/* /p/:slug — instant proposal link.
 *
 * Gated viewer for proposals published straight to Redis via
 * scripts/publish-proposal.sh (no git push, no rebuild). Mirrors the
 * PartnerGate visual language: dark #0A0A0A, IBM Plex Mono, pink accent,
 * PROXYZ wordmark, 4-digit code input that auto-submits.
 *
 * Flow: checking (cookie probe) → locked (code input) → loading (fetch
 * html) → unlocked (sandboxed full-viewport iframe) | not-found | error.
 *
 * The HTML renders inside a full-viewport <iframe srcdoc> sandboxed with
 * allow-scripts allow-same-origin allow-forms allow-popups — see the
 * justification on the iframe itself. Short version: the content is
 * studio-authored (only the admin-secret publish endpoint can store it)
 * and same-origin is what lets an interactive proposal call the respond
 * API with the recipient's gate cookie.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ProxyzMark } from '../components/ProxyzMark';

type Status = 'checking' | 'locked' | 'loading' | 'not-found' | 'error' | 'unlocked';

type ProposalMeta = {
  title: string;
  publishedAt: string;
  updatedAt: string;
} | null;

const FONT_MONO = "'IBM Plex Mono', monospace";
const SLUG_RE = /^[a-z0-9-]{2,40}$/;

export default function Proposal() {
  const { slug: rawSlug } = useParams();
  const slug = rawSlug && SLUG_RE.test(rawSlug) ? rawSlug : null;

  // Initial state is fully derivable: invalid slug shape can never resolve
  // (not-found), ?gate=locked force-previews the gate, otherwise probe.
  const [status, setStatus] = useState<Status>(() => {
    if (!slug) return 'not-found';
    const params = new URLSearchParams(window.location.search);
    if (params.get('gate') === 'locked') return 'locked';
    return 'checking';
  });
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [html, setHtml] = useState<string | null>(null);
  const [meta, setMeta] = useState<ProposalMeta>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Callers flip status to 'loading' themselves (from async callbacks /
  // event handlers) — no synchronous setState inside the mount effect.
  const fetchProposal = useCallback(async () => {
    if (!slug) return;
    try {
      const r = await fetch(`/api/proposal-get?slug=${encodeURIComponent(slug)}`, {
        credentials: 'same-origin',
      });
      if (r.status === 404) {
        setStatus('not-found');
        return;
      }
      if (r.status === 401) {
        setStatus('locked');
        return;
      }
      if (!r.ok) {
        setStatus('error');
        return;
      }
      const d = await r.json();
      if (!d?.ok || typeof d.html !== 'string') {
        setStatus('error');
        return;
      }
      setHtml(d.html);
      setMeta(d.meta ?? null);
      setStatus('unlocked');
    } catch {
      setStatus('error');
    }
  }, [slug]);

  // Initial cookie probe → locked or straight to content.
  useEffect(() => {
    if (!slug) return; // status initialized to not-found
    const params = new URLSearchParams(window.location.search);
    if (params.get('gate') === 'locked') return; // initialized to locked
    if (import.meta.env.DEV) {
      // Same dev convenience as PartnerGate: skip the gate locally.
      // proposal-get still needs `vercel dev` + Upstash env to resolve.
      // Deferred a tick so no state updates run synchronously in the effect.
      const t = setTimeout(fetchProposal, 0);
      return () => clearTimeout(t);
    }
    let cancelled = false;
    fetch(`/api/proposal-check?slug=${encodeURIComponent(slug)}`, {
      credentials: 'same-origin',
    })
      .then((r) => r.json())
      .then((d) => {
        if (cancelled) return;
        if (d?.ok) {
          setStatus('loading');
          fetchProposal();
        } else {
          setStatus('locked');
        }
      })
      .catch(() => {
        if (!cancelled) setStatus('locked');
      });
    return () => {
      cancelled = true;
    };
  }, [slug, fetchProposal]);

  useEffect(() => {
    if (status === 'locked') inputRef.current?.focus();
  }, [status]);

  // Page title: proposal title once known, neutral label before that.
  useEffect(() => {
    document.title =
      status === 'unlocked' && meta?.title ? meta.title : 'PROXYZ — Proposal';
  }, [status, meta]);

  async function submit(value: string) {
    if (submitting || !slug) return;
    setSubmitting(true);
    setError(null);
    try {
      const r = await fetch('/api/proposal-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ slug, code: value }),
      });
      if (r.ok) {
        setStatus('loading');
        await fetchProposal();
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
    if (next.length === 4) submit(next);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (code.length === 4) submit(code);
  }

  if (status === 'unlocked' && html !== null) {
    return (
      <iframe
        srcDoc={html}
        // allow-same-origin is deliberate, and safe here for two reasons:
        // (1) trusted authorship — proposal HTML is studio-authored and can
        //     only enter the store through /api/proposal-put, which requires
        //     the PROPOSAL_ADMIN_SECRET header; no third party can publish.
        // (2) interactivity needs it — with allow-same-origin, srcdoc
        //     inherits the parent's origin and base URL, so the proposal's
        //     own scripts/forms can fetch("/api/proposal-respond") and the
        //     request hits proxyz.studio WITH the HttpOnly gate cookie.
        //     Without it the iframe is an opaque origin and can't respond.
        // allow-forms lets the proposal use native <form> submission too.
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
        title={meta?.title ?? 'Proposal'}
        style={{
          position: 'fixed',
          inset: 0,
          width: '100vw',
          height: '100vh',
          border: 'none',
          display: 'block',
          background: '#0A0A0A',
          zIndex: 50,
        }}
      />
    );
  }

  if (status === 'checking' || status === 'loading') {
    return (
      <Shell>
        <p style={quietLabelStyle}>
          {status === 'checking' ? 'Verifying access…' : 'Loading proposal…'}
        </p>
      </Shell>
    );
  }

  if (status === 'not-found' || status === 'error') {
    return (
      <Shell>
        <div style={{ maxWidth: '440px', width: '100%', textAlign: 'center' }}>
          <p style={{ ...eyebrowStyle, marginBottom: '22px' }}>
            <ProxyzMark />
          </p>
          <h1 style={headingStyle}>
            {status === 'not-found'
              ? 'This proposal isn’t here.'
              : 'Something broke on our side.'}
          </h1>
          <p style={bodyTextStyle}>
            {status === 'not-found'
              ? 'The link may have expired or moved. Check the URL from your invite, or get in touch.'
              : 'Try reloading the page. If it keeps failing, tell us.'}
          </p>
          <a href="mailto:hello@proxyz.studio?subject=Proposal link" style={footerLinkStyle}>
            hello@proxyz.studio →
          </a>
        </div>
      </Shell>
    );
  }

  // locked
  return (
    <Shell align="start">
      <div style={{ maxWidth: '440px', width: '100%' }}>
        <p style={{ fontSize: '16px', margin: '0 0 28px 0' }}>
          <ProxyzMark />
        </p>
        <p style={{ ...eyebrowStyle, margin: '0 0 22px 0' }}>Private proposal</p>
        <h1 style={{ ...headingStyle, textAlign: 'left' }}>Enter the access code.</h1>
        <p style={{ ...bodyTextStyle, textAlign: 'left', maxWidth: '40ch' }}>
          This proposal is shared with named recipients. Use the 4-digit code
          from your invite to view it.
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
            aria-label="Four-digit access code"
            placeholder="0000"
            style={{
              fontFamily: FONT_MONO,
              fontSize: '32px',
              fontWeight: 400,
              letterSpacing: '0.5em',
              textAlign: 'center',
              width: '100%',
              padding: '20px 0',
              background: '#0A0A0A',
              border: '2px solid #232323',
              borderRadius: '0',
              color: '#F2F2F2',
              outline: 'none',
              transition: 'border-color var(--dur-quick) var(--ease-out-quart)',
              boxSizing: 'border-box',
            }}
            onFocus={(e) => {
              // Clear 2px pink focus ring replaces the default browser
              // outline. Visible to keyboard users; meets WCAG 2.4.7.
              (e.target as HTMLInputElement).style.borderColor = 'var(--accent-pink)';
            }}
            onBlur={(e) => {
              (e.target as HTMLInputElement).style.borderColor = '#232323';
            }}
          />

          <div
            role="status"
            aria-live="polite"
            aria-atomic="true"
            style={{ minHeight: '20px', marginTop: '14px' }}
          >
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
          <a
            href="mailto:hello@proxyz.studio?subject=Proposal access"
            style={footerLinkStyle}
          >
            Request a code →
          </a>
        </div>
      </div>
    </Shell>
  );
}

/* ── shared bits ───────────────────────────────────────────────── */

