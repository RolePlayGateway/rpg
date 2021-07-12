// # Fabric Webpack Config
// This file configures `webpack`, a build tool for JavaScript.
//
// We always enable JavaScript's "strict" mode first.
'use strict';

const webpack = require('webpack');
const path = require('path');

module.exports = {
  mode: 'development',
  entry: './scripts/rpg.js',
  target: 'web',
  output: {
    path: path.resolve(__dirname, 'assets/scripts'),
    filename: 'rpg.min.js'
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('production'),
        APP_ENV: JSON.stringify('browser')
      }
    })
  ]
};
