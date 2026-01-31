'use client';

import { useState } from 'react';
import { EventCategory, VacationEntry } from '@/lib/data/types';
import { getObservances, getFunDays, SpecialDayData } from '@/lib/data';
import { formatDateRangeDE, daysBetween, getCurrentYear } from '@/lib/utils';

interface CategorySelectorProps {
  selectedCategories: EventCategory[];
  onSelectionChange: (categories: EventCategory[]) => void;
  selectedObservances: string[];
  onObservancesChange: (ids: string[]) => void;
  selectedFunDays: string[];
  onFunDaysChange: (ids: string[]) => void;
  vacations: VacationEntry[];
  onVacationsChange: (vacations: VacationEntry[]) => void;
}

/**
 * Parse vacation date input in various formats
 */
function parseVacationInput(
  input: string,
  defaultYear: number
): { start: string; end: string } | null {
  const trimmed = input.trim();

  // ISO format: "2025-07-15 - 2025-07-28"
  const isoMatch = trimmed.match(
    /^(\d{4})-(\d{1,2})-(\d{1,2})\s*[-–]\s*(\d{4})-(\d{1,2})-(\d{1,2})$/
  );
  if (isoMatch) {
    const [, startYear, startMonth, startDay, endYear, endMonth, endDay] = isoMatch;
    const start = `${startYear}-${startMonth.padStart(2, '0')}-${startDay.padStart(2, '0')}`;
    const end = `${endYear}-${endMonth.padStart(2, '0')}-${endDay.padStart(2, '0')}`;
    return { start, end };
  }

  // German format with year: "15.07.2025-28.07.2025"
  const germanWithYearMatch = trimmed.match(
    /^(\d{1,2})\.(\d{1,2})\.(\d{4})\s*[-–]\s*(\d{1,2})\.(\d{1,2})\.(\d{4})$/
  );
  if (germanWithYearMatch) {
    const [, startDay, startMonth, startYear, endDay, endMonth, endYear] = germanWithYearMatch;
    const start = `${startYear}-${startMonth.padStart(2, '0')}-${startDay.padStart(2, '0')}`;
    const end = `${endYear}-${endMonth.padStart(2, '0')}-${endDay.padStart(2, '0')}`;
    return { start, end };
  }

  // German format without year: "15.07-28.07"
  const germanMatch = trimmed.match(
    /^(\d{1,2})\.(\d{1,2})\s*[-–]\s*(\d{1,2})\.(\d{1,2})$/
  );
  if (germanMatch) {
    const [, startDay, startMonth, endDay, endMonth] = germanMatch;
    const start = `${defaultYear}-${startMonth.padStart(2, '0')}-${startDay.padStart(2, '0')}`;
    const end = `${defaultYear}-${endMonth.padStart(2, '0')}-${endDay.padStart(2, '0')}`;
    return { start, end };
  }

  return null;
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function CategorySelector({
  selectedCategories,
  onSelectionChange,
  selectedObservances,
  onObservancesChange,
  selectedFunDays,
  onFunDaysChange,
  vacations,
  onVacationsChange,
}: CategorySelectorProps) {
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [quickInput, setQuickInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [inputMode, setInputMode] = useState<'quick' | 'picker'>('quick');

  const observances = getObservances();
  const funDays = getFunDays();
  const currentYear = getCurrentYear();

  const handleCategoryToggle = (categoryId: EventCategory) => {
    if (selectedCategories.includes(categoryId)) {
      onSelectionChange(selectedCategories.filter((c) => c !== categoryId));
      setExpandedCategories(expandedCategories.filter((c) => c !== categoryId));
      // Clear selections when category is disabled
      if (categoryId === 'observances') onObservancesChange([]);
      if (categoryId === 'fun-days') onFunDaysChange([]);
    } else {
      onSelectionChange([...selectedCategories, categoryId]);
      // Auto-expand when enabling
      setExpandedCategories([...expandedCategories, categoryId]);
      // Auto-select all for observances/fun-days
      if (categoryId === 'observances') {
        onObservancesChange(observances.map((o) => o.id));
      }
      if (categoryId === 'fun-days') {
        onFunDaysChange(funDays.map((f) => f.id));
      }
    }
  };

  const handleExpandToggle = (categoryId: string) => {
    if (expandedCategories.includes(categoryId)) {
      setExpandedCategories(expandedCategories.filter((c) => c !== categoryId));
    } else {
      setExpandedCategories([...expandedCategories, categoryId]);
    }
  };

  const handleObservanceToggle = (id: string) => {
    if (selectedObservances.includes(id)) {
      const newSelection = selectedObservances.filter((o) => o !== id);
      onObservancesChange(newSelection);
      if (newSelection.length === 0) {
        onSelectionChange(selectedCategories.filter((c) => c !== 'observances'));
      }
    } else {
      onObservancesChange([...selectedObservances, id]);
    }
  };

  const handleFunDayToggle = (id: string) => {
    if (selectedFunDays.includes(id)) {
      const newSelection = selectedFunDays.filter((f) => f !== id);
      onFunDaysChange(newSelection);
      if (newSelection.length === 0) {
        onSelectionChange(selectedCategories.filter((c) => c !== 'fun-days'));
      }
    } else {
      onFunDaysChange([...selectedFunDays, id]);
    }
  };

  const handleSelectAll = (type: 'observances' | 'fun-days') => {
    if (type === 'observances') {
      onObservancesChange(observances.map((o) => o.id));
    } else {
      onFunDaysChange(funDays.map((f) => f.id));
    }
  };

  const handleSelectNone = (type: 'observances' | 'fun-days') => {
    if (type === 'observances') {
      onObservancesChange([]);
      onSelectionChange(selectedCategories.filter((c) => c !== 'observances'));
    } else {
      onFunDaysChange([]);
      onSelectionChange(selectedCategories.filter((c) => c !== 'fun-days'));
    }
  };

  // Vacation handlers
  const handleAddVacation = () => {
    setError(null);

    let start: string;
    let end: string;

    if (inputMode === 'quick') {
      const parsed = parseVacationInput(quickInput, currentYear);
      if (!parsed) {
        setError('Format nicht erkannt. Versuche z.B. "15.07-28.07"');
        return;
      }
      start = parsed.start;
      end = parsed.end;
    } else {
      if (!startDate || !endDate) {
        setError('Bitte Start- und Enddatum auswählen');
        return;
      }
      start = startDate;
      end = endDate;
    }

    const startDateObj = new Date(start);
    const endDateObj = new Date(end);

    if (isNaN(startDateObj.getTime()) || isNaN(endDateObj.getTime())) {
      setError('Ungültige Datumsangaben');
      return;
    }

    if (startDateObj > endDateObj) {
      setError('Startdatum muss vor dem Enddatum liegen');
      return;
    }

    const newVacation: VacationEntry = {
      id: generateId(),
      name: nameInput.trim() || 'Urlaub',
      startDate: start,
      endDate: end,
    };

    onVacationsChange([...vacations, newVacation]);
    setQuickInput('');
    setNameInput('');
    setStartDate('');
    setEndDate('');
  };

  const handleRemoveVacation = (id: string) => {
    onVacationsChange(vacations.filter((v) => v.id !== id));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddVacation();
    }
  };

  const renderDaysList = (
    days: SpecialDayData[],
    selectedIds: string[],
    onToggle: (id: string) => void,
    type: 'observances' | 'fun-days'
  ) => (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-600">
          {selectedIds.length} von {days.length} ausgewählt
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => handleSelectAll(type)}
            className="text-xs text-blue-600 hover:text-blue-800"
          >
            Alle
          </button>
          <span className="text-gray-300">|</span>
          <button
            type="button"
            onClick={() => handleSelectNone(type)}
            className="text-xs text-blue-600 hover:text-blue-800"
          >
            Keine
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto">
        {days.map((day) => (
          <label
            key={day.id}
            className={`
              flex items-center gap-2 p-2 rounded border cursor-pointer
              transition-colors text-sm
              ${
                selectedIds.includes(day.id)
                  ? 'bg-blue-50 border-blue-300 text-blue-900'
                  : 'bg-gray-50 border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-100'
              }
            `}
          >
            <input
              type="checkbox"
              checked={selectedIds.includes(day.id)}
              onChange={() => onToggle(day.id)}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="truncate">{day.name}</span>
          </label>
        ))}
      </div>
    </div>
  );

  const renderVacationInput = () => (
    <div className="space-y-4">
      {/* Existing vacations list */}
      {vacations.length > 0 && (
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {vacations.map((vacation) => (
            <div
              key={vacation.id}
              className="flex items-center justify-between p-2 rounded bg-purple-50 border border-purple-200"
            >
              <div className="min-w-0 flex-1">
                <p className="font-medium text-gray-900 text-sm truncate">{vacation.name}</p>
                <p className="text-xs text-gray-600">
                  {formatDateRangeDE(vacation.startDate, vacation.endDate)}
                  <span className="ml-1 text-gray-400">
                    ({daysBetween(vacation.startDate, vacation.endDate)}d)
                  </span>
                </p>
              </div>
              <button
                onClick={() => handleRemoveVacation(vacation.id)}
                className="ml-2 p-1 text-gray-400 hover:text-red-500 transition-colors"
                title="Löschen"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Input mode toggle */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setInputMode('quick')}
          className={`px-3 py-1 text-xs rounded-full transition-colors ${
            inputMode === 'quick'
              ? 'bg-purple-100 text-purple-700'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Schnelleingabe
        </button>
        <button
          type="button"
          onClick={() => setInputMode('picker')}
          className={`px-3 py-1 text-xs rounded-full transition-colors ${
            inputMode === 'picker'
              ? 'bg-purple-100 text-purple-700'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Kalender
        </button>
      </div>

      {/* Input fields */}
      <div className="space-y-2">
        {inputMode === 'quick' ? (
          <input
            type="text"
            value={quickInput}
            onChange={(e) => setQuickInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="z.B. 15.07-28.07"
            className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          />
        ) : (
          <div className="grid grid-cols-2 gap-2">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              onKeyDown={handleKeyDown}
              className="px-2 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              onKeyDown={handleKeyDown}
              className="px-2 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
          </div>
        )}

        <div className="flex gap-2">
          <input
            type="text"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Bezeichnung (optional)"
            className="flex-1 px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          />
          <button
            type="button"
            onClick={handleAddVacation}
            className="px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors"
          >
            +
          </button>
        </div>
      </div>

      {error && <p className="text-xs text-red-600">{error}</p>}

      <p className="text-xs text-gray-500">
        Einträge werden im Browser gespeichert.
      </p>
    </div>
  );

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Weitere Termine</h3>

      <div className="space-y-2">
        {/* Observances */}
        <div
          className={`rounded-lg border overflow-hidden transition-colors ${
            selectedCategories.includes('observances')
              ? 'border-orange-300 bg-orange-50/50'
              : 'border-gray-200'
          }`}
        >
          <div
            className={`flex items-center gap-3 p-3 ${
              selectedCategories.includes('observances')
                ? 'bg-orange-50'
                : 'bg-white hover:bg-gray-50'
            }`}
          >
            <input
              type="checkbox"
              checked={selectedCategories.includes('observances')}
              onChange={() => handleCategoryToggle('observances')}
              className="h-5 w-5 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
            />
            <button
              type="button"
              onClick={() => handleCategoryToggle('observances')}
              className="flex items-center gap-2 flex-1 text-left"
            >
              <span className="text-xl">💐</span>
              <div>
                <span className="font-medium text-gray-900">Gedenktage</span>
                <p className="text-sm text-gray-500">Muttertag, Valentinstag, Halloween & mehr</p>
              </div>
            </button>
            {selectedCategories.includes('observances') && (
              <>
                <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">
                  {selectedObservances.length}/{observances.length}
                </span>
                <button
                  type="button"
                  onClick={() => handleExpandToggle('observances')}
                  className="p-1 hover:bg-orange-100 rounded transition-colors"
                >
                  <svg
                    className={`w-5 h-5 text-gray-500 transition-transform ${
                      expandedCategories.includes('observances') ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </>
            )}
          </div>
          {selectedCategories.includes('observances') && expandedCategories.includes('observances') && (
            <div className="border-t border-orange-200 bg-white p-3">
              {renderDaysList(observances, selectedObservances, handleObservanceToggle, 'observances')}
            </div>
          )}
        </div>

        {/* Fun Days */}
        <div
          className={`rounded-lg border overflow-hidden transition-colors ${
            selectedCategories.includes('fun-days')
              ? 'border-yellow-300 bg-yellow-50/50'
              : 'border-gray-200'
          }`}
        >
          <div
            className={`flex items-center gap-3 p-3 ${
              selectedCategories.includes('fun-days')
                ? 'bg-yellow-50'
                : 'bg-white hover:bg-gray-50'
            }`}
          >
            <input
              type="checkbox"
              checked={selectedCategories.includes('fun-days')}
              onChange={() => handleCategoryToggle('fun-days')}
              className="h-5 w-5 rounded border-gray-300 text-yellow-600 focus:ring-yellow-500"
            />
            <button
              type="button"
              onClick={() => handleCategoryToggle('fun-days')}
              className="flex items-center gap-2 flex-1 text-left"
            >
              <span className="text-xl">🎉</span>
              <div>
                <span className="font-medium text-gray-900">Kuriose Tage</span>
                <p className="text-sm text-gray-500">Tag des Bieres, Star Wars Tag & Co.</p>
              </div>
            </button>
            {selectedCategories.includes('fun-days') && (
              <>
                <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">
                  {selectedFunDays.length}/{funDays.length}
                </span>
                <button
                  type="button"
                  onClick={() => handleExpandToggle('fun-days')}
                  className="p-1 hover:bg-yellow-100 rounded transition-colors"
                >
                  <svg
                    className={`w-5 h-5 text-gray-500 transition-transform ${
                      expandedCategories.includes('fun-days') ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </>
            )}
          </div>
          {selectedCategories.includes('fun-days') && expandedCategories.includes('fun-days') && (
            <div className="border-t border-yellow-200 bg-white p-3">
              {renderDaysList(funDays, selectedFunDays, handleFunDayToggle, 'fun-days')}
            </div>
          )}
        </div>

        {/* Vacation */}
        <div
          className={`rounded-lg border overflow-hidden transition-colors ${
            selectedCategories.includes('vacation')
              ? 'border-purple-300 bg-purple-50/50'
              : 'border-gray-200'
          }`}
        >
          <div
            className={`flex items-center gap-3 p-3 ${
              selectedCategories.includes('vacation')
                ? 'bg-purple-50'
                : 'bg-white hover:bg-gray-50'
            }`}
          >
            <input
              type="checkbox"
              checked={selectedCategories.includes('vacation')}
              onChange={() => handleCategoryToggle('vacation')}
              className="h-5 w-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
            />
            <button
              type="button"
              onClick={() => handleCategoryToggle('vacation')}
              className="flex items-center gap-2 flex-1 text-left"
            >
              <span className="text-xl">🏖️</span>
              <div>
                <span className="font-medium text-gray-900">Urlaub</span>
                <p className="text-sm text-gray-500">Deine persönlichen Urlaubstage</p>
              </div>
            </button>
            {selectedCategories.includes('vacation') && (
              <>
                {vacations.length > 0 && (
                  <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                    {vacations.length}
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => handleExpandToggle('vacation')}
                  className="p-1 hover:bg-purple-100 rounded transition-colors"
                >
                  <svg
                    className={`w-5 h-5 text-gray-500 transition-transform ${
                      expandedCategories.includes('vacation') ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </>
            )}
          </div>
          {selectedCategories.includes('vacation') && expandedCategories.includes('vacation') && (
            <div className="border-t border-purple-200 bg-white p-3">
              {renderVacationInput()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
