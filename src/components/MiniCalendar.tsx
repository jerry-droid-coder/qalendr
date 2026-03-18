'use client';

import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { getMonthNameDE, formatDateDE } from '@/lib/utils';
import { CalendarEvent } from '@/lib/data/types';
import { getCategoryDef } from '@/lib/categoryConfig';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface MiniCalendarProps {
  events: CalendarEvent[];
  year: number;
}

const WEEKDAYS = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];

export function MiniCalendar({ events, year }: MiniCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(() => new Date().getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Build a Map<dateString, CalendarEvent[]> for fast lookup
  const eventMap = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    for (const event of events) {
      // Handle multi-day events
      const start = new Date(event.startDate);
      const end = new Date(event.endDate);
      const current = new Date(start);
      while (current <= end) {
        const key = current.toISOString().split('T')[0];
        if (!map.has(key)) map.set(key, []);
        map.get(key)!.push(event);
        current.setDate(current.getDate() + 1);
      }
    }
    return map;
  }, [events]);

  // Calendar grid for current month
  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, currentMonth, 1);
    const lastDay = new Date(year, currentMonth + 1, 0);
    const startWeekday = (firstDay.getDay() + 6) % 7; // Mon=0

    const days: (number | null)[] = [];
    for (let i = 0; i < startWeekday; i++) days.push(null);
    for (let d = 1; d <= lastDay.getDate(); d++) days.push(d);

    return days;
  }, [year, currentMonth]);

  const prevMonth = () => setCurrentMonth((m) => (m === 0 ? 11 : m - 1));
  const nextMonth = () => setCurrentMonth((m) => (m === 11 ? 0 : m + 1));

  const selectedEvents = selectedDate ? (eventMap.get(selectedDate) || []) : [];

  // Get unique category colors for a date (max 3 dots)
  const getDateDots = (dateStr: string) => {
    const dateEvents = eventMap.get(dateStr);
    if (!dateEvents) return [];
    const categories = [...new Set(dateEvents.map((e) => e.category))];
    return categories.slice(0, 3).map((cat) => {
      const def = getCategoryDef(cat);
      return def?.checkboxColor || 'var(--text-muted)';
    });
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-4">
      {/* Month Navigation */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={prevMonth}
          className="p-1.5 rounded-lg hover:bg-[var(--bg-hover)] transition-colors"
          aria-label="Vorheriger Monat"
        >
          <ChevronLeft className="h-4 w-4 text-[var(--text-secondary)]" />
        </button>
        <h3 className="text-sm font-semibold text-[var(--text-primary)]">
          {getMonthNameDE(currentMonth)} {year}
        </h3>
        <button
          type="button"
          onClick={nextMonth}
          className="p-1.5 rounded-lg hover:bg-[var(--bg-hover)] transition-colors"
          aria-label="Nächster Monat"
        >
          <ChevronRight className="h-4 w-4 text-[var(--text-secondary)]" />
        </button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-px">
        {WEEKDAYS.map((day, idx) => (
          <div key={day} className={cn(
            'text-center text-[10px] font-semibold uppercase tracking-wider py-1.5',
            idx >= 5 ? 'text-[var(--accent)]/40' : 'text-[var(--text-muted)]'
          )}>
            {day}
          </div>
        ))}

        {/* Calendar days */}
        {calendarDays.map((day, i) => {
          if (day === null) {
            return <div key={`empty-${i}`} />;
          }

          const dateStr = `${year}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const dots = getDateDots(dateStr);
          const isToday = dateStr === today;
          const isSelected = dateStr === selectedDate;
          const hasEvents = dots.length > 0;
          const dayOfWeek = new Date(year, currentMonth, day).getDay();
          const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

          return (
            <button
              key={dateStr}
              type="button"
              onClick={() => setSelectedDate(isSelected ? null : dateStr)}
              className={cn(
                'relative flex flex-col items-center justify-center rounded-lg aspect-square text-xs transition-all duration-150',
                isSelected
                  ? 'bg-[var(--accent)] text-white shadow-md shadow-[var(--accent)]/20 scale-105'
                  : isToday
                    ? 'bg-[var(--accent-light)] text-[var(--accent)] font-bold ring-1 ring-[var(--accent)]/30'
                    : hasEvents
                      ? 'hover:bg-[var(--bg-hover)] text-[var(--text-primary)] cursor-pointer'
                      : isWeekend
                        ? 'text-[var(--text-muted)]/50 cursor-default'
                        : 'text-[var(--text-muted)] cursor-default'
              )}
            >
              <span className={cn(isToday && !isSelected && 'font-bold')}>{day}</span>
              {dots.length > 0 && (
                <div className="flex gap-0.5 mt-0.5">
                  {dots.map((color, di) => (
                    <span
                      key={di}
                      className="h-1 w-1 rounded-full"
                      style={{ backgroundColor: isSelected ? 'rgba(255,255,255,0.8)' : color }}
                    />
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Selected Date Events */}
      {selectedDate && (
        <div className="border-t border-[var(--border)] pt-3 space-y-2">
          <p className="text-xs font-medium text-[var(--text-secondary)]">
            {formatDateDE(selectedDate)}
          </p>
          {selectedEvents.length === 0 ? (
            <p className="text-xs text-[var(--text-muted)]">Keine Termine</p>
          ) : (
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {selectedEvents.map((event) => {
                const def = getCategoryDef(event.category);
                return (
                  <div
                    key={event.id}
                    className="flex items-center gap-2 p-1.5 rounded-md text-xs"
                  >
                    <span
                      className="h-2 w-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: def?.checkboxColor || 'var(--text-muted)' }}
                    />
                    <span className="text-[var(--text-primary)] truncate">{event.title}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
