import { resolve } from 'path';
import { defineConfig } from 'vite';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import tsconfigPaths from 'vite-tsconfig-paths';
import { TanStackRouterVite } from '@tanstack/router-plugin/vite';
import react from '@vitejs/plugin-react';

import extensionReloadPlugin from './vite.plugin/extensionReload';
import { chromeManifestPlugin } from './vite.plugin/manifest';

export default defineConfig(({ mode }) => {
  const isProduction = mode === 'production';

  const outDir = isProduction ? 'dist' : 'dist-dev';

  const webSocketPort = 5959;

  const modePlugins = isProduction ? [] : [extensionReloadPlugin(mode, webSocketPort)];

  const watch = isProduction
    ? null
    : {
        include: ['src/**', 'browser/**'],
      };

  const manifestPath = resolve(__dirname, 'browser/chrome/manifest.json');

  return {
    define: {
      __APP_BROWSER__: JSON.stringify('chrome'),
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
      chromeManifestPlugin(manifestPath),
      tsconfigPaths({ configNames: ['tsconfig.app.json'] }),
      ...modePlugins,
    ],
    resolve: {
      alias: [
        { find: '@', replacement: resolve(__dirname, 'src/') },
        {
          find: '@components',
          replacement: resolve(__dirname, 'src/components'),
        },
        {
          find: '@pages',
          replacement: resolve(__dirname, 'src/pages'),
        },
      ],
    },
    build: {
      outDir,
      watch,
      sourcemap: !isProduction,
      rollupOptions: {
        input: {
          popup: resolve(__dirname, 'popup.html'),
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
