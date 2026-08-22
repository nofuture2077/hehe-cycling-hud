import { Gauge } from '../Gauge';
import { NumberValue } from '../NumberValue';
import { gradientLevel } from '../../core/zones';
import type { HudContext } from '../context';
import gaugeStyles from '../Gauge.module.css';

export function GradientGaugeWidget({ ctx }: { ctx: HudContext }) {
  const { data, config, visibility } = ctx;
  if (!visibility.showGradient) return null;
  const level = gradientLevel(data.gradientPercent);
  return (
    <Gauge
      accentClass={gaugeStyles.gradient}
      levelClass={gaugeStyles[`gradientLevel${level}`]}
      mountainClass={gaugeStyles[`mountain${level}`]}
      extreme={Math.abs(data.gradientPercent) >= 13}
      fading={visibility.gradientFading}
      value={<NumberValue n={data.gradientPercent} digits={1} />}
      unit="%"
      secondaryValue={config.visible.showMax ? <NumberValue n={data.maxGradientPercent} digits={1} /> : undefined}
    />
  );
}
