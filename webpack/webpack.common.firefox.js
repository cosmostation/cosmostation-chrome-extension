const path = require('path');
const webpack = require('webpack');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const srcDir = path.join(__dirname, '..', 'src');

const CopyPlugin = require('copy-webpack-plugin');
const { WebpackManifestPlugin } = require('webpack-manifest-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: {
    popup: path.join(srcDir, 'Popup/index.tsx'),
    background: path.join(srcDir, 'Popup/background/index.ts'),
    contentScript: path.join(srcDir, 'Scripts/contentScript.ts'),
    injectScript: { import: path.join(srcDir, 'Scripts/injectScript/index.ts') },
    warningScript: { import: path.join(srcDir, 'Scripts/warningScript.ts') },
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: {
          loader: 'ts-loader',
          options: {
            reportFiles: ['src/**/*.{ts,tsx}'],
          },
        },
        exclude: /node_modules/,
      },
      {
        test: /\.(png|jpe?g|gif|ttf)$/,
        type: 'asset/resource',
        generator: {
          filename: '[path][name][ext]',
        },
      },
      {
        test: /\.m?js/,
        resolve: {
          fullySpecified: false,
        },
      },
      {
        test: /\.svg$/,
        use: ['@svgr/webpack'],
      },
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
    plugins: [new TsconfigPathsPlugin()],
    fallback: {
      stream: 'stream-browserify',
      assert: 'assert',
      os: 'os-browserify',
      url: 'url',
      http: 'stream-http',
      https: 'https-browserify',
      crypto: 'crypto-browserify',
    },
  },
  plugins: [
    new webpack.ProvidePlugin({
      process: 'process/browser',
      Buffer: ['buffer', 'Buffer'],
    }),
    new CopyPlugin({
      patterns: [
        {
          from: '.',
          to: '../',
          context: 'firefox',
          filter: (resourcePath) => !(resourcePath.endsWith('manifest.json') || resourcePath.endsWith('popup.html')),
        },
      ],
      options: {},
    }),
    new HtmlWebpackPlugin({
      filename: '../popup.html',
      excludeChunks: ['background', 'contentScript', 'injectScript'],
      template: 'firefox/popup.html',
    }),
    new WebpackManifestPlugin({
      fileName: '../manifest.json',
      seed: require('../firefox/manifest.json'),
      generate: (seed, _, entries) => {
        const manifest = {
          ...seed,
          background: {
            scripts: entries.background.map((item) => `js/${item}`),
          },
          content_scripts: [{ ...seed.content_scripts[0], js: entries.contentScript.map((item) => `js/${item}`) }],
          web_accessible_resources: [{ ...seed.web_accessible_resources[0], resources: entries.injectScript.map((item) => `js/${item}`) }],
        };
        return manifest;
      },
    }),
  ],
  optimization: {
    splitChunks: {
      chunks(chunk) {
        const notChunks = ['injectScript'];
        return !notChunks.includes(chunk.name);
      },
      name: false,
      cacheGroups: {
        default: {
          maxSize: 3145728,
          maxInitialRequests: 100,
          maxAsyncRequests: 100,
        },
      },
    },
  },
};
