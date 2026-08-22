import type { Preview } from '@storybook/react-vite';
import { withThemeByDataAttribute } from '@storybook/addon-themes';
import { VALID_THEMES, DEFAULT_THEME } from '../src/hud/theme';
import { VALID_LAYOUTS, DEFAULT_LAYOUT } from '../src/hud/layout';

const themeEntries = Object.fromEntries(VALID_THEMES.map((theme) => [theme, theme]));

const preview: Preview = {
  parameters: {
    backgrounds: {
      default: 'dark',
      values: [{ name: 'dark', value: '#14161a' }],
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: {
      test: 'todo',
    },
  },
  globalTypes: {
    layout: {
      name: 'Layout',
      description: 'HUD layout',
      defaultValue: DEFAULT_LAYOUT,
      toolbar: {
        icon: 'grid',
        items: VALID_LAYOUTS.map((layout) => ({ value: layout, title: layout })),
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: {
    layout: DEFAULT_LAYOUT,
  },
  decorators: [
    withThemeByDataAttribute({
      themes: themeEntries,
      defaultTheme: DEFAULT_THEME,
      attributeName: 'data-theme',
    }),
    (Story, context) => {
      if (context.args.config) {
        context.args = {
          ...context.args,
          config: {
            ...context.args.config,
            theme: context.globals.theme ?? context.args.config.theme,
            layout: context.globals.layout ?? context.args.config.layout,
          },
        };
      }
      return Story();
    },
  ],
};

export default preview;
