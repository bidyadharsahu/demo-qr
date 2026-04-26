// Reusable Netrik Shop logo - SVG, no images needed.
export const NetrikLogo = ({ className = 'h-10 w-10' }) => (
  <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" className={className}>
    <defs>
      <linearGradient id="netrik-g1" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#fbbf24"/>
        <stop offset="60%" stopColor="#fb7185"/>
        <stop offset="100%" stopColor="#f43f5e"/>
      </linearGradient>
      <linearGradient id="netrik-g2" x1="0" y1="1" x2="1" y2="0">
        <stop offset="0%" stopColor="#0b0b0d"/>
        <stop offset="100%" stopColor="#1f2937"/>
      </linearGradient>
    </defs>
    <rect x="2" y="2" width="60" height="60" rx="16" fill="url(#netrik-g1)"/>
    <rect x="6" y="6" width="52" height="52" rx="13" fill="url(#netrik-g2)"/>
    <path d="M20 46 L20 18 L26 18 L40 38 L40 18 L46 18 L46 46 L40 46 L26 26 L26 46 Z" fill="url(#netrik-g1)"/>
    <path d="M48 14 L48 22 M51 14 L51 22 M54 14 L54 22" stroke="#fbbf24" strokeWidth="1.4" strokeLinecap="round"/>
    <circle cx="51" cy="26" r="1.6" fill="#fbbf24"/>
  </svg>
);

export default NetrikLogo;
