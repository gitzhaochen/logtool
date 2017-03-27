var gulp = require('gulp');
var less = require('gulp-less');
var del = require('del');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var htmlmin = require('gulp-htmlmin');
var gulpSequence = require('gulp-sequence');
var cssmin = require('gulp-clean-css');
var autoprefixer = require('gulp-autoprefixer');
var noop = require("gulp-noop");
var RevAll = require('gulp-rev-all');
var config = {
    app: "logtool",
    src: "app",
    dist: "dist",
    production:process.argv.splice(2,1).join()==='build'
};
gulp.task('deployNoCache', function () {
    var ignoreImgs = ['index.html'];
    var finalDest = "release/dist";
    gulp
        .src(['dist/**'])
        .pipe(RevAll.revision({dontRenameFile:ignoreImgs}))
        .pipe(gulp.dest(finalDest))
        .pipe(RevAll.manifestFile())
        .pipe(gulp.dest('manifest'));
});
gulp.task('clean:dist',function(){
    console.log(config.production?'发布环境':'开发环境');
    var dir = [config.dist,'release'];
    var option = {dot:true};
    return del(dir,option);
});

gulp.task('less', function () {
    return gulp.src(["styles/*.less"],{
        cwd: config.src,
        dot: true,
        base: config.src
    })
        .pipe(less())
        .pipe(autoprefixer())
        .pipe(config.production?cssmin(): noop())
        .pipe(gulp.dest(config.dist))
});

gulp.task('less:watch', function() {
    gulp.watch(config.src+"/styles/*.less", ['less'])
});


gulp.task('jsconcat', function() {
    var libsJS=[
        "node_modules/jquery/dist/jquery.js",
        config.src + "/scripts/server.config.js",
        config.src + "/scripts/main.js"];
    return gulp.src(libsJS)
        .pipe(concat('bundle.js'))
        .pipe(config.production?uglify(): noop())
        .pipe(gulp.dest(config.dist + "/scripts"));

});
gulp.task('js:watch',function(){
    gulp.watch([config.src+"/**/*.js"],['jsconcat']);
});
gulp.task('copyIndexHtml', function() {
    return gulp.src(["index.html"], {
        cwd: config.src,
        dot: true,
        base: config.src
    })
        .pipe(gulp.dest(config.dist));
});
gulp.task('htmlmin', function() {
    return gulp.src([config.dist+"/index.html"])
        .pipe(htmlmin({collapseWhitespace: true}))
        .pipe(gulp.dest(config.dist));
});
gulp.task('indexhtml:watch', function(){
    gulp.watch([config.src+"/index.html"],['copyIndexHtml']);
});


// 开发环境
gulp.task('dev', gulpSequence(
    "clean:dist",
    "less",
    "jsconcat",
    "copyIndexHtml",
    "less:watch",
    "js:watch",
    "indexhtml:watch"
));

// 发布环境
gulp.task('build', gulpSequence(
    "clean:dist",
    "less",
    "jsconcat",
    "copyIndexHtml",
    "htmlmin",
    "deployNoCache"
));

