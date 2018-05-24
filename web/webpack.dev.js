const path = require('path');
const webpack = require('webpack');
const glob = require('glob');

// plugins
const HotModuleReplacementPlugin = webpack.HotModuleReplacementPlugin;
const HtmlWebpackPlugin = require('html-webpack-plugin');
const NoEmitOnErrorsPlugin = webpack.NoEmitOnErrorsPlugin;
const OccurrenceOrderPlugin = webpack.optimize.OccurrenceOrderPlugin;
const PurifyCssPlugin = require("purifycss-webpack");


module.exports = {
  cache: true,
  devtool: 'inline-source-map',
  mode: 'development',
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
    extensions: ['.js', '.scss'],
    modules: ['./src', 'node_modules']
  },

  module: {
    rules: [
      {test: /\.js$/, exclude: /node_modules/, loader: 'babel-loader', query: {
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
      { test: /\.ico/, loader: "file-loader" },
      { test: /\.eot(\?v=\d+\.\d+\.\d+)?$/, loader: "file-loader" },
      { test: /\.(woff|woff2)$/, loader:"url?prefix=font/&limit=5000" },
      { test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/, loader: "url?limit=10000&mimetype=application/octet-stream" },
      { test: /\.svg(\?v=\d+\.\d+\.\d+)?$/, loader: "url?limit=10000&mimetype=image/svg+xml" },
      { test: /\.scss$/, loader: 'style-loader!css-loader!autoprefixer-loader?{browsers:["last 3 versions", "Firefox ESR"]}!sass' }
    ]
  },

  plugins: [
    new OccurrenceOrderPlugin(),
    new HotModuleReplacementPlugin(),
    new NoEmitOnErrorsPlugin(),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      hash: true,
      inject: 'body',
      template: './src/index.html',
      favicon: './src/favicon.ico'
    }),
    new PurifyCssPlugin({
      paths: glob.sync(path.join(__dirname, 'src/*.html'))
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
