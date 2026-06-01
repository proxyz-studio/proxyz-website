/* ─── useIdentity — persistent author identity ─────────────────────── */
/* Backed by localStorage['abacuz-identity'].
 * SSR-safe: guards typeof window before accessing localStorage.
 * react-refresh safe: hook exported only (no component in this file).
 */

import { useState, useCallback } from 'react';
import type { CollabAuthor } from './types';

const STORAGE_KEY = 'abacuz-identity';

function readFromStorage(): CollabAuthor | null {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'tew' || stored === 'joy') return stored;
  return null;
}

function writeToStorage(author: CollabAuthor): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, author);
}

export function useIdentity(): {
  identity: CollabAuthor | null;
  setIdentity: (a: CollabAuthor) => void;
} {
  const [identity, setIdentityState] = useState<CollabAuthor | null>(readFromStorage);

  const setIdentity = useCallback((author: CollabAuthor) => {
    writeToStorage(author);
    setIdentityState(author);
  }, []);

  return { identity, setIdentity };
}
