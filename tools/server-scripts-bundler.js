var readFileSync = require('./server-file-reader').readFileSync;
var readScriptTags = require('./html-parser').readScriptTags;


var gulp = require('gulp');
var minify = require('gulp-minify');
var uglify = require('gulp-uglify');
var browserify = require('browserify');
var concat = require('./gulp-concat');

((ctx) => {
    ctx.bundle = bundle;

    function bundle(htmlPath, outPath) {
    	var base = htmlPath.substring(0,htmlPath.lastIndexOf('/')!=-1&&htmlPath.lastIndexOf('/')||undefined);
    	//
        var str = readFileSync(htmlPath, {
            encoding: 'utf8'
        });
        var tags = readScriptTags(str);
        tags = tags.map(v=>(base+'/'+v));
        //console.log('base: '+base);

        console.log(JSON.stringify(tags));

        gulp.src(tags)
        //.pipe(browserify)
        .pipe(concat({
        	path:'bundle.js',
        	last: tags[tags.length-1]
        }))
        .pipe(minify({
        	ext:'.js'
        }))
        .pipe(uglify())
        .pipe(gulp.dest(outPath||'dist'));
    }

    //gulp.task('watch-only', tasks.watchOnly);

})(
    (typeof exports !== 'undefined' && exports) ||
    (typeof window !== 'undefined' && window) ||
    this
);
