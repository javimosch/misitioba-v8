var mongoose = require('mongoose');
var Schema = mongoose.Schema;

//DEFINE APP MODELS
var MODELS = {
	ARTICLE:"ARTICLE"
};

var schemas = {};
//DEFINE MODELS SCHEMAS
schemas[MODELS.ARTICLE] = new Schema({
	title: String,
	author: String,
	content: String,
	date: {
		type: Date,
		default: Date.now
	},
	tags: {
		votes: Number,
		favs: Number
	}
});


module.exports.MODELS = MODELS;
module.exports.schemas = schemas;

module.exports.model = function(modelName){
	if(schemas[modelName] === undefined){
		throw Error(modelName+' no tiene un esquema valido.');
	}
	return mongoose.model(modelName, schemas[modelName]);
};