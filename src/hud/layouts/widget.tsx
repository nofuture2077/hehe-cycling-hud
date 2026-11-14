import { useEffect, useState } from 'react';
import type { HudContext } from '../context';
import { getWidget } from '../widgets/registry';
import { getLayout, type ClusterProps } from './registry';
import styles from '../CyclingHud.module.css';

const TrackMap = getWidget('trackMap');

// the clusters of the configured layout, each on its own and without the layout's placement, and
// the track map - for HeheChat's unified overlay source, which shows a cluster in a frame of its
// own and places that frame per OBS scene (#token=...&widget=gauges&slot=bottom-right).
// HeheChat gives the frame the shape of the default layout's cluster (BLOCK_TYPES in its
// src/components/overlay/blocks.tsx), and the cluster is scaled to fit it - by its design size
// (`widgets` of each layout), not by what is on screen right now, so it doesn't grow and shrink as
// gauges come and go.
const HUD_WIDGET_IDS = ['info', 'gauges', 'map'] as const;

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

// looks the same in every layout
const MAP_WIDGET = { width: 240, height: 240, Cluster: MapCluster };

// how much the design size has to shrink or grow to fit the frame
function useFrameScale(width: number, height: number) {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const update = () => setScale(Math.min(window.innerWidth / width, window.innerHeight / height));
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [width, height]);

  return scale;
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
  const { width, height, Cluster } = widget === 'map' ? MAP_WIDGET : getLayout(layout).widgets[widget];
  const scale = useFrameScale(width, height);
  const [vertical = 'top', horizontal = 'left'] = slot.split('-');

  return (
    <div className={styles.frame} style={{ alignItems: FLEX_ALIGN[vertical], justifyContent: FLEX_ALIGN[horizontal] }}>
      <div
        style={{
          flexShrink: 0,
          transform: `scale(${scale})`,
          transformOrigin: `${vertical === 'middle' ? 'center' : vertical} ${horizontal}`,
        }}
      >
        {/* the map is a widget of its own, so the other clusters leave it out */}
        <Cluster
          ctx={widget === 'map' ? ctx : { ...ctx, visibility: { ...ctx.visibility, showGpxMap: false } }}
          className={styles.framed}
        />
      </div>
    </div>
  );
}
