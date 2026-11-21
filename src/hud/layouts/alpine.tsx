import { type ReactNode, type RefObject, useLayoutEffect, useRef, useState } from 'react';
import { getWidget } from '../widgets/registry';
import { fmt } from '../format';
import { WeatherIcon } from '../WeatherIcon';
import weatherStyles from '../WeatherIcon.module.css';
import type { HudContext } from '../context';
import type { ClusterProps, LayoutWidgets } from './registry';
import styles from './alpine.module.css';

const Logo = getWidget('logo');

// Every number that changes has a place of its own, as wide as its longest sensible value with its unit (`fits`, an
// 8 for each digit: a speed below 100 fits '88'), so the things next to it and the bars behind them never move. The
// place is as wide as the widest digit of the font in every position (fonts without even digits make a 1 narrower
// than a 4). The number stays against its label: to the left of a place whose label comes before it ('feels -14°'),
// to the right of one whose label follows ('684 M vertical'), any room left over on the other side.
const DIGITS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

function Num({ fits, label, children }: { fits: string; label: 'before' | 'after'; children: ReactNode }) {
  return (
    <span className={`${styles.num} ${label === 'before' ? styles.numAfterLabel : ''}`}>
      {DIGITS.map((digit) => (
        <span key={digit} className={styles.numFits} aria-hidden="true">
          {fits.replace(/8/g, digit)}
        </span>
      ))}
      <span className={styles.numValue}>{children}</span>
    </span>
  );
}

// the steepness of the slope in degrees, as snowboarders read it, from the gradient (%)
const degrees = (percent: number) => (Math.atan(Math.abs(percent) / 100) * 180) / Math.PI;

// the altimeter: a tape of the altitude around the rider that scrolls as they ride down or up the lift, a tick every
// TICK_M, a number every LABEL_M, the current altitude on a tag in the middle
const TAPE_HEIGHT = 216;
const PX_PER_M = 1.3;
const TICK_M = 10;
const LABEL_M = 50;
const TAG_REACH = 32;

function Altimeter({ ctx }: { ctx: HudContext }) {
  const { data, config } = ctx;
  if (!config.visible.altitude) return null;
  const altitude = data.altitudeM;
  const half = TAPE_HEIGHT / 2 / PX_PER_M;
  const ticks: number[] = [];
  for (let m = Math.ceil((altitude - half) / TICK_M) * TICK_M; m <= altitude + half; m += TICK_M) ticks.push(m);

  return (
    <div className={styles.altimeter}>
      <div className={styles.tape}>
        {ticks.map((m) => (
          <div
            key={m}
            className={m % LABEL_M === 0 ? styles.major : styles.minor}
            style={{ top: TAPE_HEIGHT / 2 - (m - altitude) * PX_PER_M }}
          >
            {/* no number where the tag covers it */}
            {m % LABEL_M === 0 && Math.abs(m - altitude) * PX_PER_M > TAG_REACH && <span>{fmt(m)}</span>}
          </div>
        ))}
      </div>
      <div className={styles.tag}>
        <Num fits="8.888" label="after">
          {fmt(altitude)}
        </Num>
        <span className={styles.tagUnit}>{config.texts.unitM}</span>
      </div>
      <div className={styles.altLabel}>{config.texts.altitude}</div>
    </div>
  );
}

