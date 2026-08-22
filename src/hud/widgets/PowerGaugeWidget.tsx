import { Gauge } from '../Gauge';
import { NumberValue } from '../NumberValue';
import { IconBolt } from '../icons/Icons';
import { powerZone } from '../../core/zones';
import type { HudContext } from '../context';
import gaugeStyles from '../Gauge.module.css';

export function PowerGaugeWidget({ ctx }: { ctx: HudContext }) {
  const { data, config, visibility } = ctx;
  if (!visibility.showPower) return null;
  const zone = powerZone(data.powerWatts, config.averagePowerWatts);
  return (
    <Gauge
      accentClass={gaugeStyles.power}
      levelClass={gaugeStyles[`powerLevel${zone}`]}
      backgroundIcon={<IconBolt />}
      backgroundPulseSeconds={zone >= 6 ? 0.6 : undefined}
      value={<NumberValue n={data.powerWatts} />}
      unit="W"
      secondaryValue={config.visible.showMax ? <NumberValue n={data.sessionMaxPowerWatts} /> : undefined}
    />
  );
}
