import { motion } from 'motion/react';
import { EdgeRule } from './Glow';

const FONT_DISPLAY = "'Fragment Mono', 'Courier New', monospace";
const PINK = '#ff4193';
const MINT = '#5BC9B8';

const DEFAULT_WORDS = [
  'OPERATOR STUDIO',
  'BANGKOK',
  'PHUKET',
  'BUILD FOR',
  'BUILD WITH',
  'THE PORTAL',
  'PADEL Z',
  'AI INSIDE',
];

export default function Marquee({
  words = DEFAULT_WORDS,
  durationSeconds = 28,
  edgeColor = MINT,
}: {
  words?: string[];
  durationSeconds?: number;
  edgeColor?: string;
}) {
  // Duplicate the words once so the loop has no visible seam
  const loop = [...words, ...words];
  return (
    <section
      aria-hidden
      style={{
        position: 'relative',
        background: '#0a0a0a',
        padding: '48px 0',
        borderTop: '1px solid rgba(255,255,255,0.18)',
        borderBottom: '1px solid rgba(255,255,255,0.18)',
        overflow: 'hidden',
      }}
    >
      <EdgeRule color={edgeColor} />
      <motion.div
        animate={{ x: ['0%', '-50%'] }}
        transition={{ duration: durationSeconds, ease: 'linear', repeat: Infinity }}
        style={{
          display: 'flex',
          gap: '64px',
          whiteSpace: 'nowrap',
          width: 'max-content',
        }}
      >
        {loop.map((word, i) => (
          <span
            key={i}
            style={{
              fontFamily: FONT_DISPLAY,
              fontSize: 'clamp(40px, 4.4vw, 64px)',
              fontWeight: 400,
              letterSpacing: '-0.01em',
              textTransform: 'uppercase',
              color: i % 3 === 0 ? PINK : i % 3 === 1 ? '#fff' : MINT,
              opacity: i % 3 === 1 ? 0.85 : 1,
            }}
          >
            {word} ·
          </span>
        ))}
      </motion.div>
    </section>
  );
}
