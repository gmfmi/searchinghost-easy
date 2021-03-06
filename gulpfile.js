const pkg = require('./package.json');
const { src, dest, series, watch } = require('gulp');
const flatmap = require('gulp-flatmap');
const del = require('delete');
const rename = require("gulp-rename");
const htmlmin = require('gulp-html-minifier-terser');
const webpack = require('webpack-stream');
const header = require('gulp-header');
const replace = require('gulp-replace');

const browserSync = require('browser-sync').create();

let isProduction = true;

function clean(cb) {
    del('dist/**', cb);
}

/**
 * This is a tricky one.
 * First we iterate over the theme template to load them in memory,
 * then, we start from 'searchinghost-easy.js' and replace the HTML into
 * the getHtmlTemplate() function. That's why we need 'flatmap'.
 */
function generate(cb) {
    return src('src/templates/*.html')
        .pipe(htmlmin({
            collapseWhitespace: true,
            collapseInlineTagWhitespace: true,
            removeComments: true,
            removeAttributeQuotes: true,
            minifyCSS: true,
            minifyJS: true
        }))
        .pipe(flatmap(function(stream, file){
            const name = file.path.split(/[\\/]/).pop().split('.').shift();
            const htmlContent = file.contents.toString().replace(/"/g, '\\"');
            return src('src/searchinghost-easy.js')
                .pipe(webpack({
                    mode: 'production',
                    output: {
                        filename: `${name}.js`,
                        library: 'SearchinGhostEasy',
                        libraryExport: 'default',
                    },
                    optimization: {
                        minimize: isProduction
                    }
                }))
                .pipe(replace('{{HTML_TEMPLATE}}', htmlContent));
        }))
        .pipe(rename({ prefix: "searchinghost-easy-", extname: '.js' }))
        .pipe(header(`/*! searchinghost-easy v${pkg.version} (${pkg.homepage}) license ${pkg.license} */\n`))
        .pipe(dest('dist'));
}

function build() {
    isProduction = true;
    return series(clean, generate);
}

function reload(cb) {
    browserSync.reload();
    cb();
}

function watchFiles(cb) {
    isProduction = false;
    watch(['src/*.js', 'src/templates/*.html'], { ignoreInitial: false }, series(generate, reload));
}

function serve() {
    browserSync.init({
        open: false,
        server: {
            baseDir: "./"
        }
    });

    watchFiles();
}

exports.default = build();
exports.build = build();
exports.watch = watchFiles;
exports.serve = serve;