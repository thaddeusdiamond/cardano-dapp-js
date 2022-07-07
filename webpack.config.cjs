const copyplugin = require('copy-webpack-plugin');
const path = require('path');
const webpack = require('webpack');

module.exports = {
  context: path.join(__dirname, 'src'),
  entry: './index.js',
  mode: 'production',

  experiments: {
    asyncWebAssembly: true,
    topLevelAwait: true,
    layers: true // optional, with some bundlers/frameworks it doesn't work without
  },

  output: {
    filename: 'cardano-dapp-js.js',
    library: 'CardanoDAppJs'
  },

  plugins: [
        // Work around for Buffer is undefined:
        // https://github.com/webpack/changelog-v5/issues/10
        new webpack.ProvidePlugin({
            Buffer: ['buffer', 'Buffer']
        }),

        new copyplugin({
          patterns: [
            { from: 'css/**/*', to: '[name][ext]' }
          ]
        }),

        new webpack.optimize.LimitChunkCountPlugin({
          maxChunks: 1, // disable creating additional chunks
        })
  ]

};
