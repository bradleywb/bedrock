// Includes
var gulp = require('gulp'),
    config = require('./config.json'),
    jshint = require('gulp-jshint'),
    less = require('gulp-less'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    minifyCss = require('gulp-minify-css'),
    rename = require('gulp-rename'),
    csslint = require('gulp-csslint'),
    autoprefixer = require('gulp-autoprefixer'),
    newer = require('gulp-newer'),
    jscs = require('gulp-jscs'),
    csscomb = require('gulp-csscomb'),
    del = require('del'),
    path = require('path');

// Compile Our LESS
gulp.task('build:css', function() {
    var srcFiles = config.paths.src.less + '/_build.less',
        outPath = config.paths.dist.css;
    buildCss(srcFiles, outPath);
});

// Concatenate & Minify JS
gulp.task('build:js', function() {
    var srcFiles = config.paths.src.js + '/**/*.js',
        outPath = config.paths.dist.js;
    buildJs(srcFiles, outPath);
});

// Clean tasks
gulp.task('clean:dist:css', function(){
    var cleanPath = config.paths.dist.css;
    clean(cleanPath);
});
gulp.task('clean:dist:js', function(){
    var cleanPath = config.paths.dist.js;
    clean(cleanPath);
});
gulp.task('clean:dist:resource', function(){
    var cleanPath = config.paths.dist.resource;
    clean(cleanPath);
});
gulp.task('clean:dist', ['clean:dist:css', 'clean:dist:js', 'clean:dist:resource']);

// Copy tasks
gulp.task('copy:js', function(){
    var srcFiles = config.paths.src.js + '/**/*.js',
        outPath = config.paths.dist.js;
    copy(srcFiles, outPath);
});
gulp.task('copy:resource', function(){
    var srcFiles = config.paths.src.resource + '/**/*',
        outPath = config.paths.dist.resource;
    copy(srcFiles, outPath);
});

// Sync tasks
gulp.task('sync:js', ['clean:dist:js', 'copy:js']);
gulp.task('sync:resource', ['clean:dist:resource', 'copy:resource']);

// Watch Files For Changes
gulp.task('watch:less', function(){
    gulp.watch(config.paths.src.less + '/**/*.less', ['build:css']);
});
gulp.task('watch:js', function(){
    gulp.watch(config.paths.src.js + '/**/*.js', ['build:js']);
});
gulp.task('watch:resource', function(){
    gulp.watch(config.paths.src.resource + '/**/*', ['copy:resource'])
        .on('change', function(ev){
            if(ev.type === 'deleted'){
                var cleanPath = path.relative('./', ev.path).replace(config.paths.src.resource, config.paths.dist.resource);
                clean(cleanPath);
            }
        });
});

gulp.task('default', ['watch']);
gulp.task('build', ['build:less', 'build:js', 'sync:resource']);
gulp.task('watch', ['watch:less', 'watch:js', 'watch:resource']);

/**********************************************************/
/********************* FUNCTION DEFS **********************/
/**********************************************************/
function copy(src, dest){
    return gulp.src(src)
        .pipe(newer(dest))
        .pipe(gulp.dest(dest));
}

function clean(src){
    del(src, {force: true});
}

function buildJs(src, dest){
    return gulp.src(src)
        .pipe(jshint())
        .pipe(jshint.reporter('default'))
        .pipe(concat(config.jsFileName))
        .pipe(gulp.dest(dest))
        .pipe(rename(config.jsMinFileName))
        .pipe(uglify())
        .pipe(gulp.dest(dest));
}

function buildCss(src, dest){
    return gulp.src(src)
        .pipe(less(config.lessSettings))
        .pipe(rename(config.cssFileName))
        .pipe(autoprefixer(config.autoprefixerSettings))
        .pipe(csslint(config.cssLintSettings))
        .pipe(csslint.reporter())
        //.pipe(csslint.failReporter())
        .pipe(gulp.dest(dest))
        .pipe(rename(config.cssMinFileName))
        .pipe(minifyCss())
        .pipe(gulp.dest(dest));
}