import type { Meta, StoryObj } from '@storybook/react-vite';
import { Gauge } from './Gauge';
import { NumberValue } from './NumberValue';
import { IconBolt } from './icons/Icons';
import { powerZone } from '../core/zones';
import styles from './Gauge.module.css';

const meta: Meta<typeof Gauge> = {
  title: 'Cycling HUD/Power Gauge',
  component: Gauge,
};
export default meta;

type Story = StoryObj<typeof Gauge>;

// average power assumed at 250 W for zone calculation
const AVERAGE_POWER_WATTS = 250;

function powerArgs(watts: number) {
  const zone = powerZone(watts, AVERAGE_POWER_WATTS);
  return {
    accentClass: styles.power,
    levelClass: styles[`powerLevel${zone}`],
    backgroundIcon: <IconBolt />,
    backgroundPulseSeconds: zone >= 6 ? 0.6 : undefined,
    value: <NumberValue n={watts} />,
    unit: 'W',
  };
}

export const Zone1ActiveRecovery: Story = {
  args: powerArgs(100),
};

export const Zone2Endurance: Story = {
  args: powerArgs(160),
};

export const Zone3Tempo: Story = {
  args: powerArgs(210),
};

export const Zone4Threshold: Story = {
  args: powerArgs(255),
};

export const Zone5Vo2Max: Story = {
  args: powerArgs(285),
};

export const Zone6AnaerobicPulsing: Story = {
  args: powerArgs(340),
};

export const Zone7NeuromuscularPulsing: Story = {
  args: powerArgs(400),
};
