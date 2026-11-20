import { VitalsBar } from '../VitalsBar';
import { NumberValue } from '../NumberValue';
import { IconHeart } from '../icons/Icons';
import { heartRateZone } from '../../core/zones';
import type { HudContext } from '../context';

export function HeartRateBarWidget({ ctx }: { ctx: HudContext }) {
  const { data, config, visibility } = ctx;
  if (!visibility.showHeartRate) return null;
  const zone = heartRateZone(data.heartRateBpm, config.maxHeartRateBpm);
  const percent = config.maxHeartRateBpm > 0 ? (data.heartRateBpm / config.maxHeartRateBpm) * 100 : 0;
  return (
    <VitalsBar
      icon={<IconHeart />}
      label={ctx.config.texts.heartRateShort}
      value={<NumberValue n={data.heartRateBpm} />}
      unit={ctx.config.texts.unitBpm}
      percent={percent}
      level={zone}
    />
  );
}
