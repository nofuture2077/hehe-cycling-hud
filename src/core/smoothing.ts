// Moblin's slopePercent comes from GPS/barometric altitude deltas, so it's noisy: lone spikes plus
// constant jitter. A median of the last 5 samples drops the spikes outright (an EMA would only
// dampen them), then a time-based EMA smooths the jitter - dt-aware so it behaves the same at any
// telemetry rate. After a long gap the old state is stale, so we snap to the new value instead
export function createGradientSmoother({ tauMs = 5000, gapResetMs = 10000 } = {}) {
  let recent: number[] = [];
  let smoothed = 0;
  let lastT: number | null = null;

  function reset() {
    recent = [];
    smoothed = 0;
    lastT = null;
  }

  function push(value: number, nowMs: number): number {
    if (lastT !== null && nowMs - lastT > gapResetMs) reset();

    recent.push(value);
    if (recent.length > 5) recent.shift();
    const sorted = [...recent].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    const median = sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];

    if (lastT === null) {
      smoothed = median;
    } else {
      const alpha = 1 - Math.exp(-Math.max(0, nowMs - lastT) / tauMs);
      smoothed += alpha * (median - smoothed);
    }
    lastT = nowMs;
    return smoothed;
  }

  return { push, reset };
}