// Fonts put their capitals at different heights in a line (Anton's fill it, Michroma's sit high), so a bar padded the
// same above and below doesn't show the same room around them. This finds, in the line as it is laid out, how much
// more room there is below its capitals than above them (negative: above), to make up for it: where the baseline is
// (`baseline`, an empty mark on it) and how tall the font's capitals are. Again whenever the line changes size, e.g.
// once its font comes in.
function useCapOffset(line: RefObject<HTMLElement | null>, baseline: RefObject<HTMLElement | null>) {
  const [offset, setOffset] = useState(0);

  useLayoutEffect(() => {
    const el = line.current;
    if (!el) return undefined;
    const measure = () => {
      const mark = baseline.current;
      const context = document.createElement('canvas').getContext('2d');
      if (!mark || !context) return;
      const style = getComputedStyle(el);
      context.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
      const cap = context.measureText('H').actualBoundingBoxAscent;
      const top = parseFloat(style.paddingTop);
      const height = el.clientHeight - top - parseFloat(style.paddingBottom);
      const base = mark.offsetTop - top;
      setOffset(height - base - (base - cap));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [line, baseline]);

  return offset;
}

// the room around the headline's capitals on its bar, above and below alike
const HEADLINE_ROOM = 12;

// the place as the headline
function Headline({ ctx }: { ctx: HudContext }) {
  const { data, config } = ctx;
  const { visible } = config;
  const place = [visible.locationCity && data.city, visible.locationRegion && data.region, visible.locationCountry && data.country]
    .filter(Boolean)
    .join(' · ');
  const ref = useRef<HTMLHeadingElement>(null);
  const baseline = useRef<HTMLSpanElement>(null);
  const offset = useCapOffset(ref, baseline);
  if (!place) return null;
  return (
    <h1
      ref={ref}
      className={styles.place}
      style={{ paddingTop: HEADLINE_ROOM + Math.max(0, offset), paddingBottom: HEADLINE_ROOM + Math.max(0, -offset) }}
    >
      {place}
      <span ref={baseline} className={styles.baseline} />
    </h1>
  );
}

// the run as the issue number, a lift ticket while riding up
function Issue({ ctx }: { ctx: HudContext }) {
  const { data, config } = ctx;
  const { texts } = config;
  if (!config.visible.runs) return null;
  return data.onLift ? (
    <div className={styles.lift}>
      <span className={styles.liftArrow}>↗</span>
      {texts.onLift}
    </div>
  ) : (
    <div className={styles.issue}>
      <span className={styles.issueLabel}>{texts.runs}</span>
      {String(data.runCount).padStart(2, '0')}
    </div>
  );
}

// the line under the headline in small type: flag, the weather (icon, temperature, felt, wind with its gusts,
// humidity), local time
function Dek({ ctx }: { ctx: HudContext }) {
  const { data, config } = ctx;
  const { visible, texts } = config;
  const parts: ReactNode[] = [];
  if (visible.locationFlag && data.countryFlag) parts.push(data.countryFlag);
  const icon = visible.locationWeather && data.weatherCondition && (
    <WeatherIcon condition={data.weatherCondition} isDaylight={data.isDaylight} />
  );
  const temperature = visible.locationTemperature && data.temperatureC != null && (
    <Num fits="-88°" label="before">{`${Math.round(data.temperatureC)}°`}</Num>
  );
  if (icon || temperature) {
    parts.push(
      <>
        {icon}
        {temperature}
      </>,
    );
  }
  if (visible.locationFeelsLike && data.feelsLikeC != null) {
    parts.push(
      <>
        {texts.feelsLike} <Num fits="-88°" label="before">{`${Math.round(data.feelsLikeC)}°`}</Num>
      </>,
    );
  }
  if (visible.locationWind && data.windKmh != null) {
    const gust = data.windGustKmh != null && Math.round(data.windGustKmh) > Math.round(data.windKmh);
    parts.push(
      <>
        {/* the arrow points where the wind blows, away from where it comes from */}
        <svg
          className={weatherStyles.arrow}
          viewBox="0 0 24 24"
          style={{ transform: `rotate(${(data.windDirectionDeg ?? 0) + 180}deg)`, opacity: data.windDirectionDeg == null ? 0 : 1 }}
        >
          <path d="M12 3v18M6 9l6-6 6 6" />
        </svg>
        <Num fits={`88–88 ${texts.unitKmh}`} label="before">
          {`${Math.round(data.windKmh)}${gust ? `–${Math.round(data.windGustKmh!)}` : ''} ${texts.unitKmh}`}
        </Num>
      </>,
    );
  }
  if (visible.locationHumidity && data.humidity != null) {
    parts.push(
      <Num fits="888%" label="before">{`${Math.round(data.humidity * 100)}%`}</Num>,
    );
  }
  if (visible.locationLocalTime && data.localTime) parts.push(<Num fits="88:88" label="before">{data.localTime}</Num>);
  if (parts.length === 0) return null;
  return (
    <div className={styles.dek}>
      {parts.map((part, i) => (
        <span key={i}>
          {i > 0 && <span className={styles.slash}>/</span>}
          {part}
        </span>
      ))}
    </div>
  );
}

// the speed in huge type with its unit as a sticker slapped on it, the day's top speed beside it
function Speed({ ctx }: { ctx: HudContext }) {
  const { data, config, visibility } = ctx;
  const { texts } = config;
  if (!config.visible.speed) return null;
  const hidden = !visibility.showSpeed || visibility.speedFading;

  return (
    <div className={styles.speedRow}>
      <div className={`${styles.speed} ${hidden ? styles.hidden : ''}`}>
        <span className={styles.speedValue}>
          <Num fits="88" label="after">{fmt(Math.max(0, data.speedKmh))}</Num>
        </span>
        <span className={styles.sticker}>{texts.unitKmh}</span>
        {config.visible.showMax && (
          <span className={styles.max}>
            <span className={styles.maxLabel}>{texts.max}</span>
            <Num fits="88" label="before">{fmt(data.maxSpeedKmh)}</Num>
          </span>
        )}
      </div>
    </div>
  );
}

// the rest as captions in a row, split by slashes: the number with its unit in its place, then what it is
function Facts({ ctx }: { ctx: HudContext }) {
  const { data, config, visibility } = ctx;
  const { visible, texts } = config;
  // fits: the longest sensible number with its unit (Num)
  const facts: { label: string; value: string; fits: string }[] = [];
  if (visible.vertical) {
    const meters = visible.split ? data.splitElevationLossM : data.elevationLossM;
    facts.push({ label: texts.vertical, value: `${fmt(meters)} ${texts.unitM}`, fits: `88.888 ${texts.unitM}` });
  }
  if (visible.gradient) {
    facts.push({ label: texts.slope, value: `${fmt(degrees(data.gradientPercent))}${texts.unitDeg}`, fits: `88${texts.unitDeg}` });
  }
  if (visibility.showHeartRate) facts.push({ label: texts.unitBpm, value: fmt(data.heartRateBpm), fits: '888' });
  if (visible.distance) {
    const km = visible.split ? data.splitDistanceKm : data.distanceKm;
    facts.push({ label: texts.distance, value: `${fmt(km, 1)} ${texts.unitKm}`, fits: `88,8 ${texts.unitKm}` });
  }
  if (facts.length === 0) return null;

  return (
    <div className={styles.facts}>
      {facts.map(({ label, value, fits }, i) => (
        <span key={label} className={styles.fact}>
          {i > 0 && <span className={styles.slash}>/</span>}
          <b>
            <Num fits={fits} label="after">
              {value}
            </Num>
          </b>
          {label}
        </span>
      ))}
    </div>
  );
}

// A page of a snowboard magazine, its type set on bars like cut-out labels stacked without gaps, so it reads on a
// dark blue sky and on white snow alike. The info cluster is the headline: the place in big type with the run as the
// issue number beside it, the weather and the time as the dek under it (no weather around the headline, it keeps
// the page calm). The
// gauges cluster is the story: the altimeter, the speed in huge type with a sticker, captions in a row.
function InfoCluster({ ctx, className }: ClusterProps) {
  return (
    <div className={`${styles.info} ${className}`}>
      <Logo ctx={ctx} />
      <div className={styles.body}>
        <div className={styles.head}>
          <Headline ctx={ctx} />
          <Issue ctx={ctx} />
        </div>
        <Dek ctx={ctx} />
      </div>
    </div>
  );
}

function GaugeCluster({ ctx, className }: ClusterProps) {
  return (
    <div className={`${styles.gauges} ${className}`}>
      <Altimeter ctx={ctx} />
      <div className={styles.body}>
        <Speed ctx={ctx} />
        <Facts ctx={ctx} />
      </div>
    </div>
  );
}

// the headline top-left, the story bottom-left
export default function AlpineLayout({ ctx }: { ctx: HudContext }) {
  return (
    <>
      <InfoCluster ctx={ctx} className={styles.topLeft} />
      <GaugeCluster ctx={ctx} className={styles.bottomLeft} />
    </>
  );
}

export const widgets: LayoutWidgets = {
  info: { width: 620, height: 150, Cluster: InfoCluster },
  gauges: { width: 860, height: 216, Cluster: GaugeCluster },
};
