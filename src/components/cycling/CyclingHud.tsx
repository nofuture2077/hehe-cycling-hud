import { useMemo } from 'react';
import { Gauge } from './Gauge';
import { PauseGauge } from './PauseGauge';
import { LocationChip } from './LocationChip';
import { StatsCard } from './StatsCard';
import { TrackMap } from './TrackMap';
import { ElevationProfile } from './ElevationProfile';
import { useLingering } from './hooks/useLingering';
import { gradientLevel, speedLevel, heartRateZone, heartbeatSeconds, powerZone } from './format';
import { NumberValue } from './NumberValue';
import { IconHeart, IconBolt } from './icons/Icons';
import { type CyclingData, type CyclingHudConfig, type PauseInfo, defaultConfig, defaultPause } from './types';
import { parseGpx } from '../../gpx/parseGpx';
import { findNearestPointIndex, remainingDistanceMeters, remainingElevationGainMeters } from '../../gpx/trackStats';
import type { GpxTrack } from '../../hooks/useMoblinCyclingHud';
import styles from './CyclingHud.module.css';
import gaugeStyles from './Gauge.module.css';

export type { CyclingData, CyclingHudVisibility, CyclingHudConfig, CyclingHudTheme, PauseInfo } from './types';

export default function CyclingHud({
  data,
  config = defaultConfig,
  pause = defaultPause,
  gpxTrack = null,
}: {
  data: CyclingData;
  config?: CyclingHudConfig;
  pause?: PauseInfo;
  gpxTrack?: GpxTrack | null;
}) {
  const { visible } = config;

  const gpxPoints = useMemo(() => (gpxTrack ? parseGpx(gpxTrack.content) : []), [gpxTrack]);
  const position = data.latitude != null && data.longitude != null
    ? { lat: data.latitude, lon: data.longitude }
    : null;
  const nearestIndex = position && gpxPoints.length ? findNearestPointIndex(gpxPoints, position.lat, position.lon) : -1;
  const remainingDistanceKm = nearestIndex >= 0 ? remainingDistanceMeters(gpxPoints, nearestIndex) / 1000 : 0;
  const remainingElevationGainM = nearestIndex >= 0 ? remainingElevationGainMeters(gpxPoints, nearestIndex) : 0;

  const showGpxMap = visible.showGpxMap && gpxPoints.length > 0;
  const showGpxElevationMap = visible.showGpxElevationMap && gpxPoints.length > 0;
  const showGpxRemainingDistance = visible.showGpxRemainingDistance && gpxPoints.length > 0;
  const showGpxRemainingElevation = visible.showGpxRemainingElevation && gpxPoints.length > 0;
  const mapPosition = visible.showGpxPosition ? position : null;
  const elevationPosition = visible.showGpxElevationPosition ? position : null;
  const isMoving = data.speedKmh >= config.minSpeedKmh;
  const speedActive = visible.speed && isMoving && !pause.onBreak;
  const gradientAboveThreshold = Math.abs(data.gradientPercent) >= config.minGradientPercent;
  const gradientMovingOk = !config.gradientOnlyWhenMoving || isMoving;
  const gradientActive = visible.gradient && gradientAboveThreshold && gradientMovingOk;

  const speedLinger = useLingering(speedActive, config.hideLingerMs);
  const gradientLinger = useLingering(gradientActive, config.hideLingerMs);
  const showSpeed = speedLinger.visible && !pause.onBreak;
  const showGradient = gradientLinger.visible && !pause.onBreak;
  const showPause = pause.onBreak;

  const showElevation = visible.elevation;
  const showTopChips = visible.location || visible.distance || showElevation || showGpxMap;
  const showBottomGauges = showSpeed || showGradient || showPause;

  const showHeartRate = visible.heartRate && data.heartRateBpm > 0 && !pause.onBreak;
  const showPower = visible.power && data.powerWatts > 0 && !pause.onBreak;
  const showAnyGauge = showBottomGauges || showHeartRate || showPower || showGpxElevationMap;

  return (
    <div className={styles.root} data-theme={config.theme}>
      {showTopChips && (
        <div className={`${styles.chipCluster} ${styles.topLeft} ${showElevation ? styles.matchWidth : ''}`}>
          {visible.location && (
            <LocationChip
              city={data.city}
              region={data.region}
              country={data.country}
              countryFlag={data.countryFlag}
              temperatureC={data.temperatureC}
              localTime={data.localTime}
              showCity={visible.locationCity}
              showRegion={visible.locationRegion}
              showCountry={visible.locationCountry}
              showFlag={visible.locationFlag}
              showTemperature={visible.locationTemperature}
              showLocalTime={visible.locationLocalTime}
            />
          )}
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
              remainingDistanceKm={showGpxRemainingDistance ? remainingDistanceKm : null}
              remainingElevationGainM={showGpxRemainingElevation ? remainingElevationGainM : null}
            />
          )}
          {showGpxMap && (
            <div className={styles.trackMapSpacing}>
              <TrackMap
                points={gpxPoints}
                position={mapPosition}
                radiusMeters={config.gpxMapRadius}
              />
            </div>
          )}
        </div>
      )}

      {showAnyGauge && (
        <div className={`${styles.chipCluster} ${styles.bottomRight}`}>
          {showGpxElevationMap && (
            <ElevationProfile
              points={gpxPoints}
              position={elevationPosition}
              radiusMeters={config.gpxMapRadius}
            />
          )}
          <div className={styles.gaugeRow}>
          {showHeartRate && (
            <Gauge
              accentClass={gaugeStyles.heartRate}
              levelClass={gaugeStyles[`heartRateLevel${heartRateZone(data.heartRateBpm, config.maxHeartRateBpm)}`]}
              backgroundIcon={<IconHeart />}
              backgroundPulseSeconds={heartbeatSeconds(data.heartRateBpm)}
              value={<NumberValue n={data.heartRateBpm} />}
              unit="bpm"
              secondaryValue={visible.showMax ? <NumberValue n={data.sessionMaxHeartRateBpm} /> : undefined}
            />
          )}
          {showPower && (
            <Gauge
              accentClass={gaugeStyles.power}
              levelClass={gaugeStyles[`powerLevel${powerZone(data.powerWatts, config.averagePowerWatts)}`]}
              backgroundIcon={<IconBolt />}
              backgroundPulseSeconds={powerZone(data.powerWatts, config.averagePowerWatts) >= 6 ? 0.6 : undefined}
              value={<NumberValue n={data.powerWatts} />}
              unit="W"
              secondaryValue={visible.showMax ? <NumberValue n={data.sessionMaxPowerWatts} /> : undefined}
            />
          )}
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
                value={<NumberValue n={Math.max(0, data.speedKmh)} />}
                unit="km/h"
                secondaryValue={visible.showMax ? <NumberValue n={Math.max(0, data.maxSpeedKmh)} /> : undefined}
              />
            )
          )}
          </div>
        </div>
      )}
    </div>
  );
}
