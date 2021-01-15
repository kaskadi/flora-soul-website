const { src, dest, watch, series } = require('gulp')
const pug = require('gulp-pug')
const less = require('gulp-less')
const cleanCSS = require('gulp-clean-css')
const base64 = require('gulp-base64-inline')
const clean = require('gulp-clean')

function compileLess () {
  return src('src/views/styles/main.less')
    .pipe(less({}))
    .pipe(cleanCSS({}))
    // convert all font references to inline base64
    .pipe(base64('../static/fonts'), {
      includeMime: false,
      prefix: 'url(data:font/ttf;base64,',
      suffix: ')'
    })
    .pipe(dest('src'))
}

function renderTemplates () {
  return src('src/views/*.pug')
    .pipe(pug({}))
    // convert all image references to inline base64
    .pipe(base64('./static/imgs', {
      prefix: '',
      suffix: ''
    }))
    .pipe(dest('build'))
}

function preCleanUp () {
  return src('build', { read: false, allowEmpty: true })
    .pipe(clean())
}

function postCleanUp () {
  return src('src/main.css', { read: false, allowEmpty: true })
    .pipe(clean())
}

const runner = series(preCleanUp, compileLess, renderTemplates, postCleanUp)

exports.default = process.env.GULP_BUILD
  ? runner // prod
  : function () { // dev
    watch(['src/views'], runner)
  }
