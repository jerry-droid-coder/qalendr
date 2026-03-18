'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Country, Region, EventCategory } from '@/lib/data/types';
import { ChevronDown, Check } from 'lucide-react';

interface StepCountriesProps {
  countries: Country[];
  regions: Region[];
  selectedCountries: string[];
  selectedRegions: string[];
  selectedCategories: EventCategory[];
  onCountriesChange: (codes: string[]) => void;
  onRegionsChange: (codes: string[]) => void;
}

export function StepCountries({
  countries,
  regions,
  selectedCountries,
  selectedRegions,
  selectedCategories,
  onCountriesChange,
  onRegionsChange,
}: StepCountriesProps) {
  const [expandedCountry, setExpandedCountry] = useState<string | null>(null);

  const getStatesForCountry = (code: string) =>
    regions.filter((r) => r.country === code && r.type === 'state');

  const getRegionLabel = (code: string) => {
    switch (code) {
      case 'DE': case 'AT': return 'Bundesländer';
      case 'CH': return 'Kantone';
      case 'US': case 'AU': return 'States';
      case 'GB': return 'Nations';
      case 'CA': return 'Provinces';
      default: return 'Regionen';
    }
  };

  const getSelectedRegionCount = (code: string) =>
    selectedRegions.filter((r) => r.startsWith(code + '-')).length;

  const handleCountryToggle = (code: string) => {
    const country = countries.find((c) => c.code === code);
    if (selectedCountries.includes(code)) {
      onCountriesChange(selectedCountries.filter((c) => c !== code));
      onRegionsChange(selectedRegions.filter((r) => !r.startsWith(code + '-')));
      if (expandedCountry === code) setExpandedCountry(null);
    } else {
      onCountriesChange([...selectedCountries, code]);
      if (country?.hasStates || country?.hasSchoolHolidays) {
        setExpandedCountry(code);
      }
    }
  };

  const handleRegionToggle = (regionCode: string) => {
    if (selectedRegions.includes(regionCode)) {
      onRegionsChange(selectedRegions.filter((r) => r !== regionCode));
    } else {
      onRegionsChange([...selectedRegions, regionCode]);
    }
  };

  const handleSelectAllRegions = (code: string) => {
    const states = getStatesForCountry(code);
    const others = selectedRegions.filter((r) => !r.startsWith(code + '-'));
    onRegionsChange([...others, ...states.map((s) => s.code)]);
  };

  const handleClearRegions = (code: string) => {
    onRegionsChange(selectedRegions.filter((r) => !r.startsWith(code + '-')));
  };

  const needsSchoolHolidayHint = selectedCategories.includes('school-holidays');

  return (
    <div className="animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">
          Für welche Länder?
        </h2>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          Wähle die Länder aus, für die du Feiertage
          {selectedCategories.includes('school-holidays') && ' und Schulferien'}
          {selectedCategories.includes('bridge-days') && ' und Brückentage'} möchtest.
        </p>
      </div>

      <div className="space-y-2 stagger-children">
        {countries.map((country) => {
          const isSelected = selectedCountries.includes(country.code);
          const isExpanded = expandedCountry === country.code;
          const states = getStatesForCountry(country.code);
          const hasStates = states.length > 0;
          const selectedCount = getSelectedRegionCount(country.code);
          const needsExpansion = country.hasStates || country.hasSchoolHolidays;

          return (
            <div
              key={country.code}
              className={cn(
                'rounded-2xl border overflow-hidden transition-all duration-200',
                isSelected
                  ? 'border-[var(--accent)] bg-[var(--accent-light)] shadow-[var(--shadow-sm)]'
                  : 'border-[var(--border)] bg-[var(--bg-card)] hover:border-[var(--border-hover)]'
              )}
            >
              {/* Country row */}
              <div
                className="flex items-center gap-3 px-4 py-3.5 cursor-pointer transition-colors"
                onClick={() => handleCountryToggle(country.code)}
              >
                <span className="text-2xl">{country.flag}</span>
                <span className="flex-1 font-medium text-[var(--text-primary)]">{country.name}</span>

                {needsSchoolHolidayHint && !country.hasSchoolHolidays && (
                  <span className="text-[10px] text-[var(--text-muted)] bg-[var(--bg-hover)] px-2 py-0.5 rounded-full">
                    Keine Schulferien
                  </span>
                )}

                {isSelected && hasStates && selectedCount > 0 && !isExpanded && (
                  <span className="text-xs bg-[var(--accent)] text-white px-2 py-0.5 rounded-full font-medium">
                    {selectedCount} {getRegionLabel(country.code)}
                  </span>
                )}

                {isSelected ? (
                  <div className="flex items-center gap-1">
                    {needsExpansion && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpandedCountry(isExpanded ? null : country.code);
                        }}
                        className="p-1 rounded-lg hover:bg-[var(--bg-hover)] transition-colors"
                      >
                        <ChevronDown className={cn('h-4 w-4 text-[var(--text-muted)] transition-transform', isExpanded && 'rotate-180')} />
                      </button>
                    )}
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--accent)] text-white">
                      <Check className="h-3.5 w-3.5" />
                    </div>
                  </div>
                ) : (
                  <div className="h-6 w-6 rounded-full border-2 border-[var(--border)]" />
                )}
              </div>

              {/* Expanded regions */}
              {isSelected && needsExpansion && isExpanded && hasStates && (
                <div className="border-t border-[var(--accent)]/30 bg-[var(--bg-card)] p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-[var(--text-muted)]">
                      {getRegionLabel(country.code)} ({selectedCount}/{states.length})
                    </span>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => handleSelectAllRegions(country.code)} className="text-xs text-[var(--accent)] hover:text-[var(--accent-hover)]">Alle</button>
                      <span className="text-[var(--border)]">|</span>
                      <button type="button" onClick={() => handleClearRegions(country.code)} className="text-xs text-[var(--accent)] hover:text-[var(--accent-hover)]">Keine</button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                    {states.map((region) => {
                      const isRegionSelected = selectedRegions.includes(region.code);
                      return (
                        <label
                          key={region.code}
                          className={cn(
                            'flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all duration-150 text-sm',
                            isRegionSelected
                              ? 'bg-[var(--accent-light)] text-[var(--text-primary)] font-medium'
                              : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
                          )}
                        >
                          <input
                            type="checkbox"
                            checked={isRegionSelected}
                            onChange={() => handleRegionToggle(region.code)}
                            className="h-3.5 w-3.5 rounded border-[var(--border)]"
                            style={{ accentColor: 'var(--accent)' }}
                          />
                          <span className="truncate">{region.name}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
