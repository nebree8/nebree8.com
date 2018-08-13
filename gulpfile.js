var gulp = require('gulp');
var concat = require('gulp-concat');
var csso = require('gulp-csso');
var minify = require('gulp-minify');
var ngAnnotate = require('gulp-ng-annotate');
var postcss = require('gulp-postcss');
var sourcemaps = require('gulp-sourcemaps');
var ts = require('gulp-typescript');
var uglify = require('gulp-uglify');

var config = {
  htmlGlob: 'ng-app/**/*.html',
  cssGlob: 'ng-app/**/*.css',
  tsGlob: 'ng-app/**/*.ts',
};

gulp.task('html', function(){
  return gulp.src(config.htmlGlob, {base: "ng-app"})
    .pipe(gulp.dest('public/'))
});

gulp.task('css', function(){
  return gulp.src(config.cssGlob)
    .pipe(sourcemaps.init())
      .pipe(concat('app.css'))
      .pipe(postcss([require('postcss-nested'), require('autoprefixer')]))
      .pipe(csso())
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('public/'))
});

gulp.task('ts', function(){
  return gulp.src(config.tsGlob)
    .pipe(sourcemaps.init())
      .pipe(ts({
        noImplicitAny: true,
        target: "es3"
      }))
      .js.pipe(concat('app.js'))
      .pipe(ngAnnotate())
      .pipe(uglify())
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('public'))
});

gulp.task('watch', function() {
  gulp.watch(config.htmlGlob, [ 'html' ]);
  gulp.watch(config.cssGlob, [ 'css' ]);
  gulp.watch(config.tsGlob, [ 'ts' ]);
});

gulp.task('default', [ 'html', 'css', 'ts' ]);
