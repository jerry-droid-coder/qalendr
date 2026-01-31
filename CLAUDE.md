# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Standard-Termine is a German-language Next.js app for generating ICS calendar files with holidays, school vacations, observances, and personal vacation entries. Users select countries/regions and event categories, then download a combined .ics file.

## Commands

```bash
npm run dev      # Start dev server (default port 3000)
npm run build    # Production build
npm run lint     # Run ESLint
```

## Architecture

### Data Flow

1. **Static JSON Data** (`src/data/`) → Holidays, regions, countries loaded at build time
2. **Loader** (`src/lib/data/loader.ts`) → Transforms JSON into `CalendarEvent[]`, handles date pattern resolution
3. **Components** (`src/components/`) → User selects countries, regions, categories
4. **ICS Generator** (`src/lib/ics/generator.ts`) → Converts events to RFC 5545 ICS format
5. **API Route** (`src/app/api/calendar/route.ts`) → Edge runtime, serves .ics file download

### Key Modules

**`src/lib/data/`**
- `types.ts` - Core interfaces: `CalendarEvent`, `EventCategory`, `VacationEntry`, `CalendarConfig`
- `loader.ts` - Loads and filters holidays from JSON, resolves date patterns (Easter-relative, nth-weekday, etc.)

**`src/lib/ics/`**
- `formatters.ts` - Date pattern resolution (`easter+1`, `second-sunday-05`), Easter calculation, ICS text escaping
- `generator.ts` - Produces RFC 5545 compliant ICS with proper CRLF, line folding, DATE values

**`src/lib/utils/`**
- `url-state.ts` - Encodes/decodes `CalendarConfig` to URL params for sharing and API calls

**`src/hooks/`**
- `useVacationStorage.ts` - LocalStorage persistence for user's personal vacation entries

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
- `vacation` - User's personal entries (LocalStorage)

### Component Hierarchy

`page.tsx` manages state via `CalendarConfig` and passes to:
- `CountrySelector` - Multi-country selection with expandable region lists per country
- `CategorySelector` - Global categories with expandable day selection for observances/fun-days, integrated vacation input
- `YearSelector` - Year picker (2024-2026)
- `EventPreview` - Shows filtered events with category-colored badges
- `DownloadButton` - Triggers API download

## Language

The UI is in German. All user-facing strings, labels, and error messages should be in German.
