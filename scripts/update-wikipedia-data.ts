/**
 * Update Script for Wikipedia Data
 *
 * Fetches historical events and famous people from Wikipedia/Wikidata APIs
 * and updates the local JSON data files.
 *
 * Usage: npm run update:wikipedia
 *
 * APIs used:
 * - Wikipedia "On this day": https://de.wikipedia.org/api/rest_v1/feed/onthisday/{type}/{MM}/{DD}
 * - Wikidata SPARQL for famous people with birth/death dates
 */

import * as fs from 'fs';
import * as path from 'path';

// Types
interface WikipediaEvent {
  year: number;
  text: string;
  link?: string;
}

interface WikipediaTodayData {
  description: string;
  lastUpdated: string;
  events: Record<string, WikipediaEvent[]>;
}

interface FamousPerson {
  id: string;
  name: string;
  birthDate: string;
  birthYear: number;
  deathDate?: string;
  deathYear?: number;
  profession: string;
  link?: string;
}

interface FamousPeopleData {
  description: string;
  lastUpdated: string;
  people: FamousPerson[];
}

// List of problematic persons to filter out (war criminals, dictators, etc.)
const BLOCKED_PEOPLE = new Set<string>([
  // Add IDs of people to exclude
]);

// Rate limiting helper
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Fetch Wikipedia "On this day" events for a specific date
 */
async function fetchOnThisDay(month: number, day: number): Promise<WikipediaEvent[]> {
  const monthStr = month.toString().padStart(2, '0');
  const dayStr = day.toString().padStart(2, '0');

  const url = `https://de.wikipedia.org/api/rest_v1/feed/onthisday/events/${monthStr}/${dayStr}`;

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Qalendr/1.0 (https://qalendr.com)',
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      console.error(`Failed to fetch ${monthStr}-${dayStr}: ${response.status}`);
      return [];
    }

    const data = await response.json();
    const events: WikipediaEvent[] = [];

    // Get the most significant events (limit to top 3 per day)
    const significantEvents = (data.events || [])
      .filter((e: { year?: number; text?: string }) => e.year && e.text)
      .slice(0, 3);

    for (const event of significantEvents) {
      events.push({
        year: event.year,
        text: event.text,
        link: event.pages?.[0]?.content_urls?.desktop?.page,
      });
    }

    return events;
  } catch (error) {
    console.error(`Error fetching ${monthStr}-${dayStr}:`, error);
    return [];
  }
}

/**
 * Fetch all "On this day" events for the entire year
 */
async function fetchAllOnThisDay(): Promise<WikipediaTodayData> {
  const events: Record<string, WikipediaEvent[]> = {};
  const daysInMonth = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

  console.log('Fetching Wikipedia "On this day" events...');

  for (let month = 1; month <= 12; month++) {
    for (let day = 1; day <= daysInMonth[month - 1]; day++) {
      const monthStr = month.toString().padStart(2, '0');
      const dayStr = day.toString().padStart(2, '0');
      const key = `${monthStr}-${dayStr}`;

      const dayEvents = await fetchOnThisDay(month, day);
      if (dayEvents.length > 0) {
        events[key] = dayEvents;
      }

      // Rate limiting: wait 100ms between requests
      await sleep(100);

      // Progress indicator
      if (day === 1) {
        console.log(`  Month ${month}/12...`);
      }
    }
  }

  return {
    description: 'Historische Ereignisse aus Wikipedia',
    lastUpdated: new Date().toISOString().split('T')[0],
    events,
  };
}

/**
 * Fetch famous people from Wikidata using SPARQL
 * Note: This is a simplified version - in production you'd want to
 * fetch from Wikidata SPARQL endpoint with proper pagination
 */
