'use client';

import { CalendarEvent } from '@/lib/data/types';
import { formatDateRangeDE, daysBetween } from '@/lib/utils';

interface EventPreviewProps {
  events: CalendarEvent[];
  maxItems?: number;
}

export function EventPreview({ events, maxItems = 10 }: EventPreviewProps) {
  const displayedEvents = events.slice(0, maxItems);
  const remainingCount = events.length - maxItems;

  if (events.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>Keine Termine für die aktuelle Auswahl</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Vorschau</h3>
        <span className="text-sm text-gray-600">
          {events.length} {events.length === 1 ? 'Termin' : 'Termine'}
        </span>
      </div>

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {displayedEvents.map((event) => (
          <div
            key={event.id}
            className={`
              p-3 rounded-lg border
              ${
                event.category === 'school-holidays'
                  ? 'bg-green-50 border-green-200'
                  : 'bg-red-50 border-red-200'
              }
            `}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="font-medium text-gray-900 truncate">
                  {event.title}
                </p>
                <p className="text-sm text-gray-600">
                  {formatDateRangeDE(event.startDate, event.endDate)}
                  {event.startDate !== event.endDate && (
                    <span className="ml-2 text-gray-400">
                      ({daysBetween(event.startDate, event.endDate)} Tage)
                    </span>
                  )}
                </p>
              </div>
              <span
                className={`
                  text-xs px-2 py-1 rounded-full whitespace-nowrap
                  ${
                    event.category === 'school-holidays'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }
                `}
              >
                {event.category === 'school-holidays' ? 'Ferien' : 'Feiertag'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {remainingCount > 0 && (
        <p className="text-sm text-gray-500 text-center">
          ... und {remainingCount} weitere {remainingCount === 1 ? 'Termin' : 'Termine'}
        </p>
      )}
    </div>
  );
}
