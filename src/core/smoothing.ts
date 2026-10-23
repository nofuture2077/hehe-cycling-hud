// Moblin's slopePercent comes from GPS/barometric altitude deltas, so it's noisy: lone spikes plus
// constant jitter. A trimmed mean of the last 7 samples (drop the 2 lowest and 2 highest, average
// the middle 3) drops spike bursts outright (an EMA would only dampen them), then a time-based EMA
// smooths the jitter - dt-aware so it behaves the same at any telemetry rate. The window starts out
// filled with zeros so spikes are rejected from the first sample; real values ease in over a few
// samples. After a long gap the old state is stale, so we start over from that zero-filled window
export function createGradientSmoother({ window = 7, tauMs = 3000, gapResetMs = 10000 } = {}) {
  const trim = Math.floor((window - 3) / 2);
  let recent: number[] = new Array(window).fill(0);
  let smoothed = 0;
  let lastT: number | null = null;

  function reset() {
    recent = new Array(window).fill(0);
    smoothed = 0;
    lastT = null;
  }

  function push(value: number, nowMs: number): number {
    if (lastT !== null && nowMs - lastT > gapResetMs) reset();

    recent.push(value);
    recent.shift();
    const kept = [...recent].sort((a, b) => a - b).slice(trim, window - trim);
    const trimmedMean = kept.reduce((sum, v) => sum + v, 0) / kept.length;

    if (lastT === null) {
      smoothed = trimmedMean;
    } else {
      const alpha = 1 - Math.exp(-Math.max(0, nowMs - lastT) / tauMs);
      smoothed += alpha * (trimmedMean - smoothed);
    }
    lastT = nowMs;
    return smoothed;
  }

  return { push, reset };
}
