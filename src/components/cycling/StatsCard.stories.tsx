import type { Meta, StoryObj } from '@storybook/react-vite';
import { StatsCard } from './StatsCard';

const meta: Meta<typeof StatsCard> = {
  title: 'Cycling HUD/StatsCard',
  component: StatsCard,
  args: {
    showDistance: true,
    showElevation: true,
    split: false,
    distanceKm: 42.7,
    splitDistanceKm: 12.3,
    elevationGainM: 580,
    elevationLossM: 210,
    splitElevationGainM: 140,
    splitElevationLossM: 60,
  },
};
export default meta;

type Story = StoryObj<typeof StatsCard>;

export const Combined: Story = {};

export const DistanceOnly: Story = {
  args: { showElevation: false },
};

export const ElevationOnly: Story = {
  args: { showDistance: false },
};

export const SplitMode: Story = {
  args: { split: true },
};
