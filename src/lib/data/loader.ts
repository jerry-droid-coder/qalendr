/**
 * Data loader for holidays and regions
 *
 * Loads holiday data from JSON files and filters by region/category
 */

import {
  CalendarEvent,
  EventCategory,
  Region,
  Country,
  PublicHolidaysData,
  SchoolHolidayYearData,
  RegionsData,
  CountriesData,
  VacationEntry,
} from './types';
import { resolveDatePattern } from '@/lib/ics/formatters';

// Import static JSON data
import countriesJson from '@/data/countries.json';
import regionsJson from '@/data/regions.json';

// German holidays and school holidays
import publicHolidaysDeJson from '@/data/holidays/de/public-holidays.json';
import schoolHolidays2026Json from '@/data/holidays/de/school-holidays/2026.json';
import schoolHolidays2027Json from '@/data/holidays/de/school-holidays/2027.json';
import schoolHolidays2028Json from '@/data/holidays/de/school-holidays/2028.json';

// International public holidays
import publicHolidaysAtJson from '@/data/holidays/at/public-holidays.json';
import publicHolidaysChJson from '@/data/holidays/ch/public-holidays.json';
import publicHolidaysFrJson from '@/data/holidays/fr/public-holidays.json';
import publicHolidaysNlJson from '@/data/holidays/nl/public-holidays.json';
import publicHolidaysBeJson from '@/data/holidays/be/public-holidays.json';
import publicHolidaysItJson from '@/data/holidays/it/public-holidays.json';
import publicHolidaysEsJson from '@/data/holidays/es/public-holidays.json';
import publicHolidaysPtJson from '@/data/holidays/pt/public-holidays.json';
import publicHolidaysPlJson from '@/data/holidays/pl/public-holidays.json';
import publicHolidaysGbJson from '@/data/holidays/gb/public-holidays.json';
import publicHolidaysUsJson from '@/data/holidays/us/public-holidays.json';
import publicHolidaysCaJson from '@/data/holidays/ca/public-holidays.json';
import publicHolidaysAuJson from '@/data/holidays/au/public-holidays.json';

// Special days (observances, fun days, moon phases, wikipedia, famous people)
import observancesJson from '@/data/special-days/observances.json';
import funDaysJson from '@/data/special-days/fun-days.json';
import moonPhasesJson from '@/data/special-days/moon-phases.json';
import wikipediaTodayJson from '@/data/special-days/wikipedia-today.json';
import wikipediaRandomJson from '@/data/special-days/wikipedia-random.json';
import famousPeopleJson from '@/data/special-days/famous-people.json';

// Type assertions for imported JSON
const countriesData = countriesJson as CountriesData;
const regionsData = regionsJson as RegionsData;

// Public holidays by country
const publicHolidaysData: Record<string, PublicHolidaysData> = {
  DE: publicHolidaysDeJson as PublicHolidaysData,
  AT: publicHolidaysAtJson as PublicHolidaysData,
  CH: publicHolidaysChJson as PublicHolidaysData,
  FR: publicHolidaysFrJson as PublicHolidaysData,
  NL: publicHolidaysNlJson as PublicHolidaysData,
  BE: publicHolidaysBeJson as PublicHolidaysData,
  IT: publicHolidaysItJson as PublicHolidaysData,
  ES: publicHolidaysEsJson as PublicHolidaysData,
  PT: publicHolidaysPtJson as PublicHolidaysData,
  PL: publicHolidaysPlJson as PublicHolidaysData,
  GB: publicHolidaysGbJson as PublicHolidaysData,
  US: publicHolidaysUsJson as PublicHolidaysData,
  CA: publicHolidaysCaJson as PublicHolidaysData,
  AU: publicHolidaysAuJson as PublicHolidaysData,
};

// School holidays (only Germany for now)
const schoolHolidaysData: Record<number, SchoolHolidayYearData> = {
  2026: schoolHolidays2026Json as SchoolHolidayYearData,
  2027: schoolHolidays2027Json as SchoolHolidayYearData,
  2028: schoolHolidays2028Json as SchoolHolidayYearData,
};

