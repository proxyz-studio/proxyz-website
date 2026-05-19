// src/i18n/LocaleContext.tsx
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { Locale } from './Bilingual';

const STORAGE_KEY = 'proxyz-locale';

type LocaleContextValue = {
  locale: Locale;
  setLocale: (next: Locale) => void;
};

// Default context value: English mode, no-op setter.
// Used when a component is rendered outside any <LocaleProvider>,
// which never happens in production but guards against accidental
// usage in tests, Storybook, or future routes.
const defaultValue: LocaleContextValue = {
  locale: 'en',
  setLocale: () => {},
};

const LocaleContext = createContext<LocaleContextValue>(defaultValue);

function readStoredLocale(): Locale {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === 'en' || raw === 'th') return raw;
  } catch {
    // localStorage may throw in private mode or with quota issues. Fall through.
  }
  return 'en';
}

function writeStoredLocale(locale: Locale): void {
  try {
    localStorage.setItem(STORAGE_KEY, locale);
  } catch (err) {
    console.warn('[i18n] failed to persist locale:', err);
  }
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  // Initial state: synchronous read of localStorage so first paint is correct.
  const [locale, setLocaleState] = useState<Locale>(() => readStoredLocale());

  // Persist on every change AND on first mount. On first visit (no stored
  // value) this establishes the storage key with the default 'en', so
  // subsequent reads are deterministic. We do not sync from external
  // storage changes; locale ownership lives in this provider for the
  // duration of the session.
  useEffect(() => {
    writeStoredLocale(locale);
  }, [locale]);

  // useCallback gives setLocale a stable reference across renders. The
  // <LanguageToggle /> uses it directly in onClick (where stability is
  // not required), but any future consumer that puts setLocale in a
  // useEffect dep array or passes it into React.memo'd children will
  // rely on this stability.
  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
  }, []);

  return (
    <LocaleContext.Provider value={{ locale, setLocale }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale(): LocaleContextValue {
  return useContext(LocaleContext);
}
