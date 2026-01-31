/**
 * URL State utilities
 *
 * Encode/decode calendar configuration to/from URL search params
 * This allows sharing configurations via URL
 */

import { CalendarConfig, EventCategory } from '@/lib/data/types';
import { getCurrentYear } from './dates';

const VALID_CATEGORIES: EventCategory[] = [
  'school-holidays',
  'public-holidays',
  'observances',
  'fun-days',
  'vacation',
  'custom',
];

/**
 * Encode a calendar config to URL search params
 */
export function encodeConfigToUrl(config: CalendarConfig): string {
  const params = new URLSearchParams();

  // Countries as comma-separated list
  if (config.countries && config.countries.length > 0) {
    params.set('co', config.countries.join(','));
  }

  // Regions as comma-separated list
  if (config.regions.length > 0) {
    params.set('r', config.regions.join(','));
  }

  // Categories as comma-separated list
  if (config.categories.length > 0) {
    params.set('c', config.categories.join(','));
  }

  // Year
  if (config.year) {
    params.set('y', config.year.toString());
  }

  // Optional: reminders
  if (config.includeReminders) {
    params.set('rem', '1');
    if (config.reminderDays && config.reminderDays.length > 0) {
      params.set('remd', config.reminderDays.join(','));
    }
  }

  return params.toString();
}

/**
 * Decode URL search params to a calendar config
 */
export function decodeUrlToConfig(searchParams: URLSearchParams): CalendarConfig {
  const countriesParam = searchParams.get('co');
  const regionsParam = searchParams.get('r');
  const categoriesParam = searchParams.get('c');
  const yearParam = searchParams.get('y');
  const remindersParam = searchParams.get('rem');
  const reminderDaysParam = searchParams.get('remd');

  // Parse countries (default: ['DE'] for backwards compatibility)
  const countries = countriesParam
    ? countriesParam.split(',').filter((c) => c.length > 0)
    : ['DE'];

  // Parse regions
  const regions = regionsParam
    ? regionsParam.split(',').filter((r) => r.length > 0)
    : [];

  // Parse and validate categories
  const categories: EventCategory[] = categoriesParam
    ? (categoriesParam.split(',').filter((c) =>
        VALID_CATEGORIES.includes(c as EventCategory)
      ) as EventCategory[])
    : ['school-holidays', 'public-holidays'];

  // Parse year with validation
  const year = yearParam ? parseInt(yearParam, 10) : getCurrentYear();
  const validYear = isNaN(year) || year < 2020 || year > 2100
    ? getCurrentYear()
    : year;

  // Parse reminders
  const includeReminders = remindersParam === '1';
  const reminderDays = reminderDaysParam
    ? reminderDaysParam.split(',').map(Number).filter((n) => !isNaN(n))
    : undefined;

  return {
    countries,
    regions,
    categories,
    year: validYear,
    includeReminders,
    reminderDays,
  };
}

/**
 * Create a shareable URL for a config
 */
export function createShareableUrl(
  config: CalendarConfig,
  baseUrl: string
): string {
  const params = encodeConfigToUrl(config);
  return params ? `${baseUrl}?${params}` : baseUrl;
}

/**
 * Create an API URL for downloading the calendar
 */
export function createApiUrl(config: CalendarConfig, baseUrl: string): string {
  const params = encodeConfigToUrl(config);
  return params ? `${baseUrl}/api/calendar?${params}` : `${baseUrl}/api/calendar`;
}

/**
 * Get default config
 */
export function getDefaultConfig(): CalendarConfig {
  return {
    countries: [],
    regions: [],
    categories: [],
    year: getCurrentYear(),
  };
}

/**
 * Merge partial config with defaults
 */
export function mergeWithDefaults(
  partial: Partial<CalendarConfig>
): CalendarConfig {
  const defaults = getDefaultConfig();
  return {
    ...defaults,
    ...partial,
    // Ensure arrays are properly merged (don't use defaults if partial has empty array)
    countries: partial.countries ?? defaults.countries,
    regions: partial.regions ?? defaults.regions,
    categories: partial.categories ?? defaults.categories,
  };
}
