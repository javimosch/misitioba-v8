var gulp = require('gulp');
var gutil = require('gulp-util');
var spawn = require('child_process').spawn;
var source = require('vinyl-source-stream');
var babelify = require('babelify');
var watchify = require('watchify');
var exorcist = require('exorcist');
var browserify = require('browserify');
var browserSync = require('browser-sync').create();
var watch = require('gulp-watch');
var sass = require('gulp-sass');
var runSequence = require('run-sequence');
var sourcemaps = require('gulp-sourcemaps');
var gulpif = require('gulp-if');
var minify = require('gulp-minify');
var uglify = require('gulp-uglify');
var rename = require("gulp-rename");
var clean = require('gulp-clean');
var jade = require('gulp-jade');
var data = require('gulp-data');
var _ = require('lodash');
var ftp = require('vinyl-ftp');
var toJson = require('gulp-to-json');
var streamify = require('gulp-streamify');
var htmlmin = require('gulp-htmlmin');
var cssnano = require('gulp-cssnano');
var replace = require('gulp-replace');
var argv = require('yargs').argv;

var lang = require('./tools/jsonlang');

var ftpConfig = {
	src: ['dist/**/*.*'],
	dest: '',
    auth: {
		host: 'misitioba.com',
		user: 'gulproot@misitioba.com',
		password: 'gtf@123',
		parallel: 10,
		log: "gutil.log"
	}
};



var GLOBALS = {
	'_G_ROOT':'/',
};

var events = {
	onLanguageFileChanged:[]
};

var jadeConfig = {
	src: 'src/assets/**/index.jade',
	dest:'dist',
	languageFile: './language.json',
	languageDefault: 'en'
};
var jadeLocals = {
    self: {
        root: '/' //ver elimianr referencias
    }
};



var isProduction = (argv.p && true) || false;
var enableMultiLanguage = (argv.multilang && true) || false;

console.log('Production : ',isProduction);
console.log('Multilang {'+argv.multilang+'} {'+(typeof argv.multilang)+'} : ',enableMultiLanguage);

//expand watch limit (linux)
//echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf && sudo sysctl -p

// Input file.
watchify.args.debug = true;

var tasks = {
    watchAssets: function () {
        watch(['src/assets/**/*.*', '!src/assets/**/*.png', '!src/assets/**/*.jade'], function () {
            gulp.run('build:assets');
        });
        watch(['src/assets/**/*.jade', 'src/assets/**/*.html', 'src/assets/**/*.json'], function () {
            gulp.run('build:jade');
        });
		watch([jadeConfig.languageFile],function(){
			events.onLanguageFileChanged.forEach(function(cb){cb();});
			gulp.run('build:jade');
		});
    },
    moveAssets: function () {
        return gulp.src(['src/assets/**', '!src/assets/**/*.jade', '!src/**/_*.*'])
            .pipe(gulp.dest('dist'))
            .pipe(gulpif(!isProduction, browserSync.stream({
                once: true
            })));
    },
    compileJade: function (cb) {
        JADE.runAll(cb);
	},
    watchStyles: function () {
        watch(['src/styles/**/*.*'], function () {
            gulp.run('build:styles');
        });
    },
    compileStyles: function () {
        return gulp.src('src/styles/app.scss')
            .pipe(gulpif(!isProduction,sourcemaps.init()))
			.pipe(sass(
				_.extend(
				{includePaths: [
                    './node_modules/bootstrap-sass/assets/stylesheets'
                ]},
					(isProduction)?{outputStyle: 'compressed'}:{}
				)
			))			
			.pipe(gulpif(isProduction,cssnano()))
			.pipe(gulpif(!isProduction,sourcemaps.write('.')))
            .pipe(gulp.dest('dist'))
            .pipe(gulpif(!isProduction, browserSync.stream({
                once: true
            })));
    },
    buildDev: function (cb) {
        runSequence('clean'
			, 'build:scripts-static'
			, 'build:scripts'
			, 'build:vendor-static'
			, 'build:vendor'
			, 'build:assets', 'build:jade', 'build:styles', function () {
				cb();
			});
    },
    buildProd: function () {
        isProduction = true;
		return runSequence('build-dev');
    },
	buildStatic: function (cb) {
		isProduction = true;
		runSequence('clean', 'build:scripts-static', 'build:vendor-static'
			, 'build:assets', 'build:jade', 'build:styles', function () {
				cb();
			});
	},
    clean: function () {
        return gulp.src('dist', {
			read: false
		})
            .pipe(clean({
                force: true
            }));
    },
    watch: function () {
        return runSequence('build-dev', 'watch:assets', 'watch:styles', 'server');
    },
    server: function () {
        browserSync.init({
            server: "./dist",
            port: 3334,
            open: false
        });
    },
	deploy: function () {
        var conn = ftp.create(ftpConfig.auth);

        return gulp.src(ftpConfig.src, { base: '.', buffer: false })
			.pipe(rename(function (path) {
				path.dirname = path.dirname.toString().replace("dist", "");
				return path;
			}))
            .pipe(conn.newer('/' + ftpConfig.dest)) // only upload newer files
            .pipe(conn.dest('/' + ftpConfig.dest));

    }
};

