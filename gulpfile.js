"use strict";

let gulp = require("gulp");
let babel = require("gulp-babel");
let sourcemaps = require("gulp-sourcemaps");


gulp.task("module", function () {
    return gulp.src("js/es6/autoforms.js")
        .pipe(sourcemaps.init({loadMaps: true}))
        .pipe(babel({
            presets: ["es2015"]
        }))
        .pipe(sourcemaps.write("./"))
        .pipe(gulp.dest("js/compiled/"));
});
gulp.task("app", function () {
    return gulp.src("demo/es6/app.js")
        .pipe(babel({
            presets: ["es2015"]
        }))
        .pipe(gulp.dest("demo/compiled/"));
});

gulp.task("default", ["module", "app"]);
