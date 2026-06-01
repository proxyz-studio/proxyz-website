import type { DecisionStatus, Lang } from '../types';
import { FONT_LABEL } from '../theme';
import { STATUS_LABEL, STATUS_COLOR } from '../../content/abacuz/decisions';

export function StatusPill({ status, lang }: { status: DecisionStatus; lang: Lang }) {
  const color = STATUS_COLOR[status];
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        fontFamily: FONT_LABEL,
        fontSize: '10px',
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        color,
        whiteSpace: 'nowrap',
      }}
    >
      <span
        aria-hidden
        style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          background: color,
          display: 'inline-block',
        }}
      />
      {STATUS_LABEL[status][lang]}
    </span>
  );
}
