export default function Logo({ size = 44, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Background chip */}
      <rect width="44" height="44" rx="10" fill="#0057B8" />

      {/* Corner circuit nodes */}
      <circle cx="7.5" cy="7.5" r="2.5" fill="#818CF8" opacity="0.65" />
      <circle cx="36.5" cy="7.5" r="2.5" fill="#818CF8" opacity="0.65" />
      <circle cx="7.5" cy="36.5" r="2.5" fill="#818CF8" opacity="0.65" />
      <circle cx="36.5" cy="36.5" r="2.5" fill="#818CF8" opacity="0.65" />

      {/* Circuit traces — top corners */}
      <line x1="7.5" y1="10"  x2="7.5" y2="14" stroke="#818CF8" strokeWidth="1.5" opacity="0.45" />
      <line x1="36.5" y1="10" x2="36.5" y2="14" stroke="#818CF8" strokeWidth="1.5" opacity="0.45" />
      <line x1="10"  y1="7.5" x2="14"  y2="7.5" stroke="#818CF8" strokeWidth="1.5" opacity="0.45" />
      <line x1="30"  y1="7.5" x2="34"  y2="7.5" stroke="#818CF8" strokeWidth="1.5" opacity="0.45" />

      {/* Circuit traces — bottom corners */}
      <line x1="7.5" y1="30"  x2="7.5" y2="34"  stroke="#818CF8" strokeWidth="1.5" opacity="0.45" />
      <line x1="36.5" y1="30" x2="36.5" y2="34" stroke="#818CF8" strokeWidth="1.5" opacity="0.45" />
      <line x1="10"  y1="36.5" x2="14"  y2="36.5" stroke="#818CF8" strokeWidth="1.5" opacity="0.45" />
      <line x1="30"  y1="36.5" x2="34"  y2="36.5" stroke="#818CF8" strokeWidth="1.5" opacity="0.45" />

      {/* Pin holes on sides */}
      <rect x="0" y="16" width="3" height="4" rx="1" fill="#2D27A0" />
      <rect x="0" y="24" width="3" height="4" rx="1" fill="#2D27A0" />
      <rect x="41" y="16" width="3" height="4" rx="1" fill="#2D27A0" />
      <rect x="41" y="24" width="3" height="4" rx="1" fill="#2D27A0" />

      {/* "T" letter */}
      <path d="M10 14H34V19.5H25.5V31H18.5V19.5H10Z" fill="white" />
    </svg>
  );
}
