/* PartnerMeetings — reusable meeting-summaries widget for partner pages.
 *
 * Renders a list of <PartnerMeetings partner="lazy-tiger" /> cards inside
 * a section on the partner page. The latest meeting is expanded by default;
 * older meetings collapse to a one-row card. Content is gated by
 * <MeetingsGate>, which sits between the section heading and these cards.
 *
 * Content lives in src/content/<partner>/meetings/*.md and is loaded at
 * build time via src/lib/meetings.ts.
 */

import { useState } from 'react';
import MeetingsGate from './MeetingsGate';
import { getMeetings, formatMeetingDate, type Meeting } from '../lib/meetings';

const FONT_MONO = "'IBM Plex Mono', monospace";
const PINK = 'var(--lt-accent, #FF4193)';

interface Props {
  partner: 'fast-fix' | 'lazy-tiger';
  /** Accent color override; defaults to the page's --lt-accent var. */
  accent?: string;
}

export default function PartnerMeetings({ partner, accent }: Props) {
  const meetings = getMeetings(partner);
  const accentColor = accent ?? PINK;

  return (
    <MeetingsGate partner={partner}>
      <style>{`
        .meeting-body h2 {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 16px;
          font-weight: 500;
          letter-spacing: -0.005em;
          color: #fff;
          margin: 32px 0 14px 0;
        }
        .meeting-body h3 {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 13px;
          font-weight: 500;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.85);
          margin: 24px 0 10px 0;
        }
        .meeting-body p { margin: 0 0 14px 0; }
        .meeting-body strong { color: #fff; font-weight: 500; }
        .meeting-body em { color: rgba(255,255,255,0.92); font-style: italic; }
        .meeting-body ul, .meeting-body ol { margin: 0 0 18px 0; padding-left: 22px; }
        .meeting-body li { margin: 6px 0; }
        .meeting-body hr {
          border: none;
          border-top: 1px solid rgba(255,255,255,0.12);
          margin: 28px 0;
        }
        .meeting-body code {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 12.5px;
          background: rgba(255,255,255,0.06);
          padding: 2px 6px;
          border-radius: 2px;
        }
        .meeting-body blockquote {
          margin: 0 0 18px 0;
          padding-left: 16px;
          border-left: 2px solid var(--lt-accent, #FF4193);
          color: rgba(255,255,255,0.7);
        }
        .meeting-body a {
          color: var(--lt-accent, #FF4193);
          text-decoration: none;
          border-bottom: 1px solid rgba(255,65,147,0.3);
        }
      `}</style>
      {meetings.length === 0 ? (
        <p
          style={{
            fontFamily: FONT_MONO,
            fontSize: '14px',
            color: 'rgba(255,255,255,0.55)',
            margin: '32px 0 0 0',
          }}
        >
          No meetings logged yet. New summaries will appear here as the
          engagement progresses.
        </p>
      ) : (
        <div style={{ marginTop: '40px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {meetings.map((m, idx) => (
            <MeetingCard key={m.id} meeting={m} defaultOpen={idx === 0} accent={accentColor} />
          ))}
        </div>
      )}
    </MeetingsGate>
  );
}

function MeetingCard({
  meeting,
  defaultOpen,
  accent,
}: {
  meeting: Meeting;
  defaultOpen: boolean;
  accent: string;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const { date, time } = formatMeetingDate(meeting.date);

  return (
    <article
      style={{
        border: '1px solid rgba(255,255,255,0.12)',
        background: 'rgba(255,255,255,0.02)',
        transition: 'border-color 0.2s',
      }}
      onMouseEnter={(e) => {
        if (!open) (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.24)';
      }}
      onMouseLeave={(e) => {
        if (!open) (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.12)';
      }}
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        style={{
          appearance: 'none',
          background: 'transparent',
          border: 'none',
          color: 'inherit',
          width: '100%',
          textAlign: 'left',
          cursor: 'pointer',
          padding: '24px 28px',
          display: 'grid',
          gridTemplateColumns: '1fr auto',
          gap: '20px',
          alignItems: 'flex-start',
        }}
      >
        <div>
          <p
            style={{
              fontFamily: FONT_MONO,
              fontSize: '11px',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: accent,
              margin: '0 0 10px 0',
            }}
          >
            {date}
            {time && (
              <span style={{ color: 'rgba(255,255,255,0.45)', marginLeft: '10px' }}>
                {time} BKK
              </span>
            )}
          </p>
          <h3
            style={{
              fontFamily: FONT_MONO,
              fontSize: 'clamp(18px, 2vw, 22px)',
              fontWeight: 400,
              lineHeight: 1.25,
              letterSpacing: '-0.01em',
              color: '#fff',
              margin: '0 0 14px 0',
            }}
          >
            {meeting.title}
          </h3>
          {meeting.attendees.length > 0 && (
            <div
              style={{
                display: 'flex',
                gap: '8px',
                flexWrap: 'wrap',
                marginBottom: '14px',
              }}
            >
              {meeting.attendees.map((person) => (
                <span
                  key={person}
                  style={{
                    fontFamily: FONT_MONO,
                    fontSize: '10px',
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    color: accent,
                    border: `1px solid ${accent}`,
                    padding: '4px 10px',
                    borderRadius: '999px',
                  }}
                >
                  {person}
                </span>
              ))}
            </div>
          )}
          {!open && meeting.teaser && (
            <p
              style={{
                fontFamily: FONT_MONO,
                fontSize: '14px',
                lineHeight: 1.65,
                color: 'rgba(255,255,255,0.7)',
                margin: 0,
                maxWidth: '70ch',
              }}
            >
              {meeting.teaser}
            </p>
          )}
        </div>
        <span
          aria-hidden
          style={{
            fontFamily: FONT_MONO,
            fontSize: '14px',
            color: 'rgba(255,255,255,0.55)',
            paddingTop: '4px',
            transition: 'transform 0.2s',
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
          }}
        >
          ▾
        </span>
      </button>
      {open && (
        <div
          style={{
            borderTop: '1px solid rgba(255,255,255,0.08)',
            padding: '24px 28px 28px',
          }}
        >
          <div
            className="meeting-body"
            style={{
              fontFamily: FONT_MONO,
              fontSize: '14px',
              lineHeight: 1.75,
              color: 'rgba(255,255,255,0.82)',
              maxWidth: '70ch',
            }}
            dangerouslySetInnerHTML={{ __html: meeting.html }}
          />
        </div>
      )}
    </article>
  );
}
