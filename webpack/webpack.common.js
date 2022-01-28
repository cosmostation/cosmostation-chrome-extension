const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const webpack = require('webpack');
const Dotenv = require('dotenv-webpack');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

const srcDir = path.join(__dirname, '..', 'src');

module.exports = {
  entry: {
    popup: path.join(srcDir, 'Popup/index.tsx'),
    options: path.join(srcDir, 'Options/index.tsx'),
    background: path.join(srcDir, 'Popup/background/index.ts'),
    contentScript: path.join(srcDir, 'Scripts/contentScript.ts'),
    injectScript: { import: path.join(srcDir, 'Scripts/injectScript.ts') },
  },
  output: {
    path: path.join(__dirname, '../dist/js'),
    filename: '[name].js',
  },
  optimization: {
    splitChunks: {
      name: 'vendor',
      chunks(chunk) {
        const notChunks = ['background', 'injectScript'];
        return !notChunks.includes(chunk.name);
      },
    },
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(png|jpe?g|gif)$/i,
        loader: 'file-loader',
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
    new CopyPlugin({
      patterns: [{ from: '.', to: '../', context: 'public' }],
      options: {},
    }),
    new webpack.ProvidePlugin({
      process: 'process/browser',
      Buffer: ['buffer', 'Buffer'],
    }),
  ],
};
