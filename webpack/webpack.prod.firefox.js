const { merge } = require('webpack-merge');
const common = require('./webpack.common.firefox.js');
const Dotenv = require('dotenv-webpack');
const path = require('path');

module.exports = merge(common, {
  mode: 'production',
  plugins: [new Dotenv({ path: './.env.firefox' })],
  output: {
    publicPath: '/js/',
    path: path.join(__dirname, '../build/firefox/prod/js'),
    filename: '[name].js',
  },
});