// Special days data structure
interface SpecialDayData {
  id: string;
  name: string;
  date: string;
  type: 'fixed' | 'variable';
  note?: string;
}

interface SpecialDaysFile {
  description: string;
  days: SpecialDayData[];
}

const observancesData = observancesJson as SpecialDaysFile;
const funDaysData = funDaysJson as SpecialDaysFile;

// Moon phases data structure
interface MoonPhaseEntry {
  date: string;
  type: 'new' | 'full';
  name: string;
}

interface MoonPhasesFile {
  description: string;
  phases: Record<string, MoonPhaseEntry[]>;
}

const moonPhasesData = moonPhasesJson as MoonPhasesFile;

// Wikipedia today data structure
interface WikipediaEvent {
  year: number;
  text: string;
  link?: string;
}

interface WikipediaTodayFile {
  description: string;
  lastUpdated: string;
  events: Record<string, WikipediaEvent[]>;
}

const wikipediaTodayData = wikipediaTodayJson as WikipediaTodayFile;

// Wikipedia random data structure
interface WikipediaRandomArticle {
  title: string;
  excerpt: string;
  link: string;
}

interface WikipediaRandomFile {
  description: string;
  lastUpdated: string;
  articles: Record<string, WikipediaRandomArticle>;
}

const wikipediaRandomData = wikipediaRandomJson as WikipediaRandomFile;

// Famous people data structure
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

interface FamousPeopleFile {
  description: string;
  lastUpdated: string;
  people: FamousPerson[];
}

const famousPeopleData = famousPeopleJson as FamousPeopleFile;

// Export types for use in components
export type { FamousPerson };

/**
 * Get all available observances
 */
export function getObservances(): SpecialDayData[] {
  return observancesData.days;
}

/**
 * Get all available fun days
 */
export function getFunDays(): SpecialDayData[] {
  return funDaysData.days;
}

/**
 * Get all famous people
 */
export function getFamousPeople(): FamousPerson[] {
  return famousPeopleData.people;
}

// Export the type for use in components
export type { SpecialDayData };

/**
 * Get all available countries
 */
export function getCountries(): Country[] {
  return countriesData.countries;
}

/**
 * Get a country by its code
 */
export function getCountryByCode(code: string): Country | undefined {
  return countriesData.countries.find((c) => c.code === code);
}

/**
 * Get all available regions
 */
export function getRegions(): Region[] {
  return regionsData.regions;
}

/**
 * Get regions for a specific country
 */
export function getRegionsByCountry(countryCode: string): Region[] {
  return regionsData.regions.filter((r) => r.country === countryCode);
}

/**
 * Get states (non-country-level regions) for a specific country
 */
export function getStatesByCountry(countryCode: string): Region[] {
  return regionsData.regions.filter(
    (r) => r.country === countryCode && r.type === 'state'
  );
}

/**
 * Get a region by its code
 */
export function getRegionByCode(code: string): Region | undefined {
  return regionsData.regions.find((r) => r.code === code);
}

/**
 * Get all German states (excluding country-level)
 */
export function getGermanStates(): Region[] {
  return regionsData.regions.filter(
    (r) => r.country === 'DE' && r.type === 'state'
  );
}

/**
 * Get all state codes for a country
 */
export function getStateCodes(countryCode: string): string[] {
  return regionsData.regions
    .filter((r) => r.country === countryCode && r.type === 'state')
    .map((r) => r.code);
}

/**
 * Expand region codes (e.g., "DE" expands to all German states)
 */
export function expandRegions(regionCodes: string[]): string[] {
  const expanded = new Set<string>();

  for (const code of regionCodes) {
    const region = getRegionByCode(code);
    if (!region) continue;

    if (region.type === 'country') {
      // Expand country to all its states
      const stateCodes = getStateCodes(region.country);
      if (stateCodes.length > 0) {
        stateCodes.forEach((s) => expanded.add(s));
      } else {
        // Country without states, add the country code itself
        expanded.add(code);
      }
    } else {
      expanded.add(code);
    }
  }

  return Array.from(expanded);
}

