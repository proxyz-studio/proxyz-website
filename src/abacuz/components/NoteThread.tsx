/* ─── NoteThread — note list + compose ──────────────────────────────── */
/* Reusable across chapters and decisions.
 * Notes render as plain text (React-encoded; NEVER dangerouslySetInnerHTML).
 * Compose row hidden when !available; disabled+hinted when available but author=null.
 */

import { useState } from 'react';
import type { Lang, CollabAuthor, CollabNote } from '../types';
import { NAVY, GOLD, IVORY, STONE, INK, RULE, FONT_BODY, FONT_LABEL } from '../theme';

const AUTHOR_LABEL: Record<CollabAuthor, Record<Lang, string>> = {
  tew: { en: 'Tew', th: 'Tew' },
  joy: { en: 'Khun Joy', th: 'คุณจอย' },
};

type Props = {
  target: string;
  notes: CollabNote[];
  author: CollabAuthor | null;
  available: boolean;
  onPost: (target: string, body: string) => Promise<void>;
  lang: Lang;
};

function formatDate(ts: string, lang: Lang): string {
  try {
    return new Intl.DateTimeFormat(lang === 'th' ? 'th' : 'en', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(ts));
  } catch {
    return ts;
  }
}

export function NoteThread({ target, notes, author, available, onPost, lang }: Props) {
  const [draft, setDraft] = useState('');
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!available) return null;

  const handlePost = async () => {
    const body = draft.trim();
    if (!body || !author) return;
    setPosting(true);
    setError(null);
    try {
      await onPost(target, body);
      setDraft('');
    } catch {
      setError(lang === 'th' ? 'บันทึกไม่สำเร็จ กรุณาลองใหม่' : 'Could not save. Please try again.');
    } finally {
      setPosting(false);
    }
  };

  return (
    <div
      style={{
        marginTop: '28px',
        paddingTop: '20px',
        borderTop: `1px solid ${RULE}`,
      }}
    >
      {/* Note list */}
      {notes.length > 0 && (
        <ul
          style={{
            listStyle: 'none',
            padding: 0,
            margin: '0 0 16px 0',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          {notes.map((note) => (
            <li
              key={note.id}
              style={{
                background: STONE,
                border: `1px solid ${RULE}`,
                padding: '12px 14px',
                borderRadius: '2px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                  gap: '8px',
                  marginBottom: '6px',
                  flexWrap: 'wrap',
                }}
              >
                <span
                  style={{
                    fontFamily: FONT_LABEL,
                    fontSize: '10px',
                    fontWeight: 600,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: NAVY,
                    background: GOLD,
                    padding: '2px 6px',
                    borderRadius: '1px',
                  }}
                >
                  {AUTHOR_LABEL[note.author][lang]}
                </span>
                <span
                  style={{
                    fontFamily: FONT_LABEL,
                    fontSize: '10px',
                    color: INK,
                    opacity: 0.5,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {formatDate(note.ts, lang)}
                </span>
              </div>
              {/* Plain text — React output-encodes; never use innerHTML */}
              <p
                style={{
                  fontFamily: FONT_BODY,
                  fontSize: '14px',
                  lineHeight: 1.65,
                  color: INK,
                  margin: 0,
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                }}
              >
                {note.body}
              </p>
            </li>
          ))}
        </ul>
      )}

      {/* Compose row */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          disabled={!author || posting}
          placeholder={
            !author
              ? lang === 'th'
                ? 'กรุณาเลือกตัวตนก่อนเขียนโน้ต'
                : 'Pick your identity above to leave a note'
              : lang === 'th'
              ? 'เขียนโน้ต...'
              : 'Add a note...'
          }
          rows={3}
          style={{
            fontFamily: FONT_BODY,
            fontSize: '14px',
            lineHeight: 1.6,
            color: INK,
            background: author ? IVORY : STONE,
            border: `1px solid ${RULE}`,
            borderRadius: '2px',
            padding: '10px 12px',
            resize: 'vertical',
            outline: 'none',
            opacity: author ? 1 : 0.6,
            cursor: author ? 'text' : 'not-allowed',
            width: '100%',
            boxSizing: 'border-box',
          }}
          onFocus={(e) => {
            if (author) e.currentTarget.style.borderColor = GOLD;
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = RULE;
          }}
        />

        {error && (
          <p
            style={{
              fontFamily: FONT_BODY,
              fontSize: '12px',
              color: '#c0392b',
              margin: 0,
            }}
          >
            {error}
          </p>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={handlePost}
            disabled={!author || !draft.trim() || posting}
            style={{
              fontFamily: FONT_LABEL,
              fontSize: '11px',
              fontWeight: 600,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: IVORY,
              background: !author || !draft.trim() || posting ? RULE : NAVY,
              border: 'none',
              padding: '8px 18px',
              borderRadius: '2px',
              cursor: !author || !draft.trim() || posting ? 'not-allowed' : 'pointer',
              transition: 'background 140ms ease',
            }}
            onMouseEnter={(e) => {
              if (author && draft.trim() && !posting) {
                e.currentTarget.style.background = GOLD;
                e.currentTarget.style.color = NAVY;
              }
            }}
            onMouseLeave={(e) => {
              if (author && draft.trim() && !posting) {
                e.currentTarget.style.background = NAVY;
                e.currentTarget.style.color = IVORY;
              }
            }}
          >
            {posting
              ? lang === 'th'
                ? 'กำลังบันทึก...'
                : 'Saving...'
              : lang === 'th'
              ? 'โพสต์'
              : 'Post'}
          </button>
        </div>
      </div>
    </div>
  );
}
