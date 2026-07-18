import { IconMax } from './icons/Icons';
import styles from './Gauge.module.css';

export function Gauge({
  accentClass,
  levelClass,
  mountainClass,
  extreme,
  big,
  fading,
  value,
  unit,
  secondaryValue,
}: {
  accentClass: string;
  levelClass?: string;
  mountainClass?: string;
  extreme?: boolean;
  big?: boolean;
  fading?: boolean;
  value: string;
  unit: string;
  secondaryValue?: string;
}) {
  return (
    <div
      className={`${styles.gauge} ${big ? styles.gaugeBig : ''} ${accentClass} ${levelClass ?? ''} ${
        extreme ? styles.pulseExtreme : ''
      } ${fading ? styles.fadingOut : ''}`}
    >
      {mountainClass && <div className={`${styles.mountain} ${mountainClass}`} />}
      <div className={styles.gaugeMain}>
        <span className={styles.gaugeUnit}>{unit}</span>
        <span className={styles.gaugeValue}>{value}</span>
        
          <span className={styles.gaugeSecondary}>
            {secondaryValue ? (
              <>
                <IconMax />
                {secondaryValue}
              </>) : <span>&nbsp;</span>}
          </span>
      </div>
    </div>
  );
}
