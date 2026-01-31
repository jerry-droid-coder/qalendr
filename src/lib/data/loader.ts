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
import schoolHolidays2024Json from '@/data/holidays/de/school-holidays/2024.json';
import schoolHolidays2025Json from '@/data/holidays/de/school-holidays/2025.json';
import schoolHolidays2026Json from '@/data/holidays/de/school-holidays/2026.json';

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

// Special days (observances and fun days)
import observancesJson from '@/data/special-days/observances.json';
import funDaysJson from '@/data/special-days/fun-days.json';

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
  2024: schoolHolidays2024Json as SchoolHolidayYearData,
  2025: schoolHolidays2025Json as SchoolHolidayYearData,
  2026: schoolHolidays2026Json as SchoolHolidayYearData,
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
  selectedFunDays?: string[]
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

  if (categories.includes('vacation') && vacations) {
    const vacationEvents = vacationsToEvents(vacations).filter((v) =>
      v.startDate.startsWith(year.toString())
    );
    events.push(...vacationEvents);
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
