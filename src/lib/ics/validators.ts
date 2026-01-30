/**
 * ICS validation utilities
 *
 * Validates ICS content for common issues before serving to clients
 */

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validate an ICS string for common issues
 */
export function validateIcs(icsContent: string): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check for required calendar properties
  if (!icsContent.includes('BEGIN:VCALENDAR')) {
    errors.push('Missing BEGIN:VCALENDAR');
  }
  if (!icsContent.includes('END:VCALENDAR')) {
    errors.push('Missing END:VCALENDAR');
  }
  if (!icsContent.includes('VERSION:2.0')) {
    errors.push('Missing or incorrect VERSION (must be 2.0)');
  }
  if (!icsContent.includes('PRODID:')) {
    errors.push('Missing PRODID');
  }

  // Check for at least one event
  if (!icsContent.includes('BEGIN:VEVENT')) {
    warnings.push('No events in calendar');
  }

  // Validate each event
  const eventMatches = icsContent.match(/BEGIN:VEVENT[\s\S]*?END:VEVENT/g);
  if (eventMatches) {
    eventMatches.forEach((event, index) => {
      const eventNum = index + 1;

      // Required event properties
      if (!event.includes('UID:')) {
        errors.push(`Event ${eventNum}: Missing UID`);
      }
      if (!event.includes('DTSTAMP:')) {
        errors.push(`Event ${eventNum}: Missing DTSTAMP`);
      }
      if (!event.includes('DTSTART')) {
        errors.push(`Event ${eventNum}: Missing DTSTART`);
      }
      if (!event.includes('SUMMARY:')) {
        warnings.push(`Event ${eventNum}: Missing SUMMARY`);
      }

      // Check for proper all-day event format
      if (event.includes('DTSTART;VALUE=DATE:')) {
        if (!event.includes('DTEND;VALUE=DATE:')) {
          warnings.push(`Event ${eventNum}: All-day event should have DTEND;VALUE=DATE`);
        }
      }

      // Check UID format
      const uidMatch = event.match(/UID:(.+)/);
      if (uidMatch && !uidMatch[1].includes('@')) {
        warnings.push(`Event ${eventNum}: UID should contain @ for uniqueness`);
      }
    });
  }

  // Check line endings (should be CRLF)
  if (!icsContent.includes('\r\n')) {
    warnings.push('Line endings should be CRLF (\\r\\n)');
  }

  // Check for lines exceeding 75 characters (excluding CRLF)
  const lines = icsContent.split(/\r?\n/);
  lines.forEach((line, index) => {
    if (line.length > 75 && !line.startsWith(' ')) {
      warnings.push(`Line ${index + 1} exceeds 75 characters and is not folded`);
    }
  });

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate a date string in ICS format (YYYYMMDD)
 */
export function isValidIcsDate(date: string): boolean {
  if (!/^\d{8}$/.test(date)) {
    return false;
  }

  const year = parseInt(date.substring(0, 4), 10);
  const month = parseInt(date.substring(4, 6), 10);
  const day = parseInt(date.substring(6, 8), 10);

  if (month < 1 || month > 12) {
    return false;
  }

  const daysInMonth = new Date(year, month, 0).getDate();
  if (day < 1 || day > daysInMonth) {
    return false;
  }

  return true;
}

/**
 * Validate a datetime string in ICS format (YYYYMMDDTHHMMSSZ)
 */
export function isValidIcsDateTime(datetime: string): boolean {
  if (!/^\d{8}T\d{6}Z$/.test(datetime)) {
    return false;
  }

  const datePart = datetime.substring(0, 8);
  if (!isValidIcsDate(datePart)) {
    return false;
  }

  const hour = parseInt(datetime.substring(9, 11), 10);
  const minute = parseInt(datetime.substring(11, 13), 10);
  const second = parseInt(datetime.substring(13, 15), 10);

  if (hour < 0 || hour > 23) {
    return false;
  }
  if (minute < 0 || minute > 59) {
    return false;
  }
  if (second < 0 || second > 59) {
    return false;
  }

  return true;
}

/**
 * Validate that DTEND is after DTSTART
 */
export function isValidDateRange(dtstart: string, dtend: string): boolean {
  // Handle both DATE and DATETIME formats
  const startDate = dtstart.length === 8
    ? new Date(
        parseInt(dtstart.substring(0, 4), 10),
        parseInt(dtstart.substring(4, 6), 10) - 1,
        parseInt(dtstart.substring(6, 8), 10)
      )
    : new Date(dtstart);

  const endDate = dtend.length === 8
    ? new Date(
        parseInt(dtend.substring(0, 4), 10),
        parseInt(dtend.substring(4, 6), 10) - 1,
        parseInt(dtend.substring(6, 8), 10)
      )
    : new Date(dtend);

  return endDate > startDate;
}
