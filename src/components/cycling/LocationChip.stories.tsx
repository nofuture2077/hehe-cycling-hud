import type { Meta, StoryObj } from '@storybook/react-vite';
import { LocationChip } from './LocationChip';

const meta: Meta<typeof LocationChip> = {
  title: 'Cycling HUD/LocationChip',
  component: LocationChip,
};
export default meta;

type Story = StoryObj<typeof LocationChip>;

export const Default: Story = {
  args: {
    location: 'Zugspitze, Bavaria',
  },
};

export const LongText: Story = {
  args: {
    location: 'Passo dello Stelvio, Alta Valtellina, Lombardy',
  },
};
