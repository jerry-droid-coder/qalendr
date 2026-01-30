'use client';

import { EventCategory, Country } from '@/lib/data/types';

interface CategoryInfo {
  id: EventCategory;
  name: string;
  description: string;
  icon: string;
}

const ALL_CATEGORIES: CategoryInfo[] = [
  {
    id: 'school-holidays',
    name: 'Schulferien',
    description: 'Alle Schulferien des Bundeslandes',
    icon: '🎒',
  },
  {
    id: 'public-holidays',
    name: 'Gesetzliche Feiertage',
    description: 'Bundesweite und regionale Feiertage',
    icon: '🗓️',
  },
];

interface CategorySelectorProps {
  selectedCategories: EventCategory[];
  onSelectionChange: (categories: EventCategory[]) => void;
  country?: Country;
}

export function CategorySelector({
  selectedCategories,
  onSelectionChange,
  country,
}: CategorySelectorProps) {
  // Filter categories based on country
  // School holidays are only available for Germany
  const availableCategories = ALL_CATEGORIES.filter((category) => {
    if (category.id === 'school-holidays') {
      return country?.hasSchoolHolidays ?? true;
    }
    return true;
  });

  const handleToggle = (categoryId: EventCategory) => {
    if (selectedCategories.includes(categoryId)) {
      // Don't allow deselecting if it's the last one
      if (selectedCategories.length > 1) {
        onSelectionChange(selectedCategories.filter((c) => c !== categoryId));
      }
    } else {
      onSelectionChange([...selectedCategories, categoryId]);
    }
  };

  // If there's only one available category, don't show the selector
  if (availableCategories.length === 1) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Kategorien wählen</h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {availableCategories.map((category) => (
          <label
            key={category.id}
            className={`
              flex items-start gap-3 p-4 rounded-lg border cursor-pointer
              transition-colors duration-150
              ${
                selectedCategories.includes(category.id)
                  ? 'bg-blue-50 border-blue-500'
                  : 'bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }
            `}
          >
            <input
              type="checkbox"
              checked={selectedCategories.includes(category.id)}
              onChange={() => handleToggle(category.id)}
              className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-lg" role="img" aria-hidden="true">
                  {category.icon}
                </span>
                <span className="font-medium text-gray-900">{category.name}</span>
              </div>
              <p className="mt-1 text-sm text-gray-600">{category.description}</p>
            </div>
          </label>
        ))}
      </div>
    </div>
  );
}
