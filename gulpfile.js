const pkg = require('./package.json');
const { src, dest, series, watch } = require('gulp');
const flatmap = require('gulp-flatmap');
const del = require('delete');
const rename = require("gulp-rename");
const htmlmin = require('gulp-htmlmin');
const webpack = require('webpack-stream');
const header = require('gulp-header');
const replace = require('gulp-replace');

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
    return src('themes/**/*.html')
        .pipe(htmlmin({
            collapseWhitespace: true,
            collapseInlineTagWhitespace: true,
            removeComments: true,
            removeAttributeQuotes: true,
            minifyCSS: true,
            minifyJS: true
        }))
        .pipe(flatmap(function(stream, file){
            let name = file.path.split(/[\\/]/).pop().split('.').shift();
            let htmlContent = file.contents.toString().replace(/"/g, '\\"');
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

function watchFiles() {
    isProduction = false;
    watch(['themes/**/*.html', 'src/*.js'], { ignoreInitial: false }, generate);
}

exports.default = build();
exports.build = build();
exports.watch = watchFiles;