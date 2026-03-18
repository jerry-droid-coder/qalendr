'use client';

import { cn } from '@/lib/utils';
import { Country, Region, EventCategory } from '@/lib/data/types';
import { CalendarConfig } from '@/lib/data/types';
import { CountryGrid } from './CountryGrid';
import { YearSelector } from './YearSelector';
import { DownloadButton } from './DownloadButton';
import { Heart } from 'lucide-react';

interface SidebarProps {
  countries: Country[];
  regions: Region[];
  availableYears: number[];
  config: CalendarConfig;
  selectedCountries: string[];
  selectedRegions: string[];
  selectedCategories: EventCategory[];
  onCountriesChange: (countryCodes: string[]) => void;
  onRegionsChange: (regionCodes: string[]) => void;
  onCategoriesChange: (categories: EventCategory[]) => void;
  onYearChange: (year: number) => void;
  downloadConfig: CalendarConfig;
  isReadyToDownload: boolean;
}

export function Sidebar({
  countries,
  regions,
  availableYears,
  config,
  selectedCountries,
  selectedRegions,
  selectedCategories,
  onCountriesChange,
  onRegionsChange,
  onCategoriesChange,
  onYearChange,
  downloadConfig,
  isReadyToDownload,
}: SidebarProps) {
  return (
    <aside className="flex flex-col gap-4 h-full">
      {/* Country Selection */}
      <section className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] p-4 shadow-[var(--shadow-sm)] hover:border-[var(--border-hover)] transition-colors duration-200">
        <CountryGrid
          countries={countries}
          regions={regions}
          selectedCountries={selectedCountries}
          selectedRegions={selectedRegions}
          selectedCategories={selectedCategories}
          onCountriesChange={onCountriesChange}
          onRegionsChange={onRegionsChange}
          onCategoriesChange={onCategoriesChange}
        />
      </section>

      {/* Year Selector */}
      <section className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] p-4 shadow-[var(--shadow-sm)] hover:border-[var(--border-hover)] transition-colors duration-200">
        <YearSelector
          availableYears={availableYears}
          selectedYear={config.year}
          onYearChange={onYearChange}
        />
      </section>

      {/* Spacer to push download to bottom */}
      <div className="flex-1 min-h-4" />

      {/* Download + Support */}
      <div className="sticky bottom-4 space-y-2.5">
        <div className={cn(
          'rounded-2xl border p-4 shadow-[var(--shadow-md)] transition-all duration-300',
          isReadyToDownload
            ? 'bg-[var(--bg-card)] border-[var(--accent)]/20 shadow-[var(--shadow-glow)]'
            : 'bg-[var(--bg-card)] border-[var(--border)]'
        )}>
          <DownloadButton config={downloadConfig} disabled={!isReadyToDownload} />
        </div>

        <a
          href="https://buymeacoffee.com/qalendr"
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            'flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl text-xs font-medium',
            'border border-pink-500/10 text-[var(--text-muted)]',
            'hover:text-pink-400 hover:border-pink-500/30 hover:bg-pink-500/5',
            'transition-all duration-200'
          )}
        >
          <Heart className="h-3.5 w-3.5 text-pink-500/70" />
          Supporte dieses Projekt
        </a>
      </div>
    </aside>
  );
}
