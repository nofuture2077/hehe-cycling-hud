import type { Meta, StoryObj } from '@storybook/react-vite';
import type { GpxPoint } from '../../gpx/parseGpx';
import { ElevationProfile } from './ElevationProfile';
import { parseGpx } from '../../gpx/parseGpx';
import gpxContent from '../../gpx/fixtures/road-to-japantag.gpx?raw';

const points = parseGpx(gpxContent);
const midPoint = points[Math.floor(points.length / 2)];

// synthesizes a straight-line track (each point ~10m apart) with elevations from the given
// profile, so stories can show how the normalization handles different climb shapes without
// needing separate GPX fixtures
function syntheticTrack(elevations: number[]): GpxPoint[] {
  const metersPerPoint = 10;
  const metersPerDegreeLat = 111_320;
  return elevations.map((ele, i) => ({
    lat: 47.0 + (i * metersPerPoint) / metersPerDegreeLat,
    lon: 11.0,
    ele,
  }));
}

function flatLine(length: number, base: number, jitter: number): number[] {
  return Array.from({ length }, (_, i) => base + Math.sin(i / 5) * jitter);
}

function rollingHills(length: number, base: number, amplitude: number): number[] {
  return Array.from({ length }, (_, i) => base + Math.sin(i / 20) * amplitude);
}

function alpineClimb(length: number, start: number, peak: number): number[] {
  return Array.from({ length }, (_, i) => start + (peak - start) * (i / (length - 1)));
}

const flatPoints = syntheticTrack(flatLine(200, 450, 2));
const rollingPoints = syntheticTrack(rollingHills(200, 500, 40));
const alpinePoints = syntheticTrack(alpineClimb(300, 400, 2800));

function Frame({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ width: 300, height: 120, background: '#14161a' }}>{children}</div>
  );
}

const meta: Meta<typeof ElevationProfile> = {
  title: 'Cycling HUD/ElevationProfile',
  component: ElevationProfile,
  decorators: [(Story: React.ComponentType) => <Frame><Story /></Frame>],
  args: {
    points,
    position: null,
  },
};
export default meta;

type Story = StoryObj<typeof ElevationProfile>;

export const Default: Story = {};

export const WithPosition: Story = {
  args: {
    position: { lat: midPoint.lat, lon: midPoint.lon },
  },
};

export const FlatStage: Story = {
  args: {
    points: flatPoints,
    position: null,
  },
};

export const RollingHills: Story = {
  args: {
    points: rollingPoints,
    position: null,
  },
};

export const AlpineClimb: Story = {
  args: {
    points: alpinePoints,
    position: null,
  },
};

export const Empty: Story = {
  args: {
    points: [],
  },
};
