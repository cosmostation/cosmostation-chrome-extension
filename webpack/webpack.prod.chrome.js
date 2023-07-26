const { merge } = require('webpack-merge');
const common = require('./webpack.common.chrome.js');
const Dotenv = require('dotenv-webpack');
const path = require('path');

module.exports = merge(common, {
  mode: 'production',
  plugins: [new Dotenv({ path: './.env.chrome' })],
  output: {
    path: path.join(__dirname, '../build/chrome/prod/js'),
    filename: '[name].js',
  },
});
