import React from 'react';

const LogoIcon = ({ className = '', width = 140, height = 140 }) => {
  return (
    <svg
      className={`logo-svg ${className}`}
      width={width}
      height={height}
      viewBox="0 0 680 680"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Main Gradient */}
        <linearGradient id="logoGradient" x1="0" y1="0" x2="680" y2="0">
          <stop offset="0%" stopColor="#C026D3" />
          <stop offset="38%" stopColor="#7C3AED" />
          <stop offset="100%" stopColor="#06B6D4" />
        </linearGradient>

        {/* Play Gradient */}
        <linearGradient id="playGradient" x1="316" y1="228" x2="376" y2="292">
          <stop offset="0%" stopColor="#A855F7" />
          <stop offset="100%" stopColor="#22D3EE" />
        </linearGradient>
      </defs>

      {/* Background removed – no more dark rectangles */}

      {/* OUTER RING */}
      <circle
        className="ring-out"
        cx="340"
        cy="260"
        r="170"
        fill="none"
        stroke="url(#logoGradient)"
        strokeWidth="9"
      />

      {/* INNER RING */}
      <circle
        className="ring-in"
        cx="340"
        cy="260"
        r="108"
        fill="transparent"
        stroke="url(#logoGradient)"
        strokeWidth="7.5"
      />

      {/* LEFT WAVE */}
      <g>
        <rect className="bl" x="157" y="255" width="7" height="10" rx="3.5" style={{ animationDelay: '0s' }} />
        <rect className="bl" x="170" y="250" width="7" height="20" rx="3.5" style={{ animationDelay: '0.15s' }} />
        <rect className="bl" x="183" y="240" width="7" height="40" rx="3.5" style={{ animationDelay: '0.3s' }} />
        <rect className="bl" x="196" y="253" width="7" height="14" rx="3.5" style={{ animationDelay: '0.1s' }} />
        <rect className="bl" x="209" y="238" width="7" height="44" rx="3.5" style={{ animationDelay: '0.45s' }} />
        <rect className="bl" x="222" y="248" width="7" height="24" rx="3.5" style={{ animationDelay: '0.2s' }} />
        <rect className="bl" x="235" y="234" width="7" height="52" rx="3.5" style={{ animationDelay: '0.6s' }} />
        <rect className="bl" x="248" y="252" width="7" height="16" rx="3.5" style={{ animationDelay: '0.35s' }} />
      </g>

      {/* RIGHT WAVE */}
      <g>
        <rect className="br" x="425" y="252" width="7" height="16" rx="3.5" style={{ animationDelay: '0.35s' }} />
        <rect className="br" x="438" y="234" width="7" height="52" rx="3.5" style={{ animationDelay: '0.6s' }} />
        <rect className="br" x="451" y="248" width="7" height="24" rx="3.5" style={{ animationDelay: '0.2s' }} />
        <rect className="br" x="464" y="238" width="7" height="44" rx="3.5" style={{ animationDelay: '0.45s' }} />
        <rect className="br" x="477" y="253" width="7" height="14" rx="3.5" style={{ animationDelay: '0.1s' }} />
        <rect className="br" x="490" y="240" width="7" height="40" rx="3.5" style={{ animationDelay: '0.3s' }} />
        <rect className="br" x="503" y="250" width="7" height="20" rx="3.5" style={{ animationDelay: '0.15s' }} />
        <rect className="br" x="516" y="255" width="7" height="10" rx="3.5" style={{ animationDelay: '0s' }} />
      </g>

      {/* PLAY BUTTON */}
      <polygon
        className="play"
        points="316,228 316,292 376,260"
        fill="url(#playGradient)"
      />
    </svg>
  );
};

export default LogoIcon;