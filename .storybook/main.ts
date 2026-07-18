import type { StorybookConfig } from '@storybook/react-vite';
import tsconfigPaths from 'vite-tsconfig-paths';

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: ['@storybook/addon-a11y', '@storybook/addon-docs', '@storybook/addon-themes'],
  framework: '@storybook/react-vite',
  viteFinal: async (viteConfig) => {
    viteConfig.plugins ??= [];
    viteConfig.plugins.push(tsconfigPaths());
    return viteConfig;
  },
};
export default config;
