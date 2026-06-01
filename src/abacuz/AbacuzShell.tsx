/* ─── AbacuzShell — zone-aware wrapper ────────────────────────────── */
/* Owns lang state + font injection + zone routing.
 * Renders a sticky zone-switcher header above the active zone.
 */

import { useEffect, useState } from 'react';
import type { Lang } from './types';
import {
  NAVY, STONE, INK, GOLD, RULE,
  FONT_WORD, FONT_LABEL,
} from './theme';
import { useAbacuzFonts } from './useAbacuzFonts';
import { useZone, type Zone } from './useZone';
import { useIdentity } from './useIdentity';
import { useCollab } from './useCollab';
import { LangToggle } from './components/LangToggle';
import { IdentityChip } from './components/IdentityChip';
import { CollaborateZone } from './zones/CollaborateZone';
import { DeckZone } from './zones/DeckZone';
import { PreviewZone } from './zones/PreviewZone';

type ZoneConfig = { id: Zone; labelTh: string; labelEn: string };

const ZONES: ZoneConfig[] = [
  { id: 'collaborate', labelTh: 'บทแนะนำ', labelEn: 'Collaborate' },
  { id: 'deck', labelTh: 'สไลด์', labelEn: 'Product Deck' },
  { id: 'preview', labelTh: 'ตัวอย่าง', labelEn: 'Preview' },
];

export function AbacuzShell() {
  useAbacuzFonts();
  const [lang, setLang] = useState<Lang>('th');
  const { zone, setZone } = useZone();
  const { identity, setIdentity } = useIdentity();
  const collab = useCollab('abacuz');

  // Set document.title for the page session
  useEffect(() => {
    const prev = document.title;
    document.title = 'ABACUZ × PROXYZ — Partner walkthrough';
    return () => {
      document.title = prev;
    };
  }, []);

  return (
    <>
      {/* Zone-switcher header — sticks at the top of the viewport.
          Sits ABOVE the CollaborateZone's own Nav so Collaborate's Nav
          becomes part of its content, not a global chrome. */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 200,
          background: STONE,
          borderBottom: `1px solid ${RULE}`,
          display: 'flex',
          alignItems: 'center',
          gap: '0',
          padding: '0 20px',
          minHeight: '52px',
        }}
      >
        {/* ABACUZ wordmark */}
        <div
          style={{
            fontFamily: FONT_WORD,
            fontSize: '16px',
            fontWeight: 700,
            letterSpacing: '0.08em',
            color: NAVY,
            marginRight: '24px',
            flexShrink: 0,
          }}
        >
          ABACU<span style={{ color: GOLD }}>Z</span>
        </div>

        {/* Zone switcher buttons */}
        <div
          role="tablist"
          aria-label={lang === 'th' ? 'เลือกโซน' : 'Zone switcher'}
          style={{
            display: 'flex',
            gap: '2px',
            flex: 1,
          }}
        >
          {ZONES.map((z) => {
            const active = zone === z.id;
            return (
              <button
                key={z.id}
                role="tab"
                aria-selected={active}
                type="button"
                onClick={() => setZone(z.id)}
                style={{
                  fontFamily: FONT_LABEL,
                  fontSize: '11px',
                  fontWeight: active ? 600 : 400,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: active ? NAVY : INK,
                  background: 'transparent',
                  border: 'none',
                  borderBottom: active ? `2px solid ${GOLD}` : '2px solid transparent',
                  padding: '16px 16px 14px',
                  cursor: 'pointer',
                  transition: 'color 160ms ease, border-color 160ms ease',
                  whiteSpace: 'nowrap',
                }}
              >
                {lang === 'th' ? z.labelTh : z.labelEn}
              </button>
            );
          })}
        </div>

        {/* Identity chip — only when capture is available */}
        {collab.available && (
          <div style={{ flexShrink: 0, marginLeft: '16px' }}>
            <IdentityChip lang={lang} identity={identity} setIdentity={setIdentity} />
          </div>
        )}

        {/* Language toggle — right side */}
        <div style={{ flexShrink: 0, marginLeft: '12px' }}>
          <LangToggle lang={lang} setLang={setLang} />
        </div>
      </div>

      {/* Active zone */}
      {zone === 'collaborate' && (
        <CollaborateZone
          lang={lang}
          setLang={setLang}
          identity={identity}
          collab={collab}
        />
      )}
      {zone === 'deck' && <DeckZone lang={lang} />}
      {zone === 'preview' && <PreviewZone lang={lang} />}
    </>
  );
}
