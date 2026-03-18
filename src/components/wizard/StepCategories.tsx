'use client';

import { cn } from '@/lib/utils';
import type { EventCategory } from '@/lib/data/types';
import {
  CATEGORY_DEFS,
  GROUP_LABELS,
  getCategoriesByGroup,
  type CategoryGroup,
} from '@/lib/categoryConfig';
import { ToggleSwitch } from '@/components/ui/toggle-switch';

interface StepCategoriesProps {
  selectedCategories: EventCategory[];
  onCategoryToggle: (category: EventCategory) => void;
}

const GROUPS: CategoryGroup[] = ['holidays', 'lifestyle', 'knowledge'];

export function StepCategories({ selectedCategories, onCategoryToggle }: StepCategoriesProps) {
  return (
    <div className="animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">
          Was soll in deinen Kalender?
        </h2>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          Wähle aus, welche Einträge du haben möchtest.
        </p>
      </div>

      <div className="space-y-8">
        {GROUPS.map((group) => {
          const categories = getCategoriesByGroup(group);
          return (
            <div key={group}>
              <h3 className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-widest mb-3">
                {GROUP_LABELS[group]}
              </h3>
              <div className="space-y-2 stagger-children">
                {categories.map((def) => {
                  const isSelected = selectedCategories.includes(def.id);
                  const IconComponent = def.Icon;

                  return (
                    <div
                      key={def.id}
                      onClick={() => onCategoryToggle(def.id)}
                      className={cn(
                        'group relative flex items-center gap-4 p-4 rounded-2xl border cursor-pointer transition-all duration-200',
                        isSelected
                          ? 'shadow-[var(--shadow-md)]'
                          : 'border-[var(--border)] hover:border-[var(--border-hover)] bg-[var(--bg-card)] hover:shadow-[var(--shadow-sm)]'
                      )}
                      style={{
                        borderColor: isSelected ? def.borderColor : undefined,
                        backgroundColor: isSelected ? def.bgColor : undefined,
                      }}
                    >
                      {/* Radial glow */}
                      {isSelected && (
                        <div
                          className="absolute inset-0 rounded-2xl opacity-[0.04] pointer-events-none"
                          style={{ background: `radial-gradient(ellipse at top right, ${def.checkboxColor}, transparent 70%)` }}
                        />
                      )}

                      {/* Icon */}
                      <div
                        className={cn(
                          'relative flex-shrink-0 p-3 rounded-xl transition-all duration-200',
                          'group-hover:scale-[1.04]'
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
                      <div className="relative flex-1 min-w-0">
                        <span className="font-semibold text-[var(--text-primary)] text-sm">{def.name}</span>
                        <p className="text-xs text-[var(--text-muted)] mt-0.5">{def.description}</p>
                      </div>

                      {/* Toggle */}
                      <div className="relative flex-shrink-0">
                        <ToggleSwitch
                          checked={isSelected}
                          onChange={() => onCategoryToggle(def.id)}
                          color={def.checkboxColor}
                          aria-label={`${def.name} ${isSelected ? 'deaktivieren' : 'aktivieren'}`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
