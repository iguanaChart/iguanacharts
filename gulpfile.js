/**
 * Created by gti on 01.08.16.
 */

const gulp = require('gulp');
const concat = require('gulp-concat');
const less = require('gulp-less');
const webserver = require('gulp-webserver');

const path = require('path');
const jsSources = [
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
    './src/scripts/ta/TA_analyse_rs.js',
];
const i18nSources = './src/scripts/i18n/*.js';

const lessSource = './src/styles/*.less';
gulp.task('less', function () {
    return gulp.src(lessSource)
        .pipe(less({
            paths: [path.join(__dirname, 'less', 'includes')],
        }))
        .pipe(gulp.dest('./src/styles'));
});
gulp.task('css', gulp.series('less', function () {
    return gulp.src([
            './src/styles/*.css',
        ])
        .pipe(concat('iguanachart.css'))
        .pipe(gulp.dest('./dist/'));
}));

gulp.task('js', function () {
    return gulp.src(jsSources)
        .pipe(concat('iguanachart.js'))
        .pipe(gulp.dest('./dist/'));
});

gulp.task('copy-resources', function () {
    return gulp.src('./src/scripts/i18n/i18n.en.js').pipe(gulp.dest('./dist/i18n'));
});

gulp.task('complete', function (cb) {
    console.log('\x1b[32m Build completed! \x1b[0m');
    cb();
});

gulp.task('default', gulp.series('less', 'css', 'js',  'complete'));

gulp.task('webserver', function () {
    return gulp.src('./')
        .pipe(webserver({
            port: 8080,
            fallback: 'example/index.html',
        }));
});
gulp.task('watch', function () {
    gulp.watch(jsSources, gulp.series('js'));
    gulp.watch(lessSource, gulp.series('less', 'css'));
})
gulp.task('dev', (done) => {
    gulp.parallel('webserver', 'watch')(done);
});