/**
 * Load public holidays for specified regions and year
 */
export function loadPublicHolidays(
  regionCodes: string[],
  year: number,
  countryCode?: string
): CalendarEvent[] {
  const events: CalendarEvent[] = [];
  const expandedRegions = expandRegions(regionCodes);

  // Determine which country to load holidays for
  const country = countryCode || (expandedRegions[0]?.split('-')[0] ?? 'DE');
  const holidayData = publicHolidaysData[country];

  if (!holidayData) {
    // No holiday data for this country yet
    return events;
  }

  // Get regions that belong to this country
  const countryRegions = expandedRegions.filter((r) => {
    const region = getRegionByCode(r);
    return region?.country === country;
  });

  // For countries without states, use the country code
  const effectiveRegions = countryRegions.length > 0 ? countryRegions : [country];

  for (const holiday of holidayData.holidays) {
    // Check if holiday applies to any of the selected regions
    const appliesToRegions = holiday.regions
      ? holiday.regions.some((r) => effectiveRegions.includes(r) || r === country)
      : true; // No regions means nationwide

    if (!appliesToRegions) continue;

    try {
      const date = resolveDatePattern(holiday.date, year);

      // Determine which specific regions this applies to
      const applicableRegions = holiday.regions
        ? holiday.regions.filter((r) => effectiveRegions.includes(r))
        : effectiveRegions;

      // Build region suffix for regional holidays
      const totalStates = getStateCodes(country).length;
      const regionSuffix =
        holiday.regions && holiday.regions.length < totalStates && applicableRegions.length > 0
          ? ` (${applicableRegions.join(', ')})`
          : '';

      events.push({
        id: `${country.toLowerCase()}-${holiday.id}-${year}`,
        title: holiday.name + regionSuffix,
        startDate: date,
        endDate: date, // Single-day holiday
        allDay: true,
        category: 'public-holidays',
        region: applicableRegions.length === 1 ? applicableRegions[0] : undefined,
      });
    } catch (error) {
      console.error(`Error resolving date for ${holiday.id}:`, error);
    }
  }

  return events;
}

/**
 * Load school holidays for specified regions and year
 */
export function loadSchoolHolidays(
  regionCodes: string[],
  year: number
): CalendarEvent[] {
  const events: CalendarEvent[] = [];
  const expandedRegions = expandRegions(regionCodes);

  // School holidays are only available for Germany
  const deRegions = expandedRegions.filter((r) => r.startsWith('DE-'));
  if (deRegions.length === 0) return events;

  const yearData = schoolHolidaysData[year];
  if (!yearData) return events;

  for (const holiday of yearData.holidays) {
    for (const period of holiday.periods) {
      // Check if this region is selected
      if (!deRegions.includes(period.region)) continue;

      const region = getRegionByCode(period.region);
      const regionName = region?.name || period.region;

      events.push({
        id: `${period.region.toLowerCase()}-${holiday.id}`,
        title: `${holiday.name} ${regionName}`,
        startDate: period.startDate,
        endDate: period.endDate,
        allDay: true,
        category: 'school-holidays',
        region: period.region,
      });
    }
  }

  return events;
}

/**
 * Load observances (Gedenktage) for a specific year
 * @param year - The year to load observances for
 * @param selectedIds - Optional array of IDs to filter by. If undefined, loads all.
 */
export function loadObservances(year: number, selectedIds?: string[]): CalendarEvent[] {
  const events: CalendarEvent[] = [];

  for (const day of observancesData.days) {
    // Skip if selection is provided and this day is not selected
    if (selectedIds && !selectedIds.includes(day.id)) continue;

    try {
      const date = resolveDatePattern(day.date, year);

      events.push({
        id: `observance-${day.id}-${year}`,
        title: day.name,
        startDate: date,
        endDate: date,
        allDay: true,
        category: 'observances',
        description: day.note,
      });
    } catch (error) {
      console.error(`Error resolving date for observance ${day.id}:`, error);
    }
  }

  return events;
}

