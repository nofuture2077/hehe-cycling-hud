import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  IconPin,
  IconRoute,
  IconSpeed,
  IconPause,
  IconIncline,
  IconElevationUp,
  IconElevationDown,
} from './Icons';

const icons = [
  { name: 'IconPin', Icon: IconPin },
  { name: 'IconRoute', Icon: IconRoute },
  { name: 'IconSpeed', Icon: IconSpeed },
  { name: 'IconPause', Icon: IconPause },
  { name: 'IconIncline', Icon: IconIncline },
  { name: 'IconElevationUp', Icon: IconElevationUp },
  { name: 'IconElevationDown', Icon: IconElevationDown },
];

function AllIcons() {
  return (
    <div style={{ display: 'flex', gap: 32, color: '#4dd0e1' }}>
      {icons.map(({ name, Icon }) => (
        <div key={name} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <Icon />
          <span style={{ color: '#fff', fontSize: 12, fontFamily: 'sans-serif' }}>{name}</span>
        </div>
      ))}
    </div>
  );
}

const meta: Meta<typeof AllIcons> = {
  title: 'Cycling HUD/Icons',
  component: AllIcons,
};
export default meta;

type Story = StoryObj<typeof AllIcons>;

export const AllIconsRow: Story = {};
