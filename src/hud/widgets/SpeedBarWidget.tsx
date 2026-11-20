import { VitalsBar } from '../VitalsBar';
import { NumberValue } from '../NumberValue';
import { IconSpeed, IconPause } from '../icons/Icons';
import { speedLevel } from '../../core/zones';
import type { HudContext } from '../context';

// mirrors PrimaryGaugeWidget's speed/pause slot-sharing, just rendered as a vitals bar instead
// of a circular gauge
export function SpeedBarWidget({ ctx }: { ctx: HudContext }) {
  const { data, config, pause, visibility } = ctx;
  if (visibility.showPause) {
    return (
      <VitalsBar
        icon={<IconPause />}
        label={config.texts.onBreak}
        value={<NumberValue n={pause.currentBreakSeconds} />}
        unit={config.texts.unitSec}
        percent={100}
        level={2}
      />
    );
  }
  if (!visibility.showSpeed) return null;
  return (
    <VitalsBar
      icon={<IconSpeed />}
      label={config.texts.speed}
      value={<NumberValue n={Math.max(0, data.speedKmh)} />}
      unit={config.texts.unitKmh}
      percent={(Math.max(0, data.speedKmh) / 50) * 100}
      level={Math.max(1, speedLevel(data.speedKmh))}
      fading={visibility.speedFading}
    />
  );
}
