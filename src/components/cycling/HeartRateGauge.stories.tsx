import type { Meta, StoryObj } from '@storybook/react-vite';
import { Gauge } from './Gauge';
import { NumberValue } from './NumberValue';
import { IconHeart } from './icons/Icons';
import { heartRateZone, heartbeatSeconds } from './format';
import styles from './Gauge.module.css';

const meta: Meta<typeof Gauge> = {
  title: 'Cycling HUD/Heart Rate Gauge',
  component: Gauge,
};
export default meta;

type Story = StoryObj<typeof Gauge>;

// max heart rate assumed at 190 bpm for zone calculation
const MAX_HEART_RATE_BPM = 190;

function heartRateArgs(bpm: number) {
  return {
    accentClass: styles.heartRate,
    levelClass: styles[`heartRateLevel${heartRateZone(bpm, MAX_HEART_RATE_BPM)}`],
    backgroundIcon: <IconHeart />,
    backgroundPulseSeconds: heartbeatSeconds(bpm),
    value: <NumberValue n={bpm} />,
    unit: 'bpm',
  };
}

export const Zone1Recovery: Story = {
  args: heartRateArgs(100),
};

export const Zone2Endurance: Story = {
  args: heartRateArgs(125),
};

export const Zone3Tempo: Story = {
  args: heartRateArgs(145),
};

export const Zone4Threshold: Story = {
  args: heartRateArgs(165),
};

export const Zone5Anaerobic: Story = {
  args: heartRateArgs(182),
};
