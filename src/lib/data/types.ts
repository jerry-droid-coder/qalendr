/**
 * Event categories for calendar events
 */
export type EventCategory =
  | 'school-holidays'    // Schulferien
  | 'public-holidays'    // Gesetzliche Feiertage
  | 'observances'        // Gedenktage (Muttertag, Valentinstag, etc.)
  | 'fun-days'           // Kuriose Tage (Tag des Bieres, etc.)
  | 'vacation'           // Persönlicher Urlaub
  | 'custom';            // Nutzer-Import (später)

/**
 * User vacation entry
 */
export interface VacationEntry {
  id: string;           // UUID
  name: string;         // "Sommerurlaub", "Kurztrip"
  startDate: string;    // ISO 8601: "2025-07-15"
  endDate: string;      // ISO 8601: "2025-07-28"
}

/**
 * Country definition
 */
export interface Country {
  code: string;           // "DE", "AT", "US"
  name: string;           // "Deutschland", "Österreich"
  flag: string;           // "🇩🇪", "🇦🇹"
  hasSchoolHolidays: boolean;  // Only DE has school holidays
  hasStates: boolean;     // Whether the country has regional subdivisions
}

/**
 * Region definition (German states, countries)
 */
export interface Region {
  code: string;        // "DE-BY", "DE-NW", "AT", "CH"
  name: string;        // "Bayern", "Nordrhein-Westfalen"
  country: string;     // "DE", "AT", "CH"
  type: 'state' | 'country';
}

/**
 * Recurrence rule for repeating events
 */
export interface RecurrenceRule {
  frequency: 'YEARLY' | 'MONTHLY' | 'WEEKLY' | 'DAILY';
  interval?: number;
  byMonth?: number;
  byMonthDay?: number;
  count?: number;
  until?: string;  // ISO 8601 date
}

/**
 * Single calendar event
 */
export interface CalendarEvent {
  id: string;                    // Eindeutig: "DE-BY-2025-sommerferien"
  title: string;                 // "Sommerferien Bayern"
  startDate: string;             // ISO 8601: "2025-07-28"
  endDate: string;               // ISO 8601: "2025-09-08" (exklusiv!)
  allDay: boolean;               // true für Ferien/Feiertage
  category: EventCategory;
  region?: string;               // Region code, e.g., "DE-BY"
  description?: string;
  recurrence?: RecurrenceRule;   // Für jährliche Wiederholung
}

/**
 * Calendar configuration (URL-State)
 */
export interface CalendarConfig {
  countries: string[];         // ["DE", "AT"] - multiple countries supported
  regions: string[];           // ["DE-BY", "DE-NW"]
  categories: EventCategory[];
  selectedObservances?: string[];  // IDs of selected observances
  selectedFunDays?: string[];      // IDs of selected fun days
  year: number;
  includeReminders?: boolean;  // Später
  reminderDays?: number[];     // [7, 14]
}

/**
 * Public holiday definition in JSON data
 */
export interface PublicHolidayData {
  id: string;
  name: string;
  date: string;  // ISO 8601 or pattern like "easter+1"
  regions?: string[];  // If empty/undefined, applies to all regions in the country
  type: 'fixed' | 'variable';  // fixed = same date every year, variable = depends on Easter etc.
}

/**
 * School holiday period in JSON data
 */
export interface SchoolHolidayData {
  id: string;
  name: string;
  type: 'winter' | 'easter' | 'pentecost' | 'summer' | 'autumn' | 'christmas';
  periods: {
    region: string;
    startDate: string;  // ISO 8601
    endDate: string;    // ISO 8601 (inclusive!)
  }[];
}

/**
 * Year data file structure for school holidays
 */
export interface SchoolHolidayYearData {
  year: number;
  country: string;
  holidays: SchoolHolidayData[];
}

/**
 * Public holidays data file structure
 */
export interface PublicHolidaysData {
  country: string;
  holidays: PublicHolidayData[];
}

/**
 * Regions data file structure
 */
export interface RegionsData {
  regions: Region[];
}

/**
 * Countries data file structure
 */
export interface CountriesData {
  countries: Country[];
}