function Shell({
  children,
  align = 'center',
}: {
  children: React.ReactNode;
  align?: 'center' | 'start';
}) {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#0A0A0A',
        color: '#F2F2F2',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: align === 'start' ? '120px 24px 80px' : '24px',
        fontFamily: FONT_MONO,
        position: 'relative',
        zIndex: 40, // above the fixed Vanta background layer
      }}
    >
      {children}
    </div>
  );
}

const eyebrowStyle: React.CSSProperties = {
  fontSize: '11px',
  letterSpacing: '0.18em',
  textTransform: 'uppercase',
  color: 'var(--accent-pink)',
};

const headingStyle: React.CSSProperties = {
  fontFamily: FONT_MONO,
  fontSize: 'clamp(28px, 3.4vw, 40px)',
  fontWeight: 400,
  lineHeight: 1.1,
  letterSpacing: '-0.015em',
  margin: '0 0 18px 0',
  textWrap: 'balance',
};

const bodyTextStyle: React.CSSProperties = {
  fontSize: '14px',
  lineHeight: 1.6,
  color: 'rgba(255,255,255,0.66)',
  margin: '0 0 36px 0',
};

const quietLabelStyle: React.CSSProperties = {
  fontSize: '11px',
  letterSpacing: '0.18em',
  textTransform: 'uppercase',
  color: '#5E5E5E',
  margin: 0,
};

const footerLinkStyle: React.CSSProperties = {
  color: 'rgba(255,255,255,0.55)',
  textDecoration: 'none',
  borderBottom: '1px solid rgba(255,255,255,0.2)',
  paddingBottom: '2px',
  fontSize: '11px',
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
};
