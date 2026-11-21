import type { Meta, StoryObj } from '@storybook/react-vite';
import type { CyclingData } from '../core';
import { defaultConfig } from '../core';
import { LocationChip } from './LocationChip';
import { weatherParts } from './weather';

const meta: Meta<typeof LocationChip> = {
  title: 'Cycling HUD/LocationChip',
  component: LocationChip,
  args: {
    city: 'Zugspitze',
    region: 'Bavaria',
    country: 'Germany',
    countryFlag: '🇩🇪',
    localTime: '14:32',
  },
};
export default meta;

type Story = StoryObj<typeof LocationChip>;

const weatherData = {
  temperatureC: 18,
  feelsLikeC: 15,
  windKmh: 14,
  windGustKmh: 27,
  windDirectionDeg: 240,
  humidity: 0.62,
} as CyclingData;

// the chip's weather parts for a condition, as the HUD builds them
function weather(condition: string, isDaylight: boolean, more: Partial<typeof defaultConfig.visible> = {}) {
  return weatherParts(
    { ...weatherData, weatherCondition: condition, isDaylight },
    { ...defaultConfig.visible, locationTemperature: true, ...more },
    defaultConfig.texts,
    '°C',
  );
}

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
    weather: weather('partlyCloudy', true, { locationFeelsLike: true, locationWind: true, locationHumidity: true }),
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

export const WeatherClear: Story = { args: { weather: weather('clear', true) } };
export const WeatherPartlyCloudy: Story = { args: { weather: weather('partlyCloudy', true) } };
export const WeatherCloudy: Story = { args: { weather: weather('cloudy', true) } };
export const WeatherFoggy: Story = { args: { weather: weather('foggy', true) } };
export const WeatherWindy: Story = { args: { weather: weather('windy', true) } };
export const WeatherDrizzle: Story = { args: { weather: weather('drizzle', true) } };
export const WeatherRain: Story = { args: { weather: weather('rain', true) } };
export const WeatherHeavyRain: Story = { args: { weather: weather('heavyRain', true) } };
export const WeatherSnow: Story = { args: { weather: weather('snow', true) } };
export const WeatherThunderstorms: Story = { args: { weather: weather('thunderstorms', true) } };
export const WeatherClearNight: Story = { args: { weather: weather('clear', false) } };
