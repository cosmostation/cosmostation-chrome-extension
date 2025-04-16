import { resolve } from 'path';
import { defineConfig } from 'vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import svgr from 'vite-plugin-svgr';
import tsconfigPaths from 'vite-tsconfig-paths';
import { TanStackRouterVite } from '@tanstack/router-plugin/vite';
import react from '@vitejs/plugin-react';

import extensionReloadPlugin from './vite.plugin/extensionReload';
import { firefoxManifestPlugin } from './vite.plugin/manifest';

export default defineConfig(({ mode }) => {
  const isProduction = mode === 'production';

  const outDir = isProduction ? 'dist/firefox/prod' : 'dist/firefox/dev';

  const webSocketPort = 5959;

  const modePlugins = isProduction ? [] : [extensionReloadPlugin(mode, webSocketPort)];

  const watch = isProduction
    ? null
    : {
        include: ['src/**', 'browser/**'],
      };

  const manifestPath = resolve(__dirname, 'browser/firefox/manifest.json');

  return {
    define: {
      __APP_BROWSER__: JSON.stringify('firefox'),
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
      __APP_MODE__: JSON.stringify(mode),
      __APP_DEV_WEBSOCKET_PORT__: JSON.stringify(webSocketPort),
    },
    plugins: [
      TanStackRouterVite({ routesDirectory: 'src/pages' }),
      react(),
      viteStaticCopy({
        targets: [{ src: 'browser/common/*', dest: 'extension-assets' }],
      }),
      firefoxManifestPlugin(manifestPath),
      tsconfigPaths({ configNames: ['tsconfig.app.json'] }),
      nodePolyfills(),
      svgr({
        svgrOptions: { exportType: 'default', ref: true, svgo: false, titleProp: true },
        include: '**/*.svg',
      }),
      ...modePlugins,
    ],
    build: {
      outDir,
      watch,
      sourcemap: !isProduction,
      rollupOptions: {
        input: {
          popup: resolve(__dirname, 'popup.html'),
          sidepanel: resolve(__dirname, 'sidepanel.html'),
          service_worker: resolve(__dirname, 'src/script/service-worker/index.ts'),
          inject: resolve(__dirname, 'src/script/inject/index.ts'),
          content: resolve(__dirname, 'src/script/content/index.ts'),
        },
        output: [
          {
            entryFileNames: 'js/[name]-[hash].js',
            assetFileNames: 'assets/[name]-[hash].[ext]',
            format: 'es',
          },
        ],
      },
    },
  };
});
