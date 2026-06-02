import { useMemo } from 'react';
import type { Lang, CollabAuthor, CollabNote, DecisionOverlay } from '../types';
import { NAVY, IVORY, GOLD, INK, STONE, RULE, FONT_HEAD, FONT_BODY, FONT_LABEL } from '../theme';
import { DECISIONS, STATUS_LABEL, STATUS_COLOR } from '../../content/abacuz/decisions';
import { CHAPTERS } from '../../content/abacuz/chapters';
import { StatusPill } from './StatusPill';
import { NoteThread } from './NoteThread';

type CollabProps = {
  available: boolean;
  decisions: Record<string, DecisionOverlay>;
  notesFor: (target: string) => CollabNote[];
  addNote: (target: string, author: CollabAuthor, body: string) => Promise<void>;
  setAnswered: (decisionId: string, author: CollabAuthor, answered: boolean) => Promise<void>;
};

export function DecisionTracker({
  lang,
  identity = null,
  collab = {
    available: false,
    decisions: {},
    notesFor: () => [],
    addNote: async () => {},
    setAnswered: async () => {},
  },
}: {
  lang: Lang;
  identity?: CollabAuthor | null;
  collab?: CollabProps;
}) {
  const counts = useMemo(() => {
    return {
      locked: DECISIONS.filter((d) => d.status === 'locked').length,
      discuss: DECISIONS.filter((d) => d.status === 'discuss').length,
      joy: DECISIONS.filter((d) => d.status === 'joy').length,
    };
  }, []);

  return (
    <aside
      aria-label={lang === 'th' ? 'การติดตามการตัดสินใจ' : 'Decision tracker'}
      className="abacuz-tracker"
      style={{
        background: IVORY,
        border: `1px solid ${RULE}`,
        padding: '28px 26px',
        fontFamily: FONT_BODY,
        color: INK,
      }}
    >
      <p
        style={{
          fontFamily: FONT_LABEL,
          fontSize: '11px',
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: NAVY,
          margin: '0 0 18px 0',
        }}
      >
        {lang === 'th' ? 'การตัดสินใจ · 12 รายการ' : 'Decisions · 12 items'}
      </p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '10px',
          marginBottom: '24px',
        }}
      >
        {(['locked', 'discuss', 'joy'] as const).map((s) => (
          <div
            key={s}
            style={{
              padding: '12px 10px',
              background: STONE,
              borderRadius: '2px',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                fontFamily: FONT_HEAD,
                fontSize: '32px',
                fontWeight: 500,
                lineHeight: 1,
                color: STATUS_COLOR[s],
                marginBottom: '6px',
              }}
            >
              {counts[s]}
            </div>
            <div
              style={{
                fontFamily: FONT_LABEL,
                fontSize: '9px',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: INK,
                opacity: 0.7,
              }}
            >
              {STATUS_LABEL[s][lang]}
            </div>
          </div>
        ))}
      </div>

      <ul
        style={{
          listStyle: 'none',
          padding: 0,
          margin: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
        }}
      >
        {DECISIONS.map((d) => {
          const overlay = collab.decisions[d.id];
          const isAnswered = overlay?.answered ?? false;
          const noteTarget = `decision:${d.id}`;
          const threadNotes = collab.notesFor(noteTarget);

          return (
            <li key={d.id}>
              <div
                style={{
                  paddingBottom: '12px',
                  borderBottom: `1px dashed ${RULE}`,
                }}
              >
                <a
                  href={`#chapter-${CHAPTERS[d.chapter - 1].id}`}
                  style={{
                    display: 'block',
                    textDecoration: 'none',
                    color: 'inherit',
                  }}
                >
                  <div style={{ marginBottom: '6px' }}>
                    <StatusPill status={d.status} lang={lang} />
                  </div>
                  <div
                    style={{
                      fontFamily: FONT_BODY,
                      fontSize: '13px',
                      lineHeight: 1.5,
                      color: INK,
                    }}
                  >
                    {d.label[lang]}
                  </div>
                  <div
                    style={{
                      fontFamily: FONT_LABEL,
                      fontSize: '10px',
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase',
                      color: NAVY,
                      opacity: 0.55,
                      marginTop: '6px',
                    }}
                  >
                    {lang === 'th' ? 'บทที่ ' : 'Ch '}{d.chapter} · {CHAPTERS[d.chapter - 1].title[lang]}
                  </div>
                </a>

                {/* Answered toggle — only when capture is available and decision is not already locked */}
                {collab.available && d.status !== 'locked' && (
                  <div style={{ marginTop: '10px' }}>
                    {isAnswered ? (
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '8px',
                          flexWrap: 'wrap',
                        }}
                      >
                        <span
                          style={{
                            fontFamily: FONT_LABEL,
                            fontSize: '10px',
                            letterSpacing: '0.1em',
                            textTransform: 'uppercase',
                            color: NAVY,
                            background: GOLD,
                            padding: '2px 7px',
                            borderRadius: '1px',
                          }}
                        >
                          {lang === 'th' ? 'ตอบแล้ว · ' : 'Answered · '}
                          {overlay?.by === 'tew' ? 'Tew' : lang === 'th' ? 'คุณจอย' : 'Khun Joy'}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            identity &&
                            collab.setAnswered(d.id, identity, false)
                          }
                          disabled={!identity}
                          style={{
                            fontFamily: FONT_LABEL,
                            fontSize: '10px',
                            letterSpacing: '0.08em',
                            color: INK,
                            background: 'transparent',
                            border: 'none',
                            cursor: identity ? 'pointer' : 'not-allowed',
                            opacity: identity ? 0.6 : 0.35,
                            textDecoration: 'underline',
                            padding: '0',
                          }}
                        >
                          {lang === 'th' ? 'ยกเลิก' : 'clear'}
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() =>
                          identity && collab.setAnswered(d.id, identity, true)
                        }
                        disabled={!identity}
                        style={{
                          fontFamily: FONT_LABEL,
                          fontSize: '10px',
                          fontWeight: 500,
                          letterSpacing: '0.1em',
                          textTransform: 'uppercase',
                          color: NAVY,
                          background: STONE,
                          border: `1px solid ${RULE}`,
                          padding: '4px 10px',
                          borderRadius: '2px',
                          cursor: identity ? 'pointer' : 'not-allowed',
                          opacity: identity ? 1 : 0.5,
                          transition: 'background 130ms ease',
                        }}
                        onMouseEnter={(e) => {
                          if (identity) e.currentTarget.style.background = GOLD;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = STONE;
                        }}
                        title={
                          !identity
                            ? lang === 'th'
                              ? 'กรุณาเลือกตัวตนก่อน'
                              : 'Pick your identity above first'
                            : undefined
                        }
                      >
                        {lang === 'th' ? '✓ ตอบแล้ว' : '✓ Mark answered'}
                      </button>
                    )}
                  </div>
                )}

                {/* NoteThread per decision */}
                <NoteThread
                  target={noteTarget}
                  notes={threadNotes}
                  author={identity}
                  available={collab.available}
                  onPost={(t, body) => collab.addNote(t, identity!, body)}
                  lang={lang}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
