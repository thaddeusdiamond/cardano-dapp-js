const copyplugin = require('copy-webpack-plugin');
const path = require('path');
const webpack = require('webpack');

module.exports = {
  context: path.join(__dirname, 'src'),
  entry: './index.js',
  mode: 'production',

  output: {
    filename: 'cardano-dapp-js.js',
    library: 'CardanoDAppJs'
  },

  plugins: [
        new copyplugin({
          patterns: [
            { from: 'css/**/*', to: '[name][ext]' }
          ]
        }),

        new webpack.optimize.LimitChunkCountPlugin({
          maxChunks: 1, // disable creating additional chunks
        })
  ],

};
