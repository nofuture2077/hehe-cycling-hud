// counts ski/snowboard runs from the altitude: a run starts once the rider is RUN_DROP_M below the
// highest point since the last lift, a lift (or hike) once they are RUN_DROP_M above the lowest point
// since the last run - the margin keeps GPS altitude noise and short rises within a run from counting
const RUN_DROP_M = 30;

export interface RunState {
  runCount: number;
  onLift: boolean;
}

export function createRunTracker() {
  let phase: 'start' | 'up' | 'down' = 'start';
  let low = Infinity;
  let high = -Infinity;
  let runCount = 0;

  return {
    push(altitudeM: number | null | undefined): RunState {
      if (typeof altitudeM === 'number' && Number.isFinite(altitudeM)) {
        low = Math.min(low, altitudeM);
        high = Math.max(high, altitudeM);
        if (phase !== 'down' && altitudeM <= high - RUN_DROP_M) {
          phase = 'down';
          runCount += 1;
          low = altitudeM;
        } else if (phase !== 'up' && altitudeM >= low + RUN_DROP_M) {
          phase = 'up';
          high = altitudeM;
        }
      }
      return { runCount, onLift: phase === 'up' };
    },
    reset() {
      phase = 'start';
      low = Infinity;
      high = -Infinity;
      runCount = 0;
    },
  };
}
