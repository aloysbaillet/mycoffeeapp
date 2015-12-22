var source = require('vinyl-source-stream');
var gulp = require('gulp');
var gutil = require('gulp-util');
var browserify = require('browserify');
var reactify = require('reactify');
var watchify = require('watchify');
var notify = require("gulp-notify");

var scriptsDir = './jsx';
var buildDir = './public';


function handleErrors() {
  var args = Array.prototype.slice.call(arguments);
  notify.onError({
    title: "Compile Error",
    message: "<%= error.message %>"
  }).apply(this, args);
  this.emit('end'); // Keep gulp from hanging on this task
}

gulp.task('browserify', function() {
    var bundler = browserify({
        entries: ['./jsx/mycoffeeapp.jsx'], // Only need initial file, browserify finds the deps
        transform: [reactify], // We want to convert JSX to normal javascript
        debug: true, // Gives us sourcemapping
        cache: {}, packageCache: {}, fullPaths: true // Requirement of watchify
    });
    var watcher  = watchify(bundler);

    return watcher
    .on('update', function () { // When any files update
        var updateStart = Date.now();
        console.log('Updating!');
        watcher.bundle() // Create new bundle that uses the cache for high performance
        .on('error', handleErrors)
        .pipe(source('bundle.js'))
        // This is where you add uglifying etc.
        .pipe(gulp.dest('./public/'));
        console.log('Updated!', (Date.now() - updateStart) + 'ms');
    })
    .bundle() // Create the initial bundle when starting the task
    .on('error', handleErrors)
    .pipe(source('bundle.js'))
    .pipe(gulp.dest('./public/'));
});

gulp.task('css', function () {
    gulp.watch('css/**/*.css', function () {
        return gulp.src('css/**/*.css')
        .pipe(concat('bundle.css'))
        .pipe(gulp.dest('public/'));
    });
});

gulp.task('default', ['browserify', 'css']);
