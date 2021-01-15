const { src, dest, watch, series } = require('gulp')
const pug = require('gulp-pug')
const less = require('gulp-less')
const cleanCSS = require('gulp-clean-css')

function renderTemplates () {
  return src('src/views/*.pug')
    .pipe(pug({}))
    .pipe(dest('build'))
}

function compileLess () {
  return src('src/views/styles/main.less')
    .pipe(less({}))
    .pipe(cleanCSS({}))
    .pipe(dest('build/styles'))
}

function copyFonts () {
  return src('src/views/fonts/*')
    .pipe(dest('build/fonts/'))
}

const runner = series(copyFonts, compileLess, renderTemplates)

exports.default = process.env.GULP_BUILD
  ? runner // prod
  : function () { // dev
    watch(['src/views'], runner)
  }
