// ponytail: inline icons instead of an icon library, this is the entire icon set the HUD needs

export function IconPin() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 21s7-6.4 7-11.5A7 7 0 0 0 5 9.5C5 14.6 12 21 12 21z" />
      <circle cx="12" cy="9.5" r="2.5" />
    </svg>
  );
}

export function IconRoute() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="5" cy="6" r="2" />
      <circle cx="19" cy="18" r="2" />
      <path d="M5 8v4a4 4 0 0 0 4 4h6" />
    </svg>
  );
}

export function IconSpeed() {
  return (
    <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 15a8 8 0 1 1 16 0" />
      <path d="M12 15l4-4" />
      <circle cx="12" cy="15" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconPause() {
  return (
    <svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor" stroke="none">
      <rect x="6" y="5" width="4" height="14" rx="1" />
      <rect x="14" y="5" width="4" height="14" rx="1" />
    </svg>
  );
}

export function IconIncline() {
  return (
    <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 17l7-9 4 5 7-9" />
      <path d="M17 4h4v4" />
    </svg>
  );
}

export function IconElevationUp() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 19V5" />
      <path d="M6 11l6-6 6 6" />
    </svg>
  );
}

// tabler-icons "bolt"
export function IconMax() {
  return (
    <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 3l0 7l6 0l-8 11l0 -7l-6 0l8 -11" />
    </svg>
  );
}

// tabler-icons "clock"
export function IconClock() {
  return (
    <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 3" />
    </svg>
  );
}

// background silhouette for the heart rate gauge - fills the icon slot, tinted by currentColor
export function IconHeart() {
  return (
    <svg viewBox="0 0 24 24" width="100%" height="100%" fill="currentColor" stroke="none">
      <path d="M12 21s-7.5-4.9-10-9.3C.4 8.6 1.7 5 5.2 4.2 7.6 3.6 10 4.8 12 7.5c2-2.7 4.4-3.9 6.8-3.3 3.5.8 4.8 4.4 3.2 7.5C19.5 16.1 12 21 12 21z" />
    </svg>
  );
}

// background silhouette for the power gauge
export function IconBolt() {
  return (
    <svg viewBox="0 0 24 24" width="100%" height="100%" fill="currentColor" stroke="none">
      <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8z" />
    </svg>
  );
}

export function IconElevationDown() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 5v14" />
      <path d="M6 13l6 6 6-6" />
    </svg>
  );
}
