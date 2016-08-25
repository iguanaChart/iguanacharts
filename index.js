/**
 * Created by gti on 01.08.16.
 */

var gulp = require('gulp');
var concata = require('gulp-concat');
var gnf = require('gulp-npm-files');

gulp.src([
    './src/styles/ichart.css',
    './src/styles/icons.css'
])
.pipe(concata('iguanachart.css'))
.pipe(gulp.dest('./dist/'));


gulp.src([
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
    './src/scripts/ta/TA_common.js'
])
.pipe(concata('iguanachart.js'))
.pipe(gulp.dest('./dist/'));


console.log("Build completed");