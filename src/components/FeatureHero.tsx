"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { formatDateRangeDE, daysBetween, getCurrentYear } from "@/lib/utils";
import type { EventCategory, VacationEntry } from "@/lib/data/types";
import { getObservances, getFunDays, getFamousPeople, SpecialDayData, FamousPerson } from "@/lib/data";
import {
  Moon,
  Heart,
  PartyPopper,
  Plane,
  BookOpen,
  Cake,
  ChevronDown,
  Check,
  X,
} from "lucide-react";

interface FeatureHeroProps {
  selectedCategories: EventCategory[];
  onCategoryToggle: (category: EventCategory) => void;
  selectedObservances: string[];
  onObservancesChange: (ids: string[]) => void;
  selectedFunDays: string[];
  onFunDaysChange: (ids: string[]) => void;
  selectedFamousPeople: string[];
  onFamousPeopleChange: (ids: string[]) => void;
  vacations: VacationEntry[];
  onVacationsChange: (vacations: VacationEntry[]) => void;
}

interface FeatureItem {
  Icon: React.ComponentType<{ className?: string }>;
  name: string;
  description: string;
  category: EventCategory;
  hasSubItems: boolean;
  bgGradient: string;
  borderColor: string;
  badgeColor: string;
  badgeTextColor: string;
}

const features: FeatureItem[] = [
  {
    Icon: Moon,
    name: "Mondphasen",
    description: "Neumond & Vollmond im Überblick",
    category: "moon-phases",
    hasSubItems: false,
    bgGradient: "from-[var(--indigo-bg)]",
    borderColor: "var(--indigo-border)",
    badgeColor: "var(--indigo-badge-bg)",
    badgeTextColor: "var(--indigo-badge-text)",
  },
  {
    Icon: Heart,
    name: "Gedenktage",
    description: "Muttertag, Valentinstag & mehr",
    category: "observances",
    hasSubItems: true,
    bgGradient: "from-[var(--pink-bg)]",
    borderColor: "var(--pink-border)",
    badgeColor: "var(--pink-badge-bg)",
    badgeTextColor: "var(--pink-badge-text)",
  },
  {
    Icon: PartyPopper,
    name: "Kuriose Tage",
    description: "Star Wars Tag, Tag des Bieres & Co.",
    category: "fun-days",
    hasSubItems: true,
    bgGradient: "from-[var(--orange-bg)]",
    borderColor: "var(--orange-border)",
    badgeColor: "var(--orange-badge-bg)",
    badgeTextColor: "var(--orange-badge-text)",
  },
  {
    Icon: Plane,
    name: "Urlaub",
    description: "Deine persönlichen Urlaubstage",
    category: "vacation",
    hasSubItems: true,
    bgGradient: "from-[var(--teal-bg)]",
    borderColor: "var(--teal-border)",
    badgeColor: "var(--teal-badge-bg)",
    badgeTextColor: "var(--teal-badge-text)",
  },
  {
    Icon: BookOpen,
    name: "Wikipedia heute",
    description: "Historische Ereignisse für jeden Tag",
    category: "wikipedia-today",
    hasSubItems: false,
    bgGradient: "from-[var(--slate-bg)]",
    borderColor: "var(--slate-border)",
    badgeColor: "var(--slate-badge-bg)",
    badgeTextColor: "var(--slate-badge-text)",
  },
  {
    Icon: Cake,
    name: "Berühmte Personen",
    description: "Geburts- und Todestage von Persönlichkeiten",
    category: "famous-birthdays",
    hasSubItems: true,
    bgGradient: "from-[var(--cyan-bg)]",
    borderColor: "var(--cyan-border)",
    badgeColor: "var(--cyan-badge-bg)",
    badgeTextColor: "var(--cyan-badge-text)",
  },
];

