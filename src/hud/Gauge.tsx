import { useLayoutEffect, useRef, type ReactNode } from 'react';
import { IconMax } from './icons/Icons';
import styles from './Gauge.module.css';

// how much of the circle's width the value may take
const VALUE_ROOM = 0.84;

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
  // a wide font (an overlay theme's, e.g. Orbitron) shrinks the value to fit inside the circle
  const valueRef = useRef<HTMLSpanElement>(null);
  useLayoutEffect(() => {
    const el = valueRef.current;
    const gauge = el?.closest<HTMLElement>(`.${styles.gauge}`);
    if (!el || !gauge) return;
    el.style.transform = '';
    const room = gauge.clientWidth * VALUE_ROOM;
    if (el.offsetWidth > room) el.style.transform = `scale(${room / el.offsetWidth})`;
  });

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
        <span className={styles.gaugeSecondary}>
            {secondaryValue ? (
              <>
                <IconMax />
                {secondaryValue}
              </>) : <span>&nbsp;</span>}
          </span>
        <span ref={valueRef} className={styles.gaugeValue}>
          {value}
        </span>
        <span className={styles.gaugeUnit}>{unit}</span>
          
      </div>
    </div>
  );
}
