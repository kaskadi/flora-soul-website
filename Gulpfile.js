const { src, dest, watch, series, parallel } = require('gulp')
const pug = require('gulp-pug')
const less = require('gulp-less')
const cleanCSS = require('gulp-clean-css')
const clean = require('gulp-clean')

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
  return src('src/views/static/fonts/*')
    .pipe(dest('build/fonts/'))
}

function copyImgs () {
  return src('src/views/static/imgs/*')
    .pipe(dest('build/imgs/'))
}

function cleanUp () {
  return src('build', { read: false, allowEmpty: true })
    .pipe(clean())
}

const runner = series(cleanUp, parallel(copyFonts, copyImgs), compileLess, renderTemplates)

exports.default = process.env.GULP_BUILD
  ? runner // prod
  : function () { // dev
    watch(['src/views'], runner)
  }
