const gulp = require('gulp');
const templating = require('gulp-pug');

function pug(){
  return gulp.src('src/views/*.pug')
  .pipe(templating({}))
  .pipe(gulp.dest('public'))
}

exports.default = function(){
  gulp.watch(["src/views"],pug)
}
