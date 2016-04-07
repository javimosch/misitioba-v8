var _spawnChildren = null;
try {
    var gulp = require('gulp');
    var using = require('gulp-using')
    var notify = require("gulp-notify");
    var gutil = require('gulp-util');
    var debug = require('gulp-debug');
    var es = require('event-stream');
    var spawn = require('child_process').spawn;
    var source = require('vinyl-source-stream');
    var babelify = require('babelify');
    var watchify = require('watchify');
    var exorcist = require('exorcist');
    var browserify = require('browserify');
    var browserSync = require('browser-sync').create();
    var watch = require('gulp-watch');
    var sass = require('gulp-sass');
    var filter = require('gulp-filter');
    var runSequence = require('run-sequence');
    var sourcemaps = require('gulp-sourcemaps');
    var gulpif = require('gulp-if');
    var minify = require('gulp-minify');
    var uglify = require('gulp-uglify');
    var rename = require("gulp-rename");
    var clean = require('gulp-clean');
    var jade = require('gulp-jade');
    var jadeInheritance = require('gulp-jade-inheritance');
    var data = require('gulp-data');
    var _ = require('lodash');
    var ftp = require('vinyl-ftp');
    var toJson = require('gulp-to-json');
    var streamify = require('gulp-streamify');
    var htmlmin = require('gulp-htmlmin');
    var cssnano = require('gulp-cssnano');
    var replace = require('gulp-replace');
    var argv = require('yargs').argv;
    var markdown = require("markdown").markdown;
    var through2 = require('through2');
    var path = require('path');
    var plumber = require('gulp-plumber');
    var gcallback = require('gulp-callback');

    var lang = require('./tools/jsonlang');

    var ftpConfig = {
        exclude: ['dist', 'express/admin', 'dist/admin'],
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
    if (argv.deploy && argv.target) {
        ftpConfig.src = argv.deploy;
        ftpConfig.dest = argv.target;
        console.log('ftp-config ', ftpConfig);
    }

    var DATA_PATHS = [
        './src/assets/accrocs/_accrocs.js'
    ];


    var GLOBALS = {
        '_G_ROOT': '/',
    };

    var events = {
        onLanguageFileChanged: []
    };

    var jadeConfig = {
        src: 'src/assets/**/index.jade',
        dest: 'dist',
        languageFile: './src/assets/files/i18n/language.json',
        languageDefault: 'en'
    };

    var atob = require('atob');
    var btoa = require('btoa');
    var uridecode = require('uridecode');
    var jadeLocals = {
        basedir: 'src/assets/views',
        window: {
            atob: atob,
            btoa: btoa,
            decodeURIComponent: uridecode
        },
        markdown: (x) => {
            var decoded = atob(x);
            return markdown.toHTML(decoded);
        },
        self: {
            root: '/' //ver elimianr referencias
        }
    };

    var resSrc = ['res/**/*.*', '!res/**/*.crdownload', '!src/**/_*.*', '!res/**/*.jade'];

    var isProduction = (argv.p && true) || false;
    var enableMultiLanguage = (argv.multilang && true) || false;

    console.log('Production : ', isProduction);
    console.log('Multilang {' + argv.multilang + '} {' + (typeof argv.multilang) + '} : ', enableMultiLanguage);

    //expand watch limit (linux)
    //echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf && sudo sysctl -p

    // Input file.
    watchify.args.debug = true;

    var tasks = {
        watchAssets: function() {
            watch(['src/assets/**/*.*', '!src/assets/**/*.png', '!src/assets/**/*.jade', '!src/assets/**/*.crdownload'], function() {
                gulp.run('build:assets');
            });

            watch(['src/assets/**/*.jade', 'src/assets/**/*.html', 'src/assets/**/*.json'], function() {
                gulp.run('build:jade');
            });

            watch([jadeConfig.languageFile], function() {
                events.onLanguageFileChanged.forEach(function(cb) {
                    cb();
                });
                gulp.run('build:jade');
            });


            watch(resSrc, function() {
                console.log('watch:res');
                return runSequence('build:res');
            });


        },
        moveAssets: function() {
            return gulp.src(['src/assets/**', '!src/assets/**/*.jade', '!src/**/_*.*'])
                .pipe(gulp.dest('dist'))
                .pipe(gulpif(!isProduction, browserSync.stream({
                    once: true
                })));
        },
        compileJade: function(cb) {
            JADE.runAll(false, cb);
        },
        watchStyles: function() {
            watch(['src/styles/**/*.*'], function() {
                gulp.run('build:styles');
            });
        },
        compileResources: function() {
            return gulp.src(resSrc)
                .pipe(gulp.dest('dist'))
                .pipe(gulpif(!isProduction, browserSync.stream({
                    once: true
                })));
        },
        compileStyles: function() {
            return gulp.src('src/styles/app.scss')
                .pipe(gulpif(!isProduction, sourcemaps.init()))
                .pipe(plumber())
                .pipe(sass(
                    _.extend({
                        includePaths: [
                            './node_modules/bootstrap-sass/assets/stylesheets',
                            './node_modules/font-awesome/scss'
                        ]
                    }, (isProduction) ? {
                        outputStyle: 'compressed'
                    } : {})
                ))
                .pipe(gulpif(isProduction, cssnano()))
                .pipe(gulpif(!isProduction, sourcemaps.write('.')))
                .pipe(plumber.stop())
                .pipe(gulp.dest('dist'))
                .pipe(gulpif(!isProduction, browserSync.stream({
                    once: true
                })));
        },
        buildDev: function(cb) {
            runSequence(
                //'clean', 
                'build:scripts-static',
                'build:scripts',
                //'build:vendor-static',
                //'build:vendor',
                'build:assets',
                'build:styles', ['build:jade'],
                function() {
                    cb();
                });
        },
        buildProd: function() {
            //isProduction = true;
            //return runSequence('build-dev');
            runSequence(
                'clean',
                'build:scripts-static',
                'build:scripts',
                'build:vendor-static',
                'build:vendor',
                'build:assets', 'build:jade', 'build:styles',
                function() {
                    //cb();
                });
        },
        buildStatic: function(cb) {
            isProduction = true;
            runSequence('clean', 'build:scripts-static', 'build:vendor-static', 'build:assets', 'build:jade', 'build:styles', function() {
                cb();
            });
        },
        clean: function() {
            return gulp.src('dist', {
                    read: false
                })
                .pipe(clean({
                    force: true
                }));
        },
        watch: function() {
            runSequence('build:jade', 'server');
            JADE.runAll(true);
            runSequence('watch:assets', 'watch:styles');

        },
        watchOnly: function() {
            return runSequence('watch:assets', 'watch:styles', 'server');
        },
        server: function() {
            browserSync.init({
                server: "./dist",
                port: 3401,
                open: false
            });
        },
        deploy: function() {
            var conn = ftp.create(ftpConfig.auth);

            return gulp.src(ftpConfig.src, {
                    base: '.',
                    buffer: false
                })
                .pipe(rename(function(path) {
                    //path.dirname = path.dirname.toString().replace("dist", "");
                    ftpConfig.exclude.forEach(function(v) {
                        path.dirname = path.dirname.toString().replace(v, "");
                        path.dirname = path.dirname.replace('//', '/');
                    });
                    return path;
                }))
                .pipe(conn.newer('/' + ftpConfig.dest)) // only upload newer files
                .pipe(conn.dest('/' + ftpConfig.dest));

        }
    };

    var JS = (function() {
        var bundlers = {};

        function createTask(opt) {
            var srcName = opt.src.toString().substr(opt.src.lastIndexOf('/') + 1);
            opt.rename = opt.rename || srcName;
            opt.dist = opt.dist || 'dist';
            var bundler = watchify(browserify(opt.src, watchify.args));
            bundler.transform(babelify.configure({
                sourceMapRelative: opt.src.substring(0, opt.src.lastIndexOf('/'))
            }));
            var task = function() {
                return bundler.bundle()
                    .on('error', function(err) {
                        gutil.log(err.message);
                        browserSync.notify("Browserify Error!");
                        this.emit("end");
                    })
                    .pipe(exorcist(opt.dist + '/' + opt.rename + '.map'))
                    .pipe(source(srcName))
                    //.pipe(gulpif(isProduction, streamify(uglify())))
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


    var ExtendRequire = (() => {
        var get = (path, data) => {
            if (require.cache[path]) {
                delete require.cache[path];
            }
            var r = require(path);
            if (r.configure) return r.configure(data);
            else return r;
        };
        var load = (paths, locals) => {
            var rta = {};
            paths.forEach((path) => {
                rta = _.extend(data, get(path, locals));
            });
            return rta;
        };
        return (data, paths) => {
            data = _.extend(data, load(paths, data));
            return data;
        };
    })();



    var JADE = (function(jadeLocals, jadeConfig) {
        //console.log('JADE');
        var _lang = lang(jadeConfig.languageFile, jadeConfig.languageDefault);
        var _tasks = [];
        //console.log('JADE#2');
        var buildSrc = ['src/**/index.jade'];
        var watchSrc = ['src/assets/**/*.jade', 'src/assets/**/*.html', 'src/assets/**/*.json'];
        var filterIndexFiles = filter(['**/index.jade']);

        function newTask(name, src, dest, language, isWatch) {
            var _langTaskInstance = lang(jadeConfig.languageFile, language);

            isWatch = false;//temporal disabled
            //events.onLanguageFileChanged.push(function() {
            //_langTaskInstance.reload();
            //});

            var task = function(cb) {

                _langTaskInstance.reload();
                var _locals = _.extend(_.clone(jadeLocals), {
                    lang: _langTaskInstance
                });


                _locals.root = (function(_root) {
                    return function(relativePath) {
                        if (_langTaskInstance.isDefault()) {
                            return (_root + '/' + relativePath || '').replace('//', '/');
                        } else {
                            return (_root + '/' + _locals.lang.current() + '/' + relativePath || '').replace('//', '/');
                        }
                    };
                })(GLOBALS._G_ROOT);

                _locals = ExtendRequire(_locals, DATA_PATHS);

                console.log('locals are: ' +
                    Object.keys(_locals));

                var r = gulp.src(buildSrc)
                    .pipe(gulpif(isWatch || false, watch(watchSrc, {
                            verbose: true
                        }).on('change', (path) => {
                            //console.log('a file has changed!');
                            browserSync.notify("Reloading <span color='green'>now</span> !");
                        })


                    ))
                    //.pipe(jadeInheritance({basedir: 'src'}))                    
                    //.pipe(filterIndexFiles)
                    //.pipe(using({ prefix: 'Reading locals: ' }))
                    .pipe(plumber())
                    .pipe(data(function(file, handle) {
                        var filePath = file.path.replace(path.basename(file.path), '_data.json');
                        //console.log(path.basename(file.path) + ': requiring ', filePath);
                        if (require.cache[filePath]) {
                            delete require.cache[filePath];
                        }
                        try {
                            var _data = require(filePath);
                            //console.log('locals-extended: ' + Object.keys(_data));
                            _locals = _.extend(_locals, _data);
                        } catch (e) {
                            //console.log(path.basename(file.path) + ' (no-data)', e);
                            //handle(undefined, undefined);
                        }
                        handle(undefined, undefined);
                    }))
                    .pipe(plumber.stop())
                    //.pipe(using({ prefix: "About to compile: " }))
                    //.pipe(plumber())
                    .pipe(jade((() => {
                        var opts = {
                            basedir: _locals.basedir,
                            locals: _locals
                        };

                        return opts;
                    })()))
                    //.pipe(plumber.stop())
                    //.pipe(using({ prefix: "Compiled: " }))
                    .on('error', function(err) {
                        gutil.log(err.message);
                        browserSync.notify("Jade Error!");
                        this.end();
                    })
                    .pipe(gulpif(isProduction, htmlmin({
                        collapseWhitespace: true
                    })));
                Object.keys(GLOBALS).forEach(function(k) {
                    r = r.pipe(replace(k, GLOBALS[k]));
                });


                //r = r.pipe(plumber())
                //r = r.pipe(gcallback(function() {
                  //  gutil.log('language-reload');
                    //_langTaskInstance.reload();
                //}));
                //r = r.pipe(plumber.stop())

                r = r.pipe(plumber())
                _langTaskInstance.inyect(r, replace);
                r = r.pipe(plumber.stop())


                r = r.pipe(plumber())
                //r = r.pipe(using({ prefix: "Copied: " }))
                .pipe(rename(function(str) {
                    str.dirname = str.dirname.replace('assets','');
                    str.dirname = str.dirname.replace('//','/');
                    console.log('Compiling '+str.dirname);
                    return str;
                }))
                r = r.pipe(plumber.stop())
                r = r.pipe(gulp.dest(dest))
                    //.pipe(notify("[jade:success]"))
                    .pipe(
                        gulpif(!isProduction && isWatch, browserSync.stream({}))
                    );

                return r;
            };
            gulp.task(name, task);
            console.log('JADE-task:' + name);
            _tasks.push(name);
            return task;
        }

        

        function reload() {
            return through2(function(chunk, enc, callback) {
                browserSync.reload();
                this.push(chunk);
                callback();
            })
        }

        function runAll(WATCH_ONLY, cb) {
            var _left = _.clone(_tasks);
            if (WATCH_ONLY) {
                _left = _.filter(_left, function(v) {
                    return v.indexOf('watch') !== -1;
                });
            } else {
                _left = _.filter(_left, function(v) {
                    return v.indexOf('watch') === -1;
                });
            }

            function runLeft() {
                if (_left.length === 0) {
                    console.log('jade:finish:reload');
                    browserSync.reload();
                    cb && cb();
                } else {
                    console.log('jade:running:' + _left[0] + ':' + _left.length);
                    runSequence(_left[0], function() {
                        _left = _left.slice(1);
                        runLeft();
                    });
                }
            }
            runLeft();
        }

        function createTasksForAllLanguages() {
            _lang.availableLangs.forEach(function(lang_code) {
                JADE.task('build:jade-' + lang_code, jadeConfig.src, jadeConfig.dest + '/' + lang_code, lang_code);
                JADE.task('build:jade-' + lang_code + ':watch', jadeConfig.src, jadeConfig.dest + '/' + lang_code, lang_code, true);
            });
        }

        function createDefaultTask() {
            JADE.task('build:jade-default', jadeConfig.src, jadeConfig.dest, _lang.current());
            JADE.task('build:jade-default:watch', jadeConfig.src, jadeConfig.dest, _lang.current(), true);
        }
        return {
            task: newTask,
            tasks: _tasks,
            runAll: runAll,
            createTasksForAllLanguages: createTasksForAllLanguages,
            createDefaultTask: createDefaultTask
        };
    })(jadeLocals, jadeConfig);

    JADE.createDefaultTask();
    if (enableMultiLanguage) {
        JADE.createTasksForAllLanguages();
    }


    gulp.task('build:scripts-static', JS.task({
        src: './src/scripts/app.static.js'
    }));
    gulp.task('build:scripts', JS.task({
        src: './src/scripts/app.js'
    }));
    gulp.task('build:vendor-static', JS.task({
        src: './src/vendor/vendor.static.js'
    }));
    gulp.task('build:vendor', JS.task({
        src: './src/vendor/vendor.js'
    }));

    gulp.task('build:vendor:all', function() {
        runSequence('build:vendor', 'build:vendor-static');
    });

    gulp.task('watch:styles', tasks.watchStyles);
    gulp.task('watch:assets', tasks.watchAssets);
    gulp.task('watch', tasks.watch);
    gulp.task('watch-only', tasks.watchOnly);

    gulp.task('clean', tasks.clean);
    gulp.task('build:styles', tasks.compileStyles);
    gulp.task('build:res', tasks.compileResources);
    gulp.task('build:jade', tasks.compileJade);
    gulp.task('build:assets', tasks.moveAssets);
    gulp.task('build-dev', tasks.buildDev);
    gulp.task('build-prod', tasks.buildProd);
    gulp.task('build', tasks.buildProd);
    gulp.task('build-static', tasks.buildStatic);

    gulp.task('server', tasks.server);
    gulp.task('deploy', tasks.deploy);
    gulp.task('default', tasks.watch);

    gulp.task('tojson', function() {
        gulp.src('./dist/index.html')
            .pipe(toJson());
    });



    gulp.task('auto-reload', function() {
        var p;
        gulp.watch(['gulpfile.js', 'tools/**/*.*'], spawnChildren);
        spawnChildren();
        _spawnChildren = spawnChildren;

        function spawnChildren(e) {
            if (p) {
                p.kill();
            }
            p = spawn('gulp', ['default'], {
                stdio: 'inherit'
            });
        }
    });

} catch (e) {
    if (_spawnChildren) _spawnChildren();
    console.log('GLOBAL:ERROR', e);
}
