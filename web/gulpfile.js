'use strict';

const browserSync   = require('browser-sync');
const del           = require('del');
const eslint        = require('gulp-eslint');
const gulp          = require('gulp');
const header        = require('gulp-header');
const historyApi    = require('connect-history-api-fallback');
const karma         = require('karma');
const path          = require('path');
const webpack       = require('webpack');
const WebpackServer = require("webpack-dev-server");
const PluginError   = require('plugin-error');
const colors        = require('ansi-colors');
var log             = require('fancy-log');

//=========================================================
//  PATHS
//---------------------------------------------------------
const paths = {
  src: {
    html: 'src/*.html',
    js: 'src/**/*.js'
  },

  target: 'target'
};


//=========================================================
//  CONFIG
//---------------------------------------------------------
const config = {
  browserSync: {
    files: [paths.target + '/**'],
    notify: false,
    open: false,
    port: 5000,
    server: {
      baseDir: paths.target
    }
  },

  eslint: {
    src: paths.src.js
  },

  header: {
    src: paths.target + '/{src/main.js,src/styles/main.scss}',
    template: '/* <%= name %> v<%= version %> - <%= date %> - <%= url %> */\n'
  },

  karma: {
    configFile: path.resolve('./karma.config.js')
  },

  webpack: {
    dev: './webpack.dev',
    dist: './webpack.dist'
  }
};


//=========================================================
//  TASKS
//---------------------------------------------------------
gulp.task('clean.target', () => del(paths.target));


gulp.task('headers', () => {
  let pkg = require('./package.json');
  let headerContent = {date: (new Date()).toISOString(), name: pkg.name, version: pkg.version, url: pkg.homepage};

  return gulp.src(config.header.src)
    .pipe(header(config.header.template, headerContent))
    .pipe(gulp.dest(paths.target));
});


gulp.task('js', done => {
  let conf = require(config.webpack.dist);
  webpack(conf).run((error, stats) => {
    if (error) throw new PluginError('webpack', error);
    log(stats.toString(conf.stats));
    done();
  });
});


gulp.task('lint', () => {
  return gulp.src(config.eslint.src)
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
});


gulp.task('serve', done => {
  config.browserSync.server.middleware = [historyApi()];
  browserSync.create()
    .init(config.browserSync, done);
});


gulp.task('serve.dev', done => {
  let conf = require(config.webpack.dev);
  let compiler = webpack(conf);

  let server = new WebpackServer(compiler, conf.devServer);

  server.listen(conf.devServer.port, 'localhost', () => {
    log(colors.gray('-------------------------------------------'));
    log('WebpackDevServer:', colors.magenta(`http://localhost:${conf.devServer.port}`));
    log(colors.gray('-------------------------------------------'));
    done();
  });
});


//===========================
//  BUILD
//---------------------------
gulp.task('build', gulp.series(
  'clean.target',
  'js'
));


//===========================
//  DEVELOP
//---------------------------
gulp.task('default', gulp.task('serve.dev'));


//===========================
//  TEST
//---------------------------
function karmaServer(options, done) {
  let server = new karma.Server(options, error => {
    if (error) process.exit(error);
    done();
  });
  server.start();
}


gulp.task('test', done => {
  config.karma.singleRun = true;
  karmaServer(config.karma, done);
});


gulp.task('test.watch', done => {
  karmaServer(config.karma, done);
});


//===========================
//  RELEASE
//---------------------------
gulp.task('dist', gulp.series(
  'lint',
  'test',
  'clean.target',
  'js',
  'headers'
));
