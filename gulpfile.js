/// <binding BeforeBuild='build:user' ProjectOpened='build:all' />
"use strict";

var gulp = require("gulp"),
    fs = require("fs"),
    del = require("del"),
    concat = require("gulp-concat"),
    cssmin = require("gulp-cssmin"),
    merge = require("merge-stream"),
    replace = require("gulp-replace"),
    flatten = require("gulp-flatten"),
    uglify = require("gulp-uglify"),
    livereload = require('gulp-livereload'),
    sass = require('gulp-sass');

var paths = {};

paths.projectBase = "./";
paths.webRoot = paths.projectBase;
paths.bowerBase = paths.projectBase + "bower_components/";
paths.appScriptsBase = paths.webRoot + "scripts/";
paths.appStylesBase = paths.webRoot + "sass/";
paths.libBase = paths.webRoot + "vendor/";

paths.appScriptsWildcard = paths.appScriptsBase + "**/*.js";
paths.appScriptsMinifiedWildcard = paths.appScriptsBase + "**/*.min.js";
paths.appStylesWildcard = paths.appStylesBase + "**/*.css";
paths.appStylesMinifiedWildcard = paths.appStylesBase + "**/*.min.css";

paths.appTargetScript = paths.appScriptsBase + "app.min.js";
paths.appTargetStyle = paths.appStylesBase + "app.min.css"
paths.libTargetScript = paths.libBase + "vendor.min.js";
paths.libTargetStyle = paths.libBase + "vendor.min.css";

paths.bowerLibraries = {
    "jquery": paths.bowerBase + "jquery/dist/jquery*.{js,map}",
    "angular": paths.bowerBase + "angular/angular*.{js,map}",
    "angular-route": paths.bowerBase + "angular-route/**/*.{js,map,css}",
};

// Removes the vendor folder completely
gulp.task("undeploy:vendor", function (cb) {
    console.log("Removing Folder: " + paths.libBase);
    del.sync(paths.libBase);
    return cb();
});

// Copies the relevant bower_component files to the vendor directory
gulp.task("copy:vendor", ["undeploy:vendor"], function (cb) {
    console.log('Copying Bower Libraries . . .');
    var streams = new Array();
    for (var destinationDir in paths.bowerLibraries) {
        streams[streams.length] = gulp.src(paths.bowerLibraries[destinationDir])
            .pipe(gulp.dest(paths.libBase + destinationDir));
        console.log("    Copied Library  '" + destinationDir + "'");
    };

    return merge(streams);
});

// Removes minified versions of files from the vendor folder
gulp.task("clean:vendor", ["copy:vendor"], function (cb) {
    console.log('Removing Minified Files . . .');

    var targets = [
        paths.libBase + "**/*.min.js",
        paths.libBase + "**/*.min.js.map",
        paths.libBase + "**/*.min.css",
        paths.libBase + "**/*.css.map",
        paths.libBase + "**/index.js"
    ];

    return del(targets);
});

// Minifies and flattens the vendor folder
gulp.task("build:vendor", ["clean:vendor"], function (cb) {
    var streams = new Array();

    var scriptTargets = new Array();
    var styleTargets = new Array();

    for (var destinationDir in paths.bowerLibraries) {
        // add the js files but not the min ones
        scriptTargets[scriptTargets.length] = paths.libBase + destinationDir + "/**/*.js";
        scriptTargets[scriptTargets.length] = "!" + paths.libBase + destinationDir + "/**/*min.js";

        // add the css files but not the min ones
        styleTargets[styleTargets.length] = paths.libBase + destinationDir + "/**/*.css";
        styleTargets[styleTargets.length] = "!" + paths.libBase + destinationDir + "/**/*min.css";
    };

    streams[streams.length] = gulp.src(scriptTargets)
        .pipe(uglify({
            outSourceMap: true,
            preserveComments: 'license'
        }))
        .pipe(concat(paths.libTargetScript))
        .pipe(gulp.dest(''));

    streams[streams.length] = gulp.src(styleTargets)
        .pipe(cssmin())
        .pipe(concat(paths.libTargetStyle))
        .pipe(gulp.dest(''));

    return merge(streams);

});

// Removes the minifier version of the application script
gulp.task("clean:scripts", function (cb) {
    return del(paths.appTargetScript);
});

// Removes the minified version of the application styles
gulp.task("clean:styles", function (cb) {
    return del(paths.appTargetStyle);
});

// Removes minified versions from scripts, styles and vendor folders
gulp.task("clean", ["clean:scripts", "clean:styles", "clean:vendor"]);

// Builds a minified, concatenated version the application's javascript
gulp.task("build:scripts", ["clean:scripts"], function () {
    return gulp.src([paths.appScriptsWildcard, "!" + paths.appScriptsMinifiedWildcard], { base: "." })
        .pipe(concat(paths.appTargetScript))
        .pipe(uglify()) // uncomment this line if you need to enable minification.
        .pipe(gulp.dest(""));
});

// Builds a minified, concatenated version of the application's css
gulp.task("build:styles", ["clean:styles"], function () {
    return gulp.src([paths.appStylesWildcard, "!" + paths.appStylesMinifiedWildcard])
        .pipe(concat(paths.appTargetStyle))
        .pipe(cssmin())
        .pipe(gulp.dest(""));
});

// Use this task to rebuild minified, concatenated versions of vendor, scripts and styles folder
gulp.task("build:all", ["build:scripts", "build:styles", "build:vendor"]);

// Use this task to only rebuild minified, concatenated versions of scripts and styles folders but excluding the vendor folder
gulp.task("build:user", ["build:scripts", "build:styles"]);

gulp.task('sass', function () {
  return gulp.src('./sass/**/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('./css'))
    .pipe(livereload());
});

gulp.task('serve', function() {
  livereload.listen();
  livereload();
  gulp.watch('./sass/**/*.scss', ['sass']);
  //gulp.watch('less/*.less', ['less']);
});
