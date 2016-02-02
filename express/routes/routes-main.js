var db = require('../db/db').db;

var MODELS = require('../db/schemas').MODELS;

var QUERY_VALIDATOR_FIELDS = require('../utils/validator').QUERY;
var validate = require('../utils/validator').validate;

exports.configure = function(app) {

	app.post('/api/count', function(req, res) {
		validate(req.body,QUERY_VALIDATOR_FIELDS);
		db(function(model) {
			model(req.body.model).count({}, function(err, count) {
				res.json({
					message: "[" + count + "] entries found for collection "+ req.body.model
				});
			});
		});
	});


};