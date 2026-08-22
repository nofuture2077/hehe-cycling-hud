export function fmt(n: number, digits = 0) {
  return n.toLocaleString('de-DE', { minimumFractionDigits: digits, maximumFractionDigits: digits });
}

export function durationParts(totalSeconds: number): { value: number; decimal?: number; unit?: string } {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  return h > 0 ? { value: h, decimal: m } : { value: m, unit: 'm' };
}

// current pause is always short-lived, so seconds matter here unlike the totalled-up duration above
export function currentPauseParts(totalSeconds: number): { value: number; decimal: number } {
  const m = Math.floor(totalSeconds / 60);
  const s = Math.floor(totalSeconds % 60);
  return { value: m, decimal: s };
}
