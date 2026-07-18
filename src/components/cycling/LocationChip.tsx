import { IconPin } from './icons/Icons';
import styles from './Chips.module.css';

export function LocationChip({
  city,
  region,
  country,
  countryFlag,
  temperatureC,
  localTime,
  showCity = true,
  showRegion = false,
  showCountry = false,
  showFlag = true,
  showTemperature = false,
  showLocalTime = false,
}: {
  city: string;
  region: string;
  country: string;
  countryFlag: string;
  temperatureC: number | null;
  localTime: string;
  showCity?: boolean;
  showRegion?: boolean;
  showCountry?: boolean;
  showFlag?: boolean;
  showTemperature?: boolean;
  showLocalTime?: boolean;
}) {
  const text = [showCity && city, showRegion && region, showCountry && country]
    .filter(Boolean)
    .join(', ') || '—';
  const flag = showFlag && countryFlag ? countryFlag : undefined;

  return (
    <div className={`${styles.chip} ${styles.location}`}>
      <span className={styles.chipIcon}>
        {flag ? <span aria-hidden="true">{flag}</span> : <IconPin />}
      </span>
      <span className={styles.text}>{text}</span>
      {showLocalTime && localTime && (
        <span className={styles.value}>&nbsp;- {localTime}</span>
      )}
      {showTemperature && temperatureC !== null && (
        <span className={styles.value}>&nbsp;- {Math.round(temperatureC)}°C</span>
      )}
    </div>
  );
}
