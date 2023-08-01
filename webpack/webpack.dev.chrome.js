const { merge } = require('webpack-merge');
const common = require('./webpack.common.chrome.js');
const Dotenv = require('dotenv-webpack');
const path = require('path');

module.exports = merge(common, {
  devtool: 'inline-source-map',
  mode: 'development',
  plugins: [new Dotenv({ path: './.env.chrome.development' })],
  output: {
    path: path.join(__dirname, '../build/chrome/dev/js'),
    filename: '[name].js',
  },
});
