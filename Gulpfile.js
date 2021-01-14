const { src, dest, parallel, watch} = require('gulp');
const templating = require('gulp-pug');

function pug(){
  return src('src/views/*.pug')
  .pipe(templating({}))
  .pipe(dest('build'))
}

const runner = parallel(pug)

exports.default = process.env.GULP_BUILD ?
  // build for prod
  runner :
  // dev
  function(){
    watch(["src/views"], runner)
  }
