interface PortalMonogramProps {
  className?: string;
  size?: number;
}

// The app mark (issue #34) — same shape as public/favicon.svg and the PWA
// icons (source: assets-src/portal-monogram.svg), inlined here so the
// sign-in screen doesn't depend on a network request for it. Ink ground,
// white architectural "P" arch, mint core dot.
export function PortalMonogram({ className, size = 64 }: PortalMonogramProps) {
  return (
    <svg
      viewBox="0 0 512 512"
      width={size}
      height={size}
      role="img"
      aria-label="Property Tracker"
      className={className}
    >
      {/* Fixed brand-mark palette, not a live theme surface — but these
          three colors exactly equal ink/on-ink/mint, so reference the
          real tokens rather than duplicate their hex values. */}
      <rect width="512" height="512" rx="112" fill="var(--ink)" />
      <path
        d="M144 396 V116 H288 C354 116 390 162 390 224 C390 286 354 332 288 332 H214 V396 Z"
        fill="var(--on-ink)"
      />
      <path
        d="M214 176 V272 H278 C310 272 330 252 330 224 C330 196 310 176 278 176 Z"
        fill="var(--ink)"
      />
      <circle cx="274" cy="224" r="26" fill="var(--mint)" />
    </svg>
  );
}
