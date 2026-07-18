import type { Meta, StoryObj } from '@storybook/react-vite';
import { PauseGauge } from './PauseGauge';
import { Gauge } from './Gauge';
import { NumberValue } from './NumberValue';
import gaugeStyles from './Gauge.module.css';
import hudStyles from './CyclingHud.module.css';

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

export const FirstBreak: Story = {
  args: {
    currentSeconds: 12,
    totalSeconds: 12,
    breakCount: 1,
  },
};

export const LongBreak: Story = {
  args: {
    currentSeconds: 4000,
    totalSeconds: 9000,
    breakCount: 8,
  },
};

export const ManyBreaks: Story = {
  args: {
    currentSeconds: 210,
    totalSeconds: 5400,
    breakCount: 23,
  },
};

// mirrors CyclingHud's bottom-right gaugeRow so the pause badge's overlap
// with the neighboring gauge can be checked against the bigger speed-gauge style
export const InGaugeRow: Story = {
  render: (args) => (
    <div className={`${hudStyles.gaugeRow}`} style={{ position: 'relative' }}>
      <Gauge
        accentClass={gaugeStyles.speed}
        levelClass={gaugeStyles.speedLevel2}
        big
        value={<NumberValue n={28} />}
        unit="km/h"
        secondaryValue={<NumberValue n={45} />}
      />
      <PauseGauge {...args} />
    </div>
  ),
  args: {
    currentSeconds: 95,
    totalSeconds: 720,
    breakCount: 3,
  },
};
