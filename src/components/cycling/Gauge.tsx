import type { ReactNode } from 'react';
import { IconMax } from './icons/Icons';
import styles from './Gauge.module.css';

export function Gauge({
  accentClass,
  levelClass,
  mountainClass,
  backgroundIcon,
  backgroundPulseSeconds,
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
  // fills the gauge behind the value, e.g. IconHeart/IconBolt - optionally blinking/pulsing
  backgroundIcon?: ReactNode;
  backgroundPulseSeconds?: number;
  extreme?: boolean;
  big?: boolean;
  fading?: boolean;
  value: ReactNode;
  unit: string;
  secondaryValue?: ReactNode;
}) {
  return (
    <div
      className={`${styles.gauge} ${big ? styles.gaugeBig : ''} ${accentClass} ${levelClass ?? ''} ${
        extreme ? styles.pulseExtreme : ''
      } ${fading ? styles.fadingOut : ''}`}
    >
      {mountainClass && <div className={`${styles.mountain} ${mountainClass}`} />}
      {backgroundIcon && (
        <div
          className={`${styles.bgIcon} ${backgroundPulseSeconds ? styles.bgIconPulse : ''}`}
          style={backgroundPulseSeconds ? { animationDuration: `${backgroundPulseSeconds}s` } : undefined}
        >
          {backgroundIcon}
        </div>
      )}
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
