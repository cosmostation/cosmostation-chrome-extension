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
        include: ['src/script/service-worker/**'],
        exclude: ['src/proto/**'],
      };

  return {
    define: {
      __APP_BROWSER__: JSON.stringify('chrome'),
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
      __APP_MODE__: JSON.stringify(mode),
    },
    plugins: [tsconfigPaths({ configNames: ['tsconfig.app.json'] }), nodePolyfills()],
    build: {
      outDir,
      emptyOutDir: false,
      minify: isProduction,
      watch,
      sourcemap: !isProduction,
      rollupOptions: {
        input: {
          service_worker: resolve(__dirname, 'src/script/service-worker/index.ts'),
        },
        output: [
          {
            entryFileNames: 'js/[name].js',
            assetFileNames: 'assets/[name]-[hash].[ext]',
            inlineDynamicImports: true,
            format: 'es',
          },
        ],
      },
    },
  };
});
