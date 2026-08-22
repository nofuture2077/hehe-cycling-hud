import { Gauge } from '../Gauge';
import { NumberValue } from '../NumberValue';
import { IconHeart } from '../icons/Icons';
import { heartRateZone, heartbeatSeconds } from '../../core/zones';
import type { HudContext } from '../context';
import gaugeStyles from '../Gauge.module.css';

export function HeartRateGaugeWidget({ ctx }: { ctx: HudContext }) {
  const { data, config, visibility } = ctx;
  if (!visibility.showHeartRate) return null;
  return (
    <Gauge
      accentClass={gaugeStyles.heartRate}
      levelClass={gaugeStyles[`heartRateLevel${heartRateZone(data.heartRateBpm, config.maxHeartRateBpm)}`]}
      backgroundIcon={<IconHeart />}
      backgroundPulseSeconds={heartbeatSeconds(data.heartRateBpm)}
      value={<NumberValue n={data.heartRateBpm} />}
      unit="bpm"
      secondaryValue={config.visible.showMax ? <NumberValue n={data.sessionMaxHeartRateBpm} /> : undefined}
    />
  );
}
