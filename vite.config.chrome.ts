import { readFileSync } from 'fs';
import { resolve } from 'path';
import { NormalizedOutputOptions, OutputBundle } from 'rollup';
import { defineConfig, PluginOption } from 'vite';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import { TanStackRouterVite } from '@tanstack/router-plugin/vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const isProduction = mode === 'production';

  const dir = isProduction ? 'dist' : 'dist-dev';

  return {
    plugins: [
      react(),
      viteStaticCopy({
        targets: [{ src: 'browser/common/*', dest: 'extension-assets' }],
      }),
      chromeManifestPlugin(),
      TanStackRouterVite(),
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
      outDir: dir,
      watch: isProduction
        ? null
        : {
            include: ['src/**', 'browser/**'],
          },
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
            format: 'cjs',
          },
        ],
      },
    },
  };
});

function chromeManifestPlugin(): PluginOption {
  const manifestPath = resolve(__dirname, 'browser/chrome/manifest.json');
  const tmpPath = resolve(__dirname, 'src/routes/tmp.tsx');
  console.log(process.env.npm_package_version);
  return {
    name: 'chrome-manifest',
    enforce: 'post',
    buildStart() {
      this.addWatchFile(manifestPath);
      this.addWatchFile(tmpPath);
    },
    async generateBundle(_: NormalizedOutputOptions, bundle: OutputBundle) {
      const chromeManifest = JSON.parse(readFileSync(manifestPath, 'utf-8'));
      const prefix = 'js';
      const files = Object.keys(bundle);

      const filesWithoutMap = files.filter((file) => !file.endsWith('.map'));

      const serviceWorker = filesWithoutMap.find((file) => file.includes(`${prefix}/service_worker`));
      const inject = filesWithoutMap.filter((file) => file.includes(`${prefix}/inject`));
      const content = filesWithoutMap.filter((file) => file.includes(`${prefix}/content`));

      const withJs = {
        version: process.env.npm_package_version,
        background: {
          service_worker: serviceWorker,
        },
        web_accessible_resources: [
          {
            resources: inject,
            matches: ['<all_urls>'],
          },
        ],
        content_scripts: [
          {
            matches: ['<all_urls>'],
            js: content,
            run_at: 'document_start',
            all_frames: true,
          },
        ],
      };

      const manifest = { ...chromeManifest, ...withJs };

      this.emitFile({
        type: 'asset',
        fileName: 'manifest.json',
        source: JSON.stringify(manifest),
      });
    },
  };
}
