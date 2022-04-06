const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const Dotenv = require('dotenv-webpack');
const path = require('path');

module.exports = merge(common, {
  mode: 'production',
  plugins: [new Dotenv()],
  output: {
    path: path.join(__dirname, '../prod/js'),
    filename: '[name].js',
  },
});
