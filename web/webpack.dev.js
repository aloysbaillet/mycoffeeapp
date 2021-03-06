const path = require('path');
const webpack = require('webpack');

// plugins
const HotModuleReplacementPlugin = webpack.HotModuleReplacementPlugin;
const HtmlWebpackPlugin = require('html-webpack-plugin');
const NoErrorsPlugin = webpack.NoErrorsPlugin;
const OccurenceOrderPlugin = webpack.optimize.OccurenceOrderPlugin;
const PurifyCssPlugin = require("purifycss-webpack-plugin");


module.exports = {
  cache: true,
  debug: true,
  devtool: 'inline-source-map',

  entry: {
    main: [
      'webpack-dev-server/client?http://localhost:5000',
      'webpack/hot/dev-server',
      './src/main.js'
    ]
  },

  output: {
    filename: '[name]-[hash].js',
    path: path.resolve('./target'),
    publicPath: '/'
  },

  resolve: {
    extensions: ['', '.js', '.scss'],
    modulesDirectories: ['node_modules'],
    root: path.resolve('./src')
  },

  module: {
    loaders: [
      {test: /\.js$/, exclude: /node_modules/, loader: 'babel', query: {
        plugins: [
          ['react-transform', {
            transforms: [{
              transform: 'react-transform-hmr',
              imports: ['react'],
              locals: ['module']
            }]
          }]
        ]
      }},
      { test: /\.css$/, loader: 'style-loader!css-loader' },
      { test: /\.ico/, loader: "file" },
      { test: /\.eot(\?v=\d+\.\d+\.\d+)?$/, loader: "file" },
      { test: /\.(woff|woff2)$/, loader:"url?prefix=font/&limit=5000" },
      { test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/, loader: "url?limit=10000&mimetype=application/octet-stream" },
      { test: /\.svg(\?v=\d+\.\d+\.\d+)?$/, loader: "url?limit=10000&mimetype=image/svg+xml" },
      { test: /\.scss$/, loader: 'style!css!autoprefixer-loader?{browsers:["last 3 versions", "Firefox ESR"]}!sass' }
    ]
  },

  sassLoader: {
    outputStyle: 'nested',
    precision: 10,
    sourceComments: false
  },

  plugins: [
    new OccurenceOrderPlugin(),
    new HotModuleReplacementPlugin(),
    new NoErrorsPlugin(),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      hash: true,
      inject: 'body',
      template: './src/index.html',
      favicon: './src/favicon.ico'
    }),
    new PurifyCssPlugin({
        basePath: __dirname,
        paths: [
          "src/*.html"
        ]
    })
  ],

  devServer: {
    contentBase: './src',
    historyApiFallback: true,
    hot: true,
    port: 5000,
    publicPath: '/',
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
  }
};
