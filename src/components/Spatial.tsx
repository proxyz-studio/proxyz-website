import { useRef, type ReactNode, type AnchorHTMLAttributes } from 'react';
import { motion } from 'motion/react';

function isTouchDevice() {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(hover: none)').matches;
}

export function TiltCard({
  children,
  maxTiltX = 5,
  maxTiltY = 7,
  style,
  className,
  as: Tag = 'div',
}: {
  children: ReactNode;
  maxTiltX?: number;
  maxTiltY?: number;
  style?: React.CSSProperties;
  className?: string;
  as?: 'div' | 'article' | 'section';
}) {
  const ref = useRef<HTMLDivElement>(null);
  function onMove(e: React.MouseEvent) {
    if (isTouchDevice()) return;
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    el.style.transform = `perspective(900px) rotateX(${-y * maxTiltX}deg) rotateY(${x * maxTiltY}deg) translateZ(0)`;
  }
  function onLeave() {
    const el = ref.current;
    if (!el) return;
    el.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg) translateZ(0)';
  }
  return (
    <Tag
      ref={ref as never}
      className={className}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{
        transformStyle: 'preserve-3d',
        transition: 'transform 240ms cubic-bezier(0.2, 0.7, 0.1, 1)',
        willChange: 'transform',
        ...style,
      }}
    >
      {children}
    </Tag>
  );
}

export function SpotlightCard({
  children,
  color = 'rgba(255, 65, 147, 0.18)',
  size = 320,
  style,
  className,
}: {
  children: ReactNode;
  color?: string;
  size?: number;
  style?: React.CSSProperties;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  function onMove(e: React.MouseEvent) {
    if (isTouchDevice()) return;
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    el.style.setProperty('--pvz-x', `${x}%`);
    el.style.setProperty('--pvz-y', `${y}%`);
  }
  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      className={className}
      style={{
        position: 'relative',
        overflow: 'hidden',
        backgroundImage: `radial-gradient(${size}px circle at var(--pvz-x, 50%) var(--pvz-y, 50%), ${color}, transparent 70%)`,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

type AnchorPropsWithoutMotionConflicts = Omit<
  AnchorHTMLAttributes<HTMLAnchorElement>,
  | 'onDrag'
  | 'onDragStart'
  | 'onDragEnd'
  | 'onAnimationStart'
  | 'onAnimationEnd'
  | 'onAnimationIteration'
>;

export function MagneticAnchor({
  children,
  style,
  className,
  strength = 12,
  ...rest
}: {
  children: ReactNode;
  strength?: number;
} & AnchorPropsWithoutMotionConflicts) {
  const ref = useRef<HTMLAnchorElement>(null);
  function onMove(e: React.MouseEvent<HTMLAnchorElement>) {
    if (isTouchDevice()) return;
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    // Keep the magnetic drift on the existing inline transform —
    // Motion's whileHover scale lives on a separate transform stack.
    el.style.setProperty('--magnetic-x', `${x * strength}px`);
    el.style.setProperty('--magnetic-y', `${y * (strength * 0.65)}px`);
  }
  function onLeave() {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty('--magnetic-x', '0px');
    el.style.setProperty('--magnetic-y', '0px');
  }
  return (
    <motion.a
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.96 }}
      // Exponential ease-out-quint per impeccable motion law:
      // "no bounce, no elastic". Replaces the previous spring transition.
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      className={className}
      style={{
        display: 'inline-flex',
        translateX: 'var(--magnetic-x, 0px)',
        translateY: 'var(--magnetic-y, 0px)',
        willChange: 'transform',
        ...style,
      }}
      {...rest}
    >
      {children}
    </motion.a>
  );
}
