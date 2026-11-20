import type { ReactNode } from 'react';
import type { CyclingData, CyclingHudVisibility, HudTexts } from '../core';
import { WeatherIcon } from './WeatherIcon';
import styles from './WeatherIcon.module.css';

// The weather parts of the location (LocationChip, LocationLine), each shown when its switch is on and Moblin sends
// it: the weather icon with the temperature, the felt temperature, the wind (an arrow where it blows, the gusts after
// a dash) and the humidity. `degree` is the unit after a temperature ('°C' in the chip, '°' in the line).
export function weatherParts(
  data: CyclingData,
  visible: CyclingHudVisibility,
  texts: HudTexts,
  degree: string,
): ReactNode[] {
  const parts: ReactNode[] = [];
  const icon = visible.locationWeather && data.weatherCondition && (
    <WeatherIcon condition={data.weatherCondition} isDaylight={data.isDaylight} />
  );
  const temperature = visible.locationTemperature && data.temperatureC != null && `${Math.round(data.temperatureC)}${degree}`;
  if (icon || temperature) {
    parts.push(
      <span className={styles.part}>
        {icon}
        {temperature}
      </span>,
    );
  }
  if (visible.locationFeelsLike && data.feelsLikeC != null) {
    parts.push(`${texts.feelsLike} ${Math.round(data.feelsLikeC)}${degree}`);
  }
  if (visible.locationWind && data.windKmh != null) {
    const gust = data.windGustKmh != null && Math.round(data.windGustKmh) > Math.round(data.windKmh);
    parts.push(
      <span className={styles.part}>
        {data.windDirectionDeg != null && (
          // the arrow points where the wind blows, away from where it comes from
          <svg className={styles.arrow} viewBox="0 0 24 24" style={{ transform: `rotate(${data.windDirectionDeg + 180}deg)` }}>
            <path d="M12 3v18M6 9l6-6 6 6" />
          </svg>
        )}
        {Math.round(data.windKmh)}
        {gust && `–${Math.round(data.windGustKmh!)}`} {texts.unitKmh}
      </span>,
    );
  }
  if (visible.locationHumidity && data.humidity != null) {
    parts.push(
      <span className={styles.part}>
        <svg className={styles.droplet} viewBox="0 0 24 24">
          <path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z" />
        </svg>
        {Math.round(data.humidity * 100)}%
      </span>,
    );
  }
  return parts;
}

