var db = require('../db/db').db;
var _ = require('lodash');
var MODELS = require('../db/schemas').MODELS;

var QUERY_VALIDATOR_FIELDS = require('../utils/validator').QUERY;
var AUTH_VALIDATOR_FIELDS = require('../utils/validator').AUTH;
var HTTP_RESPONSE = require('../../scripts/common/constants').HTTP_RESPONSE;

var validate = require('../utils/validator').validate;

exports.configure = function(app) {

	function handleError(res, err) {
		res.json({
			error: err
		});
	}

	app.get('/api/user/list', function(req, res) {
		db(function(model) {
			model(MODELS.USER).find({}, function(err, items) {
				if (err) handleError(res, err);
				res.json({
					result: items
				});
			});
		});
	});

	app.post('/api/user/create', function(req, res) {
		var d = req.body;
		validate(req.body, AUTH_VALIDATOR_FIELDS);
		db(function(model) {
			model(MODELS.USER).find({
				login: d.login
			}, function(err, _users) {
				if (_users.length === 0) {
					//create user
					var _user = new model(MODELS.USER)();
					_user.login = d.login;
					_user.pass = d.pass;
					_user.save(function(err, _user, numAffect) {
						if (err) handleError();
						res.json({
							err: err,
							code: HTTP_RESPONSE.SAVED_SUCCESS,
							result: _user
						});
					});

				} else {
					//user exists
					res.json({
						result: _users,
						code: HTTP_RESPONSE.OBJECT_EXISTS
					});
				}

			});
		});
	});


	app.post('/api/user/login', function(req, res) {
		var d = req.body;
		validate(req.body, AUTH_VALIDATOR_FIELDS);
		db(function(model) {

			//clean sessions

			model(MODELS.USER).find({
				login: d.login
			}, function(err, r) {
				var _user = r.length > 0 && r[0] || null;
				if (_user) {
					if (_user.pass == d.pass) {
						model(MODELS.SESSION).find({
							userId: {
								$eq: _user._id
							}
						}, function(err, r) {
							if (err) handleError(res, err);
							var _session = r.length > 0 && r[0] || null;
							if (_session === null) {
								_session = new model(MODELS.SESSION)();
								_session.userId = _user._id;
								_session.token = _.uniqueId(_user.login + '_');
								_session.expirationDate = Date.now() + 1000 * 60;
								_session.save();
								res.json({
									session: _session,
									code: HTTP_RESPONSE.SESSION_CREATED
								});
							} else {
								_session.expirationDate = Date.now() + 1000 * 60;
								_session.save();
								res.json({
									session: _session,
									code: HTTP_RESPONSE.SESSION_RESTORED
								});
							}
						});
					} else {
						//invalid passs
						res.json({
							session: null,
							code: HTTP_RESPONSE.INVALID_PASSWORD
						});
					}
				} else {
					res.json({
						session: null,
						code:HTTP_RESPONSE.OBJECT_NOT_FOUND
					});
				}

			});
		});
	});


};