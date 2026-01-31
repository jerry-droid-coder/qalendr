/**
 * ICS date and text formatting utilities
 *
 * Important ICS rules:
 * - Line endings must be CRLF (\r\n)
 * - Lines must not exceed 75 characters (excluding CRLF)
 * - Long lines must be "folded" with CRLF + single space
 * - DTEND for all-day events is EXCLUSIVE (next day)
 */

/**
 * Format a date string (ISO 8601) as ICS DATE value
 * Format: YYYYMMDD
 */
export function formatIcsDate(isoDate: string): string {
  return isoDate.replace(/-/g, '');
}

/**
 * Format a date string (ISO 8601) as ICS DATETIME value in UTC
 * Format: YYYYMMDDTHHMMSSZ
 */
export function formatIcsDateTime(isoDate: string, time = '000000'): string {
  return `${isoDate.replace(/-/g, '')}T${time}Z`;
}

/**
 * Format current timestamp for DTSTAMP
 * Format: YYYYMMDDTHHMMSSZ
 */
export function formatDtstamp(): string {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, '0');
  const day = String(now.getUTCDate()).padStart(2, '0');
  const hour = String(now.getUTCHours()).padStart(2, '0');
  const minute = String(now.getUTCMinutes()).padStart(2, '0');
  const second = String(now.getUTCSeconds()).padStart(2, '0');
  return `${year}${month}${day}T${hour}${minute}${second}Z`;
}

/**
 * Add one day to a date string (ISO 8601)
 * Used for DTEND of all-day events (DTEND is exclusive in ICS)
 */
export function addOneDay(isoDate: string): string {
  const date = new Date(isoDate);
  date.setDate(date.getDate() + 1);
  return date.toISOString().split('T')[0];
}

/**
 * Escape special characters in ICS text values
 * - Backslash, semicolon, comma must be escaped
 * - Newlines become literal \n
 */
