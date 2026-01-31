'use client';

import { useState, useEffect, useMemo } from 'react';
import { CalendarConfig, EventCategory } from '@/lib/data/types';
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
  CategorySelector,
  YearSelector,
  DownloadButton,
  EventPreview,
} from '@/components';
import { useVacationStorage } from '@/hooks/useVacationStorage';

export default function Home() {
  const countries = getCountries();
  const allRegions = getRegions();
  const availableYears = getAvailableYears();
  const [vacations, setVacations] = useVacationStorage();

  const [config, setConfig] = useState<CalendarConfig>({
    countries: [],
    regions: [],
    categories: [],
    selectedObservances: [],
    selectedFunDays: [],
    year: getCurrentYear(),
  });

  // Get states for all selected countries that have states
  const allCountryStates = useMemo(
    () => config.countries.flatMap((c) => getStatesByCountry(c)),
    [config.countries]
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

  // Load events for preview
  const events = useMemo(() => {
    // For countries without states, use the country codes as regions
    const effectiveRegions =
      allCountryStates.length === 0 ? config.countries : config.regions;

    // Check if there's any content to load
    const hasCountryContent = effectiveRegions.length > 0;
    const hasGlobalContent = config.categories.some(
      (c) => c === 'vacation' || c === 'observances' || c === 'fun-days'
    );

    if (!hasCountryContent && !hasGlobalContent) return [];

    return loadEvents(
      effectiveRegions,
      config.categories,
      config.year,
      config.countries,
      vacations,
      config.selectedObservances,
      config.selectedFunDays
    );
  }, [config.regions, config.categories, config.year, config.countries, allCountryStates.length, vacations, config.selectedObservances, config.selectedFunDays]);

  const handleCountriesChange = (countryCodes: string[]) => {
    // Check if any of the new countries has school holidays
    const anyHasSchoolHolidays = countryCodes.some(
      (c) => getCountryByCode(c)?.hasSchoolHolidays
    );

    // Filter school-holidays if none of the new countries support it
    let newCategories = config.categories;
    if (!anyHasSchoolHolidays && config.categories.includes('school-holidays')) {
      newCategories = config.categories.filter((c) => c !== 'school-holidays');
    }

    // Filter regions to only include those from selected countries
    const validRegions = config.regions.filter((r) => {
      const countryCode = r.split('-')[0];
      return countryCodes.includes(countryCode);
    });

    setConfig((prev) => ({
      ...prev,
      countries: countryCodes,
      regions: validRegions,
      categories: newCategories,
    }));
  };

  const handleRegionsChange = (regions: string[]) => {
    setConfig((prev) => ({ ...prev, regions }));
  };

  const handleCategoriesChange = (categories: EventCategory[]) => {
    setConfig((prev) => ({ ...prev, categories }));
  };

  const handleObservancesChange = (selectedObservances: string[]) => {
    setConfig((prev) => ({ ...prev, selectedObservances }));
  };

  const handleFunDaysChange = (selectedFunDays: string[]) => {
    setConfig((prev) => ({ ...prev, selectedFunDays }));
  };

  const handleYearChange = (year: number) => {
    setConfig((prev) => ({ ...prev, year }));
  };

  // Ready to download if:
  // - Countries with states: at least one region selected
  // - Countries without states: at least one country selected
  // - Or: global categories selected (vacation, observances, fun-days)
  const hasStates = allCountryStates.length > 0;
  const hasGlobalContent = config.categories.some(
    (c) => c === 'vacation' || c === 'observances' || c === 'fun-days'
  );
  const hasCountryContent = hasStates
    ? config.regions.length > 0
    : config.countries.length > 0;
  const isReadyToDownload = hasCountryContent || hasGlobalContent;

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
                regions={allRegions}
                selectedCountries={config.countries}
                selectedRegions={config.regions}
                selectedCategories={config.categories}
                onCountriesChange={handleCountriesChange}
                onRegionsChange={handleRegionsChange}
                onCategoriesChange={handleCategoriesChange}
              />
            </section>

            <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <CategorySelector
                selectedCategories={config.categories}
                onSelectionChange={handleCategoriesChange}
                selectedObservances={config.selectedObservances || []}
                onObservancesChange={handleObservancesChange}
                selectedFunDays={config.selectedFunDays || []}
                onFunDaysChange={handleFunDaysChange}
                vacations={vacations}
                onVacationsChange={setVacations}
              />
            </section>

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
                  // For countries without states, use the country codes as regions
                  regions: hasStates ? config.regions : config.countries,
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
