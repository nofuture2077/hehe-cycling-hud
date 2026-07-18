import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import fs from 'fs';
import path from 'path';

// Plugin to inject version into manifest.json during build
function injectVersionPlugin() {
  return {
    name: 'inject-version',
    generateBundle() {
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      const version = packageJson.version;

      const manifestPath = path.resolve('public/manifest.json');
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
      manifest.version = version;

      this.emitFile({
        type: 'asset',
        fileName: 'manifest.json',
        source: JSON.stringify(manifest, null, 2),
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), tsconfigPaths(), injectVersionPlugin()],
});
