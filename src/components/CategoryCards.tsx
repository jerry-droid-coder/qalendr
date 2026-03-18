'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { formatDateRangeDE, daysBetween, getCurrentYear } from '@/lib/utils';
import type { EventCategory, VacationEntry } from '@/lib/data/types';
import { getObservances, getFunDays, getFamousPeople, SpecialDayData, FamousPerson } from '@/lib/data';
import {
  CATEGORY_DEFS,
  GROUP_LABELS,
  getCategoriesByGroup,
  type CategoryGroup,
  type CategoryDef,
} from '@/lib/categoryConfig';
import { ToggleSwitch } from '@/components/ui/toggle-switch';
import { ChevronDown, X, Plus } from 'lucide-react';
import { parseVacationInput, generateId } from '@/hooks/useCategoryHandlers';

interface CategoryCardsProps {
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

const GROUPS: CategoryGroup[] = ['holidays', 'lifestyle', 'knowledge'];

export function CategoryCards({
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
}: CategoryCardsProps) {
  const [activeGroup, setActiveGroup] = useState<CategoryGroup>('holidays');
  const [expandedCard, setExpandedCard] = useState<EventCategory | null>(null);

  // Vacation input state
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

  const groupCategories = getCategoriesByGroup(activeGroup);

  const handleCardToggle = (def: CategoryDef) => {
    const wasSelected = selectedCategories.includes(def.id);

    onCategoryToggle(def.id);

    // Auto-select all items when enabling a category with sub-items
    if (!wasSelected) {
      if (def.id === 'observances') onObservancesChange(observances.map((o) => o.id));
      if (def.id === 'fun-days') onFunDaysChange(funDays.map((f) => f.id));
      if (def.id === 'famous-birthdays') onFamousPeopleChange(famousPeople.map((p) => p.id));
    } else {
      if (def.id === 'observances') onObservancesChange([]);
      if (def.id === 'fun-days') onFunDaysChange([]);
      if (def.id === 'famous-birthdays') onFamousPeopleChange([]);
    }
  };

  const handleExpandToggle = (category: EventCategory, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedCard(expandedCard === category ? null : category);
  };

  const handleItemToggle = (category: EventCategory, id: string) => {
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
  };

  const handleSelectAll = (category: EventCategory) => {
    if (category === 'observances') onObservancesChange(observances.map((o) => o.id));
    else if (category === 'fun-days') onFunDaysChange(funDays.map((f) => f.id));
    else if (category === 'famous-birthdays') onFamousPeopleChange(famousPeople.map((p) => p.id));
  };

  const handleSelectNone = (category: EventCategory) => {
    if (category === 'observances') onObservancesChange([]);
    else if (category === 'fun-days') onFunDaysChange([]);
    else if (category === 'famous-birthdays') onFamousPeopleChange([]);
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

  // --- Vacation handlers ---
  const handleAddVacation = () => {
    setError(null);
    let start: string, end: string;

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

    onVacationsChange([...vacations, { id: generateId(), name: nameInput.trim() || 'Urlaub', startDate: start, endDate: end }]);
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

  // --- Render helpers ---
  const renderDaysList = (days: SpecialDayData[], selectedIds: string[], category: EventCategory) => (
    <div className="space-y-3" onClick={(e) => e.stopPropagation()}>
      <div className="flex items-center justify-between">
        <span className="text-sm text-[var(--text-secondary)]">
          {selectedIds.length} von {days.length} ausgewählt
        </span>
        <div className="flex gap-2">
          <button type="button" onClick={() => handleSelectAll(category)} className="text-xs text-[var(--accent)] hover:text-[var(--accent-hover)]">Alle</button>
          <span className="text-[var(--border)]">|</span>
          <button type="button" onClick={() => handleSelectNone(category)} className="text-xs text-[var(--accent)] hover:text-[var(--accent-hover)]">Keine</button>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-64 overflow-y-auto">
        {days.map((day) => (
          <label
            key={day.id}
            className={cn(
              'flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-all duration-150 text-sm',
              selectedIds.includes(day.id)
                ? 'bg-[var(--accent-light)] border-[var(--accent)] text-[var(--text-primary)]'
                : 'bg-[var(--bg-hover)] border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--border-hover)] hover:bg-[var(--bg-card)]'
            )}
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

  const renderFamousPeopleList = (people: FamousPerson[], selectedIds: string[]) => (
    <div className="space-y-3" onClick={(e) => e.stopPropagation()}>
      <div className="flex items-center justify-between">
        <span className="text-sm text-[var(--text-secondary)]">
          {selectedIds.length} von {people.length} ausgewählt
        </span>
        <div className="flex gap-2">
          <button type="button" onClick={() => handleSelectAll('famous-birthdays')} className="text-xs text-[var(--accent)] hover:text-[var(--accent-hover)]">Alle</button>
          <span className="text-[var(--border)]">|</span>
          <button type="button" onClick={() => handleSelectNone('famous-birthdays')} className="text-xs text-[var(--accent)] hover:text-[var(--accent-hover)]">Keine</button>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-64 overflow-y-auto">
        {people.map((person) => (
          <label
            key={person.id}
            className={cn(
              'flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-all duration-150 text-sm',
              selectedIds.includes(person.id)
                ? 'bg-[var(--pink-bg)] border-[var(--pink-border)] text-[var(--text-primary)]'
                : 'bg-[var(--bg-hover)] border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--border-hover)] hover:bg-[var(--bg-card)]'
            )}
          >
            <input
              type="checkbox"
              checked={selectedIds.includes(person.id)}
              onChange={() => handleItemToggle('famous-birthdays', person.id)}
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
    <div className="space-y-4" onClick={(e) => e.stopPropagation()}>
      {vacations.length > 0 && (
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {vacations.map((vacation) => (
            <div key={vacation.id} className="flex items-center justify-between p-2 rounded-lg bg-[var(--purple-bg)] border border-[var(--purple-border)]">
              <div className="min-w-0 flex-1">
                <p className="font-medium text-[var(--text-primary)] text-sm truncate">{vacation.name}</p>
                <p className="text-xs text-[var(--text-secondary)]">
                  {formatDateRangeDE(vacation.startDate, vacation.endDate)}
                  <span className="ml-1 text-[var(--text-muted)]">({daysBetween(vacation.startDate, vacation.endDate)}d)</span>
                </p>
              </div>
              <button onClick={() => handleRemoveVacation(vacation.id)} className="ml-2 p-1 text-[var(--text-muted)] hover:text-red-500 transition-colors" title="Löschen">
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <button type="button" onClick={() => setInputMode('quick')} className={cn('px-3 py-1 text-xs rounded-full transition-all duration-150', inputMode === 'quick' ? 'bg-[var(--purple-badge-bg)] text-[var(--purple-badge-text)]' : 'bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:bg-[var(--border)]')}>Schnelleingabe</button>
        <button type="button" onClick={() => setInputMode('picker')} className={cn('px-3 py-1 text-xs rounded-full transition-all duration-150', inputMode === 'picker' ? 'bg-[var(--purple-badge-bg)] text-[var(--purple-badge-text)]' : 'bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:bg-[var(--border)]')}>Kalender</button>
      </div>

      <div className="space-y-2">
        {inputMode === 'quick' ? (
          <input type="text" value={quickInput} onChange={(e) => setQuickInput(e.target.value)} onKeyDown={handleKeyDown} placeholder="z.B. 15.07-28.07" className="w-full px-3 py-2 text-sm text-[var(--text-primary)] bg-[var(--bg-card)] border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-[var(--accent)] focus:border-[var(--accent)] placeholder-[var(--text-muted)]" />
        ) : (
          <div className="grid grid-cols-2 gap-2">
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} onKeyDown={handleKeyDown} aria-label="Startdatum" className="px-2 py-2 text-sm text-[var(--text-primary)] bg-[var(--bg-card)] border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-[var(--accent)] focus:border-[var(--accent)]" />
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} onKeyDown={handleKeyDown} aria-label="Enddatum" className="px-2 py-2 text-sm text-[var(--text-primary)] bg-[var(--bg-card)] border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-[var(--accent)] focus:border-[var(--accent)]" />
          </div>
        )}
        <div className="flex gap-2">
          <input type="text" value={nameInput} onChange={(e) => setNameInput(e.target.value)} onKeyDown={handleKeyDown} placeholder="Bezeichnung (optional)" className="flex-1 px-3 py-2 text-sm text-[var(--text-primary)] bg-[var(--bg-card)] border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-[var(--accent)] focus:border-[var(--accent)] placeholder-[var(--text-muted)]" />
          <button type="button" onClick={handleAddVacation} aria-label="Urlaub hinzufügen" className="px-4 py-2 bg-[var(--accent)] text-white text-sm rounded-lg hover:bg-[var(--accent-hover)] transition-all duration-150 active:scale-95">
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}
      <p className="text-xs text-[var(--text-muted)]">Einträge werden im Browser gespeichert.</p>
    </div>
  );

  const renderExpandedContent = (category: EventCategory) => {
    switch (category) {
      case 'observances': return renderDaysList(observances, selectedObservances, 'observances');
      case 'fun-days': return renderDaysList(funDays, selectedFunDays, 'fun-days');
      case 'famous-birthdays': return renderFamousPeopleList(famousPeople, selectedFamousPeople);
      case 'vacation': return renderVacationInput();
      default: return null;
    }
  };

  // Count selected per group for tab badges
  const getGroupSelectedCount = (group: CategoryGroup): number => {
    return getCategoriesByGroup(group).filter((c) => selectedCategories.includes(c.id)).length;
  };

  return (
    <section>
      {/* Tab Bar */}
      <div className="relative flex mb-7 border-b border-[var(--border)]">
        {GROUPS.map((group) => {
          const count = getGroupSelectedCount(group);
          const isActive = activeGroup === group;
          return (
            <button
              key={group}
              type="button"
              onClick={() => setActiveGroup(group)}
              className={cn(
                'relative flex-1 px-3 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors duration-200',
                isActive
                  ? 'text-[var(--accent)]'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
              )}
            >
              <span className="hidden sm:inline">{GROUP_LABELS[group]}</span>
              <span className="sm:hidden">{GROUP_LABELS[group].split(' ')[0]}</span>
              {count > 0 && (
                <span className={cn(
                  'text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center',
                  isActive
                    ? 'bg-[var(--accent)] text-white'
                    : 'bg-[var(--bg-hover)] text-[var(--text-muted)]'
                )}>
                  {count}
                </span>
              )}
              {/* Active underline */}
              {isActive && (
                <span className="absolute bottom-0 left-3 right-3 h-[2px] bg-[var(--accent)] rounded-full" />
              )}
            </button>
          );
        })}
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 stagger-children">
        {groupCategories.map((def) => {
          const isSelected = selectedCategories.includes(def.id);
          const isExpanded = expandedCard === def.id;
          const itemCount = getItemCount(def.id);
          const IconComponent = def.Icon;

          return (
            <div
              key={def.id}
              className={cn(
                'group relative flex flex-col rounded-2xl border overflow-hidden transition-all duration-250',
                isSelected
                  ? 'shadow-[var(--shadow-md)] hover:shadow-[var(--shadow-lg)]'
                  : 'shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] border-[var(--border)] hover:border-[var(--border-hover)] bg-[var(--bg-card)]',
                isExpanded && 'col-span-1 sm:col-span-2'
              )}
              style={{
                borderColor: isSelected ? def.borderColor : undefined,
                backgroundColor: isSelected ? def.bgColor : undefined,
              }}
            >
              {/* Subtle gradient overlay when selected */}
              {isSelected && (
                <div
                  className="absolute inset-0 opacity-[0.04] pointer-events-none"
                  style={{
                    background: `radial-gradient(ellipse at top right, ${def.checkboxColor}, transparent 70%)`
                  }}
                />
              )}

              {/* Card Header */}
              <div
                className={cn(
                  'relative flex items-center gap-3.5 p-4 cursor-pointer transition-colors duration-200',
                  !isSelected && 'hover:bg-[var(--bg-hover)]'
                )}
                onClick={() => handleCardToggle(def)}
              >
                {/* Icon */}
                <div
                  className={cn(
                    'flex-shrink-0 p-2.5 rounded-xl transition-all duration-250',
                    'group-hover:scale-[1.06] group-hover:-rotate-1'
                  )}
                  style={{ backgroundColor: isSelected ? def.badgeColor : 'var(--bg-hover)' }}
                >
                  <IconComponent
                    className="h-5 w-5"
                    style={{ color: isSelected ? def.badgeTextColor : 'var(--text-secondary)' }}
                    strokeWidth={isSelected ? 2.2 : 1.8}
                  />
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-[var(--text-primary)] text-[13px]">{def.name}</span>
                    {isSelected && itemCount && (
                      <span
                        className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold"
                        style={{ backgroundColor: def.badgeColor, color: def.badgeTextColor }}
                      >
                        {itemCount.count}/{itemCount.total}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-[var(--text-muted)] mt-0.5 leading-relaxed">{def.description}</p>
                </div>

                {/* Toggle + Expand */}
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <ToggleSwitch
                    checked={isSelected}
                    onChange={() => handleCardToggle(def)}
                    color={def.checkboxColor}
                    size="sm"
                    aria-label={`${def.name} ${isSelected ? 'deaktivieren' : 'aktivieren'}`}
                  />
                  {def.hasSubItems && isSelected && (
                    <button
                      type="button"
                      onClick={(e) => handleExpandToggle(def.id, e)}
                      className="p-1 rounded-lg hover:bg-[var(--bg-hover)] transition-colors"
                      aria-label={isExpanded ? `${def.name} zuklappen` : `${def.name} aufklappen`}
                    >
                      <ChevronDown className={cn('h-4 w-4 text-[var(--text-muted)] transition-transform duration-200', isExpanded && 'rotate-180')} />
                    </button>
                  )}
                </div>
              </div>

              {/* Expanded Content */}
              {isSelected && def.hasSubItems && isExpanded && (
                <div className="border-t p-4 bg-[var(--bg-card)]" style={{ borderColor: def.borderColor }}>
                  {renderExpandedContent(def.id)}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
