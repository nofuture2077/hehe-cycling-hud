import type { Meta, StoryObj } from '@storybook/react-vite';
import CyclingHud, { type CyclingData, type CyclingHudConfig } from './CyclingHud';
import { defaultConfig, defaultPause } from './types';

const sampleData: CyclingData = {
  speedKmh: 28,
  maxSpeedKmh: 45,
  distanceKm: 42.7,
  splitDistanceKm: 12.3,
  city: 'Zugspitze',
  region: 'Bavaria',
  country: 'Germany',
  countryFlag: '🇩🇪',
  temperatureC: 18,
  localTime: '14:32',
  gradientPercent: 6.5,
  maxGradientPercent: 9.2,
  elevationGainM: 580,
  elevationLossM: 210,
  splitElevationGainM: 140,
  splitElevationLossM: 60,
  heartRateBpm: 145,
  powerWatts: 255,
  sessionMaxHeartRateBpm: 168,
  sessionMaxPowerWatts: 410,
};

function HudFrame({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ position: 'relative', width: 960, height: 540, background: '#14161a', overflow: 'hidden' }}>
      <div style={{ transform: 'scale(0.5)', transformOrigin: 'top left' }}>{children}</div>
    </div>
  );
}

const meta: Meta<typeof CyclingHud> = {
  title: 'Cycling HUD/CyclingHud',
  component: CyclingHud,
  decorators: [(Story: React.ComponentType) => <HudFrame><Story /></HudFrame>],
  args: {
    data: sampleData,
    config: defaultConfig,
    pause: defaultPause,
  },
};
export default meta;

type Story = StoryObj<typeof CyclingHud>;

export const Default: Story = {};

export const SplitMode: Story = {
  args: {
    config: { ...defaultConfig, visible: { ...defaultConfig.visible, split: true } },
  },
};

export const WithMax: Story = {
  args: {
    config: { ...defaultConfig, visible: { ...defaultConfig.visible, showMax: true } },
  },
};

const speedOnlyConfig: CyclingHudConfig = {
  ...defaultConfig,
  visible: { ...defaultConfig.visible, gradient: false, distance: false, elevation: false, location: false },
};

export const SpeedOnly: Story = {
  args: { config: speedOnlyConfig },
};

const gradientOnlyConfig: CyclingHudConfig = {
  ...defaultConfig,
  visible: { ...defaultConfig.visible, speed: false, distance: false, elevation: false, location: false },
};

export const GradientOnly: Story = {
  args: { config: gradientOnlyConfig },
};

export const PauseActive: Story = {
  args: {
    pause: { onBreak: true, currentBreakSeconds: 95, totalBreakSeconds: 720, breakCount: 3 },
  },
};

export const Stationary: Story = {
  args: {
    data: { ...sampleData, speedKmh: 0, gradientPercent: 0.2 },
  },
};

export const HeartRateAndPower: Story = {
  args: {
    data: { ...sampleData, heartRateBpm: 168, powerWatts: 340 },
  },
};

const heartRateOnlyConfig: CyclingHudConfig = {
  ...defaultConfig,
  visible: { ...defaultConfig.visible, speed: false, gradient: false, distance: false, elevation: false, location: false, power: false },
};

export const HeartRateOnly: Story = {
  args: { config: heartRateOnlyConfig, data: { ...sampleData, heartRateBpm: 178 } },
};

const powerOnlyConfig: CyclingHudConfig = {
  ...defaultConfig,
  visible: { ...defaultConfig.visible, speed: false, gradient: false, distance: false, elevation: false, location: false, heartRate: false },
};

export const PowerOnly: Story = {
  args: { config: powerOnlyConfig, data: { ...sampleData, powerWatts: 400 } },
};

export const NoHeartRateOrPowerData: Story = {
  args: {
    data: { ...sampleData, heartRateBpm: 0, powerWatts: 0 },
  },
};
