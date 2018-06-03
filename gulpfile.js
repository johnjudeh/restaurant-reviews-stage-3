const gulp = require('gulp');
const browserify = require('browserify');
const babelify = require('babelify');
const source = require('vinyl-source-stream');

// Default task
gulp.task('default', ['main-bundle'], () => {
  gulp.watch('js/**/*.js', ['main-bundle']);
});

// Bundles the and main.js script with idb and serviceWorker
gulp.task('main-bundle', () => {
  browserify('./js/main.js')
    // Runs ES6 code through babel before bundling
    .transform(babelify, {presets: ["env"]})
    .bundle()
    // Coverts the bundle into a type of stream node is expectings
    .pipe(source('main-bundle.js'))
    .pipe(gulp.dest('./js'));
});
