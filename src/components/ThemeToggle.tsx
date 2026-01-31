'use client';

import { useTheme } from 'next-themes';
import { useSyncExternalStore } from 'react';

// Store for client-side mounting detection
function subscribe() {
  // This is intentionally empty - we just need to trigger on mount
  return () => {};
}

function getSnapshot() {
  return true;
}

function getServerSnapshot() {
  return false;
}

export function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme();
  const mounted = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <button
        className="p-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border)] w-10 h-10"
        aria-label="Theme wechseln"
      >
        <div className="w-5 h-5" />
      </button>
    );
  }

  const isDark = resolvedTheme === 'dark';

  const toggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark');
  };

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border)] hover:border-[var(--border-hover)] hover:bg-[var(--bg-hover)] transition-all duration-150"
      aria-label={isDark ? 'Zu Light Mode wechseln' : 'Zu Dark Mode wechseln'}
      title={isDark ? 'Light Mode' : 'Dark Mode'}
    >
      {isDark ? (
        // Sun icon for dark mode (click to switch to light)
        <svg
          className="w-5 h-5 text-[var(--text-primary)]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      ) : (
        // Moon icon for light mode (click to switch to dark)
        <svg
          className="w-5 h-5 text-[var(--text-primary)]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
          />
        </svg>
      )}
    </button>
  );
}
