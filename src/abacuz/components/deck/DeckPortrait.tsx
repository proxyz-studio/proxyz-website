/* ─── DeckPortrait — framed founder photo for a deck panel ──────────── */
/* Renders a gold-framed portrait + caption. Hides itself gracefully if the
 * image fails to load (e.g. the file hasn't been added yet), so the panel
 * never shows a broken image. */

import { useState } from 'react';
import { GOLD, FONT_LABEL } from '../../theme';

export function DeckPortrait({
  src,
  alt,
  caption,
  captionColor,
}: {
  src: string;
  alt: string;
  caption?: string;
  captionColor: string;
}) {
  const [failed, setFailed] = useState(false);
  if (failed) return null;

  return (
    <figure
      style={{
        margin: '40px 0 8px 0',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: '16px',
      }}
    >
      <img
        src={src}
        alt={alt}
        loading="lazy"
        onError={() => setFailed(true)}
        style={{
          width: 'clamp(170px, 22vw, 230px)',
          height: 'auto',
          display: 'block',
          borderRadius: '10px',
          border: `1px solid ${GOLD}`,
          boxShadow: '0 18px 44px -22px rgba(0,0,0,0.6)',
        }}
      />
      {caption && (
        <figcaption
          style={{
            fontFamily: FONT_LABEL,
            fontSize: '12.5px',
            letterSpacing: '0.08em',
            color: captionColor,
            margin: 0,
          }}
        >
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
