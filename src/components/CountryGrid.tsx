'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Country, Region, EventCategory } from '@/lib/data/types';
import { MapPin, ChevronDown, Check } from 'lucide-react';

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

  const handleCountryClick = (countryCode: string) => {
    const country = countries.find((c) => c.code === countryCode);
    const isSelected = selectedCountries.includes(countryCode);
    const hasStates = getStatesForCountry(countryCode).length > 0;

    if (isSelected) {
      // Wenn bereits ausgewählt, toggle erweiterte Ansicht bei Ländern mit Regionen
      if (hasStates || country?.hasSchoolHolidays) {
        if (expandedCountry === countryCode) {
          setExpandedCountry(null);
        } else {
          setExpandedCountry(countryCode);
        }
      } else {
        // Für Länder ohne Regionen: Abwählen
        handleCountryDeselect(countryCode);
      }
    } else {
      // Neu auswählen
      handleCountrySelect(countryCode);
    }
  };

  const handleCountrySelect = (countryCode: string) => {
    const country = countries.find((c) => c.code === countryCode);
    const newCountries = [...selectedCountries, countryCode];
    onCountriesChange(newCountries);

    // Auto-add public-holidays wenn erstes Land
    if (selectedCountries.length === 0) {
      onCategoriesChange([...selectedCategories, 'public-holidays']);
    }

    // Auto-expand wenn Land Regionen hat
    if (country?.hasStates || country?.hasSchoolHolidays) {
      setExpandedCountry(countryCode);
    }
  };

  const handleCountryDeselect = (countryCode: string) => {
    const country = countries.find((c) => c.code === countryCode);

    onCountriesChange(selectedCountries.filter((c) => c !== countryCode));
    onRegionsChange(selectedRegions.filter((r) => !r.startsWith(countryCode + '-')));

    if (expandedCountry === countryCode) {
      setExpandedCountry(null);
    }

    // Schulferien entfernen wenn letztes Land mit Schulferien
    if (country?.hasSchoolHolidays) {
      const remainingCountries = selectedCountries.filter((c) => c !== countryCode);
      const anyHasSchoolHolidays = remainingCountries.some(
        (c) => countries.find((co) => co.code === c)?.hasSchoolHolidays
      );
      if (!anyHasSchoolHolidays && selectedCategories.includes('school-holidays')) {
        onCategoriesChange(selectedCategories.filter((c) => c !== 'school-holidays'));
      }
    }

    // Länderspezifische Kategorien entfernen wenn kein Land mehr
    if (selectedCountries.length === 1) {
      onCategoriesChange(
        selectedCategories.filter((c) => c !== 'public-holidays' && c !== 'school-holidays')
      );
    }
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
    <section className="py-8">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-[var(--text-primary)] sm:text-3xl flex items-center justify-center gap-3">
          <MapPin className="h-8 w-8 text-[var(--accent)]" />
          Länder & Regionen
        </h2>
        <p className="mt-2 text-[var(--text-secondary)]">
          Wähle die Länder aus, für die du Feiertage und Ferien sehen möchtest
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {countries.map((country) => {
          const isSelected = selectedCountries.includes(country.code);
          const isExpanded = expandedCountry === country.code;
          const states = getStatesForCountry(country.code);
          const hasStates = states.length > 0;
          const selectedCount = getSelectedRegionCount(country.code);
          const labels = getRegionLabel(country.code);
          const needsExpansion = country.hasStates || country.hasSchoolHolidays;

          return (
            <div
              key={country.code}
              className={cn(
                'relative rounded-xl border overflow-hidden transition-all duration-200',
                'shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)]',
                isSelected
                  ? 'ring-2 ring-[var(--accent)] border-[var(--accent)] bg-[var(--accent-light)]'
                  : 'border-[var(--border)] hover:border-[var(--border-hover)] bg-[var(--bg-card)]',
                isExpanded && 'col-span-2 sm:col-span-3 md:col-span-4 lg:col-span-5 row-span-2'
              )}
            >
              {/* Country Card Header */}
              <div
                className={cn(
                  'relative flex flex-col items-center justify-center p-4 cursor-pointer transition-colors min-h-[100px]',
                  !isSelected && 'hover:bg-[var(--bg-hover)]'
                )}
                onClick={() => handleCountryClick(country.code)}
              >
                {/* Selected Checkmark */}
                {isSelected && (
                  <div className="absolute top-2 right-2">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--accent)] text-white">
                      <Check className="h-3 w-3" />
                    </div>
                  </div>
                )}

                {/* Flag */}
                <span className="text-4xl mb-2">{country.flag}</span>

                {/* Country Name */}
                <span className="font-medium text-[var(--text-primary)] text-sm text-center">
                  {country.name}
                </span>

                {/* Badge for selected regions */}
                {isSelected && hasStates && selectedCount > 0 && !isExpanded && (
                  <span className="mt-1 text-xs bg-[var(--accent)] text-white px-2 py-0.5 rounded-full">
                    {selectedCount} {selectedCount === 1 ? labels.singular : labels.plural}
                  </span>
                )}

                {/* Expand indicator */}
                {isSelected && needsExpansion && (
                  <ChevronDown
                    className={cn(
                      'absolute bottom-2 h-4 w-4 text-[var(--text-muted)] transition-transform',
                      isExpanded && 'rotate-180'
                    )}
                  />
                )}
              </div>

              {/* Expanded Content */}
              {isSelected && needsExpansion && isExpanded && (
                <div className="border-t border-[var(--accent)] bg-[var(--bg-card)] p-4 space-y-4">
                  {/* Actions */}
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCountryDeselect(country.code);
                      }}
                      className="text-sm text-red-500 hover:text-red-600"
                    >
                      Land entfernen
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setExpandedCountry(null);
                      }}
                      className="text-sm text-[var(--accent)] hover:text-[var(--accent-hover)]"
                    >
                      Zuklappen
                    </button>
                  </div>

                  {/* Category toggles */}
                  <div className="space-y-2">
                    <span className="text-sm font-medium text-[var(--text-secondary)]">Inhalte:</span>
                    <div className="flex flex-wrap gap-3">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedCategories.includes('public-holidays')}
                          onChange={() => handleCategoryToggle('public-holidays')}
                          className="h-4 w-4 rounded border-[var(--border)]"
                          style={{ accentColor: 'var(--accent)' }}
                        />
                        <span className="text-sm text-[var(--text-secondary)]">Gesetzliche Feiertage</span>
                      </label>

                      {country.hasSchoolHolidays && (
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedCategories.includes('school-holidays')}
                            onChange={() => handleCategoryToggle('school-holidays')}
                            className="h-4 w-4 rounded border-[var(--border)]"
                            style={{ accentColor: 'var(--accent)' }}
                          />
                          <span className="text-sm text-[var(--text-secondary)]">Schulferien</span>
                        </label>
                      )}
                    </div>
                  </div>

                  {/* Regions */}
                  {hasStates && (
                    <div className="space-y-3 pt-2 border-t border-[var(--border)]">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-[var(--text-secondary)]">
                          {labels.plural}:
                        </span>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleSelectAllRegions(country.code)}
                            className="text-xs text-[var(--accent)] hover:text-[var(--accent-hover)]"
                          >
                            Alle
                          </button>
                          <span className="text-[var(--border)]">|</span>
                          <button
                            type="button"
                            onClick={() => handleClearRegions(country.code)}
                            className="text-xs text-[var(--accent)] hover:text-[var(--accent-hover)]"
                          >
                            Keine
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                        {states.map((region) => {
                          const isRegionSelected = selectedRegions.includes(region.code);
                          return (
                            <label
                              key={region.code}
                              className={cn(
                                'flex items-center gap-2 p-2 rounded-lg border cursor-pointer',
                                'transition-all duration-150 text-sm',
                                isRegionSelected
                                  ? 'bg-[var(--accent-light)] border-[var(--accent)] text-[var(--text-primary)]'
                                  : 'bg-[var(--bg-hover)] border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--border-hover)] hover:bg-[var(--bg-card)]'
                              )}
                            >
                              <input
                                type="checkbox"
                                checked={isRegionSelected}
                                onChange={() => handleRegionToggle(region.code)}
                                className="h-4 w-4 rounded border-[var(--border)]"
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
              )}
            </div>
          );
        })}
      </div>

      {/* Summary */}
      {selectedCountries.length > 0 && (
        <p className="text-sm text-[var(--text-muted)] text-center mt-4">
          {selectedCountries.length} {selectedCountries.length === 1 ? 'Land' : 'Länder'} ausgewählt
          {selectedRegions.length > 0 && ` · ${selectedRegions.length} Regionen`}
        </p>
      )}
    </section>
  );
}
