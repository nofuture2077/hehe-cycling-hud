import type { Meta, StoryObj } from '@storybook/react-vite';
import { PauseGauge } from './PauseGauge';

const meta: Meta<typeof PauseGauge> = {
  title: 'Cycling HUD/PauseGauge',
  component: PauseGauge,
};
export default meta;

type Story = StoryObj<typeof PauseGauge>;

export const Default: Story = {
  args: {
    currentSeconds: 95,
    totalSeconds: 720,
    breakCount: 3,
  },
};

export const LongBreak: Story = {
  args: {
    currentSeconds: 4000,
    totalSeconds: 9000,
    breakCount: 8,
  },
};
