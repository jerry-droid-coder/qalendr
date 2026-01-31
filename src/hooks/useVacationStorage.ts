'use client';

import { useState, useEffect } from 'react';
import { VacationEntry } from '@/lib/data/types';

const STORAGE_KEY = 'qalendr-vacations';

/**
 * Validate a single vacation entry
 */
function isValidVacationEntry(entry: unknown): entry is VacationEntry {
  if (typeof entry !== 'object' || entry === null) return false;

  const obj = entry as Record<string, unknown>;

  // Check required fields exist and have correct types
  if (typeof obj.id !== 'string' || obj.id.length === 0) return false;
  if (typeof obj.name !== 'string' || obj.name.length === 0) return false;
  if (typeof obj.startDate !== 'string') return false;
  if (typeof obj.endDate !== 'string') return false;

  // Validate date format (YYYY-MM-DD)
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(obj.startDate)) return false;
  if (!dateRegex.test(obj.endDate)) return false;

  // Validate dates are parseable
  const startDate = new Date(obj.startDate);
  const endDate = new Date(obj.endDate);
  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) return false;

  // Validate start <= end
  if (startDate > endDate) return false;

  // Validate name length (prevent abuse)
  if (obj.name.length > 200) return false;

  return true;
}

/**
 * Validate and filter vacation entries from localStorage
 */
function validateVacations(data: unknown): VacationEntry[] {
  if (!Array.isArray(data)) return [];

  // Filter out invalid entries and limit to prevent abuse
  const MAX_ENTRIES = 100;
  return data
    .filter(isValidVacationEntry)
    .slice(0, MAX_ENTRIES);
}

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
        const validated = validateVacations(parsed);
        setVacations(validated);

        // If validation changed the data, update localStorage
        if (validated.length !== (Array.isArray(parsed) ? parsed.length : 0)) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(validated));
        }
      }
    } catch (error) {
      console.error('Error loading vacations from localStorage:', error);
      // Clear corrupted data
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {
        // Ignore if removal fails
      }
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage on change (but only after initial load)
  const updateVacations = (newVacations: VacationEntry[]) => {
    // Validate before saving
    const validated = validateVacations(newVacations);
    setVacations(validated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(validated));
    } catch (error) {
      console.error('Error saving vacations to localStorage:', error);
    }
  };

  return [vacations, updateVacations, isLoaded] as const;
}
