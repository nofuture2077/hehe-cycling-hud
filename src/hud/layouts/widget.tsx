import { useEffect, useRef, useState, type RefObject } from 'react';
import type { HudContext } from '../context';
import { getWidget } from '../widgets/registry';
import { getLayout, type ClusterProps, type LayoutWidgets } from './registry';
import styles from '../CyclingHud.module.css';

const TrackMap = getWidget('trackMap');
const ElevationProfile = getWidget('elevationProfile');

// the clusters of the configured layout, each on its own and without the layout's placement, the
// track map and the elevation profile - for HeheChat's unified overlay source, which shows a cluster in a frame of its
// own and places that frame per OBS scene (#token=...&widget=gauges&slot=bottom-right).
// HeheChat gives the frame the shape of the layout's cluster (its src/components/overlay/hud.ts), and the cluster is
// scaled to fit it - by its design size
// (`widgets` of each layout), not by what is on screen right now, so it doesn't grow and shrink as
// gauges come and go.
const HUD_WIDGET_IDS = ['info', 'gauges', 'map', 'elevation'] as const;

export type HudWidgetId = (typeof HUD_WIDGET_IDS)[number];

export function isHudWidget(id: string | null): id is HudWidgetId {
  return (HUD_WIDGET_IDS as readonly (string | null)[]).includes(id);
}

function MapCluster({ ctx, className }: ClusterProps) {
  return (
    <div className={className}>
      <TrackMap ctx={ctx} />
    </div>
  );
}

function ElevationCluster({ ctx, className }: ClusterProps) {
  return (
    <div className={className}>
      <ElevationProfile ctx={ctx} />
    </div>
  );
}

// look the same in every layout
const OWN_WIDGETS: Record<'map' | 'elevation', LayoutWidgets['info']> = {
  map: { width: 240, height: 240, Cluster: MapCluster },
  elevation: { width: 240, height: 112, Cluster: ElevationCluster },
};

// how much the design size has to shrink or grow to fit the frame, and the frame's width at that scale. A cluster
// that takes more than its design size (e.g. a long place name) shrinks to fit, instead of being cut off.
function useFrameScale(width: number, height: number, stretch: boolean | undefined, content: RefObject<HTMLElement | null>) {
  const [frame, setFrame] = useState({ scale: 1, width });

  useEffect(() => {
    const update = () => {
      const el = content.current;
      const needed = {
        width: Math.max(width, stretch || !el ? 0 : el.offsetWidth),
        height: Math.max(height, el?.offsetHeight ?? 0),
      };
      const scale = Math.min(window.innerWidth / needed.width, window.innerHeight / needed.height);
      setFrame({ scale, width: window.innerWidth / scale });
    };
    update();
    const observer = new ResizeObserver(update);
    if (content.current) observer.observe(content.current);
    window.addEventListener('resize', update);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', update);
    };
  }, [width, height, stretch, content]);

  return frame;
}

const FLEX_ALIGN: Record<string, string> = {
  top: 'flex-start',
  left: 'flex-start',
  middle: 'center',
  center: 'center',
  bottom: 'flex-end',
  right: 'flex-end',
};

// slot: where on the screen HeheChat shows the frame, e.g. 'bottom-right' - the cluster hugs that
// corner of the frame, so it stays put there while it has less to show
export default function WidgetLayout({
  ctx,
  layout,
  widget,
  slot,
}: {
  ctx: HudContext;
  layout: string;
  widget: HudWidgetId;
  slot: string;
}) {
  const { width, height, stretch, Cluster } =
    widget === 'map' || widget === 'elevation' ? OWN_WIDGETS[widget] : getLayout(layout).widgets[widget];
  const contentRef = useRef<HTMLDivElement>(null);
  const { scale, width: frameWidth } = useFrameScale(width, height, stretch, contentRef);
  const [vertical = 'top', horizontal = 'left'] = slot.split('-');

  return (
    <div
      className={styles.frame}
      data-align={horizontal}
      style={{ alignItems: FLEX_ALIGN[vertical], justifyContent: FLEX_ALIGN[horizontal] }}
    >
      <div
        ref={contentRef}
        style={{
          flexShrink: 0,
          width: stretch ? frameWidth : undefined,
          transform: `scale(${scale})`,
          transformOrigin: `${vertical === 'middle' ? 'center' : vertical} ${horizontal}`,
        }}
      >
        {/* the map and the elevation profile are widgets of their own, shown whenever there is a track, so the other
            clusters leave them out */}
        <Cluster
          ctx={{
            ...ctx,
            visibility: {
              ...ctx.visibility,
              showGpxMap: widget === 'map' && ctx.gpx.points.length > 0,
              showGpxElevationMap: widget === 'elevation' && ctx.gpx.points.length > 0,
            },
          }}
          className={styles.framed}
        />
      </div>
    </div>
  );
}
