const path = require('path');
const webpack = require('webpack');

// plugins
const AggressiveMergingPlugin = webpack.optimize.AggressiveMergingPlugin;
const CommonsChunkPlugin = webpack.optimize.CommonsChunkPlugin;
const DedupePlugin = webpack.optimize.DedupePlugin;
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const OccurenceOrderPlugin = webpack.optimize.OccurenceOrderPlugin;
const UglifyJsPlugin = webpack.optimize.UglifyJsPlugin;


module.exports = {
  cache: false,
  debug: true,
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
    filename: '[name].js',
    path: path.resolve('./target'),
    publicPath: '/'
  },

  resolve: {
    extensions: ['', '.js'],
    modulesDirectories: ['node_modules'],
    root: path.resolve('./src')
  },

  module: {
    loaders: [
      {test: /\.js$/, exclude: /node_modules/, loader: 'babel'},
      { test: /\.css$/, loader: 'style-loader!css-loader' },
      { test: /\.ico/, loader: "file" },
      { test: /\.eot(\?v=\d+\.\d+\.\d+)?$/, loader: "file" },
      { test: /\.(woff|woff2)$/, loader:"url?prefix=font/&limit=5000" },
      { test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/, loader: "url?limit=10000&mimetype=application/octet-stream" },
      { test: /\.svg(\?v=\d+\.\d+\.\d+)?$/, loader: "url?limit=10000&mimetype=image/svg+xml" },
      { test: /\.scss$/, loader: 'style!css!autoprefixer-loader?{browsers:["last 3 versions", "Firefox ESR"]}!sass' }
    ]
  },

  plugins: [
    new ExtractTextPlugin('styles.css'),
    new OccurenceOrderPlugin(),
    new DedupePlugin(),
    new AggressiveMergingPlugin(),
    new CommonsChunkPlugin('vendor', '[name].js'),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      hash: true,
      inject: 'body',
      template: './src/index.html',
      favicon: './src/favicon.ico'
    }),
    new UglifyJsPlugin({
      compress: {
        dead_code: true,
        screw_ie8: true,
        unused: true,
        warnings: false
      }
    })
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
