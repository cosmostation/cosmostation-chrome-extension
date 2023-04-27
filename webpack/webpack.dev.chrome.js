const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const CopyPlugin = require('copy-webpack-plugin');
const Dotenv = require('dotenv-webpack');
const path = require('path');

module.exports = merge(common, {
  devtool: 'inline-source-map',
  mode: 'development',
  plugins: [
    new CopyPlugin({
      patterns: [{ from: '.', to: '../', context: 'chrome' }],
      options: {},
    }),
    new Dotenv({ path: './.env.chrome.development' }),
  ],
  output: {
    path: path.join(__dirname, '../build/chrome/dev/js'),
    filename: '[name].js',
  },
});
