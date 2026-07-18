import { IconPin } from './icons/Icons';
import styles from './Chips.module.css';

export function LocationChip({ location }: { location: string }) {
  return (
    <div className={`${styles.chip} ${styles.location}`}>
      <span className={styles.chipIcon}>
        <IconPin />
      </span>
      <span className={styles.text}>{location}</span>
    </div>
  );
}
