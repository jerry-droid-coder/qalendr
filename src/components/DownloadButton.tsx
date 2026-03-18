'use client';

import { CalendarConfig } from '@/lib/data/types';
import { encodeConfigToUrl } from '@/lib/utils';
import { Download } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DownloadButtonProps {
  config: CalendarConfig;
  disabled?: boolean;
  variant?: 'sidebar' | 'mobile';
}

export function DownloadButton({ config, disabled, variant = 'sidebar' }: DownloadButtonProps) {
  const handleDownload = () => {
    const params = encodeConfigToUrl(config);
    const url = `/api/calendar?${params}`;
    window.location.href = url;
  };

  if (variant === 'mobile') {
    return (
      <button
        type="button"
        onClick={handleDownload}
        disabled={disabled}
        className={cn(
          'w-full py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2',
          disabled
            ? 'bg-[var(--border)] text-[var(--text-muted)] cursor-not-allowed'
            : 'bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] active:scale-[0.98] shadow-lg shadow-[var(--accent)]/20'
        )}
      >
        <Download className="w-4 h-4" />
        Herunterladen (.ics)
      </button>
    );
  }

  return (
    <div className="space-y-2.5">
      <button
        type="button"
        onClick={handleDownload}
        disabled={disabled}
        className={cn(
          'w-full py-3 px-4 rounded-xl font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2.5',
          disabled
            ? 'bg-[var(--border)] text-[var(--text-muted)] cursor-not-allowed'
            : 'bg-gradient-to-r from-[var(--accent)] to-purple-500 text-white hover:brightness-110 active:scale-[0.98] shadow-lg shadow-[var(--accent)]/25'
        )}
      >
        <Download className="w-4 h-4" />
        Kalender herunterladen
      </button>

      {disabled && (
        <p className="text-[10px] text-amber-500/80 text-center leading-tight">
          Wähle mindestens ein Land oder eine Kategorie
        </p>
      )}

      {!disabled && (
        <p className="text-[10px] text-[var(--text-muted)] text-center opacity-60">
          Apple Kalender, Google, Outlook & mehr
        </p>
      )}
    </div>
  );
}
