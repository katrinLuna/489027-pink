"use strict";

var gulp = require("gulp");
var sass = require("gulp-sass");
var plumber = require("gulp-plumber");
var autoprefixer = require("autoprefixer");
var rename = require("gulp-rename");
var posthtml = require("gulp-posthtml");
var include = require("posthtml-include");
var htmlmin = require('gulp-htmlmin');
var postcss = require("gulp-postcss");
var minify = require("gulp-csso");
var uglify = require('gulp-uglify');
var imagemin = require("gulp-imagemin");
var webp = require("gulp-webp");
var svgstore = require("gulp-svgstore");
var run = require("run-sequence");
var del = require("del");
var server = require("browser-sync").create();

gulp.task("html", function () {
  return gulp.src("source/*.html")
    .pipe(posthtml([
      include()
    ]))
    .pipe(htmlmin({collapseWhitespace: true}))
    .pipe(gulp.dest("build"));
});

gulp.task("style", function() {
  gulp.src("source/sass/*.scss")
    .pipe(plumber())
    .pipe(sass())
    .pipe(postcss([
      autoprefixer()
    ]))
    .pipe(gulp.dest("build/css"))
    .pipe(minify())
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest("build/css"))
    .pipe(server.stream());
});

gulp.task("js", function () {
  return gulp.src("source/js/**/*.js")
    .pipe(uglify())
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest("build/js"))
    .pipe(server.stream());
});

gulp.task("images", function() {
  gulp.src("source/img/**/*.{png,jpg,svg}")
    .pipe(imagemin([
      imagemin.optipng({optimizationLevel: 3}),
      imagemin.jpegtran({progressive: true}),
      imagemin.svgo()
    ]))
    .pipe(gulp.dest("source/img"));
});

gulp.task("webp", function () {
  return gulp.src("source/img/**/*.{png,jpg}")
    .pipe(webp({quality: 90}))
    .pipe(gulp.dest("source/img"));
});

gulp.task("sprite", function () {
  return gulp.src([
      'source/img/icon-yes.svg',
      'source/img/icon-no.svg',
      'source/img/logo-htmlacademy.svg',
      'source/img/icon-editor-crop.svg',
      'source/img/icon-editor-fill.svg',
      'source/img/icon-editor-contrast.svg',
      'source/img/logo-pink-*.svg',
      'source/img/icon-menu-*.svg',
      'source/img/icon-review-*.svg'
    ])
    .pipe(svgstore({
      inlineSvg: true
    }))
    .pipe(rename("sprite.svg"))
    .pipe(gulp.dest("build/img"));
});

gulp.task("copy", function () {
  return gulp.src([
    "source/fonts/**/*.{woff,woff2}",
    "source/img/**",
    "source/js/**"
  ], {
    base: "source"
  })
    .pipe(gulp.dest("build"));
});

gulp.task("clean", function () {
  return del("build");
 });

gulp.task("build", function(done) {
  run(
    "clean",
    "copy",
    "style",
    "sprite",
    "html",
    "js",
    done
  );
});

gulp.task("serve", function() {
  server.init({
    server: "build/"
  });

  gulp.watch("source/sass/**/*.{scss,sass}", ["style"]);
  gulp.watch("source/js/**/*.js", ["js"]);
  gulp.watch("source/*.html", ["html"]).on("change", server.reload);
});
