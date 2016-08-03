'use strict';

var gulp = require('gulp');
var babel = require('gulp-babel');


gulp.task('module', function () {
    return gulp.src('js/es6/autoforms.js')
        .pipe(babel({
            presets: ['es2015']
        }))
        .pipe(gulp.dest('js/compiled/'));
});
gulp.task('app', function () {
    return gulp.src('demo/es6/app.js')
        .pipe(babel({
            presets: ['es2015']
        }))
        .pipe(gulp.dest('demo/compiled/'));
});

gulp.task('default', ['module','app']);