/**
 * Load fun days (kuriose Tage) for a specific year
 * @param year - The year to load fun days for
 * @param selectedIds - Optional array of IDs to filter by. If undefined, loads all.
 */
export function loadFunDays(year: number, selectedIds?: string[]): CalendarEvent[] {
  const events: CalendarEvent[] = [];

  for (const day of funDaysData.days) {
    // Skip if selection is provided and this day is not selected
    if (selectedIds && !selectedIds.includes(day.id)) continue;

    try {
      const date = resolveDatePattern(day.date, year);

      events.push({
        id: `funday-${day.id}-${year}`,
        title: day.name,
        startDate: date,
        endDate: date,
        allDay: true,
        category: 'fun-days',
        description: day.note,
      });
    } catch (error) {
      console.error(`Error resolving date for fun day ${day.id}:`, error);
    }
  }

  return events;
}

/**
 * Load moon phases (Neumond/Vollmond) for a specific year
 * @param year - The year to load moon phases for
 */
export function loadMoonPhases(year: number): CalendarEvent[] {
  const events: CalendarEvent[] = [];
  const yearData = moonPhasesData.phases[year.toString()];

  if (!yearData) return events;

  for (const phase of yearData) {
    events.push({
      id: `moon-${phase.type}-${phase.date}`,
      title: phase.name,
      startDate: phase.date,
      endDate: phase.date,
      allDay: true,
      category: 'moon-phases',
    });
  }

  return events;
}

/**
 * Load Wikipedia "On this day" historical events for a specific year
 * @param year - The year to generate events for
 */
export function loadWikipediaToday(year: number): CalendarEvent[] {
  const events: CalendarEvent[] = [];

  for (const [monthDay, dayEvents] of Object.entries(wikipediaTodayData.events)) {
    const [month, day] = monthDay.split('-');
    const date = `${year}-${month}-${day}`;

    for (const event of dayEvents) {
      const yearsAgo = year - event.year;
      events.push({
        id: `wikipedia-${monthDay}-${event.year}`,
        title: `${event.year}: ${event.text}`,
        startDate: date,
        endDate: date,
        allDay: true,
        category: 'wikipedia-today',
        description: event.link ? `Vor ${yearsAgo} Jahren. Mehr: ${event.link}` : `Vor ${yearsAgo} Jahren.`,
      });
    }
  }

  return events;
}

/**
 * Load random Wikipedia articles for a specific year
 * @param year - The year to generate events for
 */
export function loadWikipediaRandom(year: number): CalendarEvent[] {
  const events: CalendarEvent[] = [];

  for (const [monthDay, article] of Object.entries(wikipediaRandomData.articles)) {
    const [month, day] = monthDay.split('-');
    const date = `${year}-${month}-${day}`;

    events.push({
      id: `wikipedia-random-${monthDay}`,
      title: `📚 ${article.title}`,
      startDate: date,
      endDate: date,
      allDay: true,
      category: 'wikipedia-random',
      description: `${article.excerpt}\n\nWikipedia: ${article.link}`,
    });
  }

  return events;
}

/**
 * Load famous birthdays and death anniversaries for a specific year
 * @param year - The year to generate events for
 * @param selectedIds - Optional array of person IDs to filter by. If undefined, loads all.
 */
