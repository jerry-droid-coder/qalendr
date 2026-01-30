'use client';

import { useState, useEffect, useMemo } from 'react';
import { CalendarConfig, EventCategory, Country } from '@/lib/data/types';
import {
  getCountries,
  getCountryByCode,
  getRegions,
  getStatesByCountry,
  loadEvents,
  getAvailableYears,
} from '@/lib/data';
import { getCurrentYear } from '@/lib/utils';
import {
  CountrySelector,
  RegionSelector,
  CategorySelector,
  YearSelector,
  DownloadButton,
  EventPreview,
} from '@/components';

export default function Home() {
  const countries = getCountries();
  const allRegions = getRegions();
  const availableYears = getAvailableYears();

  const [config, setConfig] = useState<CalendarConfig>({
    country: 'DE',
    regions: [],
    categories: ['school-holidays', 'public-holidays'],
    year: getCurrentYear(),
  });

  // Get the current country object
  const currentCountry = useMemo(
    () => getCountryByCode(config.country),
    [config.country]
  );

  // Get states for current country
  const countryStates = useMemo(
    () => getStatesByCountry(config.country),
    [config.country]
  );

  // Ensure the selected year is in available years
  useEffect(() => {
    if (!availableYears.includes(config.year)) {
      setConfig((prev) => ({
        ...prev,
        year: availableYears[availableYears.length - 1] || getCurrentYear(),
      }));
    }
  }, [availableYears, config.year]);

  // Filter out school-holidays if country doesn't support it
  useEffect(() => {
    if (currentCountry && !currentCountry.hasSchoolHolidays) {
      if (config.categories.includes('school-holidays')) {
        setConfig((prev) => ({
          ...prev,
          categories: prev.categories.filter((c) => c !== 'school-holidays'),
        }));
      }
    }
  }, [currentCountry, config.categories]);

  // Load events for preview
  const events = useMemo(() => {
    // For countries without states, use the country code as region
    const effectiveRegions =
      countryStates.length === 0 ? [config.country] : config.regions;

    if (effectiveRegions.length === 0) return [];
    return loadEvents(effectiveRegions, config.categories, config.year, config.country);
  }, [config.regions, config.categories, config.year, config.country, countryStates.length]);

  const handleCountryChange = (countryCode: string) => {
    const newCountry = getCountryByCode(countryCode);
    // Reset regions when country changes
    // Also reset categories if the new country doesn't have school holidays
    const newCategories = newCountry?.hasSchoolHolidays
      ? config.categories
      : config.categories.filter((c) => c !== 'school-holidays');

    // Ensure at least one category is selected
    const finalCategories =
      newCategories.length > 0 ? newCategories : ['public-holidays'];

    setConfig((prev) => ({
      ...prev,
      country: countryCode,
      regions: [],
      categories: finalCategories as EventCategory[],
    }));
  };

  const handleRegionsChange = (regions: string[]) => {
    setConfig((prev) => ({ ...prev, regions }));
  };

  const handleCategoriesChange = (categories: EventCategory[]) => {
    setConfig((prev) => ({ ...prev, categories }));
  };

  const handleYearChange = (year: number) => {
    setConfig((prev) => ({ ...prev, year }));
  };

  // For countries without states, we consider it "ready" if a country is selected
  const hasStates = countryStates.length > 0;
  const isReadyToDownload = hasStates ? config.regions.length > 0 : true;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <main className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
        {/* Header */}
        <header className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Standard-Termine
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Erstelle einen Kalender mit Feiertagen für dein Land.
            Einfach herunterladen und in deinen Kalender importieren.
          </p>
        </header>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Configuration Panel */}
          <div className="lg:col-span-2 space-y-8">
            <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <CountrySelector
                countries={countries}
                selectedCountry={config.country}
                onCountryChange={handleCountryChange}
              />
            </section>

            {hasStates && (
              <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <RegionSelector
                  regions={allRegions}
                  selectedRegions={config.regions}
                  onSelectionChange={handleRegionsChange}
                  country={currentCountry}
                />
              </section>
            )}

            {currentCountry?.hasSchoolHolidays && (
              <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <CategorySelector
                  selectedCategories={config.categories}
                  onSelectionChange={handleCategoriesChange}
                  country={currentCountry}
                />
              </section>
            )}

            <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <YearSelector
                availableYears={availableYears}
                selectedYear={config.year}
                onYearChange={handleYearChange}
              />
            </section>

            <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <DownloadButton
                config={{
                  ...config,
                  // For countries without states, use the country code as region
                  regions: hasStates ? config.regions : [config.country],
                }}
                disabled={!isReadyToDownload}
              />
            </section>
          </div>

          {/* Preview Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-6">
              <EventPreview events={events} maxItems={15} />
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-16 text-center text-sm text-gray-500">
          <p>
            Die Kalender-Datei (.ics) ist kompatibel mit Apple Kalender, Google Kalender,
            Microsoft Outlook und anderen Kalender-Apps.
          </p>
          <p className="mt-2">
            Daten ohne Gewähr. Stand: 2024-2026
          </p>
        </footer>
      </main>
    </div>
  );
}
