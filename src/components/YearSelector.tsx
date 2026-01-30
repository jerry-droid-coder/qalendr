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
      <h3 className="text-lg font-semibold text-gray-900">Jahr wählen</h3>

      <div className="flex flex-wrap gap-2">
        {availableYears.map((year) => (
          <button
            key={year}
            type="button"
            onClick={() => onYearChange(year)}
            className={`
              px-4 py-2 rounded-lg font-medium text-sm
              transition-colors duration-150
              ${
                selectedYear === year
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
