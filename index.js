/**
 * Created by gti on 01.08.16.
 */

var gulp = require('gulp');
var concata = require('gulp-concat');
var gnf = require('gulp-npm-files');
var less = require('gulp-less');
var path = require('path');
var runSequence = require('run-sequence').use(gulp);

gulp.task('less', function() {
    return gulp.src('./src/styles/*.less')
        .pipe(less({
            paths: [path.join(__dirname, 'less', 'includes')]
        }))
        .pipe(gulp.dest('./src/styles'));
});

gulp.task('css', ['less'], function() {
    return gulp.src([
        './src/styles/*.css'
    ])
        .pipe(concata('iguanachart.css'))
        .pipe(gulp.dest('./dist/'));
});

gulp.task('js', function() {
    return gulp.src([
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
        .pipe(concata('iguanachart.js'))
        .pipe(gulp.dest('./dist/'));
});

gulp.task('complete', function () {
    console.log('Build completed!');
});

runSequence('less', 'css', 'js', 'complete');


