const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const CopyPlugin = require('copy-webpack-plugin');
const Dotenv = require('dotenv-webpack');
const path = require('path');

module.exports = merge(common, {
  mode: 'production',
  plugins: [
    new CopyPlugin({
      patterns: [{ from: '.', to: '../', context: 'firefox' }],
      options: {},
    }),
    new Dotenv({ path: './.env.firefox' }),
  ],
  output: {
    path: path.join(__dirname, '../build/firefox/prod/js'),
    filename: '[name].js',
  },
});
