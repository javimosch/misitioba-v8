'use strict';
var through = require('through2');
var minimatch = require('minimatch');
var path = require('path');
var gutil = require('gulp-util');


module.exports = function(opt) {
    var options = opt || {};

    function concat(file, encoding, callback) {
        //file.sourceMap
        //file.isNull()
        //file.isStream()
        //file.path
        //file.base
        //file.contents

        if (file.isNull()) {
            this.push(file);
            return callback();
        }

        if (file.isStream()) {
            return callback(uglifyError('Streaming not supported', {
                fileName: file.path,
                showStack: false
            }));
        }

        var ignore = false;

        if (!ignore && options.ignoreFiles) {
            ignore = options.ignoreFiles.some(function(item) {
                return minimatch(path.basename(file.path), item);
            });
        }

        if (ignore || path.extname(file.path) != '.js') {
            this.push(file);
            return;
        }


        pushContent(file);

        var name = file.path.substring(file.path.lastIndexOf('/')+1);
        if(options.last.indexOf(name)!==-1){
        	var concatFile = getConcatFile(file);
        	this.push(concatFile);	
        	console.log('Concatenando: ',name,' Success!');
        }else{
        	console.log('Concatenando: ',name);
        }

        //file.path = file.path.replace(/\.js$/, ext.src);
        //this.push(file);
        callback();
    }
    var _contents='';
    function pushContent(file){
    	_contents+= file.contents;
    }
    function getConcatFile(file){
    	var f = new gutil.File({
            //path: file.path.replace(/\.js$/, "-concat.js"),
            path: options.path,
            //base: file.base
            base: __dirname
        });
        //console.log('rta path',f.path);
        //console.log('rta base',f.base);
        f.contents = new Buffer(_contents);
        return f;
    }
    return through.obj(concat);
};
