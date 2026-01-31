'use client';

import { useState } from 'react';
import { EventCategory, VacationEntry } from '@/lib/data/types';
import { getObservances, getFunDays, getFamousPeople, SpecialDayData, FamousPerson } from '@/lib/data';
import { formatDateRangeDE, daysBetween, getCurrentYear } from '@/lib/utils';

interface CategorySelectorProps {
  selectedCategories: EventCategory[];
  onSelectionChange: (categories: EventCategory[]) => void;
  selectedObservances: string[];
  onObservancesChange: (ids: string[]) => void;
  selectedFunDays: string[];
  onFunDaysChange: (ids: string[]) => void;
  selectedFamousPeople: string[];
  onFamousPeopleChange: (ids: string[]) => void;
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

// Category configuration for rendering
interface CategoryConfig {
  id: EventCategory;
  icon: string;
  title: string;
  description: string;
  borderColor: string;
  bgColor: string;
  badgeColor: string;
  badgeTextColor: string;
  checkboxColor: string;
}

const CATEGORY_CONFIGS: CategoryConfig[] = [
  {
    id: 'observances',
    icon: '💐',
    title: 'Gedenktage',
    description: 'Muttertag, Valentinstag, Halloween & mehr',
    borderColor: 'var(--orange-border)',
    bgColor: 'var(--orange-bg)',
    badgeColor: 'var(--orange-badge-bg)',
    badgeTextColor: 'var(--orange-badge-text)',
    checkboxColor: '#f97316',
  },
  {
    id: 'fun-days',
    icon: '🎉',
    title: 'Kuriose Tage',
    description: 'Tag des Bieres, Star Wars Tag & Co.',
    borderColor: 'var(--yellow-border)',
    bgColor: 'var(--yellow-bg)',
    badgeColor: 'var(--yellow-badge-bg)',
    badgeTextColor: 'var(--yellow-badge-text)',
    checkboxColor: '#eab308',
  },
  {
    id: 'wikipedia-today',
    icon: '📖',
    title: 'Wikipedia heute',
    description: 'Historische Ereignisse für jeden Tag',
    borderColor: 'var(--slate-border)',
    bgColor: 'var(--slate-bg)',
    badgeColor: 'var(--slate-badge-bg)',
    badgeTextColor: 'var(--slate-badge-text)',
    checkboxColor: '#64748b',
  },
  {
    id: 'wikipedia-random',
    icon: '🎲',
    title: 'Wikipedia zufällig',
    description: 'Zufällige interessante Artikel',
    borderColor: 'var(--cyan-border)',
    bgColor: 'var(--cyan-bg)',
    badgeColor: 'var(--cyan-badge-bg)',
    badgeTextColor: 'var(--cyan-badge-text)',
    checkboxColor: '#06b6d4',
  },
  {
    id: 'famous-birthdays',
    icon: '🎂',
    title: 'Berühmte Personen',
    description: 'Geburts- und Todestage berühmter Persönlichkeiten',
    borderColor: 'var(--pink-border)',
    bgColor: 'var(--pink-bg)',
    badgeColor: 'var(--pink-badge-bg)',
    badgeTextColor: 'var(--pink-badge-text)',
    checkboxColor: '#ec4899',
  },
  {
    id: 'moon-phases',
    icon: '🌙',
    title: 'Mondphasen',
    description: 'Neumond & Vollmond',
    borderColor: 'var(--indigo-border)',
    bgColor: 'var(--indigo-bg)',
    badgeColor: 'var(--indigo-badge-bg)',
    badgeTextColor: 'var(--indigo-badge-text)',
    checkboxColor: '#6366f1',
  },
  {
    id: 'bridge-days',
    icon: '🌉',
    title: 'Brückentage',
    description: 'Empfohlene Urlaubstage für lange Wochenenden',
    borderColor: 'var(--teal-border)',
    bgColor: 'var(--teal-bg)',
    badgeColor: 'var(--teal-badge-bg)',
    badgeTextColor: 'var(--teal-badge-text)',
    checkboxColor: '#14b8a6',
  },
];

const VACATION_CONFIG: CategoryConfig = {
  id: 'vacation',
  icon: '🏖️',
  title: 'Urlaub',
  description: 'Deine persönlichen Urlaubstage',
  borderColor: 'var(--purple-border)',
  bgColor: 'var(--purple-bg)',
  badgeColor: 'var(--purple-badge-bg)',
  badgeTextColor: 'var(--purple-badge-text)',
  checkboxColor: '#a855f7',
};

export function CategorySelector({
  selectedCategories,
  onSelectionChange,
  selectedObservances,
  onObservancesChange,
  selectedFunDays,
  onFunDaysChange,
  selectedFamousPeople,
  onFamousPeopleChange,
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
  const famousPeople = getFamousPeople();
  const currentYear = getCurrentYear();

  const handleCategoryToggle = (categoryId: EventCategory) => {
    if (selectedCategories.includes(categoryId)) {
      onSelectionChange(selectedCategories.filter((c) => c !== categoryId));
      setExpandedCategories(expandedCategories.filter((c) => c !== categoryId));
      // Clear selections when category is disabled
      if (categoryId === 'observances') onObservancesChange([]);
      if (categoryId === 'fun-days') onFunDaysChange([]);
      if (categoryId === 'famous-birthdays') onFamousPeopleChange([]);
    } else {
      onSelectionChange([...selectedCategories, categoryId]);
      // Auto-expand when enabling
      setExpandedCategories([...expandedCategories, categoryId]);
      // Auto-select all for observances/fun-days/famous-birthdays
      if (categoryId === 'observances') {
        onObservancesChange(observances.map((o) => o.id));
      }
      if (categoryId === 'fun-days') {
        onFunDaysChange(funDays.map((f) => f.id));
      }
      if (categoryId === 'famous-birthdays') {
        onFamousPeopleChange(famousPeople.map((p) => p.id));
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

  const handleFamousPersonToggle = (id: string) => {
    if (selectedFamousPeople.includes(id)) {
      const newSelection = selectedFamousPeople.filter((p) => p !== id);
      onFamousPeopleChange(newSelection);
      if (newSelection.length === 0) {
        onSelectionChange(selectedCategories.filter((c) => c !== 'famous-birthdays'));
      }
    } else {
      onFamousPeopleChange([...selectedFamousPeople, id]);
    }
  };

  const handleSelectAll = (type: 'observances' | 'fun-days' | 'famous-birthdays') => {
    if (type === 'observances') {
      onObservancesChange(observances.map((o) => o.id));
    } else if (type === 'fun-days') {
      onFunDaysChange(funDays.map((f) => f.id));
    } else {
      onFamousPeopleChange(famousPeople.map((p) => p.id));
    }
  };

  const handleSelectNone = (type: 'observances' | 'fun-days' | 'famous-birthdays') => {
    if (type === 'observances') {
      onObservancesChange([]);
      onSelectionChange(selectedCategories.filter((c) => c !== 'observances'));
    } else if (type === 'fun-days') {
      onFunDaysChange([]);
      onSelectionChange(selectedCategories.filter((c) => c !== 'fun-days'));
    } else {
      onFamousPeopleChange([]);
      onSelectionChange(selectedCategories.filter((c) => c !== 'famous-birthdays'));
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
        <span className="text-sm text-[var(--text-secondary)]">
          {selectedIds.length} von {days.length} ausgewählt
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => handleSelectAll(type)}
            className="text-xs text-[var(--accent)] hover:text-[var(--accent-hover)]"
          >
            Alle
          </button>
          <span className="text-[var(--border)]">|</span>
          <button
            type="button"
            onClick={() => handleSelectNone(type)}
            className="text-xs text-[var(--accent)] hover:text-[var(--accent-hover)]"
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
              flex items-center gap-2 p-2 rounded-lg border cursor-pointer
              transition-all duration-150 text-sm
              ${
                selectedIds.includes(day.id)
                  ? 'bg-[var(--accent-light)] border-[var(--accent)] text-[var(--text-primary)]'
                  : 'bg-[var(--bg-hover)] border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--border-hover)] hover:bg-[var(--bg-card)]'
              }
            `}
          >
            <input
              type="checkbox"
              checked={selectedIds.includes(day.id)}
              onChange={() => onToggle(day.id)}
              className="h-4 w-4 rounded border-[var(--border)] text-[var(--accent)] focus:ring-[var(--accent)]"
            />
            <span className="truncate">{day.name}</span>
          </label>
        ))}
      </div>
    </div>
  );

  const renderFamousPeopleList = (
    people: FamousPerson[],
    selectedIds: string[],
    onToggle: (id: string) => void
  ) => (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm text-[var(--text-secondary)]">
          {selectedIds.length} von {people.length} ausgewählt
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => handleSelectAll('famous-birthdays')}
            className="text-xs text-[var(--accent)] hover:text-[var(--accent-hover)]"
          >
            Alle
          </button>
          <span className="text-[var(--border)]">|</span>
          <button
            type="button"
            onClick={() => handleSelectNone('famous-birthdays')}
            className="text-xs text-[var(--accent)] hover:text-[var(--accent-hover)]"
          >
            Keine
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto">
        {people.map((person) => (
          <label
            key={person.id}
            className={`
              flex items-center gap-2 p-2 rounded-lg border cursor-pointer
              transition-all duration-150 text-sm
              ${
                selectedIds.includes(person.id)
                  ? 'bg-[var(--pink-bg)] border-[var(--pink-border)] text-[var(--text-primary)]'
                  : 'bg-[var(--bg-hover)] border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--border-hover)] hover:bg-[var(--bg-card)]'
              }
            `}
          >
            <input
              type="checkbox"
              checked={selectedIds.includes(person.id)}
              onChange={() => onToggle(person.id)}
              className="h-4 w-4 rounded border-[var(--border)] text-pink-600 focus:ring-pink-500"
            />
            <div className="min-w-0 flex-1">
              <span className="truncate block">{person.name}</span>
              <span className="text-xs text-[var(--text-muted)] truncate block">{person.profession}</span>
            </div>
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
              className="flex items-center justify-between p-2 rounded-lg bg-[var(--purple-bg)] border border-[var(--purple-border)]"
            >
              <div className="min-w-0 flex-1">
                <p className="font-medium text-[var(--text-primary)] text-sm truncate">{vacation.name}</p>
                <p className="text-xs text-[var(--text-secondary)]">
                  {formatDateRangeDE(vacation.startDate, vacation.endDate)}
                  <span className="ml-1 text-[var(--text-muted)]">
                    ({daysBetween(vacation.startDate, vacation.endDate)}d)
                  </span>
                </p>
              </div>
              <button
                onClick={() => handleRemoveVacation(vacation.id)}
                className="ml-2 p-1 text-[var(--text-muted)] hover:text-red-500 transition-colors"
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
          className={`px-3 py-1 text-xs rounded-full transition-all duration-150 ${
            inputMode === 'quick'
              ? 'bg-[var(--purple-badge-bg)] text-[var(--purple-badge-text)]'
              : 'bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:bg-[var(--border)]'
          }`}
        >
          Schnelleingabe
        </button>
        <button
          type="button"
          onClick={() => setInputMode('picker')}
          className={`px-3 py-1 text-xs rounded-full transition-all duration-150 ${
            inputMode === 'picker'
              ? 'bg-[var(--purple-badge-bg)] text-[var(--purple-badge-text)]'
              : 'bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:bg-[var(--border)]'
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
            className="w-full px-3 py-2 text-sm text-[var(--text-primary)] bg-[var(--bg-card)] border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-[var(--accent)] focus:border-[var(--accent)] placeholder-[var(--text-muted)]"
          />
        ) : (
          <div className="grid grid-cols-2 gap-2">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              onKeyDown={handleKeyDown}
              aria-label="Startdatum"
              className="px-2 py-2 text-sm text-[var(--text-primary)] bg-[var(--bg-card)] border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-[var(--accent)] focus:border-[var(--accent)]"
            />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              onKeyDown={handleKeyDown}
              aria-label="Enddatum"
              className="px-2 py-2 text-sm text-[var(--text-primary)] bg-[var(--bg-card)] border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-[var(--accent)] focus:border-[var(--accent)]"
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
            className="flex-1 px-3 py-2 text-sm text-[var(--text-primary)] bg-[var(--bg-card)] border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-[var(--accent)] focus:border-[var(--accent)] placeholder-[var(--text-muted)]"
          />
          <button
            type="button"
            onClick={handleAddVacation}
            aria-label="Urlaub hinzufügen"
            className="px-4 py-2 bg-[var(--accent)] text-white text-sm rounded-lg hover:bg-[var(--accent-hover)] transition-all duration-150 active:scale-95"
          >
            +
          </button>
        </div>
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}

      <p className="text-xs text-[var(--text-muted)]">
        Einträge werden im Browser gespeichert.
      </p>
    </div>
  );

  // Get counts for expandable categories
  const getCategoryCount = (id: EventCategory): { count: number; total: number } | undefined => {
    switch (id) {
      case 'observances':
        return { count: selectedObservances.length, total: observances.length };
      case 'fun-days':
        return { count: selectedFunDays.length, total: funDays.length };
      case 'famous-birthdays':
        return { count: selectedFamousPeople.length, total: famousPeople.length };
      default:
        return undefined;
    }
  };

  // Check if category is expandable
  const isExpandable = (id: EventCategory): boolean => {
    return ['observances', 'fun-days', 'famous-birthdays'].includes(id);
  };

  // Get expanded content for category
  const getExpandedContent = (id: EventCategory): React.ReactNode => {
    switch (id) {
      case 'observances':
        return renderDaysList(observances, selectedObservances, handleObservanceToggle, 'observances');
      case 'fun-days':
        return renderDaysList(funDays, selectedFunDays, handleFunDayToggle, 'fun-days');
      case 'famous-birthdays':
        return renderFamousPeopleList(famousPeople, selectedFamousPeople, handleFamousPersonToggle);
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-[var(--text-primary)]">Weitere Termine</h3>

      <div className="space-y-2">
        {CATEGORY_CONFIGS.map((config) => {
          const isSelected = selectedCategories.includes(config.id);
          const isExpanded = expandedCategories.includes(config.id);
          const counts = getCategoryCount(config.id);
          const expandable = isExpandable(config.id);
          const expandedContent = getExpandedContent(config.id);

          return (
            <div
              key={config.id}
              className={`rounded-xl border overflow-hidden transition-all duration-150 ${
                isSelected
                  ? ''
                  : 'border-[var(--border)] hover:border-[var(--border-hover)]'
              }`}
              style={{
                borderColor: isSelected ? config.borderColor : undefined,
                backgroundColor: isSelected ? config.bgColor : undefined,
              }}
            >
              <div
                className={`flex items-center gap-3 p-3 transition-colors ${
                  isSelected ? '' : 'bg-[var(--bg-card)] hover:bg-[var(--bg-hover)]'
                }`}
                style={{
                  backgroundColor: isSelected ? config.bgColor : undefined,
                }}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => handleCategoryToggle(config.id)}
                  className="h-5 w-5 rounded border-[var(--border)]"
                  style={{ accentColor: config.checkboxColor }}
                />
                <button
                  type="button"
                  onClick={() => handleCategoryToggle(config.id)}
                  className="flex items-center gap-2 flex-1 text-left"
                >
                  <span className="text-xl">{config.icon}</span>
                  <div>
                    <span className="font-medium text-[var(--text-primary)]">{config.title}</span>
                    <p className="text-sm text-[var(--text-secondary)]">{config.description}</p>
                  </div>
                </button>
                {isSelected && counts && (
                  <>
                    <span
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: config.badgeColor, color: config.badgeTextColor }}
                    >
                      {counts.count}/{counts.total}
                    </span>
                    {expandable && (
                      <button
                        type="button"
                        onClick={() => handleExpandToggle(config.id)}
                        aria-label={isExpanded ? `${config.title} zuklappen` : `${config.title} aufklappen`}
                        aria-expanded={isExpanded}
                        className="p-1 rounded transition-colors hover:bg-[var(--bg-hover)]"
                      >
                        <svg
                          className={`w-5 h-5 text-[var(--text-muted)] transition-transform duration-150 ${
                            isExpanded ? 'rotate-180' : ''
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    )}
                  </>
                )}
              </div>
              {isSelected && expandable && isExpanded && expandedContent && (
                <div
                  className="border-t p-3 bg-[var(--bg-card)]"
                  style={{ borderColor: config.borderColor }}
                >
                  {expandedContent}
                </div>
              )}
            </div>
          );
        })}

        {/* Vacation - special case with input form */}
        <div
          className={`rounded-xl border overflow-hidden transition-all duration-150 ${
            selectedCategories.includes('vacation')
              ? ''
              : 'border-[var(--border)] hover:border-[var(--border-hover)]'
          }`}
          style={{
            borderColor: selectedCategories.includes('vacation') ? VACATION_CONFIG.borderColor : undefined,
            backgroundColor: selectedCategories.includes('vacation') ? VACATION_CONFIG.bgColor : undefined,
          }}
        >
          <div
            className={`flex items-center gap-3 p-3 transition-colors ${
              selectedCategories.includes('vacation')
                ? ''
                : 'bg-[var(--bg-card)] hover:bg-[var(--bg-hover)]'
            }`}
            style={{
              backgroundColor: selectedCategories.includes('vacation') ? VACATION_CONFIG.bgColor : undefined,
            }}
          >
            <input
              type="checkbox"
              checked={selectedCategories.includes('vacation')}
              onChange={() => handleCategoryToggle('vacation')}
              className="h-5 w-5 rounded border-[var(--border)]"
              style={{ accentColor: VACATION_CONFIG.checkboxColor }}
            />
            <button
              type="button"
              onClick={() => handleCategoryToggle('vacation')}
              className="flex items-center gap-2 flex-1 text-left"
            >
              <span className="text-xl">{VACATION_CONFIG.icon}</span>
              <div>
                <span className="font-medium text-[var(--text-primary)]">{VACATION_CONFIG.title}</span>
                <p className="text-sm text-[var(--text-secondary)]">{VACATION_CONFIG.description}</p>
              </div>
            </button>
            {selectedCategories.includes('vacation') && (
              <>
                {vacations.length > 0 && (
                  <span
                    className="text-xs px-2 py-0.5 rounded-full"
                    style={{
                      backgroundColor: VACATION_CONFIG.badgeColor,
                      color: VACATION_CONFIG.badgeTextColor,
                    }}
                  >
                    {vacations.length}
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => handleExpandToggle('vacation')}
                  aria-label={expandedCategories.includes('vacation') ? 'Urlaub zuklappen' : 'Urlaub aufklappen'}
                  aria-expanded={expandedCategories.includes('vacation')}
                  className="p-1 rounded transition-colors hover:bg-[var(--bg-hover)]"
                >
                  <svg
                    className={`w-5 h-5 text-[var(--text-muted)] transition-transform duration-150 ${
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
            <div
              className="border-t p-3 bg-[var(--bg-card)]"
              style={{ borderColor: VACATION_CONFIG.borderColor }}
            >
              {renderVacationInput()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
