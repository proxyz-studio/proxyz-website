/* ─── useCollab — collaboration capture state + API ─────────────────── */
/* On mount: GET /api/partner-collab-get?partner=<partner>.
 *   - 200 { configured:true }  → available=true + hydrate data.
 *   - anything else (404/401/network/configured:false) → available=false
 *     (errors swallowed; at most one console.debug).
 *
 * addNote / setAnswered use optimistic update + rollback on failure.
 * Hand-rolled fetch; no react-query.
 * react-refresh safe: hook exported only (no component in this file).
 */

import { useState, useEffect, useCallback } from 'react';
import type { CollabAuthor, CollabNote, DecisionOverlay } from './types';

type CollabState = {
  available: boolean;
  notes: CollabNote[];
  decisions: Record<string, DecisionOverlay>;
};

type UseCollabReturn = {
  available: boolean;
  notes: CollabNote[];
  decisions: Record<string, DecisionOverlay>;
  notesFor: (target: string) => CollabNote[];
  addNote: (target: string, author: CollabAuthor, body: string) => Promise<void>;
  setAnswered: (decisionId: string, author: CollabAuthor, answered: boolean) => Promise<void>;
};

export function useCollab(partner = 'abacuz'): UseCollabReturn {
  const [state, setState] = useState<CollabState>({
    available: false,
    notes: [],
    decisions: {},
  });

  // Mount: try to load data; any error → available stays false.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/partner-collab-get?partner=${encodeURIComponent(partner)}`, {
          credentials: 'same-origin',
        });
        if (!res.ok) {
          console.debug('[useCollab] GET not OK:', res.status);
          return;
        }
        const data = (await res.json()) as {
          configured: boolean;
          notes: CollabNote[];
          decisions: Record<string, DecisionOverlay>;
        };
        if (!data.configured) {
          console.debug('[useCollab] capture not configured');
          return;
        }
        if (!cancelled) {
          setState({ available: true, notes: data.notes ?? [], decisions: data.decisions ?? {} });
        }
      } catch (err) {
        console.debug('[useCollab] fetch failed:', err);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [partner]);

  const notesFor = useCallback(
    (target: string) => state.notes.filter((n) => n.target === target),
    [state.notes],
  );

  // Optimistic addNote: append immediately, POST, reconcile or roll back.
  const addNote = useCallback(
    async (target: string, author: CollabAuthor, body: string) => {
      const tempId = `temp-${Date.now()}-${Math.random()}`;
      const optimistic: CollabNote = {
        id: tempId,
        target,
        author,
        body,
        ts: new Date().toISOString(),
      };
      setState((prev) => ({ ...prev, notes: [...prev.notes, optimistic] }));

      try {
        const res = await fetch('/api/partner-collab-post', {
          method: 'POST',
          credentials: 'same-origin',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ partner, author, action: 'note', target, body }),
        });
        if (!res.ok) {
          throw new Error(`POST failed: ${res.status}`);
        }
        const data = (await res.json()) as { ok: boolean; note: CollabNote };
        // Reconcile: replace the temp entry with the server's canonical note.
        setState((prev) => ({
          ...prev,
          notes: prev.notes.map((n) => (n.id === tempId ? data.note : n)),
        }));
      } catch (err) {
        console.debug('[useCollab] addNote failed, rolling back:', err);
        // Roll back optimistic entry.
        setState((prev) => ({ ...prev, notes: prev.notes.filter((n) => n.id !== tempId) }));
      }
    },
    [partner],
  );

  // Optimistic setAnswered: update decisions immediately, POST, reconcile or roll back.
  const setAnswered = useCallback(
    async (decisionId: string, author: CollabAuthor, answered: boolean) => {
      const prev = state.decisions[decisionId] ?? null;
      const optimistic: DecisionOverlay = { answered, by: author, at: new Date().toISOString() };

      setState((s) => ({
        ...s,
        decisions: answered
          ? { ...s.decisions, [decisionId]: optimistic }
          : Object.fromEntries(Object.entries(s.decisions).filter(([k]) => k !== decisionId)),
      }));

      try {
        const action = answered ? 'answer' : 'unanswer';
        const res = await fetch('/api/partner-collab-post', {
          method: 'POST',
          credentials: 'same-origin',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ partner, author, action, decisionId }),
        });
        if (!res.ok) {
          throw new Error(`POST failed: ${res.status}`);
        }
        const data = (await res.json()) as {
          ok: boolean;
          decisionId: string;
          overlay: DecisionOverlay | null;
        };
        // Reconcile with server value.
        setState((s) => {
          const next = { ...s.decisions };
          if (data.overlay) {
            next[data.decisionId] = data.overlay;
          } else {
            delete next[data.decisionId];
          }
          return { ...s, decisions: next };
        });
      } catch (err) {
        console.debug('[useCollab] setAnswered failed, rolling back:', err);
        // Roll back.
        setState((s) => {
          const next = { ...s.decisions };
          if (prev) {
            next[decisionId] = prev;
          } else {
            delete next[decisionId];
          }
          return { ...s, decisions: next };
        });
      }
    },
    [partner, state.decisions],
  );

  return {
    available: state.available,
    notes: state.notes,
    decisions: state.decisions,
    notesFor,
    addNote,
    setAnswered,
  };
}
