console.log('this is test 2');

var readFileSync = require('./server-file-reader').readFileSync;
var readScriptTags = require('./html-parser').readScriptTags;


(function(ctx){
    ctx.bundle = bundle;

    function bundle(htmlPath, outPath) {
        var str = readFileSync(htmlPath, {
            encoding: 'utf8'
        });
        var tags = readScriptTags(str);
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
