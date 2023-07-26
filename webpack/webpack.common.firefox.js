const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const CopyPlugin = require('copy-webpack-plugin');
const { WebpackManifestPlugin } = require('webpack-manifest-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = merge(common, {
  optimization: {
    splitChunks: {
      chunks(chunk) {
        const notChunks = ['injectScript'];
        return !notChunks.includes(chunk.name);
      },
      name: 'vendor',
      maxSize: 3145728,
    },
  },
  plugins: [
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
});
