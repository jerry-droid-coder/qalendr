/**
 * Date utility functions
 */

/**
 * Get the current year
 */
export function getCurrentYear(): number {
  return new Date().getFullYear();
}

/**
 * Format a date as German locale string
 */
export function formatDateDE(isoDate: string): string {
  const date = new Date(isoDate);
  return date.toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

/**
 * Format a date range as German locale string
 */
export function formatDateRangeDE(startDate: string, endDate: string): string {
  const start = new Date(startDate);
  const end = new Date(endDate);

  // Same day
  if (startDate === endDate) {
    return formatDateDE(startDate);
  }

  // Same month and year
  if (
    start.getMonth() === end.getMonth() &&
    start.getFullYear() === end.getFullYear()
  ) {
    return `${start.getDate()}. - ${end.toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })}`;
  }

  // Different months
  return `${formatDateDE(startDate)} - ${formatDateDE(endDate)}`;
}

/**
 * Get month name in German
 */
export function getMonthNameDE(month: number): string {
  const months = [
    'Januar',
    'Februar',
    'März',
    'April',
    'Mai',
    'Juni',
    'Juli',
    'August',
    'September',
    'Oktober',
    'November',
    'Dezember',
  ];
  return months[month];
}

/**
 * Get short month name in German
 */
export function getShortMonthNameDE(month: number): string {
  const months = [
    'Jan',
    'Feb',
    'Mär',
    'Apr',
    'Mai',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Okt',
    'Nov',
    'Dez',
  ];
  return months[month];
}

/**
 * Get weekday name in German
 */
export function getWeekdayNameDE(date: Date): string {
  const weekdays = [
    'Sonntag',
    'Montag',
    'Dienstag',
    'Mittwoch',
    'Donnerstag',
    'Freitag',
    'Samstag',
  ];
  return weekdays[date.getDay()];
}

/**
 * Calculate the number of days between two dates (inclusive)
 */
export function daysBetween(startDate: string, endDate: string): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays + 1; // inclusive
}

/**
 * Check if a date falls within a range
 */
export function isDateInRange(
  date: string,
  startDate: string,
  endDate: string
): boolean {
  return date >= startDate && date <= endDate;
}

/**
 * Get all dates in a month as ISO strings
 */
export function getDatesInMonth(year: number, month: number): string[] {
  const dates: string[] = [];
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    dates.push(date.toISOString().split('T')[0]);
  }

  return dates;
}

/**
 * Get the ISO week number for a date
 */
export function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}
