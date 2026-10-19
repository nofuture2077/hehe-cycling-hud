import { VitalsBar } from '../VitalsBar';
import { NumberValue } from '../NumberValue';
import { IconIncline } from '../icons/Icons';
import { gradientLevel } from '../../core/zones';
import type { HudContext } from '../context';

export function GradientBarWidget({ ctx }: { ctx: HudContext }) {
  const { data, visibility } = ctx;
  if (!visibility.showGradient) return null;
  const level = gradientLevel(data.gradientPercent);
  const percent = (Math.abs(data.gradientPercent) / 20) * 100;
  return (
    <VitalsBar
      icon={<IconIncline />}
      label="Gradient"
      value={<NumberValue n={data.gradientPercent} digits={1} />}
      unit="%"
      percent={percent}
      level={level}
      extreme={Math.abs(data.gradientPercent) >= 13}
      fading={visibility.gradientFading}
    />
  );
}
