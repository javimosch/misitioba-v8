var mongodb = require('mongodb');
var uri = "mongodb://root:root@ds051553.mongolab.com:51553/misitioba";
var mongoose = require('mongoose');
var db = mongoose.connection;
var model = require('./schemas').model;

db.on('error', console.error.bind(console, 'connection error:'));
var STATUS = {
	DISCONNECTED:0
};
mongoose.connect(uri);


module.exports.db = function(cb){
	if(db.readyState === STATUS.DISCONNECTED){
		console.log('Connecting to mongo');
		db.once('open', function() {
			cb(model);
		});	
	}else{
		cb(model);
	}
};