'use client';

import { Country } from '@/lib/data/types';

interface CountrySelectorProps {
  countries: Country[];
  selectedCountry: string;
  onCountryChange: (countryCode: string) => void;
}

export function CountrySelector({
  countries,
  selectedCountry,
  onCountryChange,
}: CountrySelectorProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Land wählen</h3>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
        {countries.map((country) => (
          <button
            key={country.code}
            type="button"
            onClick={() => onCountryChange(country.code)}
            className={`
              flex items-center gap-2 p-3 rounded-lg border cursor-pointer
              transition-colors duration-150 text-left
              ${
                selectedCountry === country.code
                  ? 'bg-blue-50 border-blue-500 text-blue-900'
                  : 'bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }
            `}
          >
            <span className="text-xl" role="img" aria-label={country.name}>
              {country.flag}
            </span>
            <span className="text-sm font-medium truncate">{country.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
