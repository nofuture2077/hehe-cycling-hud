import styles from './NumberValue.module.css';

export function NumberValue({
  n,
  digits = 0,
  decimal,
  separator,
}: {
  n: number;
  digits?: number;
  decimal?: number;
  separator?: string;
}) {
  if (decimal !== undefined) {
    // a separator (e.g. ":" for mm:ss) reads as a clock, so both halves stay the same size
    // instead of the superscript-decimal styling used for plain fractional values
    return (
      <span className={styles.wrap}>
        {Math.trunc(n)}
        <span className={separator ? undefined : styles.decimal}>
          {separator}
          {String(decimal).padStart(2, '0')}
        </span>
      </span>
    );
  }

  if (digits === 0) return <>{Math.round(n)}</>;

  const [int, dec] = n.toLocaleString('de-DE', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).split(',');

  return (
    <span className={styles.wrap}>
      {int}
      <span className={styles.decimal}>{dec}</span>
    </span>
  );
}
