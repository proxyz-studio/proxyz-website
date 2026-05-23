/* MeetingsGate — second-layer auth for partner meeting summaries.
 *
 * Modeled on PartnerGate but rendered inline (no full-viewport takeover).
 * Wraps just the meetings *content* inside <PartnerMeetings>, so the
 * section heading still appears for anyone who passed the partner gate.
 *
 * The unlock cookie is scoped to a separate namespace (meetings_unlocked_<slug>)
 * so it doesn't bleed across the partner gate or other partners.
 */

import { useEffect, useRef, useState, type ReactNode } from 'react';

type Status = 'checking' | 'locked' | 'unlocked';

const FONT_MONO = "'IBM Plex Mono', monospace";

export default function MeetingsGate({
  children,
  partner,
}: {
  children: ReactNode;
  partner?: 'fast-fix' | 'lazy-tiger';
}) {
  const [status, setStatus] = useState<Status>('checking');
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (import.meta.env.DEV) {
      setStatus('unlocked');
      return;
    }
    let cancelled = false;
    const checkUrl = partner
      ? `/api/meetings-check?partner=${encodeURIComponent(partner)}`
      : '/api/meetings-check';
    fetch(checkUrl, { credentials: 'same-origin' })
      .then((r) => r.json())
      .then((d) => {
        if (!cancelled) setStatus(d.ok ? 'unlocked' : 'locked');
      })
      .catch(() => {
        if (!cancelled) setStatus('locked');
      });
    return () => {
      cancelled = true;
    };
  }, [partner]);

  useEffect(() => {
    if (status === 'locked') {
      inputRef.current?.focus();
    }
  }, [status]);

  async function submit(value: string) {
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const r = await fetch('/api/meetings-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify(partner ? { code: value, partner } : { code: value }),
      });
      if (r.ok) {
        setStatus('unlocked');
      } else {
        setError("Code didn't match. Try again.");
        setCode('');
        inputRef.current?.focus();
      }
    } catch {
      setError('Network error. Try again.');
    } finally {
      setSubmitting(false);
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const next = e.target.value.replace(/\D/g, '').slice(0, 4);
    setCode(next);
    setError(null);
    if (next.length === 4) {
      submit(next);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (code.length === 4) submit(code);
  }

  if (status === 'checking') {
    return (
      <p
        style={{
          fontFamily: FONT_MONO,
          fontSize: '11px',
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.35)',
          margin: '32px 0 0 0',
        }}
      >
        Verifying meeting access…
      </p>
    );
  }

  if (status === 'unlocked') {
    return <>{children}</>;
  }

  return (
    <div
      style={{
        marginTop: '40px',
        padding: '32px',
        border: '1px solid rgba(255,255,255,0.12)',
        background: 'rgba(255,255,255,0.02)',
        maxWidth: '480px',
      }}
    >
      <p
        style={{
          fontFamily: FONT_MONO,
          fontSize: '11px',
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: 'var(--accent-pink, #FF4193)',
          margin: '0 0 14px 0',
        }}
      >
        Meeting access
      </p>
      <p
        style={{
          fontFamily: FONT_MONO,
          fontSize: '14px',
          lineHeight: 1.6,
          color: 'rgba(255,255,255,0.7)',
          margin: '0 0 22px 0',
        }}
      >
        Meeting summaries are scoped to the build team. Enter the 4-digit
        meeting code Tew shared with you.
      </p>
      <form onSubmit={handleSubmit}>
        <input
          ref={inputRef}
          value={code}
          onChange={handleChange}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          maxLength={4}
          disabled={submitting}
          aria-label="Four-digit meeting code"
          placeholder="0000"
          style={{
            fontFamily: FONT_MONO,
            fontSize: '28px',
            fontWeight: 400,
            letterSpacing: '0.5em',
            textAlign: 'center',
            width: '100%',
            padding: '16px 0',
            background: '#0a0a0a',
            border: '1px solid rgba(255,255,255,0.3)',
            borderRadius: 0,
            color: '#F2F2F2',
            outline: 'none',
            boxSizing: 'border-box',
            transition: 'border-color 0.15s',
          }}
          onFocus={(e) => {
            (e.target as HTMLInputElement).style.borderColor =
              'var(--accent-pink, #FF4193)';
          }}
          onBlur={(e) => {
            (e.target as HTMLInputElement).style.borderColor =
              'rgba(255,255,255,0.3)';
          }}
        />
        <div style={{ minHeight: '20px', marginTop: '12px' }}>
          {error && (
            <p
              style={{
                fontFamily: FONT_MONO,
                fontSize: '12px',
                color: 'var(--accent-pink, #FF4193)',
                margin: 0,
              }}
            >
              {error}
            </p>
          )}
          {submitting && !error && (
            <p
              style={{
                fontFamily: FONT_MONO,
                fontSize: '11px',
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.45)',
                margin: 0,
              }}
            >
              Checking…
            </p>
          )}
        </div>
      </form>
    </div>
  );
}
