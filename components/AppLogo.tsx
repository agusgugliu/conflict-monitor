import { memo } from 'react';

interface AppLogoProps {
  size?: number;
  className?: string;
}

function AppLogo({ size = 24, className }: AppLogoProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 32 32"
      fill="none"
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
      suppressHydrationWarning
    >
      <defs>
        <radialGradient id="cg" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#e05252" stopOpacity="0.25" suppressHydrationWarning />
          <stop offset="100%" stopColor="#e05252" stopOpacity="0" suppressHydrationWarning />
        </radialGradient>
      </defs>

      {/* Centre glow */}
      <circle cx="16" cy="16" r="10" fill="url(#cg)" />

      {/* Outer pulse ring */}
      <circle cx="16" cy="16" r="14.5" stroke="#e05252" strokeWidth="0.5" strokeOpacity="0.18" strokeDasharray="1.5 2.5" />

      {/* Globe */}
      <circle cx="16" cy="16" r="10" stroke="#e05252" strokeWidth="1.5" />

      {/* Equator */}
      <line x1="6" y1="16" x2="26" y2="16" stroke="#e05252" strokeWidth="0.7" strokeOpacity="0.32" />

      {/* Prime meridian */}
      <ellipse cx="16" cy="16" rx="5.5" ry="10" stroke="#e05252" strokeWidth="0.7" strokeOpacity="0.32" />

      {/* Upper latitude */}
      <path d="M8 11.5 Q16 9.5 24 11.5" stroke="#e05252" strokeWidth="0.55" strokeOpacity="0.2" fill="none" />

      {/* Lower latitude */}
      <path d="M8 20.5 Q16 22.5 24 20.5" stroke="#e05252" strokeWidth="0.55" strokeOpacity="0.2" fill="none" />

      {/* Crosshair — faint through-lines */}
      <line x1="5.5" y1="16" x2="26.5" y2="16" stroke="#e05252" strokeWidth="0.4" strokeOpacity="0.18" />
      <line x1="16" y1="5.5" x2="16" y2="26.5" stroke="#e05252" strokeWidth="0.4" strokeOpacity="0.18" />

      {/* Crosshair — bold arms (outside globe, 1 px gap) */}
      <line x1="1.5" y1="16" x2="5" y2="16" stroke="#e05252" strokeWidth="1.6" strokeLinecap="round" />
      <line x1="27" y1="16" x2="30.5" y2="16" stroke="#e05252" strokeWidth="1.6" strokeLinecap="round" />
      <line x1="16" y1="1.5" x2="16" y2="5" stroke="#e05252" strokeWidth="1.6" strokeLinecap="round" />
      <line x1="16" y1="27" x2="16" y2="30.5" stroke="#e05252" strokeWidth="1.6" strokeLinecap="round" />

      {/* Corner brackets */}
      <path d="M2 8 L2 2 L8 2" stroke="#e05252" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.65" />
      <path d="M30 8 L30 2 L24 2" stroke="#e05252" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.65" />
      <path d="M2 24 L2 30 L8 30" stroke="#e05252" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.65" />
      <path d="M30 24 L30 30 L24 30" stroke="#e05252" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.65" />

      {/* Conflict hotspot dots */}
      <circle cx="20" cy="12" r="1.3" fill="#e05252" opacity="0.9" />
      <circle cx="23" cy="16.5" r="0.9" fill="#e05252" opacity="0.65" />
      <circle cx="11.5" cy="17.5" r="0.9" fill="#e05252" opacity="0.6" />

      {/* Centre target ring + dot */}
      <circle cx="16" cy="16" r="3" stroke="#e05252" strokeWidth="0.65" strokeOpacity="0.5" />
      <circle cx="16" cy="16" r="1.5" fill="#e05252" />
    </svg>
  );
}

export default memo(AppLogo);
