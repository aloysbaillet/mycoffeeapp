const path = require('path');
const glob = require('glob');
const webpack = require('webpack');

// plugins
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const PurifyCssPlugin = require("purifycss-webpack");

module.exports = {
  mode: 'production',
  cache: false,
  devtool: 'source-map',

  entry: {
    main: './src/main.js',
    vendor: [
      'classnames',
      'firebase',
      'history',
      'react',
      'react-dom',
      'react-router'
    ]
  },

  output: {
    filename: '[name]-[hash].js',
    path: path.resolve('./target'),
    publicPath: '/'
  },

  resolve: {
    extensions: ['.js'],
    modules: ['./src', 'node_modules']
  },

  module: {
    rules: [
      { test: /\.js$/, exclude: /node_modules/, loader: 'babel-loader' },
      { test: /\.css$/, loader: 'style-loader!css-loader' },
      { test: /\.ico/, loader: "file-loader" },
      { test: /\.eot(\?v=\d+\.\d+\.\d+)?$/, loader: "file-loader" },
      { test: /\.(woff|woff2)$/, loader:"url?prefix=font/&limit=5000" },
      { test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/, loader: "url?limit=10000&mimetype=application/octet-stream" },
      { test: /\.svg(\?v=\d+\.\d+\.\d+)?$/, loader: "url?limit=10000&mimetype=image/svg+xml" },
      { test: /\.scss$/, loader: 'style-loader!css!autoprefixer-loader?{browsers:["last 3 versions", "Firefox ESR"]}!sass' }
    ]
  },

  plugins: [
    new ExtractTextPlugin('styles-[hash].css'),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      hash: true,
      inject: 'body',
      template: './src/index.html',
      favicon: './src/favicon.ico'
    }),
    new PurifyCssPlugin({
      paths: glob.sync(path.join(__dirname, 'src/*.html'))
    }),
    new webpack.optimize.AggressiveSplittingPlugin()
  ],

  stats: {
    cached: true,
    cachedAssets: true,
    chunks: true,
    chunkModules: false,
    colors: true,
    hash: false,
    reasons: true,
    timings: true,
    version: false
  }
};
