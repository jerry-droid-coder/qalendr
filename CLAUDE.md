# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Qalendr is a German-language Next.js app for generating ICS calendar files with holidays, school vacations, observances, and personal vacation entries. Users select countries/regions and event categories, then download a combined .ics file.

## Domain

### Data Structure

Holiday JSON files use date patterns:
- Fixed: `"12-25"` (MM-DD)
- Easter-relative: `"easter"`, `"easter+1"`, `"easter-2"`
- Nth weekday: `"second-sunday-05"` (Muttertag), `"last-friday-07"` (Sysadmin Day)
- Special: `"buss-und-bettag"`, `"thanksgiving-us"`

School holidays (Germany only) are year-specific files with region-specific periods.

### Event Categories

- `school-holidays` - German school vacations (by Bundesland)
- `public-holidays` - Legal holidays (country-specific)
- `observances` - Memorial days (Muttertag, Valentinstag, etc.)
- `fun-days` - Quirky days (Tag des Bieres, Star Wars Tag, etc.)
- `bridge-days` - Recommended vacation days for long weekends
- `moon-phases` - New moon and full moon dates
- `wikipedia-today` - Historical events that happened on this day
- `wikipedia-random` - Random interesting Wikipedia articles
- `famous-birthdays` - Birth and death anniversaries of famous people
- `vacation` - User's personal entries (LocalStorage)

## Data Sources

| Data Type | Source | URL |
|-----------|--------|-----|
| Schulferien (DE) | Kultusministerkonferenz | https://www.kmk.org/service/ferien.html |
| Gesetzliche Feiertage | Nager.Date API | https://date.nager.at/ |
| Mondphasen | timeanddate.de | https://www.timeanddate.de/mond/phasen/ |

The update script fetches data from Wikipedia/Wikidata APIs. For school holidays and public holidays, manual updates from the official sources above are recommended.

## Language

The UI is in German. All user-facing strings, labels, and error messages should be in German.

## Security Notes

- API route sanitizes filename for Content-Disposition header (RFC 5987)
- LocalStorage data is validated with schema checks before use
- No cookies used, only LocalStorage for theme preference and vacation entries
