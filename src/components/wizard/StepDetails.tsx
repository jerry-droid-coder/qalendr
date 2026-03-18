'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { formatDateRangeDE, daysBetween, getCurrentYear } from '@/lib/utils';
import type { EventCategory, VacationEntry } from '@/lib/data/types';
import { getObservances, getFunDays, getFamousPeople } from '@/lib/data';
import { getCategoryDef } from '@/lib/categoryConfig';
import { X, Plus } from 'lucide-react';
import { parseVacationInput, generateId } from '@/hooks/useCategoryHandlers';

interface StepDetailsProps {
  selectedCategories: EventCategory[];
  selectedObservances: string[];
  onObservancesChange: (ids: string[]) => void;
  selectedFunDays: string[];
  onFunDaysChange: (ids: string[]) => void;
  selectedFamousPeople: string[];
  onFamousPeopleChange: (ids: string[]) => void;
  vacations: VacationEntry[];
  onVacationsChange: (v: VacationEntry[]) => void;
}

export function StepDetails({
  selectedCategories,
  selectedObservances,
  onObservancesChange,
  selectedFunDays,
  onFunDaysChange,
  selectedFamousPeople,
  onFamousPeopleChange,
  vacations,
  onVacationsChange,
}: StepDetailsProps) {
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

  // Which detail sections to show
  const sections: { category: EventCategory; title: string }[] = [];
  if (selectedCategories.includes('observances')) sections.push({ category: 'observances', title: 'Gedenktage' });
  if (selectedCategories.includes('fun-days')) sections.push({ category: 'fun-days', title: 'Kuriose Tage' });
  if (selectedCategories.includes('famous-birthdays')) sections.push({ category: 'famous-birthdays', title: 'Berühmte Personen' });
  if (selectedCategories.includes('vacation')) sections.push({ category: 'vacation', title: 'Urlaub' });

  const handleItemToggle = (category: EventCategory, id: string) => {
    if (category === 'observances') {
      onObservancesChange(selectedObservances.includes(id) ? selectedObservances.filter((o) => o !== id) : [...selectedObservances, id]);
    } else if (category === 'fun-days') {
      onFunDaysChange(selectedFunDays.includes(id) ? selectedFunDays.filter((f) => f !== id) : [...selectedFunDays, id]);
    } else if (category === 'famous-birthdays') {
      onFamousPeopleChange(selectedFamousPeople.includes(id) ? selectedFamousPeople.filter((p) => p !== id) : [...selectedFamousPeople, id]);
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

  const getItems = (category: EventCategory) => {
    switch (category) {
      case 'observances': return { items: observances, selected: selectedObservances };
      case 'fun-days': return { items: funDays, selected: selectedFunDays };
      case 'famous-birthdays': return { items: famousPeople.map((p) => ({ id: p.id, name: `${p.name} — ${p.profession}` })), selected: selectedFamousPeople };
      default: return { items: [], selected: [] };
    }
  };

  // Vacation
  const handleAddVacation = () => {
    setError(null);
    let start: string, end: string;
    if (inputMode === 'quick') {
      const parsed = parseVacationInput(quickInput, currentYear);
      if (!parsed) { setError('Format nicht erkannt. Versuche z.B. "15.07-28.07"'); return; }
      start = parsed.start; end = parsed.end;
    } else {
      if (!startDate || !endDate) { setError('Bitte Start- und Enddatum auswählen'); return; }
      start = startDate; end = endDate;
    }
    const s = new Date(start), e = new Date(end);
    if (isNaN(s.getTime()) || isNaN(e.getTime())) { setError('Ungültige Datumsangaben'); return; }
    if (s > e) { setError('Startdatum muss vor dem Enddatum liegen'); return; }

    onVacationsChange([...vacations, { id: generateId(), name: nameInput.trim() || 'Urlaub', startDate: start, endDate: end }]);
    setQuickInput(''); setNameInput(''); setStartDate(''); setEndDate('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') { e.preventDefault(); handleAddVacation(); }
  };

  return (
    <div className="animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">Feintuning</h2>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          Wähle einzelne Einträge ab oder füge Urlaubstage hinzu.
        </p>
      </div>

      <div className="space-y-8">
        {sections.map(({ category, title }) => {
          if (category === 'vacation') {
            const def = getCategoryDef('vacation');
            return (
              <div key={category} className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] p-5">
                <h3 className="font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                  {def && <def.Icon className="h-4 w-4" style={{ color: def.checkboxColor }} />}
                  {title}
                </h3>

                {/* Existing vacations */}
                {vacations.length > 0 && (
                  <div className="space-y-2 mb-4">
                    {vacations.map((v) => (
                      <div key={v.id} className="flex items-center justify-between p-3 rounded-xl bg-[var(--purple-bg)] border border-[var(--purple-border)]">
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-[var(--text-primary)] text-sm">{v.name}</p>
                          <p className="text-xs text-[var(--text-secondary)]">
                            {formatDateRangeDE(v.startDate, v.endDate)}
                            <span className="ml-1 text-[var(--text-muted)]">({daysBetween(v.startDate, v.endDate)}d)</span>
                          </p>
                        </div>
                        <button onClick={() => onVacationsChange(vacations.filter((x) => x.id !== v.id))} className="ml-2 p-1 text-[var(--text-muted)] hover:text-red-500 transition-colors">
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Input mode toggle */}
                <div className="flex gap-2 mb-3">
                  <button type="button" onClick={() => setInputMode('quick')} className={cn('px-3 py-1 text-xs rounded-full transition-all', inputMode === 'quick' ? 'bg-[var(--purple-badge-bg)] text-[var(--purple-badge-text)]' : 'bg-[var(--bg-hover)] text-[var(--text-secondary)]')}>Schnelleingabe</button>
                  <button type="button" onClick={() => setInputMode('picker')} className={cn('px-3 py-1 text-xs rounded-full transition-all', inputMode === 'picker' ? 'bg-[var(--purple-badge-bg)] text-[var(--purple-badge-text)]' : 'bg-[var(--bg-hover)] text-[var(--text-secondary)]')}>Kalender</button>
                </div>

                <div className="space-y-2">
                  {inputMode === 'quick' ? (
                    <input type="text" value={quickInput} onChange={(e) => setQuickInput(e.target.value)} onKeyDown={handleKeyDown} placeholder="z.B. 15.07-28.07" className="w-full px-3 py-2.5 text-sm text-[var(--text-primary)] bg-[var(--bg-primary)] border border-[var(--border)] rounded-xl focus:ring-2 focus:ring-[var(--accent)] focus:border-[var(--accent)] placeholder-[var(--text-muted)]" />
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} onKeyDown={handleKeyDown} aria-label="Startdatum" className="px-3 py-2.5 text-sm text-[var(--text-primary)] bg-[var(--bg-primary)] border border-[var(--border)] rounded-xl focus:ring-2 focus:ring-[var(--accent)]" />
                      <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} onKeyDown={handleKeyDown} aria-label="Enddatum" className="px-3 py-2.5 text-sm text-[var(--text-primary)] bg-[var(--bg-primary)] border border-[var(--border)] rounded-xl focus:ring-2 focus:ring-[var(--accent)]" />
                    </div>
                  )}
                  <div className="flex gap-2">
                    <input type="text" value={nameInput} onChange={(e) => setNameInput(e.target.value)} onKeyDown={handleKeyDown} placeholder="Bezeichnung (optional)" className="flex-1 px-3 py-2.5 text-sm text-[var(--text-primary)] bg-[var(--bg-primary)] border border-[var(--border)] rounded-xl focus:ring-2 focus:ring-[var(--accent)] placeholder-[var(--text-muted)]" />
                    <button type="button" onClick={handleAddVacation} className="px-4 py-2.5 bg-[var(--accent)] text-white rounded-xl hover:bg-[var(--accent-hover)] transition-all active:scale-95">
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
                <p className="text-[10px] text-[var(--text-muted)] mt-2">Einträge werden im Browser gespeichert.</p>
              </div>
            );
          }

          const { items, selected } = getItems(category);
          const def = getCategoryDef(category);

          return (
            <div key={category} className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-[var(--text-primary)] flex items-center gap-2">
                  {def && <def.Icon className="h-4 w-4" style={{ color: def.checkboxColor }} />}
                  {title}
                  <span className="text-xs text-[var(--text-muted)] font-normal ml-1">
                    {selected.length}/{items.length}
                  </span>
                </h3>
                <div className="flex gap-2">
                  <button type="button" onClick={() => handleSelectAll(category)} className="text-xs text-[var(--accent)] hover:text-[var(--accent-hover)]">Alle</button>
                  <span className="text-[var(--border)]">|</span>
                  <button type="button" onClick={() => handleSelectNone(category)} className="text-xs text-[var(--accent)] hover:text-[var(--accent-hover)]">Keine</button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-72 overflow-y-auto">
                {items.map((item) => (
                  <label
                    key={item.id}
                    className={cn(
                      'flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all duration-150 text-sm',
                      selected.includes(item.id)
                        ? 'bg-[var(--accent-light)] text-[var(--text-primary)]'
                        : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={selected.includes(item.id)}
                      onChange={() => handleItemToggle(category, item.id)}
                      className="h-3.5 w-3.5 rounded border-[var(--border)]"
                      style={{ accentColor: def?.checkboxColor || 'var(--accent)' }}
                    />
                    <span className="truncate">{item.name}</span>
                  </label>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
