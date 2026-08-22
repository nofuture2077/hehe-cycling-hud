import type { Preview } from '@storybook/react-vite';
import { withThemeByDataAttribute } from '@storybook/addon-themes';

const preview: Preview = {
  decorators: [
    withThemeByDataAttribute({
      themes: {
        classic: 'classic',
        mono: 'mono',
        cockpit: 'cockpit',
        japan: 'japan',
      },
      defaultTheme: 'classic',
      attributeName: 'data-theme',
    }),
  ],
};

export default preview;
