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

// heart rate zones as % of max heart rate (5-zone model)
export function heartRateZone(bpm: number, maxHeartRateBpm: number) {
  const percentMax = maxHeartRateBpm > 0 ? (bpm / maxHeartRateBpm) * 100 : 0;
  if (percentMax < 60) return 1;
  if (percentMax < 70) return 2;
  if (percentMax < 80) return 3;
  if (percentMax < 90) return 4;
  return 5;
}

// how long a single heartbeat blink should take, so the heart icon blinks in time with the pulse
export function heartbeatSeconds(bpm: number) {
  return bpm > 0 ? 60 / bpm : 1;
}

// power zones as % of average power (Coggan 7-zone model)
export function powerZone(watts: number, averagePowerWatts: number) {
  const percentAvg = averagePowerWatts > 0 ? (watts / averagePowerWatts) * 100 : 0;
  if (percentAvg < 55) return 1;
  if (percentAvg < 75) return 2;
  if (percentAvg < 90) return 3;
  if (percentAvg < 105) return 4;
  if (percentAvg < 120) return 5;
  if (percentAvg < 150) return 6;
  return 7;
}
