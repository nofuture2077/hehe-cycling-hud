import type { Meta, StoryObj } from '@storybook/react-vite';
import { TrackMap } from './TrackMap';
import { parseGpx, parseGpxWaypoints } from '../../gpx/parseGpx';
import gpxContent from '../../gpx/fixtures/road-to-japantag.gpx?raw';

const points = parseGpx(gpxContent);
const waypoints = parseGpxWaypoints(gpxContent);
const midPoint = points[Math.floor(points.length / 2)];

function Frame({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ width: 300, height: 300, background: '#14161a' }}>{children}</div>
  );
}

const meta: Meta<typeof TrackMap> = {
  title: 'Cycling HUD/TrackMap',
  component: TrackMap,
  decorators: [(Story: React.ComponentType) => <Frame><Story /></Frame>],
  args: {
    points,
    position: null,
    radiusMeters: null,
    waypoints: [],
  },
};
export default meta;

type Story = StoryObj<typeof TrackMap>;

export const Default: Story = {};

export const WithPosition: Story = {
  args: {
    position: { lat: midPoint.lat, lon: midPoint.lon },
  },
};

export const ZoomedToRadius: Story = {
  args: {
    position: { lat: midPoint.lat, lon: midPoint.lon },
    radiusMeters: 20000,
  },
};

export const WithWaypoints: Story = {
  args: {
    waypoints,
  },
};

export const WithWaypointsZoomedToRadius: Story = {
  args: {
    position: { lat: midPoint.lat, lon: midPoint.lon },
    radiusMeters: 20000,
    waypoints,
  },
};

export const Empty: Story = {
  args: {
    points: [],
  },
};
