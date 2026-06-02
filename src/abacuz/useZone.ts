/* ─── Zone switcher hook ──────────────────────────────────────────── */
/* Reads/writes ?zone= in the URL.
 * Default and any invalid/absent value → 'collaborate'.
 * Setting 'collaborate' removes the param (canonical bare URL).
 * 'deck' / 'preview' set ?zone=deck|preview.
 */

import { useSearchParams } from 'react-router-dom';

export type Zone = 'collaborate' | 'deck' | 'preview';

const VALID_ZONES: Zone[] = ['collaborate', 'deck', 'preview'];

function isValidZone(v: string | null): v is Zone {
  return VALID_ZONES.includes(v as Zone);
}

export function useZone(): { zone: Zone; setZone: (z: Zone) => void } {
  const [searchParams, setSearchParams] = useSearchParams();
  const raw = searchParams.get('zone');
  const zone: Zone = isValidZone(raw) ? raw : 'collaborate';

  function setZone(z: Zone) {
    if (z === 'collaborate') {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        next.delete('zone');
        return next;
      });
    } else {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        next.set('zone', z);
        return next;
      });
    }
  }

  return { zone, setZone };
}
