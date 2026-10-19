import { VitalsBar } from '../VitalsBar';
import { NumberValue } from '../NumberValue';
import { IconBolt } from '../icons/Icons';
import { powerZone } from '../../core/zones';
import type { HudContext } from '../context';

export function PowerBarWidget({ ctx }: { ctx: HudContext }) {
  const { data, config, visibility } = ctx;
  if (!visibility.showPower) return null;
  const zone = powerZone(data.powerWatts, config.averagePowerWatts);
  const percent = config.averagePowerWatts > 0 ? (data.powerWatts / (config.averagePowerWatts * 2)) * 100 : 0;
  return (
    <VitalsBar
      icon={<IconBolt />}
      label="Power"
      value={<NumberValue n={data.powerWatts} />}
      unit="W"
      percent={percent}
      level={Math.min(5, zone)}
      extreme={zone >= 6}
    />
  );
}
