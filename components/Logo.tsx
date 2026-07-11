// The brand mark: a calculator with a $ display, wrapped in curly braces.
// Drawn as inline SVG (recreated from the original logo art) so it stays
// crisp at any size and inherits currentColor for dark mode.

export function LogoIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* left brace */}
      <path
        d="M 26 12 C 17 12 17 19 17 27 L 17 40 C 17 46 13 48 9 50 C 13 52 17 54 17 60 L 17 73 C 17 81 17 88 26 88"
        stroke="currentColor"
        strokeWidth="7"
        strokeLinecap="round"
      />
      {/* right brace */}
      <path
        d="M 94 12 C 103 12 103 19 103 27 L 103 40 C 103 46 107 48 111 50 C 107 52 103 54 103 60 L 103 73 C 103 81 103 88 94 88"
        stroke="currentColor"
        strokeWidth="7"
        strokeLinecap="round"
      />
      {/* calculator body */}
      <rect
        x="34"
        y="6"
        width="52"
        height="88"
        rx="10"
        stroke="currentColor"
        strokeWidth="7"
      />
      {/* display window */}
      <rect
        x="44"
        y="17"
        width="32"
        height="20"
        rx="3"
        stroke="currentColor"
        strokeWidth="5"
      />
      {/* $ on the display */}
      <text
        x="60"
        y="34.5"
        textAnchor="middle"
        fontFamily="Helvetica, Arial, sans-serif"
        fontWeight="bold"
        fontSize="19"
        fill="currentColor"
      >
        $
      </text>
      {/* keypad: 3x3 grid, bottom-right key double height */}
      <rect x="44" y="46" width="10" height="10" rx="2" fill="currentColor" />
      <rect x="58" y="46" width="10" height="10" rx="2" fill="currentColor" />
      <rect x="72" y="46" width="10" height="10" rx="2" fill="currentColor" />
      <rect x="44" y="60" width="10" height="10" rx="2" fill="currentColor" />
      <rect x="58" y="60" width="10" height="10" rx="2" fill="currentColor" />
      <rect x="44" y="74" width="10" height="10" rx="2" fill="currentColor" />
      <rect x="58" y="74" width="10" height="10" rx="2" fill="currentColor" />
      <rect x="72" y="60" width="10" height="24" rx="2" fill="currentColor" />
    </svg>
  );
}

// Full lockup: icon + stacked condensed wordmark, as in the original logo.
export function Logo({ iconClassName = "h-10 w-12" }: { iconClassName?: string }) {
  return (
    <span className="flex items-center gap-2.5 text-brand dark:text-neutral-100">
      <LogoIcon className={iconClassName} />
      <span className="font-condensed text-[15px] font-semibold uppercase leading-[1.05] tracking-wide">
        The
        <br />
        Accountant
        <br />
        That Codes
      </span>
    </span>
  );
}
