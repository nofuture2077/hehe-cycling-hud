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
  const place = [showCity && city, showRegion && region, showCountry && country]
    .filter(Boolean)
    .join(', ');
  const flag = showFlag && countryFlag ? countryFlag : undefined;
  // Local time and temperature each after a dash, unless nothing comes before; '—' only while nothing else shows
  const extras = [
    showLocalTime && localTime,
    showTemperature && temperatureC !== null && `${Math.round(temperatureC)}°C`,
  ].filter(Boolean);
  const text = place || (extras.length === 0 && !flag ? '—' : '');

  return (
    <div className={`${styles.chip} ${styles.location}`}>
      <span className={styles.chipIcon}>
        {flag ? <span aria-hidden="true">{flag}</span> : <IconPin />}
      </span>
      {text && <span className={styles.text}>{text}</span>}
      {extras.map((extra, i) => (
        <span key={i} className={styles.value}>
          {(text || i > 0) && <>&nbsp;- </>}
          {extra}
        </span>
      ))}
    </div>
  );
}
