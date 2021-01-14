const { src, dest, parallel, watch } = require('gulp')
const pug = require('gulp-pug')
const less = require('gulp-less')

function renderTemplates () {
  return src('src/views/*.pug')
    .pipe(pug({}))
    .pipe(dest('build'))
}

function compileLess () {
  return src('src/views/styles/**.less')
    .pipe(less({}))
    .pipe(dest('build/styles'))
}

const runner = parallel(renderTemplates, compileLess)

exports.default = process.env.GULP_BUILD
  ? runner // prod
  : function () { // dev
    watch(['src/views'], runner)
  }
