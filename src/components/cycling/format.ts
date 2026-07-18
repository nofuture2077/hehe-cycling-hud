export function fmt(n: number, digits = 0) {
  return n.toLocaleString('de-DE', { minimumFractionDigits: digits, maximumFractionDigits: digits });
}

export function formatDuration(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  return h > 0 ? `${h}:${String(m).padStart(2, '0')}` : `${m}m`;
}

// intensity steps for the ascent gauge: bigger hill + hotter color the steeper the slope
export function gradientLevel(gradientPercent: number) {
  const abs = Math.abs(gradientPercent);
  if (abs < 5) return 1;
  if (abs < 8) return 2;
  if (abs < 13) return 3;
  return 4;
}

// speed color steps
export function speedLevel(speedKmh: number) {
  if (speedKmh < 20) return 0;
  if (speedKmh < 25) return 1;
  if (speedKmh < 30) return 2;
  if (speedKmh < 35) return 3;
  if (speedKmh < 50) return 4;
  return 5;
}
