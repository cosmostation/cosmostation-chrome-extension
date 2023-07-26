const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = merge(common, {
  optimization: {
    splitChunks: {
      name: 'vendor',
      chunks(chunk) {
        const notChunks = ['background', 'injectScript'];
        return !notChunks.includes(chunk.name);
      },
    },
  },
  plugins: [
    new CopyPlugin({
      patterns: [{ from: '.', to: '../', context: 'chrome' }],
      options: {},
    }),
  ],
});
