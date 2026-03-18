'use client';

import { CalendarEvent, CalendarConfig } from '@/lib/data/types';
import { MiniCalendar } from '@/components/MiniCalendar';
import { EventPreview } from '@/components/EventPreview';
import { DownloadButton } from '@/components/DownloadButton';
import { YearSelector } from '@/components/YearSelector';
import { getCategoryDef } from '@/lib/categoryConfig';

interface StepPreviewProps {
  events: CalendarEvent[];
  config: CalendarConfig;
  downloadConfig: CalendarConfig;
  availableYears: number[];
  onYearChange: (year: number) => void;
  isReadyToDownload: boolean;
  selectedCategories: string[];
}

export function StepPreview({
  events,
  config,
  downloadConfig,
  availableYears,
  onYearChange,
  isReadyToDownload,
  selectedCategories,
}: StepPreviewProps) {
  // Summarize selections
  const activeCategoryDefs = selectedCategories
    .map((id) => getCategoryDef(id as Parameters<typeof getCategoryDef>[0]))
    .filter(Boolean);

  return (
    <div className="animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">Vorschau & Download</h2>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          Prüfe deine Auswahl und lade den Kalender herunter.
        </p>
      </div>

      {/* Summary chips */}
      <div className="flex flex-wrap gap-2 justify-center mb-8">
        {activeCategoryDefs.map((def) => {
          const IconComp = def!.Icon;
          return (
            <span
              key={def!.id}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium"
              style={{ backgroundColor: def!.badgeColor, color: def!.badgeTextColor }}
            >
              <IconComp className="h-3 w-3" />
              {def!.name}
            </span>
          );
        })}
      </div>

      {/* Year selector */}
      <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] p-5 mb-5">
        <YearSelector
          availableYears={availableYears}
          selectedYear={config.year}
          onYearChange={onYearChange}
        />
      </div>

      {/* Calendar + Preview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
        <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] p-5">
          <MiniCalendar events={events} year={config.year} />
        </div>
        <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] p-5">
          <EventPreview events={events} maxItems={12} />
        </div>
      </div>

      {/* Download */}
      <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] p-5 shadow-[var(--shadow-glow)]">
        <DownloadButton config={downloadConfig} disabled={!isReadyToDownload} />
      </div>
    </div>
  );
}
