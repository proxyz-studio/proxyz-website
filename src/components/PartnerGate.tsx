import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';

type Status = 'checking' | 'locked' | 'unlocked';

const FONT_MONO = "'IBM Plex Mono', monospace";

export default function PartnerGate({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<Status>('checking');
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('gate') === 'locked') {
      setStatus('locked');
      return;
    }
    if (import.meta.env.DEV) {
      setStatus('unlocked');
      return;
    }
    let cancelled = false;
    fetch('/api/partners-check', { credentials: 'same-origin' })
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
  }, []);

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
      const r = await fetch('/api/partners-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ code: value }),
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
      <div
        style={{
          minHeight: 'calc(100vh - 83px)',
          background: '#000',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: FONT_MONO,
          fontSize: '11px',
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.4)',
        }}
      >
        Verifying access…
      </div>
    );
  }

  if (status === 'unlocked') {
    return <>{children}</>;
  }

  return (
    <div
      style={{
        minHeight: 'calc(100vh - 83px)',
        background: '#000',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '120px 24px 80px',
        fontFamily: FONT_MONO,
      }}
    >
      <div style={{ maxWidth: '440px', width: '100%' }}>
        <p
          style={{
            fontSize: '11px',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: 'var(--accent-pink)',
            margin: '0 0 22px 0',
          }}
        >
          Partner access
        </p>
        <h1
          style={{
            fontFamily: FONT_MONO,
            fontSize: 'clamp(28px, 3.4vw, 40px)',
            fontWeight: 400,
            lineHeight: 1.1,
            letterSpacing: '-0.015em',
            margin: '0 0 18px 0',
            textWrap: 'balance',
          }}
        >
          Enter the partner code.
        </h1>
        <p
          style={{
            fontSize: '14px',
            lineHeight: 1.6,
            color: 'rgba(255,255,255,0.66)',
            margin: '0 0 36px 0',
            maxWidth: '40ch',
          }}
        >
          This page is shared with named partners. Use the 4-digit code from
          your invite to view the engagement.
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
            aria-label="Four-digit partner code"
            placeholder="0000"
            style={{
              fontFamily: FONT_MONO,
              fontSize: '32px',
              fontWeight: 400,
              letterSpacing: '0.5em',
              textAlign: 'center',
              width: '100%',
              padding: '20px 0',
              background: '#0a0a0a',
              border: '1px solid rgba(255,255,255,0.30)',
              borderRadius: '0',
              color: '#fff',
              outline: 'none',
              transition: 'border-color 0.15s',
              boxSizing: 'border-box',
            }}
            onFocus={(e) => {
              (e.target as HTMLInputElement).style.borderColor = 'var(--accent-pink)';
            }}
            onBlur={(e) => {
              (e.target as HTMLInputElement).style.borderColor = 'rgba(255,255,255,0.30)';
            }}
          />

          <div style={{ minHeight: '20px', marginTop: '14px' }}>
            {error && (
              <p
                style={{
                  fontSize: '12px',
                  letterSpacing: '0.04em',
                  color: 'var(--accent-pink)',
                  margin: 0,
                }}
              >
                {error}
              </p>
            )}
            {submitting && !error && (
              <p
                style={{
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

        <div
          style={{
            marginTop: '40px',
            paddingTop: '24px',
            borderTop: '1px solid rgba(255,255,255,0.12)',
            display: 'flex',
            gap: '24px',
            flexWrap: 'wrap',
            fontSize: '11px',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}
        >
          <Link
            to="/partners"
            style={{
              color: 'rgba(255,255,255,0.55)',
              textDecoration: 'none',
              borderBottom: '1px solid rgba(255,255,255,0.2)',
              paddingBottom: '2px',
            }}
          >
            ← Back to partners
          </Link>
          <a
            href="mailto:hello@proxyz.studio?subject=Partner access"
            style={{
              color: 'rgba(255,255,255,0.55)',
              textDecoration: 'none',
              borderBottom: '1px solid rgba(255,255,255,0.2)',
              paddingBottom: '2px',
            }}
          >
            Request a code →
          </a>
        </div>
      </div>
    </div>
  );
}
