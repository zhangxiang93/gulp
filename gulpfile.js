var gulp = require('gulp'),
    uglify = require('gulp-uglify');

gulp.task('minify', function() {
	gulp.src('js/data.js')
		.pipe(uglify())
		.pipe(gulp.dest('build/js'))
});

gulp.task('default', ['minify']);