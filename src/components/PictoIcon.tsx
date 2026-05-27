type IconName =
  | 'audit'
  | 'blueprint'
  | 'install'
  | 'partnership'
  | 'studioOs'
  | 'portal'
  | 'meetings'
  | 'todos'
  | 'rocks'
  | 'issues'
  | 'scorecard'
  | 'vto'
  | 'principle'
  | 'arrow'
  | 'spark'
  | 'orbit'
  | 'mirror'
  | 'time'
  | 'place'
  | 'person'
  | 'stage';

export default function PictoIcon({
  name,
  size = 40,
  stroke = 'currentColor',
  strokeWidth = 2.5,
  className,
  style,
}: {
  name: IconName;
  size?: number;
  stroke?: string;
  strokeWidth?: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 48 48',
    fill: 'none',
    stroke,
    strokeWidth,
    strokeLinecap: 'square' as const,
    strokeLinejoin: 'miter' as const,
    className,
    style,
    'aria-hidden': true,
  };

  switch (name) {
    case 'audit':
      return (
        <svg {...common}>
          <circle cx="20" cy="20" r="11" />
          <line x1="28" y1="28" x2="40" y2="40" />
          <line x1="14" y1="20" x2="26" y2="20" />
          <line x1="20" y1="14" x2="20" y2="26" />
        </svg>
      );
    case 'blueprint':
      return (
        <svg {...common}>
          <rect x="6" y="6" width="36" height="36" />
          <line x1="6" y1="18" x2="42" y2="18" />
          <line x1="6" y1="30" x2="42" y2="30" />
          <line x1="18" y1="6" x2="18" y2="42" />
          <line x1="30" y1="6" x2="30" y2="42" />
        </svg>
      );
    case 'install':
      return (
        <svg {...common}>
          <rect x="6" y="14" width="36" height="20" />
          <line x1="6" y1="22" x2="42" y2="22" />
          <line x1="6" y1="26" x2="42" y2="26" />
          <circle cx="12" cy="18" r="1.5" fill={stroke} stroke="none" />
          <circle cx="12" cy="30" r="1.5" fill={stroke} stroke="none" />
        </svg>
      );
    case 'partnership':
      return (
        <svg {...common}>
          <circle cx="16" cy="24" r="8" />
          <circle cx="32" cy="24" r="8" />
          <line x1="20" y1="24" x2="28" y2="24" />
        </svg>
      );
    case 'studioOs':
      return (
        <svg {...common}>
          <circle cx="24" cy="24" r="6" />
          <circle cx="24" cy="24" r="14" />
          <line x1="24" y1="4" x2="24" y2="10" />
          <line x1="24" y1="38" x2="24" y2="44" />
          <line x1="4" y1="24" x2="10" y2="24" />
          <line x1="38" y1="24" x2="44" y2="24" />
        </svg>
      );
    case 'portal':
      return (
        <svg {...common}>
          <polyline points="6,6 6,42 42,42" />
          <line x1="14" y1="34" x2="14" y2="24" />
          <line x1="22" y1="34" x2="22" y2="18" />
          <line x1="30" y1="34" x2="30" y2="12" />
          <line x1="38" y1="34" x2="38" y2="20" />
        </svg>
      );
    case 'meetings':
      return (
        <svg {...common}>
          <rect x="6" y="10" width="36" height="30" />
          <line x1="6" y1="18" x2="42" y2="18" />
          <line x1="14" y1="6" x2="14" y2="14" />
          <line x1="34" y1="6" x2="34" y2="14" />
        </svg>
      );
    case 'todos':
      return (
        <svg {...common}>
          <rect x="6" y="6" width="10" height="10" />
          <rect x="6" y="20" width="10" height="10" />
          <rect x="6" y="34" width="10" height="10" />
          <polyline points="9,10 11,12 13,8" />
          <line x1="22" y1="11" x2="42" y2="11" />
          <line x1="22" y1="25" x2="42" y2="25" />
          <line x1="22" y1="39" x2="36" y2="39" />
        </svg>
      );
    case 'rocks':
      return (
        <svg {...common}>
          <polyline points="6,40 18,18 26,30 34,12 42,40 6,40" />
        </svg>
      );
    case 'issues':
      return (
        <svg {...common}>
          <rect x="6" y="6" width="10" height="36" />
          <rect x="19" y="6" width="10" height="36" />
          <rect x="32" y="6" width="10" height="36" />
          <line x1="6" y1="18" x2="16" y2="18" />
          <line x1="19" y1="14" x2="29" y2="14" />
          <line x1="32" y1="22" x2="42" y2="22" />
        </svg>
      );
    case 'scorecard':
      return (
        <svg {...common}>
          <rect x="6" y="6" width="36" height="36" />
          <line x1="6" y1="18" x2="42" y2="18" />
          <line x1="18" y1="6" x2="18" y2="42" />
          <line x1="6" y1="30" x2="42" y2="30" />
          <line x1="30" y1="6" x2="30" y2="42" />
        </svg>
      );
    case 'vto':
      return (
        <svg {...common}>
          <line x1="24" y1="6" x2="24" y2="42" />
          <line x1="24" y1="6" x2="36" y2="14" />
          <line x1="24" y1="14" x2="36" y2="22" />
          <line x1="24" y1="22" x2="36" y2="30" />
          <line x1="24" y1="30" x2="36" y2="38" />
          <line x1="24" y1="6" x2="12" y2="14" />
          <line x1="24" y1="14" x2="12" y2="22" />
          <line x1="24" y1="22" x2="12" y2="30" />
          <line x1="24" y1="30" x2="12" y2="38" />
        </svg>
      );
    case 'principle':
      return (
        <svg {...common}>
          <line x1="6" y1="24" x2="42" y2="24" />
          <line x1="14" y1="16" x2="14" y2="32" />
          <line x1="34" y1="16" x2="34" y2="32" />
        </svg>
      );
    case 'arrow':
      return (
        <svg {...common}>
          <line x1="6" y1="24" x2="40" y2="24" />
          <polyline points="30,14 42,24 30,34" />
        </svg>
      );
    case 'spark':
      return (
        <svg {...common}>
          <line x1="24" y1="6" x2="24" y2="20" />
          <line x1="24" y1="28" x2="24" y2="42" />
          <line x1="6" y1="24" x2="20" y2="24" />
          <line x1="28" y1="24" x2="42" y2="24" />
          <line x1="11" y1="11" x2="18" y2="18" />
          <line x1="30" y1="30" x2="37" y2="37" />
          <line x1="11" y1="37" x2="18" y2="30" />
          <line x1="30" y1="18" x2="37" y2="11" />
        </svg>
      );
    case 'orbit':
      return (
        <svg {...common}>
          <circle cx="24" cy="24" r="14" />
          <circle cx="24" cy="10" r="2.5" fill={stroke} stroke="none" />
          <circle cx="38" cy="24" r="2.5" fill={stroke} stroke="none" />
          <circle cx="24" cy="38" r="2.5" fill={stroke} stroke="none" />
        </svg>
      );
    case 'mirror':
      return (
        <svg {...common}>
          <polyline points="6,24 18,16 18,32 6,24" />
          <polyline points="42,24 30,16 30,32 42,24" />
        </svg>
      );
    case 'time':
      return (
        <svg {...common}>
          <circle cx="24" cy="24" r="16" />
          <line x1="24" y1="24" x2="24" y2="12" />
          <line x1="24" y1="24" x2="32" y2="28" />
        </svg>
      );
    case 'place':
      return (
        <svg {...common}>
          <path d="M24 6 C16 6 10 12 10 20 C10 30 24 42 24 42 C24 42 38 30 38 20 C38 12 32 6 24 6 Z" />
          <circle cx="24" cy="20" r="4" />
        </svg>
      );
    case 'person':
      return (
        <svg {...common}>
          <circle cx="24" cy="16" r="6" />
          <path d="M10 42 C10 32 16 26 24 26 C32 26 38 32 38 42" />
        </svg>
      );
    case 'stage':
      return (
        <svg {...common}>
          <line x1="6" y1="12" x2="42" y2="12" />
          <line x1="6" y1="24" x2="42" y2="24" />
          <line x1="6" y1="36" x2="42" y2="36" />
          <circle cx="14" cy="12" r="2" fill={stroke} stroke="none" />
          <circle cx="34" cy="24" r="2" fill={stroke} stroke="none" />
          <circle cx="20" cy="36" r="2" fill={stroke} stroke="none" />
        </svg>
      );
  }
}
