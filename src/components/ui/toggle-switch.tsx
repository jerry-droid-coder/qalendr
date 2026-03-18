'use client';

import { cn } from '@/lib/utils';

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  color?: string;
  size?: 'sm' | 'md';
  'aria-label'?: string;
}

export function ToggleSwitch({
  checked,
  onChange,
  color = 'var(--accent)',
  size = 'md',
  'aria-label': ariaLabel,
}: ToggleSwitchProps) {
  const dims = size === 'sm' ? { track: 'w-8 h-[18px]', thumb: 'h-3.5 w-3.5', translate: 'translate-x-[14px]' } : { track: 'w-10 h-[22px]', thumb: 'h-4 w-4', translate: 'translate-x-[18px]' };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      onClick={(e) => {
        e.stopPropagation();
        onChange(!checked);
      }}
      className={cn(
        'relative inline-flex flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200',
        dims.track
      )}
      style={{ backgroundColor: checked ? color : 'var(--border)' }}
    >
      <span
        className={cn(
          'pointer-events-none inline-block rounded-full bg-white shadow transform transition-transform duration-200',
          dims.thumb,
          checked ? dims.translate : 'translate-x-0.5'
        )}
      />
    </button>
  );
}
