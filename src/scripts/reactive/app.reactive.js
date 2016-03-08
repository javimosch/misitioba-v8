var store = require('store2');
window.store = store;

var app = ((root, appIdentifier) => {
	_handlers = {};

	function isPrimitive(propertyValue) {
		return (!_.includes(['function', 'object'], typeof propertyValue));
	}

	function forEachPrimitive(arr, cb) {
		for (var x in arr) {
			if (isPrimitive(arr[x])) {
				cb(arr[x], x);
			}
		}
	}

	function clonePrimitives(o) {
		var another = {};
		forEachPrimitive(o, (val, key) => {
			another[key] = val;
			//console.log('cloning primitive',key);
		});
		return another;
	}

	function autosave(local, actions, interval) {
		var lastSnap = clonePrimitives(local);
		setInterval(function() {
			//console.log('checking ',local);
			forEachPrimitive(local, (val, key) => {
				if (lastSnap[key] !== val) {
					actions._save();
					lastSnap = clonePrimitives(local);

				}
			});
		}, interval);
	}

	function convertToPrimitive(data, propName,separator) {
		separator = separator || '/';
		var rta = {};
		if (!_.isUndefined(data[propName])) {
			for (var x in data[propName]) {
				if (isPrimitive(data[propName][x])) {
					rta[propName + separator + x] = data[propName][x];
					console.log('primitivizing',propName + separator + x);
				}
			}
		}
		return rta;
	}

	function extractPrimitiveObjectToObject(data, propName,separator) {
		separator = separator || '/';
		var prefix = propName + separator;
		var name = (x)=>x.substr(prefix.length);
		//console.log('extract prefix',prefix,data);
		for (var x in data) {
			if (x.indexOf(prefix) !== -1) {
				data[propName] = data[propName] || {};
				data[propName][name(x)] = data[x];
				console.log('recovering',propName,name(x),data[x]);
				//console.log('deleting',x);
				delete data[x];
			}
		}
	}

	function createLocal(options) {
		var data = null;
		var ai = appIdentifier + '_' + options.route;
		try {
			data = store(ai) || {};
			extractPrimitiveObjectToObject(data,'_params');
		} catch (e) {
			store(ai, {});
			data = {};
		}
		var actions = _.extend(data, {
			_set: (d) => {
				data = d;
				actions._save();
			},
			_add: (d) => {
				_.extend(data, d);
				actions._save();
			},
			_clear: () => {
				data = {};
				actions.save();
			},
			_get: () => data,
			_save: () => {
				var primitives = clonePrimitives(data);
				_.extend(primitives, convertToPrimitive(data, '_params'));
				console.log('storing primitives',primitives);
				store(ai, primitives);
				extractPrimitiveObjectToObject(data,'_params');
			}
		});
		if (options.autosave !== false) {
			autosave(data, actions, options.autosaveInterval || 1000);
		}
		return actions;
	}

	function createScope(options) {
		var rta = _.extend(createLocal(options) || {}, {
			reroute: function(name, parameters) {
				//this.parameters = parameters;
				//write params in destiny scope



				_handlers[name].__scope._params = parameters;
				_handlers[name].__scope._save();

				//console.info(_handlers[name].__scope);

				var path = _handlers[name].route;

				window.location.href = location.origin + document.head.dataset.root + path;
			}
		});
		return rta;
	}

	root.app = function(name, options, handler) {
		if (handler === undefined) {
			if (_handlers[name] === undefined) {
				throw Error("handler unknow: " + name);
			}
			_handlers[name].__handler(_handlers[name].__scope);
		} else {
			if (!options || !options.route) {
				console.warn(options);
				throw Error('app[' + name + ']: options[route] argument required');
			}

			_handlers[name] = _.extend(options, {
				__handler: handler,
				__scope: _.extend(createScope(options), {
					_name: name,
					_options: options
				})
			});
		}
	};
})(window, 'misitioba');

require('../dom/el');
require('../http/http');

require('../handlers/handler-admin-home');
require('../handlers/handler-admin-user-create');
require('../handlers/handler-admin-user-login');