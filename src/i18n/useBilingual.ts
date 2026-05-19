// src/i18n/useBilingual.ts
import type { Bilingual } from './Bilingual';
import { t } from './Bilingual';
import { useLocale } from './LocaleContext';

/**
 * Resolves a Bilingual<T> field to the active locale's value.
 * Falls back to English when Thai is undefined in Thai mode.
 * Pure render-time function; no side effects.
 */
export function useBilingual<T>(value: Bilingual<T>): T {
  const { locale } = useLocale();
  return t(value, locale);
}