export function escapeIcsText(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

/**
 * Fold a line to comply with ICS 75-character limit
 * Long lines are split with CRLF + space continuation
 */
export function foldLine(line: string): string {
  const MAX_LENGTH = 75;

  if (line.length <= MAX_LENGTH) {
    return line;
  }

  const result: string[] = [];
  let remaining = line;
  let isFirst = true;

  while (remaining.length > 0) {
    // First line: 75 chars, continuation lines: 74 chars (account for leading space)
    const maxLen = isFirst ? MAX_LENGTH : MAX_LENGTH - 1;
    const chunk = remaining.substring(0, maxLen);
    remaining = remaining.substring(maxLen);

    if (isFirst) {
      result.push(chunk);
      isFirst = false;
    } else {
      result.push(' ' + chunk);
    }
  }

  return result.join('\r\n');
}

/**
 * Join multiple lines with CRLF endings (ICS standard)
 */
export function joinIcsLines(lines: string[]): string {
  return lines.map(line => foldLine(line)).join('\r\n');
}

/**
 * Generate a stable, unique UID for an event
 */
export function generateUid(eventId: string, domain = 'qalendr.com'): string {
  return `${eventId}@${domain}`;
}

/**
 * Parse ISO date string to Date object
 */
export function parseIsoDate(isoDate: string): Date {
  return new Date(isoDate);
}

/**
 * Calculate Easter Sunday for a given year using the Anonymous Gregorian algorithm
 */
export function calculateEaster(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;

  return new Date(year, month - 1, day);
}

/**
 * Calculate Buß- und Bettag (Wednesday before Nov 23)
 * It's the Wednesday before the last Sunday of the church year
 */
export function calculateBussUndBettag(year: number): Date {
  // Find November 23
  const nov23 = new Date(year, 10, 23); // November is month 10 (0-indexed)

  // Find the Wednesday before or on Nov 22
  // (because Buß- und Bettag is 11 days before the 4th Sunday of Advent,
  //  which is the Sunday between Nov 27 and Dec 3)
  // Simpler: it's always between Nov 16 and Nov 22

  // Get the day of the week for Nov 23 (0 = Sunday)
  const dayOfWeek = nov23.getDay();

  // Calculate days to subtract to get to Wednesday (3)
  // If Nov 23 is Sunday (0), we go back 4 days (to Wed Nov 19)
  // If Nov 23 is Monday (1), we go back 5 days (to Wed Nov 18)
  // etc.
  let daysToSubtract = (dayOfWeek + 4) % 7;
  if (daysToSubtract === 0) daysToSubtract = 7;

  const bussUndBettag = new Date(year, 10, 23 - daysToSubtract);
  return bussUndBettag;
}

/**
 * Calculate the Nth occurrence of a weekday in a month
 * @param year - The year
 * @param month - The month (1-12)
 * @param weekday - The day of week (0 = Sunday, 1 = Monday, etc.)
 * @param n - Which occurrence (1 = first, 2 = second, etc.)
 */
export function calculateNthWeekday(year: number, month: number, weekday: number, n: number): Date {
  // First day of the month
  const firstDay = new Date(year, month - 1, 1);
  const firstDayOfWeek = firstDay.getDay();

  // Calculate days until the first occurrence of the weekday
  let daysUntilFirst = weekday - firstDayOfWeek;
  if (daysUntilFirst < 0) daysUntilFirst += 7;

  // Calculate the date of the nth occurrence
  const nthDay = 1 + daysUntilFirst + (n - 1) * 7;

  return new Date(year, month - 1, nthDay);
}

/**
 * Calculate the last occurrence of a weekday in a month
 * @param year - The year
 * @param month - The month (1-12)
 * @param weekday - The day of week (0 = Sunday, 1 = Monday, etc.)
 */
export function calculateLastWeekday(year: number, month: number, weekday: number): Date {
  // Last day of the month
  const lastDay = new Date(year, month, 0);
  const lastDayOfWeek = lastDay.getDay();

  // Calculate days to subtract to get to the last occurrence of weekday
  let daysToSubtract = lastDayOfWeek - weekday;
  if (daysToSubtract < 0) daysToSubtract += 7;

  return new Date(year, month - 1, lastDay.getDate() - daysToSubtract);
}

/**
 * Calculate US Thanksgiving (4th Thursday in November)
 */
export function calculateThanksgiving(year: number): Date {
  return calculateNthWeekday(year, 11, 4, 4); // 4th Thursday (4) in November (11)
}

/**
 * Calculate US Memorial Day (last Monday in May)
 */
export function calculateMemorialDay(year: number): Date {
  return calculateLastWeekday(year, 5, 1); // Last Monday (1) in May (5)
}

/**
 * Calculate US Labor Day (first Monday in September)
 */
export function calculateLaborDay(year: number): Date {
  return calculateNthWeekday(year, 9, 1, 1); // 1st Monday (1) in September (9)
}

/**
 * Calculate US MLK Day (third Monday in January)
 */
export function calculateMLKDay(year: number): Date {
  return calculateNthWeekday(year, 1, 1, 3); // 3rd Monday (1) in January (1)
}

/**
 * Calculate US Presidents Day (third Monday in February)
 */
export function calculatePresidentsDay(year: number): Date {
  return calculateNthWeekday(year, 2, 1, 3); // 3rd Monday (1) in February (2)
}

/**
 * Calculate US Columbus Day (second Monday in October)
 */
export function calculateColumbusDay(year: number): Date {
  return calculateNthWeekday(year, 10, 1, 2); // 2nd Monday (1) in October (10)
}

/**
 * Calculate UK Early May Bank Holiday (first Monday in May)
 */
export function calculateEarlyMayBankHoliday(year: number): Date {
  return calculateNthWeekday(year, 5, 1, 1); // 1st Monday (1) in May (5)
}

/**
 * Calculate UK Spring Bank Holiday (last Monday in May)
 */
export function calculateSpringBankHoliday(year: number): Date {
  return calculateLastWeekday(year, 5, 1); // Last Monday (1) in May (5)
}

/**
 * Calculate UK Summer Bank Holiday (last Monday in August)
 */
export function calculateSummerBankHoliday(year: number): Date {
  return calculateLastWeekday(year, 8, 1); // Last Monday (1) in August (8)
}

/**
 * Calculate Canadian Thanksgiving (second Monday in October)
 */
export function calculateCanadianThanksgiving(year: number): Date {
  return calculateNthWeekday(year, 10, 1, 2); // 2nd Monday (1) in October (10)
}

/**
 * Calculate Canadian Victoria Day (Monday before May 25)
 */
export function calculateVictoriaDay(year: number): Date {
  // Victoria Day is the Monday on or before May 24
  const may24 = new Date(year, 4, 24);
  const dayOfWeek = may24.getDay();

  // If May 24 is a Monday, that's Victoria Day
  if (dayOfWeek === 1) return may24;

  // Otherwise, find the previous Monday
  let daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  return new Date(year, 4, 24 - daysToSubtract);
}

/**
 * Calculate Australian Queen's Birthday (varies by state, typically 2nd Monday in June for most states)
 */
export function calculateQueensBirthdayAU(year: number): Date {
  return calculateNthWeekday(year, 6, 1, 2); // 2nd Monday (1) in June (6)
}

/**
 * Resolve a date pattern (e.g., "easter+1", "12-25") to an actual date
 *
 * Supported patterns:
 * - "MM-DD" - Fixed date (e.g., "12-25" for December 25)
 * - "easter", "easter+N", "easter-N" - Easter-relative dates
 * - "buss-und-bettag" - German Buß- und Bettag
 * - "first-monday-MM" - First Monday of month MM
 * - "second-monday-MM" - Second Monday of month MM
 * - "third-monday-MM" - Third Monday of month MM
 * - "fourth-monday-MM" - Fourth Monday of month MM
 * - "last-monday-MM" - Last Monday of month MM
 * - Same patterns work for other weekdays (tuesday, wednesday, thursday, friday)
 * - "thanksgiving-us" - US Thanksgiving (4th Thursday in November)
 * - "memorial-day" - US Memorial Day (last Monday in May)
 * - "labor-day-us" - US Labor Day (first Monday in September)
 * - "mlk-day" - US MLK Day (third Monday in January)
 * - "presidents-day" - US Presidents Day (third Monday in February)
 * - "columbus-day" - US Columbus Day (second Monday in October)
 * - "early-may-bank-holiday" - UK Early May Bank Holiday
 * - "spring-bank-holiday" - UK Spring Bank Holiday
 * - "summer-bank-holiday" - UK Summer Bank Holiday (last Monday in August)
 * - "thanksgiving-ca" - Canadian Thanksgiving (second Monday in October)
 * - "victoria-day" - Canadian Victoria Day
 * - "queens-birthday-au" - Australian Queen's Birthday
 */
export function resolveDatePattern(pattern: string, year: number): string {
  // Fixed date pattern: "MM-DD"
  if (/^\d{2}-\d{2}$/.test(pattern)) {
    return `${year}-${pattern}`;
  }

  // Easter-relative pattern: "easter", "easter+N", "easter-N"
  if (pattern.startsWith('easter')) {
    const easter = calculateEaster(year);
    const offsetMatch = pattern.match(/easter([+-]\d+)?/);
    const offset = offsetMatch && offsetMatch[1] ? parseInt(offsetMatch[1], 10) : 0;

    easter.setDate(easter.getDate() + offset);
    return easter.toISOString().split('T')[0];
  }

  // Buß- und Bettag
  if (pattern === 'buss-und-bettag') {
    const date = calculateBussUndBettag(year);
    return date.toISOString().split('T')[0];
  }

  // US Holidays
  if (pattern === 'thanksgiving-us') {
    const date = calculateThanksgiving(year);
    return date.toISOString().split('T')[0];
  }

  if (pattern === 'memorial-day') {
    const date = calculateMemorialDay(year);
    return date.toISOString().split('T')[0];
  }

  if (pattern === 'labor-day-us') {
    const date = calculateLaborDay(year);
    return date.toISOString().split('T')[0];
  }

  if (pattern === 'mlk-day') {
    const date = calculateMLKDay(year);
    return date.toISOString().split('T')[0];
  }

  if (pattern === 'presidents-day') {
    const date = calculatePresidentsDay(year);
    return date.toISOString().split('T')[0];
  }

  if (pattern === 'columbus-day') {
    const date = calculateColumbusDay(year);
    return date.toISOString().split('T')[0];
  }

  // UK Holidays
  if (pattern === 'early-may-bank-holiday') {
    const date = calculateEarlyMayBankHoliday(year);
    return date.toISOString().split('T')[0];
  }

  if (pattern === 'spring-bank-holiday') {
    const date = calculateSpringBankHoliday(year);
    return date.toISOString().split('T')[0];
  }

  if (pattern === 'summer-bank-holiday') {
    const date = calculateSummerBankHoliday(year);
    return date.toISOString().split('T')[0];
  }

  // Canadian Holidays
  if (pattern === 'thanksgiving-ca') {
    const date = calculateCanadianThanksgiving(year);
    return date.toISOString().split('T')[0];
  }

  if (pattern === 'victoria-day') {
    const date = calculateVictoriaDay(year);
    return date.toISOString().split('T')[0];
  }

  // Australian Holidays
  if (pattern === 'queens-birthday-au') {
    const date = calculateQueensBirthdayAU(year);
    return date.toISOString().split('T')[0];
  }

  // Daylight Saving Time (Europe)
  if (pattern === 'dst-spring') {
    // Last Sunday in March (clocks forward)
    const date = calculateLastWeekday(year, 3, 0); // Sunday = 0
    return date.toISOString().split('T')[0];
  }

  if (pattern === 'dst-autumn') {
    // Last Sunday in October (clocks back)
    const date = calculateLastWeekday(year, 10, 0); // Sunday = 0
    return date.toISOString().split('T')[0];
  }

  // Generic weekday patterns: "first-monday-MM", "last-friday-MM", etc.
  const weekdayPatternMatch = pattern.match(
    /^(first|second|third|fourth|last)-(monday|tuesday|wednesday|thursday|friday|saturday|sunday)-(\d{2})$/
  );

  if (weekdayPatternMatch) {
    const [, occurrence, weekdayName, monthStr] = weekdayPatternMatch;
    const month = parseInt(monthStr, 10);

    const weekdayMap: Record<string, number> = {
      sunday: 0,
      monday: 1,
      tuesday: 2,
      wednesday: 3,
      thursday: 4,
      friday: 5,
      saturday: 6,
    };
    const weekday = weekdayMap[weekdayName];

    let date: Date;
    if (occurrence === 'last') {
      date = calculateLastWeekday(year, month, weekday);
    } else {
      const nthMap: Record<string, number> = {
        first: 1,
        second: 2,
        third: 3,
        fourth: 4,
      };
      date = calculateNthWeekday(year, month, weekday, nthMap[occurrence]);
    }

    return date.toISOString().split('T')[0];
  }

  throw new Error(`Unknown date pattern: ${pattern}`);
}
