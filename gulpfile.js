const path = require('path');
const gulp = require('gulp');
const concat = require('gulp-concat');
const less = require('gulp-less');
const rename = require('gulp-rename');
const postcss = require('gulp-postcss');
const uglify = require('gulp-uglify');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');

function compileCss(cb) {
  gulp
    .src('./src/styles/iguanachart.less')
    .pipe(less({
      paths: [path.join(__dirname, 'less', 'includes')]
    }))
    .pipe(gulp.dest('./dist'))
    .pipe(postcss([
      autoprefixer(),
      cssnano(),
    ]))
    .pipe(rename({ extname: '.min.css' }))
    .pipe(gulp.dest('./dist'));

  return cb();
}

function compileJs(cb) {
  gulp
    .src([
      './src/scripts/jquery.simplemodal.js',
      './src/scripts/jquery.palette.js',
      './src/scripts/lib/ichart.core.js',
      './src/scripts/lib/indicators.descr.js',
      './src/scripts/lib/charting/*',
      './src/scripts/templates.js',
      './src/scripts/chart_options_for_nt.js',
      './src/scripts/chart.js',
      './src/scripts/iguana-ui.js',
      './src/scripts/jquery.iguana-chart.js',
      './src/scripts/ta/TA_prototypes.js',
      './src/scripts/ta/functions/*',
      './src/scripts/ta/TA_common.js',
      './src/scripts/ta/TA_analyse_rs.js'
    ])
    .pipe(concat('iguanachart.js'))
    .pipe(gulp.dest('./dist/'))
    .pipe(uglify())
    .pipe(rename({ extname: '.min.js' }))
    .pipe(gulp.dest('./dist'));

  return cb();
}

function watchJs() {
  gulp.watch(['src/scripts/*.js'], compileJs)
}

exports.default = gulp.series(compileCss, compileJs);
exports.watchJs = watchJs;
