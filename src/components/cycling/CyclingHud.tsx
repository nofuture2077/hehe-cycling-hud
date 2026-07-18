import { Gauge } from './Gauge';
import { PauseGauge } from './PauseGauge';
import { LocationChip } from './LocationChip';
import { StatsCard } from './StatsCard';
import { useLingering } from './hooks/useLingering';
import { gradientLevel, speedLevel } from './format';
import { NumberValue } from './NumberValue';
import { type CyclingData, type CyclingHudConfig, type PauseInfo, defaultConfig, defaultPause } from './types';
import styles from './CyclingHud.module.css';
import gaugeStyles from './Gauge.module.css';

export type { CyclingData, CyclingHudVisibility, CyclingHudConfig, PauseInfo } from './types';

export default function CyclingHud({
  data,
  config = defaultConfig,
  pause = defaultPause,
}: {
  data: CyclingData;
  config?: CyclingHudConfig;
  pause?: PauseInfo;
}) {
  const { visible } = config;
  const isMoving = data.speedKmh >= config.minSpeedKmh;
  const speedActive = visible.speed && isMoving && !pause.onBreak;
  const gradientAboveThreshold = Math.abs(data.gradientPercent) >= config.minGradientPercent;
  const gradientMovingOk = !config.gradientOnlyWhenMoving || isMoving;
  const gradientActive = visible.gradient && gradientAboveThreshold && gradientMovingOk;

  const speedLinger = useLingering(speedActive, config.hideLingerMs);
  const gradientLinger = useLingering(gradientActive, config.hideLingerMs);
  const showSpeed = speedLinger.visible && !pause.onBreak;
  const showGradient = gradientLinger.visible;
  const showPause = pause.onBreak;

  const showElevation = visible.elevation;
  const showTopChips = visible.location || visible.distance || showElevation;
  const showBottomGauges = showSpeed || showGradient || showPause;

  return (
    <div className={styles.root}>
      {showTopChips && (
        <div className={`${styles.chipCluster} ${styles.topLeft}`}>
          {visible.location && <LocationChip location={data.location} />}
          {(visible.distance || showElevation) && (
            <StatsCard
              showDistance={visible.distance}
              showElevation={showElevation}
              split={visible.split}
              distanceKm={data.distanceKm}
              splitDistanceKm={data.splitDistanceKm}
              elevationGainM={data.elevationGainM}
              elevationLossM={data.elevationLossM}
              splitElevationGainM={data.splitElevationGainM}
              splitElevationLossM={data.splitElevationLossM}
            />
          )}
        </div>
      )}

      {showBottomGauges && (
        <div className={`${styles.gaugeRow} ${styles.bottomRight}`}>
          {showGradient && (
            <Gauge
              accentClass={gaugeStyles.gradient}
              levelClass={gaugeStyles[`gradientLevel${gradientLevel(data.gradientPercent)}`]}
              mountainClass={gaugeStyles[`mountain${gradientLevel(data.gradientPercent)}`]}
              extreme={Math.abs(data.gradientPercent) >= 13}
              fading={gradientLinger.fading}
              value={<NumberValue n={data.gradientPercent} digits={1} />}
              unit="%"
              secondaryValue={visible.showMax ? <NumberValue n={data.maxGradientPercent} digits={1} /> : undefined}
            />
          )}
          {showPause ? (
            <PauseGauge
              currentSeconds={pause.currentBreakSeconds}
              totalSeconds={pause.totalBreakSeconds}
              breakCount={pause.breakCount}
            />
          ) : (
            showSpeed && (
              <Gauge
                accentClass={gaugeStyles.speed}
                levelClass={gaugeStyles[`speedLevel${speedLevel(data.speedKmh)}`]}
                big
                fading={speedLinger.fading}
                value={<NumberValue n={data.speedKmh} />}
                unit="km/h"
                secondaryValue={visible.showMax ? <NumberValue n={data.maxSpeedKmh} /> : undefined}
              />
            )
          )}
        </div>
      )}
    </div>
  );
}
