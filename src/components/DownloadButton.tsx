'use client';

import { CalendarConfig } from '@/lib/data/types';
import { encodeConfigToUrl } from '@/lib/utils';

interface DownloadButtonProps {
  config: CalendarConfig;
  disabled?: boolean;
}

export function DownloadButton({ config, disabled }: DownloadButtonProps) {
  const handleDownload = () => {
    const params = encodeConfigToUrl(config);
    const url = `/api/calendar?${params}`;
    window.location.href = url;
  };

  const isDisabled = disabled || config.regions.length === 0;

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={handleDownload}
        disabled={isDisabled}
        className={`
          w-full py-4 px-6 rounded-xl font-semibold text-lg
          transition-all duration-150
          flex items-center justify-center gap-3
          ${
            isDisabled
              ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 shadow-lg hover:shadow-xl'
          }
        `}
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
          />
        </svg>
        Kalender herunterladen (.ics)
      </button>

      {isDisabled && config.regions.length === 0 && (
        <p className="text-sm text-amber-600 text-center">
          Bitte wähle mindestens ein Bundesland aus
        </p>
      )}

      <p className="text-xs text-gray-500 text-center">
        Funktioniert mit Apple Kalender, Google Kalender, Outlook und anderen
      </p>
    </div>
  );
}
