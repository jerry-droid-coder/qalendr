import type { LucideIcon } from 'lucide-react';
import {
  Flag,
  GraduationCap,
  Calendar,
  Heart,
  PartyPopper,
  Plane,
  Moon,
  BookOpen,
  Shuffle,
  Cake,
} from 'lucide-react';
import type { EventCategory } from '@/lib/data/types';

export interface CategoryDef {
  id: EventCategory;
  name: string;
  description: string;
  Icon: LucideIcon;
  group: CategoryGroup;
  hasSubItems: boolean;
  borderColor: string;
  bgColor: string;
  badgeColor: string;
  badgeTextColor: string;
  checkboxColor: string;
}

export type CategoryGroup = 'holidays' | 'lifestyle' | 'knowledge';

export const GROUP_LABELS: Record<CategoryGroup, string> = {
  holidays: 'Feiertage & Ferien',
  lifestyle: 'Lifestyle & Kurioses',
  knowledge: 'Wissen & Geschichte',
};

export const CATEGORY_DEFS: CategoryDef[] = [
  // --- Feiertage & Ferien ---
  {
    id: 'public-holidays',
    name: 'Gesetzliche Feiertage',
    description: 'Offizielle Feiertage des Landes',
    Icon: Flag,
    group: 'holidays',
    hasSubItems: false,
    borderColor: 'var(--red-border)',
    bgColor: 'var(--red-bg)',
    badgeColor: 'var(--red-badge-bg)',
    badgeTextColor: 'var(--red-badge-text)',
    checkboxColor: '#ef4444',
  },
  {
    id: 'school-holidays',
    name: 'Schulferien',
    description: 'Schulferien nach Bundesland',
    Icon: GraduationCap,
    group: 'holidays',
    hasSubItems: false,
    borderColor: 'var(--green-border)',
    bgColor: 'var(--green-bg)',
    badgeColor: 'var(--green-badge-bg)',
    badgeTextColor: 'var(--green-badge-text)',
    checkboxColor: '#22c55e',
  },
  {
    id: 'bridge-days',
    name: 'Brückentage',
    description: 'Empfohlene Urlaubstage für lange Wochenenden',
    Icon: Calendar,
    group: 'holidays',
    hasSubItems: false,
    borderColor: 'var(--teal-border)',
    bgColor: 'var(--teal-bg)',
    badgeColor: 'var(--teal-badge-bg)',
    badgeTextColor: 'var(--teal-badge-text)',
    checkboxColor: '#14b8a6',
  },
  // --- Lifestyle & Kurioses ---
  {
    id: 'observances',
    name: 'Gedenktage',
    description: 'Muttertag, Valentinstag & mehr',
    Icon: Heart,
    group: 'lifestyle',
    hasSubItems: true,
    borderColor: 'var(--orange-border)',
    bgColor: 'var(--orange-bg)',
    badgeColor: 'var(--orange-badge-bg)',
    badgeTextColor: 'var(--orange-badge-text)',
    checkboxColor: '#f97316',
  },
  {
    id: 'fun-days',
    name: 'Kuriose Tage',
    description: 'Star Wars Tag, Tag des Bieres & Co.',
    Icon: PartyPopper,
    group: 'lifestyle',
    hasSubItems: true,
    borderColor: 'var(--yellow-border)',
    bgColor: 'var(--yellow-bg)',
    badgeColor: 'var(--yellow-badge-bg)',
    badgeTextColor: 'var(--yellow-badge-text)',
    checkboxColor: '#eab308',
  },
  {
    id: 'vacation',
    name: 'Urlaub',
    description: 'Deine persönlichen Urlaubstage',
    Icon: Plane,
    group: 'lifestyle',
    hasSubItems: true,
    borderColor: 'var(--purple-border)',
    bgColor: 'var(--purple-bg)',
    badgeColor: 'var(--purple-badge-bg)',
    badgeTextColor: 'var(--purple-badge-text)',
    checkboxColor: '#a855f7',
  },
  {
    id: 'moon-phases',
    name: 'Mondphasen',
    description: 'Neumond & Vollmond',
    Icon: Moon,
    group: 'lifestyle',
    hasSubItems: false,
    borderColor: 'var(--indigo-border)',
    bgColor: 'var(--indigo-bg)',
    badgeColor: 'var(--indigo-badge-bg)',
    badgeTextColor: 'var(--indigo-badge-text)',
    checkboxColor: '#6366f1',
  },
  // --- Wissen & Geschichte ---
  {
    id: 'wikipedia-today',
    name: 'Wikipedia heute',
    description: 'Historische Ereignisse für jeden Tag',
    Icon: BookOpen,
    group: 'knowledge',
    hasSubItems: false,
    borderColor: 'var(--slate-border)',
    bgColor: 'var(--slate-bg)',
    badgeColor: 'var(--slate-badge-bg)',
    badgeTextColor: 'var(--slate-badge-text)',
    checkboxColor: '#64748b',
  },
  {
    id: 'wikipedia-random',
    name: 'Wikipedia zufällig',
    description: 'Zufällige interessante Artikel',
    Icon: Shuffle,
    group: 'knowledge',
    hasSubItems: false,
    borderColor: 'var(--cyan-border)',
    bgColor: 'var(--cyan-bg)',
    badgeColor: 'var(--cyan-badge-bg)',
    badgeTextColor: 'var(--cyan-badge-text)',
    checkboxColor: '#06b6d4',
  },
  {
    id: 'famous-birthdays',
    name: 'Berühmte Personen',
    description: 'Geburts- und Todestage von Persönlichkeiten',
    Icon: Cake,
    group: 'knowledge',
    hasSubItems: true,
    borderColor: 'var(--pink-border)',
    bgColor: 'var(--pink-bg)',
    badgeColor: 'var(--pink-badge-bg)',
    badgeTextColor: 'var(--pink-badge-text)',
    checkboxColor: '#ec4899',
  },
];

export function getCategoryDef(id: EventCategory): CategoryDef | undefined {
  return CATEGORY_DEFS.find((c) => c.id === id);
}

export function getCategoriesByGroup(group: CategoryGroup): CategoryDef[] {
  return CATEGORY_DEFS.filter((c) => c.group === group);
}