async function fetchFamousPeople(): Promise<FamousPeopleData> {
  console.log('Fetching famous people from Wikidata...');

  // SPARQL query for famous people with German Wikipedia articles
  // This query gets scientists, artists, composers, writers, politicians, etc.
  const sparqlQuery = `
    SELECT DISTINCT ?person ?personLabel ?birthDate ?deathDate ?occupationLabel ?article WHERE {
      ?person wdt:P31 wd:Q5 .
      ?person wdt:P569 ?birthDate .
      ?person wdt:P106 ?occupation .

      # Filter for notable occupations
      VALUES ?occupation {
        wd:Q901 wd:Q36180 wd:Q1028181 wd:Q482980 wd:Q33999 wd:Q170790
        wd:Q1930187 wd:Q639669 wd:Q593644 wd:Q49757 wd:Q2259451 wd:Q82955
      }

      # Must have German Wikipedia article
      ?article schema:about ?person .
      ?article schema:isPartOf <https://de.wikipedia.org/> .

      # Optional death date
      OPTIONAL { ?person wdt:P570 ?deathDate }

      # Language filter
      SERVICE wikibase:label { bd:serviceParam wikibase:language "de,en" }
    }
    ORDER BY ?birthDate
    LIMIT 600
  `;

  const url = 'https://query.wikidata.org/sparql';

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json',
        'User-Agent': 'StandardTermine/1.0',
      },
      body: `query=${encodeURIComponent(sparqlQuery)}`,
    });

    if (!response.ok) {
      console.error(`Wikidata query failed: ${response.status}`);
      return createFallbackPeopleData();
    }

    const data = await response.json();
    const people: FamousPerson[] = [];
    const seenIds = new Set<string>();

    for (const result of data.results.bindings) {
      const personUri = result.person?.value || '';
      const wikidataId = personUri.split('/').pop() || '';

      // Skip duplicates and blocked people
      if (seenIds.has(wikidataId) || BLOCKED_PEOPLE.has(wikidataId)) continue;
      seenIds.add(wikidataId);

      const name = result.personLabel?.value;
      const birthDateStr = result.birthDate?.value;
      const deathDateStr = result.deathDate?.value;
      const profession = result.occupationLabel?.value || 'Person';
      const link = result.article?.value;

      if (!name || !birthDateStr) continue;

      const birthDate = new Date(birthDateStr);
      if (isNaN(birthDate.getTime())) continue;

      const birthMonth = (birthDate.getMonth() + 1).toString().padStart(2, '0');
      const birthDay = birthDate.getDate().toString().padStart(2, '0');

      const person: FamousPerson = {
        id: wikidataId.toLowerCase(),
        name,
        birthDate: `${birthMonth}-${birthDay}`,
        birthYear: birthDate.getFullYear(),
        profession,
        link,
      };

      if (deathDateStr) {
        const deathDate = new Date(deathDateStr);
        if (!isNaN(deathDate.getTime())) {
          const deathMonth = (deathDate.getMonth() + 1).toString().padStart(2, '0');
          const deathDay = deathDate.getDate().toString().padStart(2, '0');
          person.deathDate = `${deathMonth}-${deathDay}`;
          person.deathYear = deathDate.getFullYear();
        }
      }

      people.push(person);
    }

    console.log(`  Found ${people.length} famous people`);

    return {
      description: 'Geburts- und Todestage berühmter Persönlichkeiten',
      lastUpdated: new Date().toISOString().split('T')[0],
      people,
    };
  } catch (error) {
    console.error('Error fetching from Wikidata:', error);
    return createFallbackPeopleData();
  }
}

/**
 * Create fallback data if API fails
 */
function createFallbackPeopleData(): FamousPeopleData {
  console.log('  Using existing data (API unavailable)');

  // Read existing file if available
  const existingPath = path.join(
    __dirname,
    '../src/data/special-days/famous-people.json'
  );

  try {
    const existing = JSON.parse(fs.readFileSync(existingPath, 'utf-8'));
    return existing;
  } catch {
    return {
      description: 'Geburts- und Todestage berühmter Persönlichkeiten',
      lastUpdated: new Date().toISOString().split('T')[0],
      people: [],
    };
  }
}

/**
 * Main update function
 */
async function main() {
  console.log('=== Wikipedia Data Update ===\n');

  const dataDir = path.join(__dirname, '../src/data/special-days');

  // Ensure directory exists
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  // Update Wikipedia "On this day" events
  const skipWikipedia = process.argv.includes('--skip-wikipedia');
  if (!skipWikipedia) {
    try {
      const wikipediaData = await fetchAllOnThisDay();
      const wikipediaPath = path.join(dataDir, 'wikipedia-today.json');
      fs.writeFileSync(wikipediaPath, JSON.stringify(wikipediaData, null, 2));
      console.log(`\nWikipedia data saved to ${wikipediaPath}`);
      console.log(`  Total days with events: ${Object.keys(wikipediaData.events).length}`);
    } catch (error) {
      console.error('Failed to update Wikipedia data:', error);
    }
  }

  // Update famous people
  const skipPeople = process.argv.includes('--skip-people');
  if (!skipPeople) {
    try {
      const peopleData = await fetchFamousPeople();
      const peoplePath = path.join(dataDir, 'famous-people.json');
      fs.writeFileSync(peoplePath, JSON.stringify(peopleData, null, 2));
      console.log(`\nFamous people data saved to ${peoplePath}`);
      console.log(`  Total people: ${peopleData.people.length}`);
    } catch (error) {
      console.error('Failed to update famous people data:', error);
    }
  }

  console.log('\n=== Update Complete ===');
}

// Run if executed directly
main().catch(console.error);
