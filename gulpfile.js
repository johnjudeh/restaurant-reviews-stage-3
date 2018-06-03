const gulp = require('gulp');
const browserify = require('browserify');
const babelify = require('babelify');
const source = require('vinyl-source-stream');

// Default task
gulp.task('default', ['main-bundle', 'restaurant-bundle'], () => {
  gulp.watch('js/**/*.js', ['main-bundle', 'restaurant-bundle']);
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

// Bundles the and restaurant_info.js script with idb and serviceWorker
gulp.task('restaurant-bundle', () => {
  browserify('./js/restaurant_info.js')
    // Runs ES6 code through babel before bundling
    .transform(babelify, {presets: ["env"]})
    .bundle()
    // Coverts the bundle into a type of stream node is expectings
    .pipe(source('restaurant-bundle.js'))
    .pipe(gulp.dest('./js'));
});
