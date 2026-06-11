const LINE_URL =
  import.meta.env.VITE_LINE_OA_URL?.trim() || 'https://line.me/R/ti/p/%40518tylfg';

function isExternalHref(href: string) {
  return /^(https?:|line:)/i.test(href);
}

function LineIcon() {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" focusable="false">
      <path
        fill="none"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="1.7"
        d="M16 5.25c-6.35 0-11.5 4.12-11.5 9.2 0 4.55 4.14 8.34 9.58 9.08.37.08.66.4.66.78v1.98c0 .47.55.73.92.43l2.92-2.36c5.1-.88 8.92-4.52 8.92-8.91 0-5.08-5.15-9.2-11.5-9.2Z"
      />
      <text
        x="16"
        y="17.25"
        fill="currentColor"
        fontFamily="Arial, sans-serif"
        fontSize="5.6"
        fontWeight="800"
        letterSpacing="0.25"
        textAnchor="middle"
      >
        LINE
      </text>
    </svg>
  );
}

const CHANNELS = [
  {
    id: 'line',
    label: 'Open PROXYZ on LINE',
    href: LINE_URL,
    icon: <LineIcon />,
  },
] as const;

export default function FloatingContactRail() {
  return (
    <nav className="floating-contact-rail" aria-label="Quick contact">
      {CHANNELS.map((channel) => {
        const isExternal = isExternalHref(channel.href);

        return (
          <a
            key={channel.id}
            href={channel.href}
            className={`floating-contact-button floating-contact-button--${channel.id}`}
            aria-label={channel.label}
            title={channel.label}
            target={isExternal ? '_blank' : undefined}
            rel={isExternal ? 'noopener noreferrer' : undefined}
          >
            {channel.icon}
          </a>
        );
      })}
    </nav>
  );
}