export function loadFamousBirthdays(year: number, selectedIds?: string[]): CalendarEvent[] {
  const events: CalendarEvent[] = [];

  for (const person of famousPeopleData.people) {
    // Skip if selection is provided and this person is not selected
    if (selectedIds && !selectedIds.includes(person.id)) continue;

    // Birthday event
    const [birthMonth, birthDay] = person.birthDate.split('-');
    const birthDate = `${year}-${birthMonth}-${birthDay}`;
    const birthAge = year - person.birthYear;

    events.push({
      id: `birthday-${person.id}-${year}`,
      title: `🎂 ${person.name} (*${person.birthYear})`,
      startDate: birthDate,
      endDate: birthDate,
      allDay: true,
      category: 'famous-birthdays',
      description: person.link
        ? `${person.profession}. ${birthAge}. Geburtstag.\n\nWikipedia: ${person.link}`
        : `${person.profession}. ${birthAge}. Geburtstag.`,
    });

    // Death anniversary event (if person has died)
    if (person.deathDate && person.deathYear) {
      const [deathMonth, deathDay] = person.deathDate.split('-');
      const deathDate = `${year}-${deathMonth}-${deathDay}`;
      const deathYearsAgo = year - person.deathYear;

      events.push({
        id: `death-${person.id}-${year}`,
        title: `✝ ${person.name} (†${person.deathYear})`,
        startDate: deathDate,
        endDate: deathDate,
        allDay: true,
        category: 'famous-birthdays',
        description: person.link
          ? `${person.profession}. Vor ${deathYearsAgo} Jahren verstorben.\n\nWikipedia: ${person.link}`
          : `${person.profession}. Vor ${deathYearsAgo} Jahren verstorben.`,
      });
    }
  }

  return events;
}

/**
 * Calculate bridge days (Brückentage) based on public holidays
 *
 * A bridge day is a recommended vacation day that connects a holiday to a weekend:
 * - Holiday on Tuesday: Take Monday off → 4 days free (Sat-Tue)
 * - Holiday on Thursday: Take Friday off → 4 days free (Thu-Sun)
 * - Holiday on Wednesday: Take Mon+Tue or Thu+Fri off → 5 days free
 */
export function calculateBridgeDays(
  holidays: CalendarEvent[],
  year: number
): CalendarEvent[] {
  const bridgeDays: CalendarEvent[] = [];

  for (const holiday of holidays) {
    // Only process public holidays from the requested year
    if (!holiday.startDate.startsWith(year.toString())) continue;
    if (holiday.category !== 'public-holidays') continue;

    const holidayDate = new Date(holiday.startDate);
    const dayOfWeek = holidayDate.getDay(); // 0=Sunday, 1=Monday, ..., 6=Saturday

    // Helper to format date as YYYY-MM-DD
    const formatDate = (d: Date): string => {
      return d.toISOString().split('T')[0];
    };

    // Helper to add days to a date
    const addDays = (d: Date, days: number): Date => {
      const result = new Date(d);
      result.setDate(result.getDate() + days);
      return result;
    };

    // Clean holiday name (remove region suffix like "(DE-BY, DE-NW)")
    const cleanHolidayName = holiday.title.replace(/\s*\([^)]+\)\s*$/, '');

    if (dayOfWeek === 2) {
      // Tuesday: Bridge day on Monday
      const bridgeDate = addDays(holidayDate, -1);
      bridgeDays.push({
        id: `bridge-${holiday.id}-mon`,
        title: 'Brückentag (1 Tag Urlaub = 4 Tage frei)',
        startDate: formatDate(bridgeDate),
        endDate: formatDate(bridgeDate),
        allDay: true,
        category: 'bridge-days',
        description: `Nimm den Montag vor ${cleanHolidayName} frei und genieße ein langes Wochenende von Samstag bis Dienstag.`,
      });
    } else if (dayOfWeek === 4) {
      // Thursday: Bridge day on Friday
      const bridgeDate = addDays(holidayDate, 1);
      bridgeDays.push({
        id: `bridge-${holiday.id}-fri`,
        title: 'Brückentag (1 Tag Urlaub = 4 Tage frei)',
        startDate: formatDate(bridgeDate),
        endDate: formatDate(bridgeDate),
        allDay: true,
        category: 'bridge-days',
        description: `Nimm den Freitag nach ${cleanHolidayName} frei und genieße ein langes Wochenende von Donnerstag bis Sonntag.`,
      });
    } else if (dayOfWeek === 3) {
      // Wednesday: Two options - take Mon+Tue or Thu+Fri (we recommend Thu+Fri as it's closer to weekend)
      const bridgeDate1 = addDays(holidayDate, 1); // Thursday
      const bridgeDate2 = addDays(holidayDate, 2); // Friday
      bridgeDays.push({
        id: `bridge-${holiday.id}-thufri`,
        title: 'Brückentage (2 Tage Urlaub = 5 Tage frei)',
        startDate: formatDate(bridgeDate1),
        endDate: formatDate(bridgeDate2),
        allDay: true,
        category: 'bridge-days',
        description: `Nimm Donnerstag und Freitag nach ${cleanHolidayName} frei und genieße 5 freie Tage von Mittwoch bis Sonntag.`,
      });
    }
  }

  return bridgeDays;
}

