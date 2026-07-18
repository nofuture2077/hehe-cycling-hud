import type { Meta, StoryObj } from '@storybook/react-vite';
import { LocationChip } from './LocationChip';

const meta: Meta<typeof LocationChip> = {
  title: 'Cycling HUD/LocationChip',
  component: LocationChip,
  args: {
    city: 'Zugspitze',
    region: 'Bavaria',
    country: 'Germany',
    countryFlag: '🇩🇪',
    temperatureC: 18,
    localTime: '14:32',
  },
};
export default meta;

type Story = StoryObj<typeof LocationChip>;

export const Default: Story = {};

export const CityAndRegion: Story = {
  args: {
    showCity: true,
    showRegion: true,
  },
};

export const FullDetail: Story = {
  args: {
    showCity: true,
    showRegion: true,
    showCountry: true,
    showFlag: true,
    showTemperature: true,
    showLocalTime: true,
  },
};

export const LongText: Story = {
  args: {
    city: 'Passo dello Stelvio',
    region: 'Alta Valtellina',
    country: 'Italy',
    countryFlag: '🇮🇹',
    showRegion: true,
    showCountry: true,
  },
};

export const NoFlag: Story = {
  args: {
    showFlag: false,
  },
};
