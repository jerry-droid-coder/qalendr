'use client';

import { useState, useEffect } from 'react';
import { VacationEntry } from '@/lib/data/types';

const STORAGE_KEY = 'standard-termine-vacations';

/**
 * Hook for persisting vacation entries in localStorage
 */
export function useVacationStorage() {
  const [vacations, setVacations] = useState<VacationEntry[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setVacations(parsed);
        }
      }
    } catch (error) {
      console.error('Error loading vacations from localStorage:', error);
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage on change (but only after initial load)
  const updateVacations = (newVacations: VacationEntry[]) => {
    setVacations(newVacations);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newVacations));
    } catch (error) {
      console.error('Error saving vacations to localStorage:', error);
    }
  };

  return [vacations, updateVacations, isLoaded] as const;
}
