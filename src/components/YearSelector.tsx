'use client';

import { cn } from '@/lib/utils';

interface YearSelectorProps {
  availableYears: number[];
  selectedYear: number;
  onYearChange: (year: number) => void;
}

export function YearSelector({
  availableYears,
  selectedYear,
  onYearChange,
}: YearSelectorProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-widest">Jahr</h3>

      <div className="flex gap-1.5">
        {availableYears.map((year) => (
          <button
            key={year}
            type="button"
            onClick={() => onYearChange(year)}
            className={cn(
              'flex-1 px-3 py-2 rounded-lg font-semibold text-sm transition-all duration-200',
              selectedYear === year
                ? 'bg-[var(--accent)] text-white shadow-md shadow-[var(--accent)]/20'
                : 'bg-[var(--bg-hover)] text-[var(--text-muted)] hover:bg-[var(--border)] hover:text-[var(--text-primary)]'
            )}
          >
            {year}
          </button>
        ))}
      </div>
    </div>
  );
}
