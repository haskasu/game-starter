var gulp = require('gulp');
var run = require('gulp-run');
var gutil = require('gulp-util');
var ftp = require('vinyl-ftp');
var minify = require('gulp-minify');
var concat = require('gulp-concat');
var gts = require('gulp-typescript');
var copy = require('gulp-copy');

function deploy() {
    var conn = ftp.create({
        host: 'ftp.haskasu.com',
        user: 'codegames@haskasu.com',
        password: "F$;&NfbG#}?0",
        parallel: 6,
        log: gutil.log
    });
    var globs = [
        'output/systemjs/**'
    ];
    return gulp.src(globs, { base: './output/systemjs', buffer: false })
        .pipe(conn.dest('/web/test/project'));
}

function minifyPlugins() {
    return gulp.src([
        'assets/js/plugins/plugins-prepare.js',
        'assets/js/plugins/liquidfun.js',
        'assets/js/plugins/pixi-filters.js',
        'assets/js/plugins/PixiGAFPlayer.js',
        'assets/js/plugins/pixi-sound.min.js',
        'assets/js/plugins/pixi-keyboard.js',
        'assets/js/plugins/source-map.js',
        'assets/js/plugins/Tween.js'
    ])
        .pipe(concat('plugins.js'))
        .pipe(minify({
            ext: {
                src: '.js',
                min: '.min.js'
            }
        }))
        .pipe(gulp.dest('assets/js/compiled'));
}

function minifyBootJs() {
    return gulp.src([
        'assets/js/plugins/zepto.min.js',
        'assets/js/starter/plugins-loader.js',
        'assets/js/starter/systemjs-starter.js',
        'assets/js/starter/boot.js'
    ])
    .pipe(concat('boot.systemjs.js'))
    .pipe(minify({
        ext: {
            src: '.js',
            min: '.min.js'
        }
    }))
    .pipe(gulp.dest('assets/js/compiled'));
}

function build() {
    return run('npm run systemjs').exec();
}

function devServer() {
    return run('npm run dev-start').exec();
}
function systemjsServer() {
    return run('npm run systemjs-start').exec();
}

function localDeploy() {
    return gulp.src(['output/systemjs/**'])
        .pipe(gulp.dest('../../site/codegames/web/test/project/'));
}

gulp.task('build', gulp.series(minifyPlugins, minifyBootJs, build));

gulp.task('deploy', gulp.series('build', deploy));

gulp.task('localDeploy', gulp.series('build', localDeploy));

gulp.task('dev', gulp.series(devServer));

gulp.task('systemjs', gulp.series(minifyPlugins, minifyBootJs, systemjsServer));


function installTypings() {
    return run('npm i typings --global').exec();
}
function installTypingsDefs() {
    return run('typings install').exec();
}
gulp.task('install', gulp.series(installTypings, installTypingsDefs, minifyPlugins));

var TYPESCRIPT_PROJECT = gts.createProject({
    declarationFiles: true,
});

function generateDts() {
    var tsResult = gulp
        .src('./src/**/*.ts')
        .pipe(TYPESCRIPT_PROJECT());
    return tsResult.dts
        .pipe(concat('myPackage.d.ts'))
        .pipe(gulp.dest('./dist'));
}

gulp.task('generate-dts', gulp.series(generateDts));