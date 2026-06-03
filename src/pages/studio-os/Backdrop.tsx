import { PINK, type SosVariant } from './theme';

/**
 * Static page backdrop. No animation (per Tew). Three directions to choose
 * from, swapped live by the variant switcher. Fixed behind all content.
 */
export default function Backdrop({ variant }: { variant: SosVariant }) {
  return (
    <div
      aria-hidden
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        background: '#0a0a0a',
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
    >
      {variant === 'blueprint' && (
        <>
          {/* Faint engineering grid, masked so it fades at the edges. */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage:
                'linear-gradient(rgba(255,255,255,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.045) 1px, transparent 1px)',
              backgroundSize: '72px 72px',
              backgroundPosition: 'center',
              maskImage: 'radial-gradient(ellipse 85% 75% at 50% 42%, #000 50%, transparent 100%)',
              WebkitMaskImage: 'radial-gradient(ellipse 85% 75% at 50% 42%, #000 50%, transparent 100%)',
            }}
          />
          {/* One quiet pink axis line for brand signature. */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              left: '12%',
              width: '1px',
              background: `linear-gradient(180deg, transparent, ${PINK}33 30%, ${PINK}33 70%, transparent)`,
            }}
          />
        </>
      )}

      {variant === 'glow' && (
        <>
          <div
            style={{
              position: 'absolute',
              top: '-18%',
              left: '50%',
              transform: 'translateX(-50%)',
              width: 'min(1200px, 120vw)',
              height: '760px',
              background: `radial-gradient(ellipse at center, ${PINK}26 0%, transparent 62%)`,
              filter: 'blur(30px)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: '-20%',
              right: '-10%',
              width: '720px',
              height: '720px',
              background: 'radial-gradient(circle at center, rgba(242,215,140,0.10) 0%, transparent 60%)',
              filter: 'blur(40px)',
            }}
          />
        </>
      )}
    </div>
  );
}
