import { useEffect, useRef, useState, type ReactNode } from 'react';

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

  const baseStyle: React.CSSProperties = {
    opacity: inView ? 1 : 0,
    transform: inView ? 'translateY(0)' : 'translateY(28px)',
    transition: `opacity 320ms cubic-bezier(0.2, 0.7, 0.1, 1) ${delay}ms, transform 320ms cubic-bezier(0.2, 0.7, 0.1, 1) ${delay}ms`,
    willChange: 'opacity, transform',
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