var JS = (function () {
	var bundlers = {};
	function createTask(opt) {
		var srcName = opt.src.toString().substr(opt.src.lastIndexOf('/') + 1);
		opt.rename = opt.rename || srcName;
		opt.dist = opt.dist || 'dist';
		var bundler = watchify(browserify(opt.src, watchify.args));
		bundler.transform(babelify.configure({
			sourceMapRelative: opt.src.substring(0, opt.src.lastIndexOf('/'))
		}));
		var task = function () {
			return bundler.bundle()
				.on('error', function (err) {
					gutil.log(err.message);
					browserSync.notify("Browserify Error!");
					this.emit("end");
				})
				.pipe(exorcist(opt.dist + '/' + opt.rename + '.map'))
				.pipe(source(srcName))
				.pipe(gulpif(isProduction, streamify(uglify())))
				.pipe(gulpif(isProduction, streamify(minify())))
				.pipe(gulp.dest(opt.dist || 'dist'))
				.pipe(gulpif(!isProduction, browserSync.stream({
					once: true
				})));
		};
		bundler.on('update', task);
		bundlers[opt.src] = bundler;
		return task;
	}
	return {
		task: createTask
	};
})();

var JADE = (function(jadeLocals,jadeConfig){
	var _lang = lang(jadeConfig.languageFile,jadeConfig.languageDefault);
	var _tasks = [];
	function newTask(name,src,dest,language){
		
		var _langTaskInstance = lang(jadeConfig.languageFile,language);
		var _locals = _.extend(_.clone(jadeLocals),{lang:_langTaskInstance});
		
		events.onLanguageFileChanged.push(function(){
			_langTaskInstance.reload();
		});
		
		
		_locals.root = function(){
			return (GLOBALS._G_ROOT + '/' + _locals.lang.current + '/').replace('//','/');
		};
		
		var task = function(){
			var r = gulp.src(src)
			.pipe(data(function (file, cb) {
				var path = file.path.replace('index.jade', '') + '_data.json';
				if (require.cache[path]) {
					delete require.cache[path];
				}
				cb(undefined, _.extend(require(path), _locals));
			}))
			.pipe(jade())
			.on('error', function (err) {
				gutil.log(err.message);
				browserSync.notify("Jade Error!");
				this.end();
			})
			.pipe(gulpif(isProduction, htmlmin({ collapseWhitespace: true })));	
			Object.keys(GLOBALS).forEach(function(k){
				r = r.pipe(replace(k, GLOBALS[k]));
			});
			r = r.pipe(gulp.dest(dest))
			.pipe(gulpif(!isProduction, browserSync.stream({
				once: true
			})));
			return r;
		} 
		gulp.task(name, task);
		_tasks.push(name);
		return task;
	}
	function runAll(cb){
		var _left = _tasks;
		function runLeft(){
			if(_left.length === 0) {
				cb();
			}else{
				runSequence(_left[0],function(){
					_left = _left.slice(1);
					runLeft();
				});
			}
		}
		runLeft();
	}
	function createTasksForAllLanguages(){
		_lang.availableLangs.forEach(function(lang_code){
			JADE.task('build:jade-'+lang_code,jadeConfig.src,jadeConfig.dest+'/'+lang_code,lang_code);
		});
	}
	function createDefaultTask(){
		JADE.task('build:jade-default',jadeConfig.src,jadeConfig.dest,_lang.current);
	}
	return{task:newTask,tasks:_tasks,runAll:runAll,
	createTasksForAllLanguages:createTasksForAllLanguages, createDefaultTask:createDefaultTask};
})(jadeLocals,jadeConfig);

JADE.createDefaultTask();
if(enableMultiLanguage){
	JADE.createTasksForAllLanguages();
}


gulp.task('build:scripts-static', JS.task({ src: './src/scripts/app.static.js' }));
gulp.task('build:scripts', JS.task({ src: './src/scripts/app.js' }));
gulp.task('build:vendor-static', JS.task({ src: './src/vendor/vendor.static.js' }));
gulp.task('build:vendor', JS.task({ src: './src/vendor/vendor.js' }));

gulp.task('watch:styles', tasks.watchStyles);
gulp.task('watch:assets', tasks.watchAssets);
gulp.task('watch', tasks.watch);

gulp.task('clean', tasks.clean);
gulp.task('build:styles', tasks.compileStyles);
gulp.task('build:jade', tasks.compileJade);
gulp.task('build:assets', tasks.moveAssets);
gulp.task('build-dev', tasks.buildDev);
gulp.task('build-prod', tasks.buildProd);
gulp.task('build', tasks.buildProd);
gulp.task('build-static', tasks.buildStatic);

gulp.task('server', tasks.server);
gulp.task('deploy', tasks.deploy);
gulp.task('default', tasks.watch);

gulp.task('tojson', function () {
	gulp.src('./dist/index.html')
		.pipe(toJson());
});

gulp.task('auto-reload', function() {
  var p;
  gulp.watch('gulpfile.js', spawnChildren);
  spawnChildren();
  function spawnChildren(e) {
    if(p) { p.kill(); }
    p = spawn('gulp', ['default'], {stdio: 'inherit'});
  }
});