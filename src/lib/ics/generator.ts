/**
 * ICS Calendar Generator
 *
 * Generates RFC 5545 compliant iCalendar files
 *
 * Key compliance points:
 * - CRLF line endings
 * - Line folding at 75 characters
 * - All-day events use DATE (not DATETIME)
 * - DTEND is exclusive (day after last day)
 * - Required properties: VERSION, PRODID, UID, DTSTAMP, DTSTART
 */

import { CalendarEvent, EventCategory } from '@/lib/data/types';
import {
  formatIcsDate,
  formatDtstamp,
  addOneDay,
  escapeIcsText,
  joinIcsLines,
  generateUid,
} from './formatters';

export interface IcsGeneratorOptions {
  calendarName?: string;
  calendarDescription?: string;
  prodId?: string;
}

const DEFAULT_OPTIONS: IcsGeneratorOptions = {
  calendarName: 'Ferien & Feiertage',
  prodId: '-//Standard-Termine//DE',
};

/**
 * Map event category to ICS CATEGORIES value
 */
function categoryToIcs(category: EventCategory): string {
  const mapping: Record<EventCategory, string> = {
    'school-holidays': 'SCHULFERIEN',
    'public-holidays': 'FEIERTAGE',
    'observances': 'GEDENKTAGE',
    'custom': 'SONSTIGE',
  };
  return mapping[category] || 'SONSTIGE';
}

/**
 * Generate a single VEVENT block
 */
function generateEvent(event: CalendarEvent, dtstamp: string): string[] {
  const lines: string[] = [];

  lines.push('BEGIN:VEVENT');
  lines.push(`UID:${generateUid(event.id)}`);
  lines.push(`DTSTAMP:${dtstamp}`);

  // All-day events use DATE value type
  if (event.allDay) {
    lines.push(`DTSTART;VALUE=DATE:${formatIcsDate(event.startDate)}`);
    // DTEND is exclusive, so add one day to the end date
    lines.push(`DTEND;VALUE=DATE:${formatIcsDate(addOneDay(event.endDate))}`);
  } else {
    // For timed events (future use), we'd use DATETIME
    lines.push(`DTSTART:${formatIcsDate(event.startDate)}T000000`);
    lines.push(`DTEND:${formatIcsDate(event.endDate)}T235959`);
  }

  lines.push(`SUMMARY:${escapeIcsText(event.title)}`);

  if (event.description) {
    lines.push(`DESCRIPTION:${escapeIcsText(event.description)}`);
  }

  lines.push(`CATEGORIES:${categoryToIcs(event.category)}`);

  // TRANSP:TRANSPARENT means the event doesn't block time
  // (appropriate for holidays that don't represent actual appointments)
  lines.push('TRANSP:TRANSPARENT');

  // Add recurrence rule if present
  if (event.recurrence) {
    let rrule = `RRULE:FREQ=${event.recurrence.frequency}`;

    if (event.recurrence.interval && event.recurrence.interval > 1) {
      rrule += `;INTERVAL=${event.recurrence.interval}`;
    }
    if (event.recurrence.byMonth) {
      rrule += `;BYMONTH=${event.recurrence.byMonth}`;
    }
    if (event.recurrence.byMonthDay) {
      rrule += `;BYMONTHDAY=${event.recurrence.byMonthDay}`;
    }
    if (event.recurrence.count) {
      rrule += `;COUNT=${event.recurrence.count}`;
    }
    if (event.recurrence.until) {
      rrule += `;UNTIL=${formatIcsDate(event.recurrence.until)}`;
    }

    lines.push(rrule);
  }

  lines.push('END:VEVENT');

  return lines;
}

/**
 * Generate a complete ICS calendar file
 */
export function generateIcs(
  events: CalendarEvent[],
  options: IcsGeneratorOptions = {}
): string {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const dtstamp = formatDtstamp();

  const lines: string[] = [];

  // Calendar header
  lines.push('BEGIN:VCALENDAR');
  lines.push('VERSION:2.0');
  lines.push(`PRODID:${opts.prodId}`);
  lines.push('CALSCALE:GREGORIAN');
  lines.push('METHOD:PUBLISH');

  // X-WR-CALNAME is recognized by Apple and Google Calendar
  if (opts.calendarName) {
    lines.push(`X-WR-CALNAME:${escapeIcsText(opts.calendarName)}`);
  }

  if (opts.calendarDescription) {
    lines.push(`X-WR-CALDESC:${escapeIcsText(opts.calendarDescription)}`);
  }

  // Generate events
  for (const event of events) {
    const eventLines = generateEvent(event, dtstamp);
    lines.push(...eventLines);
  }

  // Calendar footer
  lines.push('END:VCALENDAR');

  // Join with CRLF and apply line folding
  return joinIcsLines(lines) + '\r\n';
}

/**
 * Generate a calendar name based on selected regions and categories
 */
export function generateCalendarName(
  regions: string[],
  categories: EventCategory[]
): string {
  const parts: string[] = [];

  // Add category description
  const categoryNames: Record<EventCategory, string> = {
    'school-holidays': 'Schulferien',
    'public-holidays': 'Feiertage',
    'observances': 'Gedenktage',
    'custom': 'Termine',
  };

  const catNames = categories.map((c) => categoryNames[c] || c);
  if (catNames.length > 0) {
    parts.push(catNames.join(' & '));
  }

  // Add region info if specific regions selected
  if (regions.length === 1) {
    // Will be replaced with actual region name by caller
    parts.push(regions[0]);
  } else if (regions.length > 1 && regions.length <= 3) {
    parts.push(regions.join(', '));
  } else if (regions.length > 3) {
    parts.push(`${regions.length} Regionen`);
  }

  return parts.join(' - ') || 'Kalender';
}

/**
 * Generate a filename for the ICS download
 */
export function generateFilename(
  regions: string[],
  year?: number
): string {
  let name = 'kalender';

  if (regions.length === 1) {
    name = regions[0].toLowerCase().replace(/-/g, '_');
  } else if (regions.length > 0) {
    name = `kalender_${regions.length}_regionen`;
  }

  if (year) {
    name += `_${year}`;
  }

  return `${name}.ics`;
}
