const PrismaLogo = ({ size = 48 }: { size?: number }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="triangleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#D946EF" />
          <stop offset="100%" stopColor="#8B5CF6" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="centerGlow">
          <feGaussianBlur stdDeviation="4" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <polygon
        points="50,10 90,80 10,80"
        stroke="url(#triangleGradient)"
        strokeWidth="2.5"
        fill="none"
        strokeLinejoin="round"
        filter="url(#glow)"
      />
      <circle
        cx="50"
        cy="57"
        r="5"
        fill="#D946EF"
        filter="url(#centerGlow)"
        opacity="0.9"
      />
    </svg>
  );
};

export default PrismaLogo;