/**
 * Convert vacation entries to calendar events
 */
export function vacationsToEvents(vacations: VacationEntry[]): CalendarEvent[] {
  return vacations.map((v) => ({
    id: `vacation-${v.id}`,
    title: v.name || 'Urlaub',
    startDate: v.startDate,
    endDate: v.endDate,
    allDay: true,
    category: 'vacation' as EventCategory,
  }));
}

/**
 * Load all events for specified configuration
 */
export function loadEvents(
  regionCodes: string[],
  categories: EventCategory[],
  year: number,
  countryCodes?: string[],
  vacations?: VacationEntry[],
  selectedObservances?: string[],
  selectedFunDays?: string[],
  selectedFamousPeople?: string[]
): CalendarEvent[] {
  const events: CalendarEvent[] = [];

  if (categories.includes('public-holidays') && countryCodes && countryCodes.length > 0) {
    // Load public holidays for each selected country
    for (const countryCode of countryCodes) {
      events.push(...loadPublicHolidays(regionCodes, year, countryCode));
    }
  }

  if (categories.includes('school-holidays')) {
    events.push(...loadSchoolHolidays(regionCodes, year));
  }

  if (categories.includes('observances')) {
    events.push(...loadObservances(year, selectedObservances));
  }

  if (categories.includes('fun-days')) {
    events.push(...loadFunDays(year, selectedFunDays));
  }

  if (categories.includes('moon-phases')) {
    events.push(...loadMoonPhases(year));
  }

  if (categories.includes('wikipedia-today')) {
    events.push(...loadWikipediaToday(year));
  }

  if (categories.includes('wikipedia-random')) {
    events.push(...loadWikipediaRandom(year));
  }

  if (categories.includes('famous-birthdays')) {
    events.push(...loadFamousBirthdays(year, selectedFamousPeople));
  }

  if (categories.includes('vacation') && vacations) {
    const vacationEvents = vacationsToEvents(vacations).filter((v) =>
      v.startDate.startsWith(year.toString())
    );
    events.push(...vacationEvents);
  }

  if (categories.includes('bridge-days')) {
    // Bridge days depend on public holidays, so we need to load them first
    const publicHolidays = events.filter((e) => e.category === 'public-holidays');
    // If public holidays weren't already loaded, load them for bridge day calculation
    if (publicHolidays.length === 0 && countryCodes && countryCodes.length > 0) {
      const tempHolidays: CalendarEvent[] = [];
      for (const countryCode of countryCodes) {
        tempHolidays.push(...loadPublicHolidays(regionCodes, year, countryCode));
      }
      events.push(...calculateBridgeDays(tempHolidays, year));
    } else {
      events.push(...calculateBridgeDays(publicHolidays, year));
    }
  }

  // Sort events by start date
  events.sort((a, b) => a.startDate.localeCompare(b.startDate));

  return events;
}

/**
 * Get available years for school holidays
 */
export function getAvailableYears(): number[] {
  return Object.keys(schoolHolidaysData).map(Number).sort();
}

/**
 * Check if a country has holiday data available
 */
export function hasHolidayData(countryCode: string): boolean {
  return countryCode in publicHolidaysData;
}
