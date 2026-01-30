/**
 * Calendar API Route
 *
 * GET /api/calendar - Download ICS file
 *
 * Query Parameters:
 * - co: country code (e.g., "DE", "AT", "US") - optional, defaults to "DE"
 * - r: regions (comma-separated, e.g., "DE-BY,DE-NW")
 * - c: categories (comma-separated, e.g., "school-holidays,public-holidays")
 * - y: year (e.g., "2025")
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateIcs, generateFilename } from '@/lib/ics';
import { loadEvents, getRegionByCode, getCountryByCode } from '@/lib/data';
import { decodeUrlToConfig } from '@/lib/utils';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const config = decodeUrlToConfig(searchParams);

    // Validate that at least one region is selected
    if (config.regions.length === 0) {
      return NextResponse.json(
        { error: 'Bitte mindestens eine Region auswählen' },
        { status: 400 }
      );
    }

    // Validate that at least one category is selected
    if (config.categories.length === 0) {
      return NextResponse.json(
        { error: 'Bitte mindestens eine Kategorie auswählen' },
        { status: 400 }
      );
    }

    // Load events based on configuration
    const events = loadEvents(
      config.regions,
      config.categories,
      config.year,
      config.country
    );

    if (events.length === 0) {
      return NextResponse.json(
        { error: 'Keine Termine für die ausgewählte Konfiguration gefunden' },
        { status: 404 }
      );
    }

    // Get country info for calendar name
    const country = getCountryByCode(config.country);
    const countryName = country?.name || config.country;

    // Generate calendar name based on selection
    let calendarName = `Feiertage ${countryName}`;
    if (config.regions.length === 1) {
      const region = getRegionByCode(config.regions[0]);
      if (region && region.type === 'state') {
        calendarName = `Feiertage ${region.name}`;
      }
    } else if (config.regions.length > 1) {
      const firstRegion = getRegionByCode(config.regions[0]);
      if (firstRegion && firstRegion.type === 'state') {
        calendarName = `Feiertage (${config.regions.length} Regionen)`;
      }
    }

    // Add school holidays to name if included
    if (config.categories.includes('school-holidays')) {
      calendarName = calendarName.replace('Feiertage', 'Ferien & Feiertage');
    }

    // Generate ICS content
    const icsContent = generateIcs(events, {
      calendarName,
      calendarDescription: `Generiert von Standard-Termine für ${config.year}`,
    });

    // Generate filename
    const filename = generateFilename(config.regions, config.year);

    // Return ICS file with appropriate headers
    return new NextResponse(icsContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
        // Cache for 1 hour, stale-while-revalidate for 1 day
        'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error('Error generating calendar:', error);
    return NextResponse.json(
      { error: 'Fehler beim Generieren des Kalenders' },
      { status: 500 }
    );
  }
}
