import { useCallback } from 'react';
import type { EventCategory, VacationEntry } from '@/lib/data/types';
import { getObservances, getFunDays, getFamousPeople } from '@/lib/data';
import { getCurrentYear } from '@/lib/utils';

/**
 * Parse vacation date input in various formats
 */
export function parseVacationInput(
  input: string,
  defaultYear: number
): { start: string; end: string } | null {
  const trimmed = input.trim();

  const isoMatch = trimmed.match(
    /^(\d{4})-(\d{1,2})-(\d{1,2})\s*[-–]\s*(\d{4})-(\d{1,2})-(\d{1,2})$/
  );
  if (isoMatch) {
    const [, startYear, startMonth, startDay, endYear, endMonth, endDay] = isoMatch;
    return {
      start: `${startYear}-${startMonth.padStart(2, '0')}-${startDay.padStart(2, '0')}`,
      end: `${endYear}-${endMonth.padStart(2, '0')}-${endDay.padStart(2, '0')}`,
    };
  }

  const germanWithYearMatch = trimmed.match(
    /^(\d{1,2})\.(\d{1,2})\.(\d{4})\s*[-–]\s*(\d{1,2})\.(\d{1,2})\.(\d{4})$/
  );
  if (germanWithYearMatch) {
    const [, startDay, startMonth, startYear, endDay, endMonth, endYear] = germanWithYearMatch;
    return {
      start: `${startYear}-${startMonth.padStart(2, '0')}-${startDay.padStart(2, '0')}`,
      end: `${endYear}-${endMonth.padStart(2, '0')}-${endDay.padStart(2, '0')}`,
    };
  }

  const germanMatch = trimmed.match(
    /^(\d{1,2})\.(\d{1,2})\s*[-–]\s*(\d{1,2})\.(\d{1,2})$/
  );
  if (germanMatch) {
    const [, startDay, startMonth, endDay, endMonth] = germanMatch;
    return {
      start: `${defaultYear}-${startMonth.padStart(2, '0')}-${startDay.padStart(2, '0')}`,
      end: `${defaultYear}-${endMonth.padStart(2, '0')}-${endDay.padStart(2, '0')}`,
    };
  }

  return null;
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

interface CategoryHandlersProps {
  selectedCategories: EventCategory[];
  onCategoriesChange: (categories: EventCategory[]) => void;
  selectedObservances: string[];
  onObservancesChange: (ids: string[]) => void;
  selectedFunDays: string[];
  onFunDaysChange: (ids: string[]) => void;
  selectedFamousPeople: string[];
  onFamousPeopleChange: (ids: string[]) => void;
  vacations: VacationEntry[];
  onVacationsChange: (vacations: VacationEntry[]) => void;
}

export function useCategoryHandlers({
  selectedCategories,
  onCategoriesChange,
  selectedObservances,
  onObservancesChange,
  selectedFunDays,
  onFunDaysChange,
  selectedFamousPeople,
  onFamousPeopleChange,
  vacations,
  onVacationsChange,
}: CategoryHandlersProps) {
  const observances = getObservances();
  const funDays = getFunDays();
  const famousPeople = getFamousPeople();
  const currentYear = getCurrentYear();

  const handleCategoryToggle = useCallback(
    (category: EventCategory) => {
      if (selectedCategories.includes(category)) {
        onCategoriesChange(selectedCategories.filter((c) => c !== category));
        if (category === 'observances') onObservancesChange([]);
        if (category === 'fun-days') onFunDaysChange([]);
        if (category === 'famous-birthdays') onFamousPeopleChange([]);
      } else {
        onCategoriesChange([...selectedCategories, category]);
        if (category === 'observances') onObservancesChange(observances.map((o) => o.id));
        if (category === 'fun-days') onFunDaysChange(funDays.map((f) => f.id));
        if (category === 'famous-birthdays') onFamousPeopleChange(famousPeople.map((p) => p.id));
      }
    },
    [selectedCategories, onCategoriesChange, observances, funDays, famousPeople, onObservancesChange, onFunDaysChange, onFamousPeopleChange]
  );

  const handleItemToggle = useCallback(
    (category: EventCategory, id: string) => {
      if (category === 'observances') {
        onObservancesChange(
          selectedObservances.includes(id)
            ? selectedObservances.filter((o) => o !== id)
            : [...selectedObservances, id]
        );
      } else if (category === 'fun-days') {
        onFunDaysChange(
          selectedFunDays.includes(id)
            ? selectedFunDays.filter((f) => f !== id)
            : [...selectedFunDays, id]
        );
      } else if (category === 'famous-birthdays') {
        onFamousPeopleChange(
          selectedFamousPeople.includes(id)
            ? selectedFamousPeople.filter((p) => p !== id)
            : [...selectedFamousPeople, id]
        );
      }
    },
    [selectedObservances, selectedFunDays, selectedFamousPeople, onObservancesChange, onFunDaysChange, onFamousPeopleChange]
  );

  const handleSelectAll = useCallback(
    (category: EventCategory) => {
      if (category === 'observances') onObservancesChange(observances.map((o) => o.id));
      else if (category === 'fun-days') onFunDaysChange(funDays.map((f) => f.id));
      else if (category === 'famous-birthdays') onFamousPeopleChange(famousPeople.map((p) => p.id));
    },
    [observances, funDays, famousPeople, onObservancesChange, onFunDaysChange, onFamousPeopleChange]
  );

  const handleSelectNone = useCallback(
    (category: EventCategory) => {
      if (category === 'observances') onObservancesChange([]);
      else if (category === 'fun-days') onFunDaysChange([]);
      else if (category === 'famous-birthdays') onFamousPeopleChange([]);
    },
    [onObservancesChange, onFunDaysChange, onFamousPeopleChange]
  );

  const getItemCount = useCallback(
    (category: EventCategory): { count: number; total: number } | null => {
      switch (category) {
        case 'observances':
          return { count: selectedObservances.length, total: observances.length };
        case 'fun-days':
          return { count: selectedFunDays.length, total: funDays.length };
        case 'famous-birthdays':
          return { count: selectedFamousPeople.length, total: famousPeople.length };
        case 'vacation':
          return vacations.length > 0 ? { count: vacations.length, total: vacations.length } : null;
        default:
          return null;
      }
    },
    [selectedObservances, selectedFunDays, selectedFamousPeople, vacations, observances, funDays, famousPeople]
  );

  return {
    observances,
    funDays,
    famousPeople,
    currentYear,
    handleCategoryToggle,
    handleItemToggle,
    handleSelectAll,
    handleSelectNone,
    getItemCount,
  };
}
