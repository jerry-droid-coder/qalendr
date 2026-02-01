'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
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
  CountryGrid,
  CategorySelector,
  YearSelector,
  DownloadButton,
  EventPreview,
  ThemeToggle,
  FeatureHero,
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
    selectedFamousPeople: [],
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
      (c) => c === 'vacation' || c === 'observances' || c === 'fun-days' || c === 'wikipedia-today' || c === 'wikipedia-random' || c === 'famous-birthdays' || c === 'moon-phases'
    );

    if (!hasCountryContent && !hasGlobalContent) return [];

    return loadEvents(
      effectiveRegions,
      config.categories,
      config.year,
      config.countries,
      vacations,
      config.selectedObservances,
      config.selectedFunDays,
      config.selectedFamousPeople
    );
  }, [config.regions, config.categories, config.year, config.countries, allCountryStates.length, vacations, config.selectedObservances, config.selectedFunDays, config.selectedFamousPeople]);

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

  const handleFamousPeopleChange = (selectedFamousPeople: string[]) => {
    setConfig((prev) => ({ ...prev, selectedFamousPeople }));
  };

  const handleYearChange = (year: number) => {
    setConfig((prev) => ({ ...prev, year }));
  };

  const handleCategoryToggle = (category: EventCategory) => {
    if (config.categories.includes(category)) {
      handleCategoriesChange(config.categories.filter((c) => c !== category));
    } else {
      handleCategoriesChange([...config.categories, category]);
    }
  };

  // Ready to download if:
  // - Countries with states: at least one region selected
  // - Countries without states: at least one country selected
  // - Or: global categories selected
  const hasStates = allCountryStates.length > 0;
  const hasGlobalContent = config.categories.some(
    (c) => c === 'vacation' || c === 'observances' || c === 'fun-days' || c === 'wikipedia-today' || c === 'wikipedia-random' || c === 'famous-birthdays' || c === 'moon-phases'
  );
  const hasCountryContent = hasStates
    ? config.regions.length > 0
    : config.countries.length > 0;
  const isReadyToDownload = hasCountryContent || hasGlobalContent;

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 backdrop-blur-sm bg-[var(--bg-primary)]/80 border-b border-[var(--border)]">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-[var(--text-primary)]">
            Qalendr
          </h1>
          <ThemeToggle />
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 sm:py-12">
        {/* Hero Section */}
        <section className="text-center mb-4">
          <h2 className="text-4xl sm:text-5xl font-bold mb-6 bg-gradient-to-r from-[var(--accent)] to-purple-500 bg-clip-text text-transparent">
            Dein Qalendr
          </h2>
          <p className="text-lg text-[var(--text-secondary)] max-w-2xl mx-auto leading-relaxed">
            Erstelle einen Kalender mit Feiertagen, Schulferien und besonderen Tagen.
            Einfach herunterladen und in deinen Kalender importieren.
          </p>
        </section>

        {/* Feature Hero - Quick Category Selection */}
        <FeatureHero
          selectedCategories={config.categories}
          onCategoryToggle={handleCategoryToggle}
          selectedObservances={config.selectedObservances || []}
          onObservancesChange={handleObservancesChange}
          selectedFunDays={config.selectedFunDays || []}
          onFunDaysChange={handleFunDaysChange}
          selectedFamousPeople={config.selectedFamousPeople || []}
          onFamousPeopleChange={handleFamousPeopleChange}
          vacations={vacations}
          onVacationsChange={setVacations}
        />

        {/* Country Grid */}
        <CountryGrid
          countries={countries}
          regions={allRegions}
          selectedCountries={config.countries}
          selectedRegions={config.regions}
          selectedCategories={config.categories}
          onCountriesChange={handleCountriesChange}
          onRegionsChange={handleRegionsChange}
          onCategoriesChange={handleCategoriesChange}
        />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          {/* Configuration Panel */}
          <div className="lg:col-span-2 space-y-6">
            {/* Category Selector */}
            <section className="bg-[var(--bg-card)] rounded-2xl shadow-[var(--shadow-md)] border border-[var(--border)] p-6 hover:shadow-[var(--shadow-lg)] hover:border-[var(--border-hover)] transition-all duration-150">
              <CategorySelector
                selectedCategories={config.categories}
                onSelectionChange={handleCategoriesChange}
                selectedObservances={config.selectedObservances || []}
                onObservancesChange={handleObservancesChange}
                selectedFunDays={config.selectedFunDays || []}
                onFunDaysChange={handleFunDaysChange}
                selectedFamousPeople={config.selectedFamousPeople || []}
                onFamousPeopleChange={handleFamousPeopleChange}
                vacations={vacations}
                onVacationsChange={setVacations}
              />
            </section>

            {/* Year Selector */}
            <section className="bg-[var(--bg-card)] rounded-2xl shadow-[var(--shadow-md)] border border-[var(--border)] p-6 hover:shadow-[var(--shadow-lg)] hover:border-[var(--border-hover)] transition-all duration-150">
              <YearSelector
                availableYears={availableYears}
                selectedYear={config.year}
                onYearChange={handleYearChange}
              />
            </section>

            {/* Download Button */}
            <section className="bg-[var(--bg-card)] rounded-2xl shadow-[var(--shadow-md)] border border-[var(--border)] p-6 hover:shadow-[var(--shadow-lg)] hover:border-[var(--border-hover)] transition-all duration-150">
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
            <div className="bg-[var(--bg-card)] rounded-2xl shadow-[var(--shadow-md)] border border-[var(--border)] p-6 sticky top-24">
              <EventPreview events={events} maxItems={15} />
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-20 text-center text-sm text-[var(--text-muted)]">
          <p>
            Die Kalender-Datei (.ics) ist kompatibel mit Apple Kalender, Google Kalender,
            Microsoft Outlook und anderen Kalender-Apps.
          </p>
          <p className="mt-2">
            Daten ohne Gewähr. Stand: 2026-2028
          </p>
          <div className="mt-6 flex justify-center gap-6">
            <Link
              href="/impressum"
              className="text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
            >
              Impressum
            </Link>
            <Link
              href="/datenschutz"
              className="text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
            >
              Datenschutz
            </Link>
          </div>
        </footer>
      </main>
    </div>
  );
}
