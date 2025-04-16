import { resolve } from 'path';
import { defineConfig } from 'vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig(({ mode }) => {
  const isProduction = mode === 'production';

  const outDir = isProduction ? 'dist/chrome/prod' : 'dist/chrome/dev';

  const watch = isProduction
    ? null
    : {
        include: ['src/script/inject/**'],
      };

  return {
    define: {
      __APP_BROWSER__: JSON.stringify('chrome'),
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
      __APP_MODE__: JSON.stringify(mode),
    },
    plugins: [
      tsconfigPaths({ configNames: ['tsconfig.app.json'] }),
      nodePolyfills({
        include: ['stream', 'assert', 'os', 'url', 'http', 'https', 'crypto'],
      }),
    ],
    build: {
      outDir,
      emptyOutDir: false,
      minify: isProduction,
      watch,
      sourcemap: !isProduction,
      rollupOptions: {
        input: {
          inject: resolve(__dirname, 'src/script/inject/index.ts'),
        },
        output: [
          {
            entryFileNames: 'js/[name].js',
            assetFileNames: 'assets/[name].[ext]',
            format: 'iife',
            name: 'CosmostationInjectedScript',
            inlineDynamicImports: true,
          },
        ],
      },
    },
  };
});
