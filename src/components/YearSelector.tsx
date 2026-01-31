'use client';

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
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-[var(--text-primary)]">Jahr wählen</h3>

      <div className="flex flex-wrap gap-2">
        {availableYears.map((year) => (
          <button
            key={year}
            type="button"
            onClick={() => onYearChange(year)}
            className={`
              px-4 py-2 rounded-lg font-medium text-sm
              transition-all duration-150
              ${
                selectedYear === year
                  ? 'bg-[var(--accent)] text-white shadow-md'
                  : 'bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:bg-[var(--border)] hover:text-[var(--text-primary)]'
              }
            `}
          >
            {year}
          </button>
        ))}
      </div>
    </div>
  );
}
