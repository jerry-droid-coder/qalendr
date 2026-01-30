'use client';

import { Region, Country } from '@/lib/data/types';

interface RegionSelectorProps {
  regions: Region[];
  selectedRegions: string[];
  onSelectionChange: (regions: string[]) => void;
  country?: Country;
}

export function RegionSelector({
  regions,
  selectedRegions,
  onSelectionChange,
  country,
}: RegionSelectorProps) {
  // Filter regions for the selected country (only states, not country-level)
  const countryStates = regions.filter(
    (r) => r.country === (country?.code || 'DE') && r.type === 'state'
  );

  // If the country has no states, show a message
  if (countryStates.length === 0) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Region wählen</h3>
        <p className="text-sm text-gray-600">
          Für {country?.name || 'dieses Land'} werden landesweite Feiertage angezeigt.
        </p>
      </div>
    );
  }

  const handleToggle = (code: string) => {
    if (selectedRegions.includes(code)) {
      onSelectionChange(selectedRegions.filter((r) => r !== code));
    } else {
      onSelectionChange([...selectedRegions, code]);
    }
  };

  const handleSelectAll = () => {
    const allCodes = countryStates.map((r) => r.code);
    onSelectionChange(allCodes);
  };

  const handleClearAll = () => {
    onSelectionChange([]);
  };

  // Determine the right label based on country
  const getRegionLabel = () => {
    switch (country?.code) {
      case 'DE':
        return 'Bundesland';
      case 'AT':
        return 'Bundesland';
      case 'CH':
        return 'Kanton';
      case 'US':
      case 'AU':
        return 'State';
      case 'GB':
        return 'Nation';
      case 'CA':
        return 'Province';
      default:
        return 'Region';
    }
  };

  const regionLabel = getRegionLabel();
  const regionLabelPlural = regionLabel === 'Bundesland'
    ? 'Bundesländer'
    : regionLabel === 'Kanton'
    ? 'Kantone'
    : `${regionLabel}s`;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">{regionLabel} wählen</h3>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleSelectAll}
            className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
          >
            Alle auswählen
          </button>
          <span className="text-gray-300">|</span>
          <button
            type="button"
            onClick={handleClearAll}
            className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
          >
            Auswahl aufheben
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
        {countryStates.map((region) => (
          <label
            key={region.code}
            className={`
              flex items-center gap-2 p-3 rounded-lg border cursor-pointer
              transition-colors duration-150
              ${
                selectedRegions.includes(region.code)
                  ? 'bg-blue-50 border-blue-500 text-blue-900'
                  : 'bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }
            `}
          >
            <input
              type="checkbox"
              checked={selectedRegions.includes(region.code)}
              onChange={() => handleToggle(region.code)}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm font-medium truncate">{region.name}</span>
          </label>
        ))}
      </div>

      {selectedRegions.length > 0 && (
        <p className="text-sm text-gray-600">
          {selectedRegions.length} {selectedRegions.length === 1 ? regionLabel : regionLabelPlural} ausgewählt
        </p>
      )}
    </div>
  );
}
