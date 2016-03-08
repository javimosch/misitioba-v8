var db = require('../db/db').db;

var MODELS = require('../db/schemas').MODELS;

var QUERY_VALIDATOR_FIELDS = require('../utils/validator').QUERY;
var AUTH_VALIDATOR_FIELDS = require('../utils/validator').AUTH;

var validate = require('../utils/validator').validate;

exports.configure = function(app) {

	function handleError(res,err){
		res.json({error:err});
	}

	app.get('/', function(req, res) {
		res.json({message:'API OK'});
	});

	app.post('/api/count', function(req, res) {
		validate(req.body,QUERY_VALIDATOR_FIELDS);
		db(function(model) {
			model(req.body.model).count({}, function(err, count) {
				res.json({
					message: "[" + count + "] entries found for collection "+ req.body.model,
					env:process.env
				});
			});
		});
	});

	


};