/**
 * Defines modules used in tasks below
 */
const gulp = require('gulp');
const browserSync = require('browser-sync').create();
const autoprefixer = require('gulp-autoprefixer');
const imagemin = require('gulp-imagemin');
const browserify = require('browserify');
const babelify = require('babelify');
const source = require('vinyl-source-stream');
const babel = require('gulp-babel');
const uglify = require('gulp-uglify');
const csso = require('gulp-csso');

/**
 * Default task - runs with gulp command in command line
 */
gulp.task('default', ['copy-html', 'copy-images', 'copy-icons', 'copy-manifest',
  'sw', 'styles', 'main-bundle', 'restaurant-bundle'], () => {

  // Watches files and reruns tasks if any change
  gulp.watch('css/*.css', ['styles'])
    .on('change', browserSync.reload);
  gulp.watch('js/**/*.js', ['main-bundle', 'restaurant-bundle'])
    .on('change', browserSync.reload);
  gulp.watch('./*.html', ['copy-html'])
    .on('change', browserSync.reload);
  gulp.watch('./manifest.json', ['copy-manifest'])
    .on('change', browserSync.reload);
  gulp.watch('./sw-src.js', ['sw'])
    .on('change', browserSync.reload);

  // Creates server from build directory
  browserSync.init({
    server: './build'
  });
});

/**
 * Task used to create production-ready code and run
 */
 gulp.task('serve', ['build'], () => {
   // Watches files and reruns tasks if any change
   gulp.watch('css/*.css', ['styles-prod'])
     .on('change', browserSync.reload);
   gulp.watch('js/**/*.js', ['scripts-prod'])
     .on('change', browserSync.reload);
   gulp.watch('./*.html', ['copy-html'])
     .on('change', browserSync.reload);
   gulp.watch('./manifest.json', ['copy-manifest'])
     .on('change', browserSync.reload);
   gulp.watch('./sw-src.js', ['sw'])
     .on('change', browserSync.reload);

   // Creates server from build directory
   browserSync.init({
     server: './build'
   });
 });

/**
 * Task used to create production-ready code
 */
gulp.task('build', [
  'copy-html',
  'copy-images',
  'copy-icons',
  'copy-manifest',
  'sw',
  'styles-prod',
  'scripts-prod'
]);

/**
 * Autoprefixes stylesheet
 */
gulp.task('styles', () => {
  return gulp.src('css/*.css')
    .pipe(autoprefixer({
      browsers: ['last 2 versions']
    }))
    .pipe(gulp.dest('./build/css'))
    .pipe(browserSync.stream());
});

/**
 * Move html to build folder
 */
gulp.task('copy-html', () => {
  return gulp.src('./*.html')
    .pipe(gulp.dest('./build'))
    .pipe(browserSync.stream());
});

/**
 * Copy images into build folder after lossless compression
 */
gulp.task('copy-images', () => {
  return gulp.src('./img/*')
    .pipe(imagemin())
    .pipe(gulp.dest('./build/img'));
});

/**
 * Copy icons into build folder after lossless compression
 */
gulp.task('copy-icons', () => {
  return gulp.src('./icon/*')
    .pipe(imagemin())
    .pipe(gulp.dest('./build/icon'));
});

/**
 * Copy manifest.json into the build folder
 */
gulp.task('copy-manifest', () => {
  return gulp.src('./manifest.json')
    .pipe(gulp.dest('./build'))
    .pipe(browserSync.stream());
});

/**
 * Bundles & babelifies sw-src.js.
 */
gulp.task('sw-bundle', () => {
  return browserify('./sw-src.js')
    // Runs ES6 code through babel before bundling
    .transform(babelify, {presets: ["env"]})
    .bundle()
    // Coverts the bundle into a type of stream node is expectings
    .pipe(source('sw.js'))
    .pipe(gulp.dest('./build'))
    .pipe(browserSync.stream());
});

/**
 * Minifies sw.js after bundling.
 */
gulp.task('sw', ['sw-bundle'], () => {
  return gulp.src('./build/sw.js')
    .pipe(uglify())
    .pipe(gulp.dest('./build'))
    .pipe(browserSync.stream());
});

/**
 * Bundles the and main.js script with idb and serviceWorker
 */
gulp.task('main-bundle', () => {
  return browserify('./js/main.js')
    // Runs ES6 code through babel before bundling
    .transform(babelify, {presets: ["env"]})
    .bundle()
    // Coverts the bundle into a type of stream node is expectings
    .pipe(source('main-bundle.js'))
    .pipe(gulp.dest('./build/js'))
    .pipe(browserSync.stream());
});

/**
 * Bundles the and restaurant_info.js script with idb and serviceWorker
 */
gulp.task('restaurant-bundle', () => {
  return browserify('./js/restaurant_info.js')
    // Runs ES6 code through babel before bundling
    .transform(babelify, {presets: ["env"]})
    .bundle()
    // Coverts the bundle into a type of stream node is expectings
    .pipe(source('restaurant-bundle.js'))
    .pipe(gulp.dest('./build/js'))
    .pipe(browserSync.stream());
});

/**
 * Autoprefixes and minifies stylesheet
 */
gulp.task('styles-prod', () => {
  return gulp.src('css/*.css')
    .pipe(autoprefixer({
      browsers: ['last 2 versions']
    }))
    .pipe(csso())
    .pipe(gulp.dest('./build/css'))
    .pipe(browserSync.stream());
});

/**
 * Minifies scripts after bundling tasks
 */
gulp.task('scripts-prod', ['main-bundle', 'restaurant-bundle'], () => {
  return gulp.src('./build/js/**/*.js')
    .pipe(uglify())
    .pipe(gulp.dest('./build/js'));
});
