/**
 * Created by gti on 22.09.16.
 */

var gulp = require('gulp');

gulp.src([
    './src/scripts/i18n/*.js'
])
    .pipe(gulp.dest('./dist/i18n/'));