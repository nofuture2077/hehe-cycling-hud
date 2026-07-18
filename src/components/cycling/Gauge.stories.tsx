import type { Meta, StoryObj } from '@storybook/react-vite';
import { Gauge } from './Gauge';
import styles from './Gauge.module.css';

const meta: Meta<typeof Gauge> = {
  title: 'Cycling HUD/Gauge',
  component: Gauge,
};
export default meta;

type Story = StoryObj<typeof Gauge>;

export const Speed: Story = {
  args: {
    accentClass: styles.speed,
    levelClass: styles.speedLevel2,
    big: true,
    value: '28',
    unit: 'km/h',
  },
};

export const SpeedLevel0: Story = {
  args: {
    accentClass: styles.speed,
    big: true,
    value: '15',
    unit: 'km/h',
  },
};

export const SpeedLevel1: Story = {
  args: {
    accentClass: styles.speed,
    levelClass: styles.speedLevel1,
    big: true,
    value: '22',
    unit: 'km/h',
  },
};

export const SpeedLevel2: Story = {
  args: {
    accentClass: styles.speed,
    levelClass: styles.speedLevel2,
    big: true,
    value: '28',
    unit: 'km/h',
  },
};

export const SpeedLevel3: Story = {
  args: {
    accentClass: styles.speed,
    levelClass: styles.speedLevel3,
    big: true,
    value: '32',
    unit: 'km/h',
  },
};

export const SpeedLevel4: Story = {
  args: {
    accentClass: styles.speed,
    levelClass: styles.speedLevel4,
    big: true,
    value: '42',
    unit: 'km/h',
  },
};

export const SpeedLevel5: Story = {
  args: {
    accentClass: styles.speed,
    levelClass: styles.speedLevel5,
    big: true,
    value: '55',
    unit: 'km/h',
  },
};

export const SpeedWithMax: Story = {
  args: {
    accentClass: styles.speed,
    levelClass: styles.speedLevel2,
    big: true,
    value: '28',
    unit: 'km/h',
    secondaryValue: '45',
  },
};

export const GradientLevel1: Story = {
  args: {
    accentClass: styles.gradient,
    levelClass: styles.gradientLevel1,
    mountainClass: styles.mountain1,
    value: '3.0',
    unit: '%',
  },
};

export const GradientLevel2: Story = {
  args: {
    accentClass: styles.gradient,
    levelClass: styles.gradientLevel2,
    mountainClass: styles.mountain2,
    value: '6.5',
    unit: '%',
  },
};

export const GradientLevel3: Story = {
  args: {
    accentClass: styles.gradient,
    levelClass: styles.gradientLevel3,
    mountainClass: styles.mountain3,
    value: '10.0',
    unit: '%',
  },
};

export const GradientLevel4Extreme: Story = {
  args: {
    accentClass: styles.gradient,
    levelClass: styles.gradientLevel4,
    mountainClass: styles.mountain4,
    extreme: true,
    value: '15.0',
    unit: '%',
  },
};

export const GradientWithMax: Story = {
  args: {
    accentClass: styles.gradient,
    levelClass: styles.gradientLevel2,
    mountainClass: styles.mountain2,
    value: '6.5',
    unit: '%',
    secondaryValue: '9.2',
  },
};
