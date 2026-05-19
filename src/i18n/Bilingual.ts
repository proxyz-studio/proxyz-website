// src/i18n/Bilingual.ts

/**
 * A translatable field. English is required; Thai is optional.
 * When Thai is absent in Thai mode, callers fall back to English.
 */
export type Bilingual<T> = { en: T; th?: T };

export type Locale = 'en' | 'th';

/**
 * Resolve a Bilingual value to the active locale's value.
 * Falls back to English when locale is Thai but `th` is undefined.
 * Never returns undefined (because `en` is required by the type).
 */
export function t<T>(value: Bilingual<T>, locale: Locale): T {
  if (locale === 'th' && value.th !== undefined) {
    return value.th;
  }
  return value.en;
}

/**
 * Returns true when the value WOULD fall back to English at the given locale.
 * Pure predicate. No side effects.
 */
export function isFallback(value: Bilingual<unknown>, locale: Locale): boolean {
  return locale === 'th' && value.th === undefined;
}

/**
 * Returns true if ANY of the passed Bilingual values would fall back
 * at the given locale. Sections use this to decide whether to render
 * the [EN] badge in their eyebrow.
 */
export function anyFallback(
  locale: Locale,
  ...values: Array<Bilingual<unknown>>
): boolean {
  if (locale !== 'th') return false;
  return values.some((v) => v.th === undefined);
}
