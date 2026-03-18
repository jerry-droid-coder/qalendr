'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Country, Region, EventCategory } from '@/lib/data/types';
import { ChevronDown, Check, X } from 'lucide-react';

interface CountryGridProps {
  countries: Country[];
  regions: Region[];
  selectedCountries: string[];
  selectedRegions: string[];
  selectedCategories: EventCategory[];
  onCountriesChange: (countryCodes: string[]) => void;
  onRegionsChange: (regionCodes: string[]) => void;
  onCategoriesChange: (categories: EventCategory[]) => void;
}

export function CountryGrid({
  countries,
  regions,
  selectedCountries,
  selectedRegions,
  selectedCategories,
  onCountriesChange,
  onRegionsChange,
  onCategoriesChange,
}: CountryGridProps) {
  const [expandedCountry, setExpandedCountry] = useState<string | null>(null);

  const getStatesForCountry = (countryCode: string) =>
    regions.filter((r) => r.country === countryCode && r.type === 'state');

  const getRegionLabel = (countryCode: string) => {
    switch (countryCode) {
      case 'DE':
      case 'AT':
        return { singular: 'Bundesland', plural: 'Bundesländer' };
      case 'CH':
        return { singular: 'Kanton', plural: 'Kantone' };
      case 'US':
      case 'AU':
        return { singular: 'State', plural: 'States' };
      case 'GB':
        return { singular: 'Nation', plural: 'Nations' };
      case 'CA':
        return { singular: 'Province', plural: 'Provinces' };
      default:
        return { singular: 'Region', plural: 'Regionen' };
    }
  };

  const getSelectedRegionCount = (countryCode: string) =>
    selectedRegions.filter((r) => r.startsWith(countryCode + '-')).length;

  const handleCountryToggle = (countryCode: string) => {
    const country = countries.find((c) => c.code === countryCode);
    const isSelected = selectedCountries.includes(countryCode);

    if (isSelected) {
      onCountriesChange(selectedCountries.filter((c) => c !== countryCode));
      onRegionsChange(selectedRegions.filter((r) => !r.startsWith(countryCode + '-')));
      if (expandedCountry === countryCode) setExpandedCountry(null);

      if (country?.hasSchoolHolidays) {
        const remaining = selectedCountries.filter((c) => c !== countryCode);
        const anyHasSchoolHolidays = remaining.some(
          (c) => countries.find((co) => co.code === c)?.hasSchoolHolidays
        );
        if (!anyHasSchoolHolidays && selectedCategories.includes('school-holidays')) {
          onCategoriesChange(selectedCategories.filter((c) => c !== 'school-holidays'));
        }
      }

      if (selectedCountries.length === 1) {
        onCategoriesChange(selectedCategories.filter((c) => c !== 'public-holidays' && c !== 'school-holidays'));
      }
    } else {
      const newCountries = [...selectedCountries, countryCode];
      onCountriesChange(newCountries);

      if (selectedCountries.length === 0) {
        onCategoriesChange([...selectedCategories, 'public-holidays']);
      }

      if (country?.hasStates || country?.hasSchoolHolidays) {
        setExpandedCountry(countryCode);
      }
    }
  };

  const handleExpandToggle = (countryCode: string) => {
    setExpandedCountry(expandedCountry === countryCode ? null : countryCode);
  };

  const handleRegionToggle = (regionCode: string) => {
    if (selectedRegions.includes(regionCode)) {
      onRegionsChange(selectedRegions.filter((r) => r !== regionCode));
    } else {
      onRegionsChange([...selectedRegions, regionCode]);
    }
  };

  const handleSelectAllRegions = (countryCode: string) => {
    const countryStates = getStatesForCountry(countryCode);
    const otherRegions = selectedRegions.filter((r) => !r.startsWith(countryCode + '-'));
    onRegionsChange([...otherRegions, ...countryStates.map((s) => s.code)]);
  };

  const handleClearRegions = (countryCode: string) => {
    onRegionsChange(selectedRegions.filter((r) => !r.startsWith(countryCode + '-')));
  };

  const handleCategoryToggle = (category: 'public-holidays' | 'school-holidays') => {
    if (selectedCategories.includes(category)) {
      const dataCategories = selectedCategories.filter(
        (c): c is 'public-holidays' | 'school-holidays' =>
          c === 'public-holidays' || c === 'school-holidays'
      );
      if (dataCategories.length > 1 || !dataCategories.includes(category)) {
        onCategoriesChange(selectedCategories.filter((c) => c !== category));
      }
    } else {
      onCategoriesChange([...selectedCategories, category]);
    }
  };

  return (
    <div className="space-y-3">
      <h3 className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-widest">Länder & Regionen</h3>

      {/* Vertical list of countries */}
      <div className="space-y-1 max-h-[400px] overflow-y-auto pr-1">
        {countries.map((country) => {
          const isSelected = selectedCountries.includes(country.code);
          const isExpanded = expandedCountry === country.code;
          const states = getStatesForCountry(country.code);
          const hasStates = states.length > 0;
          const selectedCount = getSelectedRegionCount(country.code);
          const labels = getRegionLabel(country.code);
          const needsExpansion = country.hasStates || country.hasSchoolHolidays;

          return (
            <div key={country.code} className="rounded-lg overflow-hidden">
              {/* Country row */}
              <div
                className={cn(
                  'flex items-center gap-2.5 px-3 py-2 cursor-pointer rounded-lg transition-all duration-150',
                  isSelected
                    ? 'bg-[var(--accent-light)] text-[var(--text-primary)]'
                    : 'hover:bg-[var(--bg-hover)] text-[var(--text-secondary)]'
                )}
                onClick={() => handleCountryToggle(country.code)}
              >
                <span className="text-lg">{country.flag}</span>
                <span className="flex-1 text-sm font-medium">{country.name}</span>

                {isSelected && hasStates && selectedCount > 0 && !isExpanded && (
                  <span className="text-xs bg-[var(--accent)] text-white px-1.5 py-0.5 rounded-full">
                    {selectedCount}
                  </span>
                )}

                {isSelected && (
                  <div className="flex items-center gap-1">
                    {needsExpansion && (
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); handleExpandToggle(country.code); }}
                        className="p-0.5 rounded hover:bg-[var(--bg-hover)] transition-colors"
                        aria-label={isExpanded ? 'Zuklappen' : 'Aufklappen'}
                      >
                        <ChevronDown className={cn('h-4 w-4 text-[var(--text-muted)] transition-transform', isExpanded && 'rotate-180')} />
                      </button>
                    )}
                    <Check className="h-4 w-4 text-[var(--accent)]" />
                  </div>
                )}
              </div>

              {/* Expanded inline */}
              {isSelected && needsExpansion && isExpanded && (
                <div className="ml-4 pl-4 border-l-2 border-[var(--accent)] space-y-3 py-2 mb-2">
                  {/* Category toggles */}
                  <div className="flex flex-wrap gap-2">
                    <label className="flex items-center gap-1.5 cursor-pointer text-xs">
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes('public-holidays')}
                        onChange={() => handleCategoryToggle('public-holidays')}
                        className="h-3.5 w-3.5 rounded border-[var(--border)]"
                        style={{ accentColor: 'var(--accent)' }}
                      />
                      <span className="text-[var(--text-secondary)]">Feiertage</span>
                    </label>

                    {country.hasSchoolHolidays && (
                      <label className="flex items-center gap-1.5 cursor-pointer text-xs">
                        <input
                          type="checkbox"
                          checked={selectedCategories.includes('school-holidays')}
                          onChange={() => handleCategoryToggle('school-holidays')}
                          className="h-3.5 w-3.5 rounded border-[var(--border)]"
                          style={{ accentColor: 'var(--accent)' }}
                        />
                        <span className="text-[var(--text-secondary)]">Schulferien</span>
                      </label>
                    )}
                  </div>

                  {/* Regions */}
                  {hasStates && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-[var(--text-muted)]">{labels.plural}</span>
                        <div className="flex gap-1.5">
                          <button type="button" onClick={() => handleSelectAllRegions(country.code)} className="text-xs text-[var(--accent)] hover:text-[var(--accent-hover)]">Alle</button>
                          <span className="text-[var(--border)]">|</span>
                          <button type="button" onClick={() => handleClearRegions(country.code)} className="text-xs text-[var(--accent)] hover:text-[var(--accent-hover)]">Keine</button>
                        </div>
                      </div>
                      <div className="space-y-0.5 max-h-48 overflow-y-auto">
                        {states.map((region) => {
                          const isRegionSelected = selectedRegions.includes(region.code);
                          return (
                            <label
                              key={region.code}
                              className={cn(
                                'flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer transition-all duration-150 text-xs',
                                isRegionSelected
                                  ? 'bg-[var(--accent-light)] text-[var(--text-primary)]'
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

                  {/* Remove country */}
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); handleCountryToggle(country.code); }}
                    className="flex items-center gap-1 text-xs text-red-500 hover:text-red-600 transition-colors"
                  >
                    <X className="h-3 w-3" />
                    Land entfernen
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Summary */}
      {selectedCountries.length > 0 && (
        <p className="text-xs text-[var(--text-muted)]">
          {selectedCountries.length} {selectedCountries.length === 1 ? 'Land' : 'Länder'}
          {selectedRegions.length > 0 && ` · ${selectedRegions.length} Regionen`}
        </p>
      )}
    </div>
  );
}
