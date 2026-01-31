'use client';

import { CalendarEvent } from '@/lib/data/types';
import { formatDateRangeDE, daysBetween } from '@/lib/utils';

interface EventPreviewProps {
  events: CalendarEvent[];
  maxItems?: number;
}

function getCategoryStyles(category: string): { bg: string; badge: string; label: string } {
  switch (category) {
    case 'school-holidays':
      return {
        bg: 'bg-[var(--green-bg)] border-[var(--green-border)]',
        badge: 'bg-[var(--green-badge-bg)] text-[var(--green-badge-text)]',
        label: 'Ferien'
      };
    case 'public-holidays':
      return {
        bg: 'bg-[var(--red-bg)] border-[var(--red-border)]',
        badge: 'bg-[var(--red-badge-bg)] text-[var(--red-badge-text)]',
        label: 'Feiertag'
      };
    case 'observances':
      return {
        bg: 'bg-[var(--orange-bg)] border-[var(--orange-border)]',
        badge: 'bg-[var(--orange-badge-bg)] text-[var(--orange-badge-text)]',
        label: 'Gedenktag'
      };
    case 'fun-days':
      return {
        bg: 'bg-[var(--yellow-bg)] border-[var(--yellow-border)]',
        badge: 'bg-[var(--yellow-badge-bg)] text-[var(--yellow-badge-text)]',
        label: 'Aktionstag'
      };
    case 'bridge-days':
      return {
        bg: 'bg-[var(--teal-bg)] border-[var(--teal-border)]',
        badge: 'bg-[var(--teal-badge-bg)] text-[var(--teal-badge-text)]',
        label: 'Brückentag'
      };
    case 'moon-phases':
      return {
        bg: 'bg-[var(--indigo-bg)] border-[var(--indigo-border)]',
        badge: 'bg-[var(--indigo-badge-bg)] text-[var(--indigo-badge-text)]',
        label: 'Mondphase'
      };
    case 'wikipedia-today':
      return {
        bg: 'bg-[var(--slate-bg)] border-[var(--slate-border)]',
        badge: 'bg-[var(--slate-badge-bg)] text-[var(--slate-badge-text)]',
        label: 'Geschichte'
      };
    case 'wikipedia-random':
      return {
        bg: 'bg-[var(--cyan-bg)] border-[var(--cyan-border)]',
        badge: 'bg-[var(--cyan-badge-bg)] text-[var(--cyan-badge-text)]',
        label: 'Wikipedia'
      };
    case 'famous-birthdays':
      return {
        bg: 'bg-[var(--pink-bg)] border-[var(--pink-border)]',
        badge: 'bg-[var(--pink-badge-bg)] text-[var(--pink-badge-text)]',
        label: 'Geburtstag'
      };
    case 'vacation':
      return {
        bg: 'bg-[var(--purple-bg)] border-[var(--purple-border)]',
        badge: 'bg-[var(--purple-badge-bg)] text-[var(--purple-badge-text)]',
        label: 'Urlaub'
      };
    default:
      return {
        bg: 'bg-[var(--bg-hover)] border-[var(--border)]',
        badge: 'bg-[var(--border)] text-[var(--text-secondary)]',
        label: 'Sonstige'
      };
  }
}

export function EventPreview({ events, maxItems = 10 }: EventPreviewProps) {
  const displayedEvents = events.slice(0, maxItems);
  const remainingCount = events.length - maxItems;

  if (events.length === 0) {
    return (
      <div className="text-center py-8 text-[var(--text-muted)]">
        <p>Keine Termine für die aktuelle Auswahl</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-[var(--text-primary)]">Vorschau</h3>
        <span className="text-sm text-[var(--text-secondary)]">
          {events.length} {events.length === 1 ? 'Termin' : 'Termine'}
        </span>
      </div>

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {displayedEvents.map((event) => {
          const styles = getCategoryStyles(event.category);
          return (
            <div
              key={event.id}
              className={`p-3 rounded-lg border transition-all duration-150 hover:scale-[1.01] ${styles.bg}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-medium text-[var(--text-primary)] truncate">
                    {event.title}
                  </p>
                  <p className="text-sm text-[var(--text-secondary)]">
                    {formatDateRangeDE(event.startDate, event.endDate)}
                    {event.startDate !== event.endDate && (
                      <span className="ml-2 text-[var(--text-muted)]">
                        ({daysBetween(event.startDate, event.endDate)} Tage)
                      </span>
                    )}
                  </p>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded-full whitespace-nowrap ${styles.badge}`}
                >
                  {styles.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {remainingCount > 0 && (
        <p className="text-sm text-[var(--text-muted)] text-center">
          ... und {remainingCount} weitere {remainingCount === 1 ? 'Termin' : 'Termine'}
        </p>
      )}
    </div>
  );
}
