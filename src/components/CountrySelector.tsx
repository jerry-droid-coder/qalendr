'use client';

import { useState } from 'react';
import { Country, Region, EventCategory } from '@/lib/data/types';

interface CountrySelectorProps {
  countries: Country[];
  regions: Region[];
  selectedCountries: string[];
  selectedRegions: string[];
  selectedCategories: EventCategory[];
  onCountriesChange: (countryCodes: string[]) => void;
  onRegionsChange: (regionCodes: string[]) => void;
  onCategoriesChange: (categories: EventCategory[]) => void;
}

export function CountrySelector({
  countries,
  regions,
  selectedCountries,
  selectedRegions,
  selectedCategories,
  onCountriesChange,
  onRegionsChange,
  onCategoriesChange,
}: CountrySelectorProps) {
  const [expandedCountries, setExpandedCountries] = useState<string[]>([]);

  // Get states for a specific country
  const getStatesForCountry = (countryCode: string) =>
    regions.filter((r) => r.country === countryCode && r.type === 'state');

  const handleCountryToggle = (countryCode: string) => {
    const country = countries.find((c) => c.code === countryCode);
    const isSelected = selectedCountries.includes(countryCode);

    if (isSelected) {
      // Deselect country
      onCountriesChange(selectedCountries.filter((c) => c !== countryCode));
      // Also remove regions for this country
      onRegionsChange(
        selectedRegions.filter((r) => !r.startsWith(countryCode + '-'))
      );
      // Collapse if deselected
      setExpandedCountries(expandedCountries.filter((c) => c !== countryCode));

      // If this was the only country with school holidays, remove that category
      if (country?.hasSchoolHolidays) {
        const remainingCountries = selectedCountries.filter((c) => c !== countryCode);
        const anyHasSchoolHolidays = remainingCountries.some(
          (c) => countries.find((co) => co.code === c)?.hasSchoolHolidays
        );
        if (!anyHasSchoolHolidays && selectedCategories.includes('school-holidays')) {
          onCategoriesChange(selectedCategories.filter((c) => c !== 'school-holidays'));
        }
      }

      // If no countries left, remove country-specific categories
      if (selectedCountries.length === 1) {
        onCategoriesChange(
          selectedCategories.filter((c) => c !== 'public-holidays' && c !== 'school-holidays')
        );
      }
    } else {
      // Select country
      const newCountries = [...selectedCountries, countryCode];
      onCountriesChange(newCountries);

      // Auto-add public-holidays if this is the first country
      if (selectedCountries.length === 0) {
        onCategoriesChange([...selectedCategories, 'public-holidays']);
      }

      // Auto-expand if country has states or school holidays
      if (country?.hasStates || country?.hasSchoolHolidays) {
        setExpandedCountries([...expandedCountries, countryCode]);
      }
    }
  };

  const handleExpandToggle = (countryCode: string) => {
    if (expandedCountries.includes(countryCode)) {
      setExpandedCountries(expandedCountries.filter((c) => c !== countryCode));
    } else {
      setExpandedCountries([...expandedCountries, countryCode]);
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
    const otherRegions = selectedRegions.filter(
      (r) => !r.startsWith(countryCode + '-')
    );
    onRegionsChange([...otherRegions, ...countryStates.map((s) => s.code)]);
  };

  const handleClearRegions = (countryCode: string) => {
    onRegionsChange(
      selectedRegions.filter((r) => !r.startsWith(countryCode + '-'))
    );
  };

  const handleCategoryToggle = (category: 'public-holidays' | 'school-holidays') => {
    if (selectedCategories.includes(category)) {
      // Don't allow removing if it's the last "data" category
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

  // Check if a country needs expansion (has states or school holidays)
  const countryNeedsExpansion = (country: Country) =>
    country.hasStates || country.hasSchoolHolidays;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Länder & Regionen</h3>

      <div className="space-y-2">
        {countries.map((country) => {
          const isSelected = selectedCountries.includes(country.code);
          const isExpanded = expandedCountries.includes(country.code);
          const states = getStatesForCountry(country.code);
          const hasStates = states.length > 0;
          const selectedCount = getSelectedRegionCount(country.code);
          const labels = getRegionLabel(country.code);
          const needsExpansion = countryNeedsExpansion(country);

          return (
            <div
              key={country.code}
              className={`rounded-lg border overflow-hidden transition-colors ${
                isSelected ? 'border-blue-300 bg-blue-50/50' : 'border-gray-200'
              }`}
            >
              {/* Country Header */}
              <div
                className={`flex items-center gap-3 p-3 ${
                  isSelected ? 'bg-blue-50' : 'bg-white hover:bg-gray-50'
                }`}
              >
                {/* Checkbox */}
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => handleCountryToggle(country.code)}
                  className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />

                {/* Flag & Name */}
                <button
                  type="button"
                  onClick={() => handleCountryToggle(country.code)}
                  className="flex items-center gap-2 flex-1 text-left"
                >
                  <span className="text-xl">{country.flag}</span>
                  <span className="font-medium text-gray-900">{country.name}</span>
                </button>

                {/* Info badges */}
                <div className="flex items-center gap-2">
                  {isSelected && hasStates && selectedCount > 0 && (
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                      {selectedCount} {selectedCount === 1 ? labels.singular : labels.plural}
                    </span>
                  )}
                </div>

                {/* Expand button for countries that need it */}
                {isSelected && needsExpansion && (
                  <button
                    type="button"
                    onClick={() => handleExpandToggle(country.code)}
                    className="p-1 hover:bg-blue-100 rounded transition-colors"
                    aria-label={isExpanded ? 'Zuklappen' : 'Aufklappen'}
                  >
                    <svg
                      className={`w-5 h-5 text-gray-500 transition-transform ${
                        isExpanded ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>
                )}
              </div>

              {/* Expanded Panel */}
              {isSelected && needsExpansion && isExpanded && (
                <div className="border-t border-blue-200 bg-white p-3 space-y-4">
                  {/* Category options for this country */}
                  <div className="space-y-2">
                    <span className="text-sm font-medium text-gray-700">Inhalte:</span>
                    <div className="flex flex-wrap gap-3">
                      {/* Public Holidays - always available */}
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedCategories.includes('public-holidays')}
                          onChange={() => handleCategoryToggle('public-holidays')}
                          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">Gesetzliche Feiertage</span>
                      </label>

                      {/* School Holidays - only for countries that have them */}
                      {country.hasSchoolHolidays && (
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedCategories.includes('school-holidays')}
                            onChange={() => handleCategoryToggle('school-holidays')}
                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700">Schulferien</span>
                        </label>
                      )}
                    </div>
                  </div>

                  {/* Regions Panel */}
                  {hasStates && (
                    <div className="space-y-3 pt-2 border-t border-gray-100">
                      {/* Region actions */}
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">
                          {labels.plural}:
                        </span>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleSelectAllRegions(country.code)}
                            className="text-xs text-blue-600 hover:text-blue-800"
                          >
                            Alle
                          </button>
                          <span className="text-gray-300">|</span>
                          <button
                            type="button"
                            onClick={() => handleClearRegions(country.code)}
                            className="text-xs text-blue-600 hover:text-blue-800"
                          >
                            Keine
                          </button>
                        </div>
                      </div>

                      {/* Region grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {states.map((region) => {
                          const isRegionSelected = selectedRegions.includes(region.code);
                          return (
                            <label
                              key={region.code}
                              className={`
                                flex items-center gap-2 p-2 rounded border cursor-pointer
                                transition-colors text-sm
                                ${
                                  isRegionSelected
                                    ? 'bg-blue-100 border-blue-400 text-blue-900'
                                    : 'bg-gray-50 border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-100'
                                }
                              `}
                            >
                              <input
                                type="checkbox"
                                checked={isRegionSelected}
                                onChange={() => handleRegionToggle(region.code)}
                                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
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
      <p className="text-sm text-gray-500">
        {selectedCountries.length} {selectedCountries.length === 1 ? 'Land' : 'Länder'} ausgewählt
        {selectedRegions.length > 0 && ` · ${selectedRegions.length} Regionen`}
      </p>
    </div>
  );
}
