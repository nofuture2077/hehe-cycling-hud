import { Gauge } from '../Gauge';
import { PauseGauge } from '../PauseGauge';
import { NumberValue } from '../NumberValue';
import { speedLevel } from '../../core/zones';
import type { HudContext } from '../context';
import gaugeStyles from '../Gauge.module.css';

// speed and the on-break gauge share one slot: only one can be showing at a time, since a rider
// is either moving or on a break, never both
export function PrimaryGaugeWidget({ ctx }: { ctx: HudContext }) {
  const { data, config, pause, visibility } = ctx;
  if (visibility.showPause) {
    return (
      <PauseGauge
        currentSeconds={pause.currentBreakSeconds}
        totalSeconds={pause.totalBreakSeconds}
        breakCount={pause.breakCount}
      />
    );
  }
  if (!visibility.showSpeed) return null;
  return (
    <Gauge
      accentClass={gaugeStyles.speed}
      levelClass={gaugeStyles[`speedLevel${speedLevel(data.speedKmh)}`]}
      big
      fading={visibility.speedFading}
      value={<NumberValue n={Math.max(0, data.speedKmh)} />}
      unit="km/h"
      secondaryValue={config.visible.showMax ? <NumberValue n={Math.max(0, data.maxSpeedKmh)} /> : undefined}
    />
  );
}