function parseVacationInput(
  input: string,
  defaultYear: number
): { start: string; end: string } | null {
  const trimmed = input.trim();

  const isoMatch = trimmed.match(
    /^(\d{4})-(\d{1,2})-(\d{1,2})\s*[-–]\s*(\d{4})-(\d{1,2})-(\d{1,2})$/
  );
  if (isoMatch) {
    const [, startYear, startMonth, startDay, endYear, endMonth, endDay] = isoMatch;
    const start = `${startYear}-${startMonth.padStart(2, '0')}-${startDay.padStart(2, '0')}`;
    const end = `${endYear}-${endMonth.padStart(2, '0')}-${endDay.padStart(2, '0')}`;
    return { start, end };
  }

  const germanWithYearMatch = trimmed.match(
    /^(\d{1,2})\.(\d{1,2})\.(\d{4})\s*[-–]\s*(\d{1,2})\.(\d{1,2})\.(\d{4})$/
  );
  if (germanWithYearMatch) {
    const [, startDay, startMonth, startYear, endDay, endMonth, endYear] = germanWithYearMatch;
    const start = `${startYear}-${startMonth.padStart(2, '0')}-${startDay.padStart(2, '0')}`;
    const end = `${endYear}-${endMonth.padStart(2, '0')}-${endDay.padStart(2, '0')}`;
    return { start, end };
  }

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

export function FeatureHero({
  selectedCategories,
  onCategoryToggle,
  selectedObservances,
  onObservancesChange,
  selectedFunDays,
  onFunDaysChange,
  selectedFamousPeople,
  onFamousPeopleChange,
  vacations,
  onVacationsChange,
}: FeatureHeroProps) {
  const [expandedCard, setExpandedCard] = useState<EventCategory | null>(null);
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

  const handleCardClick = (feature: FeatureItem) => {
    if (feature.hasSubItems) {
      // Toggle expand/collapse
      if (expandedCard === feature.category) {
        setExpandedCard(null);
      } else {
        setExpandedCard(feature.category);
        // Auto-enable category when expanding
        if (!selectedCategories.includes(feature.category)) {
          onCategoryToggle(feature.category);
          // Auto-select all items
          if (feature.category === 'observances') {
            onObservancesChange(observances.map((o) => o.id));
          } else if (feature.category === 'fun-days') {
            onFunDaysChange(funDays.map((f) => f.id));
          } else if (feature.category === 'famous-birthdays') {
            onFamousPeopleChange(famousPeople.map((p) => p.id));
          }
        }
      }
    } else {
      // Simple toggle for categories without sub-items
      onCategoryToggle(feature.category);
    }
  };

  const handleItemToggle = (category: EventCategory, id: string) => {
    if (category === 'observances') {
      if (selectedObservances.includes(id)) {
        const newSelection = selectedObservances.filter((o) => o !== id);
        onObservancesChange(newSelection);
      } else {
        onObservancesChange([...selectedObservances, id]);
      }
    } else if (category === 'fun-days') {
      if (selectedFunDays.includes(id)) {
        const newSelection = selectedFunDays.filter((f) => f !== id);
        onFunDaysChange(newSelection);
      } else {
        onFunDaysChange([...selectedFunDays, id]);
      }
    } else if (category === 'famous-birthdays') {
      if (selectedFamousPeople.includes(id)) {
        const newSelection = selectedFamousPeople.filter((p) => p !== id);
        onFamousPeopleChange(newSelection);
      } else {
        onFamousPeopleChange([...selectedFamousPeople, id]);
      }
    }
  };

  const handleSelectAll = (category: EventCategory) => {
    if (category === 'observances') {
      onObservancesChange(observances.map((o) => o.id));
    } else if (category === 'fun-days') {
      onFunDaysChange(funDays.map((f) => f.id));
    } else if (category === 'famous-birthdays') {
      onFamousPeopleChange(famousPeople.map((p) => p.id));
    }
  };

  const handleSelectNone = (category: EventCategory) => {
    if (category === 'observances') {
      onObservancesChange([]);
    } else if (category === 'fun-days') {
      onFunDaysChange([]);
    } else if (category === 'famous-birthdays') {
      onFamousPeopleChange([]);
    }
  };

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

  const getItemCount = (category: EventCategory): { count: number; total: number } | null => {
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
  };

  const renderDaysList = (
    days: SpecialDayData[],
    selectedIds: string[],
    category: EventCategory
  ) => (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm text-[var(--text-secondary)]">
          {selectedIds.length} von {days.length} ausgewählt
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); handleSelectAll(category); }}
            className="text-xs text-[var(--accent)] hover:text-[var(--accent-hover)]"
          >
            Alle
          </button>
          <span className="text-[var(--border)]">|</span>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); handleSelectNone(category); }}
            className="text-xs text-[var(--accent)] hover:text-[var(--accent-hover)]"
          >
            Keine
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-64 overflow-y-auto">
        {days.map((day) => (
          <label
            key={day.id}
            className={cn(
              "flex items-center gap-2 p-2 rounded-lg border cursor-pointer",
              "transition-all duration-150 text-sm",
              selectedIds.includes(day.id)
                ? "bg-[var(--accent-light)] border-[var(--accent)] text-[var(--text-primary)]"
                : "bg-[var(--bg-hover)] border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--border-hover)] hover:bg-[var(--bg-card)]"
            )}
            onClick={(e) => e.stopPropagation()}
          >
            <input
              type="checkbox"
              checked={selectedIds.includes(day.id)}
              onChange={() => handleItemToggle(category, day.id)}
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
    selectedIds: string[]
  ) => (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm text-[var(--text-secondary)]">
          {selectedIds.length} von {people.length} ausgewählt
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); handleSelectAll('famous-birthdays'); }}
            className="text-xs text-[var(--accent)] hover:text-[var(--accent-hover)]"
          >
            Alle
          </button>
          <span className="text-[var(--border)]">|</span>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); handleSelectNone('famous-birthdays'); }}
            className="text-xs text-[var(--accent)] hover:text-[var(--accent-hover)]"
          >
            Keine
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-64 overflow-y-auto">
        {people.map((person) => (
          <label
            key={person.id}
            className={cn(
              "flex items-center gap-2 p-2 rounded-lg border cursor-pointer",
              "transition-all duration-150 text-sm",
              selectedIds.includes(person.id)
                ? "bg-[var(--cyan-bg)] border-[var(--cyan-border)] text-[var(--text-primary)]"
                : "bg-[var(--bg-hover)] border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--border-hover)] hover:bg-[var(--bg-card)]"
            )}
            onClick={(e) => e.stopPropagation()}
          >
            <input
              type="checkbox"
              checked={selectedIds.includes(person.id)}
              onChange={() => handleItemToggle('famous-birthdays', person.id)}
              className="h-4 w-4 rounded border-[var(--border)] text-cyan-600 focus:ring-cyan-500"
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
    <div className="space-y-4" onClick={(e) => e.stopPropagation()}>
      {vacations.length > 0 && (
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {vacations.map((vacation) => (
            <div
              key={vacation.id}
              className="flex items-center justify-between p-2 rounded-lg bg-[var(--teal-bg)] border border-[var(--teal-border)]"
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
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setInputMode('quick')}
          className={cn(
            "px-3 py-1 text-xs rounded-full transition-all duration-150",
            inputMode === 'quick'
              ? "bg-[var(--teal-badge-bg)] text-[var(--teal-badge-text)]"
              : "bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:bg-[var(--border)]"
          )}
        >
          Schnelleingabe
        </button>
        <button
          type="button"
          onClick={() => setInputMode('picker')}
          className={cn(
            "px-3 py-1 text-xs rounded-full transition-all duration-150",
            inputMode === 'picker'
              ? "bg-[var(--teal-badge-bg)] text-[var(--teal-badge-text)]"
              : "bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:bg-[var(--border)]"
          )}
        >
          Kalender
        </button>
      </div>

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

  const renderExpandedContent = (category: EventCategory) => {
    switch (category) {
      case 'observances':
        return renderDaysList(observances, selectedObservances, 'observances');
      case 'fun-days':
        return renderDaysList(funDays, selectedFunDays, 'fun-days');
      case 'famous-birthdays':
        return renderFamousPeopleList(famousPeople, selectedFamousPeople);
      case 'vacation':
        return renderVacationInput();
      default:
        return null;
    }
  };

  return (
    <section className="py-8">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-[var(--text-primary)] sm:text-3xl">
          Besondere Termine
        </h2>
        <p className="mt-2 text-[var(--text-secondary)]">
          Klicke auf eine Kategorie, um sie deinem Kalender hinzuzufügen
        </p>
      </div>
      <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => {
          const isSelected = selectedCategories.includes(feature.category);
          const isExpanded = expandedCard === feature.category;
          const itemCount = getItemCount(feature.category);

          return (
            <div
              key={feature.category}
              className={cn(
                "group relative flex flex-col overflow-hidden rounded-xl cursor-pointer",
                "bg-[var(--bg-card)] border transition-all duration-300",
                "shadow-[var(--shadow-sm)] hover:shadow-lg",
                isSelected
                  ? "ring-2 ring-[var(--accent)] border-[var(--accent)]"
                  : "border-[var(--border)] hover:border-[var(--border-hover)]",
                isExpanded && "col-span-1 sm:col-span-2 lg:col-span-3"
              )}
              onClick={() => handleCardClick(feature)}
            >
              {/* Background gradient */}
              <div className={cn(
                "absolute right-0 top-0 h-full w-full bg-gradient-to-br to-transparent opacity-50",
                feature.bgGradient
              )} />

              {/* Card Header */}
              <div className="relative z-10 flex items-start gap-3 p-4">
                <feature.Icon className="h-10 w-10 text-[var(--text-secondary)] flex-shrink-0" />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                      {feature.name}
                    </h3>
                    {isSelected && itemCount && (
                      <span
                        className="text-xs px-2 py-0.5 rounded-full font-medium"
                        style={{ backgroundColor: feature.badgeColor, color: feature.badgeTextColor }}
                      >
                        {itemCount.count}/{itemCount.total}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-[var(--text-secondary)] mt-0.5">
                    {feature.description}
                  </p>
                </div>

                {/* Status indicators */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {isSelected && (
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--accent)] text-white">
                      <Check className="h-4 w-4" />
                    </div>
                  )}
                  {feature.hasSubItems && (
                    <ChevronDown
                      className={cn(
                        "h-5 w-5 text-[var(--text-muted)] transition-transform duration-200",
                        isExpanded && "rotate-180"
                      )}
                    />
                  )}
                </div>
              </div>

              {/* Expanded Content */}
              {isExpanded && (
                <div
                  className="relative z-10 border-t border-[var(--border)] p-4 bg-[var(--bg-card)]"
                  style={{ borderColor: feature.borderColor }}
                >
                  {renderExpandedContent(feature.category)}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
