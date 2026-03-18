'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
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
import { ThemeToggle } from '@/components/ThemeToggle';
import { useVacationStorage } from '@/hooks/useVacationStorage';
import { WizardShell, WizardStep } from '@/components/wizard/WizardShell';
import { StepCategories } from '@/components/wizard/StepCategories';
import { StepCountries } from '@/components/wizard/StepCountries';
import { StepDetails } from '@/components/wizard/StepDetails';
import { StepPreview } from '@/components/wizard/StepPreview';
import { Heart } from 'lucide-react';

// Categories that require country selection
const COUNTRY_CATEGORIES: EventCategory[] = ['public-holidays', 'school-holidays', 'bridge-days'];

// Categories that have sub-item selection
const DETAIL_CATEGORIES: EventCategory[] = ['observances', 'fun-days', 'famous-birthdays', 'vacation'];

export default function ErstellenPage() {
  const countries = getCountries();
  const allRegions = getRegions();
  const availableYears = getAvailableYears();
  const [vacations, setVacations] = useVacationStorage();
  const [currentStep, setCurrentStep] = useState(0);

  const [config, setConfig] = useState<CalendarConfig>({
    countries: [],
    regions: [],
    categories: [],
    selectedObservances: [],
    selectedFunDays: [],
    selectedFamousPeople: [],
    year: getCurrentYear(),
  });

  const allCountryStates = useMemo(
    () => config.countries.flatMap((c) => getStatesByCountry(c)),
    [config.countries]
  );

  useEffect(() => {
    if (!availableYears.includes(config.year)) {
      setConfig((prev) => ({
        ...prev,
        year: availableYears[availableYears.length - 1] || getCurrentYear(),
      }));
    }
  }, [availableYears, config.year]);

  // Derived state
  const needsCountryStep = config.categories.some((c) => COUNTRY_CATEGORIES.includes(c));
  const needsDetailsStep = config.categories.some((c) => DETAIL_CATEGORIES.includes(c));

  const hasStates = allCountryStates.length > 0;
  const hasGlobalContent = config.categories.some(
    (c) => c === 'vacation' || c === 'observances' || c === 'fun-days' ||
      c === 'wikipedia-today' || c === 'wikipedia-random' ||
      c === 'famous-birthdays' || c === 'moon-phases'
  );
  const hasCountryContent = hasStates ? config.regions.length > 0 : config.countries.length > 0;
  const isReadyToDownload = hasCountryContent || hasGlobalContent;

  // Build steps dynamically
  const steps: WizardStep[] = useMemo(() => {
    const s: WizardStep[] = [
      { id: 'categories', label: 'Kategorien wählen', shortLabel: 'Kategorien', available: true },
    ];
    s.push({
      id: 'countries',
      label: 'Länder festlegen',
      shortLabel: 'Länder',
      available: needsCountryStep,
    });
    s.push({
      id: 'details',
      label: 'Feintuning',
      shortLabel: 'Details',
      available: needsDetailsStep,
    });
    s.push({
      id: 'preview',
      label: 'Vorschau & Download',
      shortLabel: 'Download',
      available: config.categories.length > 0,
    });
    return s;
  }, [needsCountryStep, needsDetailsStep, config.categories.length]);

  // Events for preview
  const events = useMemo(() => {
    const effectiveRegions = allCountryStates.length === 0 ? config.countries : config.regions;
    const hasCC = effectiveRegions.length > 0;
    const hasGC = config.categories.some(
      (c) => c === 'vacation' || c === 'observances' || c === 'fun-days' ||
        c === 'wikipedia-today' || c === 'wikipedia-random' ||
        c === 'famous-birthdays' || c === 'moon-phases'
    );
    if (!hasCC && !hasGC) return [];
    return loadEvents(effectiveRegions, config.categories, config.year, config.countries, vacations, config.selectedObservances, config.selectedFunDays, config.selectedFamousPeople);
  }, [config, allCountryStates.length, vacations]);

  const downloadConfig: CalendarConfig = {
    ...config,
    regions: hasStates ? config.regions : config.countries,
  };

  // Handlers
  const handleCategoryToggle = useCallback((category: EventCategory) => {
    setConfig((prev) => {
      const has = prev.categories.includes(category);
      const newCategories = has
        ? prev.categories.filter((c) => c !== category)
        : [...prev.categories, category];

      // Auto-add public-holidays when adding school-holidays or bridge-days if not present
      if (!has && (category === 'school-holidays' || category === 'bridge-days') && !newCategories.includes('public-holidays')) {
        newCategories.push('public-holidays');
      }

      return { ...prev, categories: newCategories };
    });
  }, []);

  const handleCountriesChange = useCallback((countryCodes: string[]) => {
    setConfig((prev) => {
      const anyHasSchoolHolidays = countryCodes.some((c) => getCountryByCode(c)?.hasSchoolHolidays);
      let newCategories = prev.categories;
      if (!anyHasSchoolHolidays && prev.categories.includes('school-holidays')) {
        newCategories = prev.categories.filter((c) => c !== 'school-holidays');
      }
      const validRegions = prev.regions.filter((r) => {
        const cc = r.split('-')[0];
        return countryCodes.includes(cc);
      });
      return { ...prev, countries: countryCodes, regions: validRegions, categories: newCategories };
    });
  }, []);

  const handleRegionsChange = useCallback((regions: string[]) => {
    setConfig((prev) => ({ ...prev, regions }));
  }, []);

  const handleYearChange = useCallback((year: number) => {
    setConfig((prev) => ({ ...prev, year }));
  }, []);

  const handleObservancesChange = useCallback((ids: string[]) => {
    setConfig((prev) => ({ ...prev, selectedObservances: ids }));
  }, []);

  const handleFunDaysChange = useCallback((ids: string[]) => {
    setConfig((prev) => ({ ...prev, selectedFunDays: ids }));
  }, []);

  const handleFamousPeopleChange = useCallback((ids: string[]) => {
    setConfig((prev) => ({ ...prev, selectedFamousPeople: ids }));
  }, []);

  // Navigation
  const getNextAvailableStep = (from: number): number => {
    for (let i = from + 1; i < steps.length; i++) {
      if (steps[i].available) return i;
    }
    return from;
  };

  const getPrevAvailableStep = (from: number): number => {
    for (let i = from - 1; i >= 0; i--) {
      if (steps[i].available) return i;
    }
    return from;
  };

  const handleNext = () => {
    const next = getNextAvailableStep(currentStep);
    setCurrentStep(next);
  };

  const handleBack = () => {
    const prev = getPrevAvailableStep(currentStep);
    setCurrentStep(prev);
  };

  const handleStepClick = (index: number) => {
    if (steps[index].available && index <= currentStep) {
      setCurrentStep(index);
    }
  };

  // Can go next?
  const canGoNext = (() => {
    const step = steps[currentStep];
    if (!step) return false;
    switch (step.id) {
      case 'categories':
        return config.categories.length > 0;
      case 'countries':
        return config.countries.length > 0;
      case 'details':
        return true;
      case 'preview':
        return isReadyToDownload;
      default:
        return true;
    }
  })();

  // Render current step
  const renderStep = () => {
    const step = steps[currentStep];
    if (!step) return null;

    switch (step.id) {
      case 'categories':
        return (
          <StepCategories
            selectedCategories={config.categories}
            onCategoryToggle={handleCategoryToggle}
          />
        );
      case 'countries':
        return (
          <StepCountries
            countries={countries}
            regions={allRegions}
            selectedCountries={config.countries}
            selectedRegions={config.regions}
            selectedCategories={config.categories}
            onCountriesChange={handleCountriesChange}
            onRegionsChange={handleRegionsChange}
          />
        );
      case 'details':
        return (
          <StepDetails
            selectedCategories={config.categories}
            selectedObservances={config.selectedObservances || []}
            onObservancesChange={handleObservancesChange}
            selectedFunDays={config.selectedFunDays || []}
            onFunDaysChange={handleFunDaysChange}
            selectedFamousPeople={config.selectedFamousPeople || []}
            onFamousPeopleChange={handleFamousPeopleChange}
            vacations={vacations}
            onVacationsChange={setVacations}
          />
        );
      case 'preview':
        return (
          <StepPreview
            events={events}
            config={config}
            downloadConfig={downloadConfig}
            availableYears={availableYears}
            onYearChange={handleYearChange}
            isReadyToDownload={isReadyToDownload}
            selectedCategories={config.categories}
          />
        );
      default:
        return null;
    }
  };

  const isPreviewStep = steps[currentStep]?.id === 'preview';

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-[var(--bg-primary)]/75 border-b border-[var(--border)]">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="text-lg font-bold tracking-tight text-[var(--text-primary)] hover:opacity-80 transition-opacity">
            <span className="bg-gradient-to-r from-[var(--accent)] to-purple-400 bg-clip-text text-transparent">Q</span>alendr
          </Link>
          <div className="flex items-center gap-2">
            <a
              href="https://buymeacoffee.com/qalendr"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded-full border border-pink-500/20 text-[var(--text-secondary)] hover:text-pink-400 hover:border-pink-500/40 transition-all"
            >
              <Heart className="h-3 w-3 text-pink-500" />
              Supporte uns
            </a>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Wizard */}
      <WizardShell
        steps={steps}
        currentStep={currentStep}
        onStepClick={handleStepClick}
        onBack={handleBack}
        onNext={handleNext}
        canGoNext={canGoNext}
        nextLabel={isPreviewStep ? undefined : undefined}
      >
        {renderStep()}
      </WizardShell>
    </div>
  );
}
