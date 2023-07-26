const { merge } = require('webpack-merge');
const common = require('./webpack.common.firefox.js');
const Dotenv = require('dotenv-webpack');
const path = require('path');

module.exports = merge(common, {
  devtool: 'inline-source-map',
  mode: 'development',
  plugins: [new Dotenv({ path: './.env.firefox.development' })],
  output: {
    publicPath: '/js/',
    path: path.join(__dirname, '../build/firefox/dev/js'),
    filename: '[name].js',
  },
});
