import { useEffect, useRef, useState, type ReactNode } from 'react';

/**
 * Returns true when the user has the OS-level "reduce motion" preference set.
 * SSR-safe (returns false on the server). Subscribes to changes so a user who
 * toggles the setting mid-session sees the update.
 */
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  return reduced;
}

export function useInView<T extends HTMLElement>(
  options: IntersectionObserverInit = { threshold: 0.15, rootMargin: '0px 0px -10% 0px' }
) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === 'undefined') {
      setInView(true);
      return;
    }
    const obs = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          setInView(true);
          obs.disconnect();
          break;
        }
      }
    }, options);
    obs.observe(el);
    return () => obs.disconnect();
  }, [options.threshold, options.rootMargin]);

  return { ref, inView };
}

export default function Reveal({
  children,
  delay = 0,
  as: Tag = 'div',
  className,
  style,
}: {
  children: ReactNode;
  delay?: number;
  as?: 'div' | 'section' | 'article' | 'header' | 'ul' | 'li' | 'span';
  className?: string;
  style?: React.CSSProperties;
}) {
  const { ref, inView } = useInView<HTMLElement>();
  const prefersReducedMotion = usePrefersReducedMotion();

  // Motion tokens from src/index.css :root. Consuming via var() keeps
  // every Reveal in sync with the rest of the site's motion system.
  //
  // When the user has prefers-reduced-motion set, we render the final state
  // immediately with no transition — the content still appears, just without
  // the spatial movement. This is the WCAG 2.2 motion-criteria-compliant path.
  const baseStyle: React.CSSProperties = prefersReducedMotion
    ? {
        opacity: 1,
        transform: 'none',
        transition: 'none',
        ...style,
      }
    : {
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateY(0)' : 'translateY(28px)',
        transition:
          `opacity var(--dur-base) var(--ease-out-quart) ${delay}ms, ` +
          `transform var(--dur-base) var(--ease-out-expo) ${delay}ms`,
        willChange: inView ? undefined : 'opacity, transform',
        ...style,
      };

  return (
    <Tag ref={ref as never} className={className} style={baseStyle}>
      {children}
    </Tag>
  );
}

export function RevealStack({
  children,
  step = 60,
  startDelay = 0,
  className,
  style,
}: {
  children: ReactNode[];
  step?: number;
  startDelay?: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div className={className} style={style}>
      {children.map((child, i) => (
        <Reveal key={i} delay={startDelay + i * step}>
          {child}
        </Reveal>
      ))}
    </div>
  );
}
