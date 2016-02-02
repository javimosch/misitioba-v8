var createEventSystem = (target) => {
	var _evts = {};
	target.emit = (n, p) => {
		var c = 0;
		var arr = _.if(typeof _evts[n] !== 'undefined', _evts[n], []);
		_.each(arr, (handler, id) => {
			handler(p);
			c++;
		});
		if(c>0)
			console.log((target.name || 'noname') + '.emit.' + n + '.' + c);
	};
	target.on = (n, handler) => {
		var id = n + new Date().getTime() + _.if(typeof _evts[n] !== 'undefined', Object.keys(_evts[n] || []).length, 0);
		_evts[n] = _.if(_evts[n], _.set(_evts[n], id, handler), _.set({}, id, handler));
		console.log((target.name || 'noname') + '.on.' + n + '.' + Object.keys(_evts).length + '.registered.');
		return () => {
			delete _evts[n][id];
		};
	};
}

var FORMS_TYPES = ['input', 'select', 'textarea'];
var isValidTag = (t) => {
	return FORMS_TYPES.find((tag) => tag == t) !== undefined;
};

var applyFieldDefaults = (field, name, options) => {
	field.name = name;
	field.type = field.type || 'input';
	field._events = _.if(field.events, _.push([], field.events), []);
	createEventSystem(field);
	field.template = field.template || "" + "<div data-view></div>" + "";
};


var FORMS = ((options) => {
	var self = _.extend({}, options);
	createEventSystem(self);
	var target = _.el(options.target);
	var wrapper = _.el(document.createElement('output')).attr({
		'data-wrapper': ''
	});
	//self.form = _.el(target).el('form') || _.el(document.createElement('form')).appendTo(target);
	self.form = target.el('[data-view]') || target;
	//if(!self.form){
	//	throw Error('You need to define a [data-view] inside target '+ target.id+' '+target.name+' ' //+ target.className);
	//}
	self.el = (n) => _.el(target).el(n);
	self.wrapper = wrapper;
	self.target = target;

	options._events = _.if(options.events, _.push([], options.events), []);

	var fire = (n) => {
		self.emit(n);
		_.each(options._events, (obj, index) => {
			_.each(obj, (callback, name) => {
				if (name == n) {
					callback(self);
				}
			});
		});
	};

	//wrapper.id = 'wrapper-' + new Date().getTime();

	var addFieldToWrapper = ((tpl) => {
		if (tpl == undefined) return (el) => wrapper.appendChild(el);
		wrapper.innerHTML = tpl;
		var out = wrapper.el('output');
		if (!out) {
			throw Error('Template require output tag.');
		} else {
			return (el) => {
				out.append(el);
				//out.parentNode.insertBefore(el, out);
				//out.parentNode.removeChild(out);
			}
		}
	})(options.template);

	var defineCommonControl = (control, fieldKey, f) => {
		control.name = fieldKey;
		f.el = control;
		f.val = (v) => f.el.val(v);
		f.clear = () => f.el.val();
		if (f.attributes) {
			control.attr(f.attributes);
		}
		control.className = fieldKey + ' ' + (f.className || '') + ' ' + (options.attributes && options.attributes.className || '');
		var el = control;
		control.onkeyup = (evt) => f.emit('onkeyup', {el,evt});
	};

	var addField = (f, fieldKey) => {
		applyFieldDefaults(f, fieldKey, options);

		var out = _.dom(f.template);
		var view = out.dataset.view !== undefined && out || out.el('[data-view]') || null;
		if (!view) {
			throw Error('No data-view in template: ' + JSON.stringify(f.template));
		}

		if (f.type && FORMS._isCustom(f.type)) {
			view.append(FORMS._types[f.type](f));
		} else {
			if (!isValidTag(f.type)) {
				throw Error(fieldKey + ' has an invalid type ' + f.type + '. Available types are the follow: ' + _.union(FORMS_TYPES, Object.keys(FORMS._types)));
			}

			var control = out.el('.' + fieldKey) || _.dom(f.type);
			if (!out.el('.' + fieldKey)) {
				view.append(control);
			}

			if (f.label) {
				out.el('[data-label]') && out.el('[data-label]').html(f.label) || _.dom('label').html(f.label).prependTo(view);
			}

			defineCommonControl(control, fieldKey, f);
		}
		//

		addFieldToWrapper(out);
	};


	_.el.toggleClass(target, 'hidden', true);

	target.dataset.form = '';

	var attached = false;
	var actions = {
		attach: () => {
			self.form.appendChild(wrapper);
			attached = true;
			fire('form-attach');
			actions.toggle(true);
		},
		add: (fields) => {
			Object.keys(fields).forEach((fieldKey) => {
				addField(fields[fieldKey], fieldKey);
			});

			/*
			_.each(wrapper.querySelectorAll('output'),(out)=>{
				_.each(_.toArray(out.childNodes),(n)=>{
					if(n)out.parentNode.insertBefore(n, out);
				});
				out.parentNode.removeChild(out);
			});
			*/
		},
		toggle: (val) => {
			if (!attached && val === true) {
				throw Error('The form you are trying to toggle on is not attached yet. Call to show to attach it for first time.');
			}
			_.el.toggleClass(target, 'hidden', !val);
			fire('form-toggle-' + val.toString());
		},
		detach: () => {
			target.removeChild(wrapper)
			attached = false;
			fire('form-detach');
		},
		self: self
	}
	actions.add(options.fields);
	self.action = actions;
	fire('form-init');

	//	FORMS._instances.push(actions);

	return actions;
});
//FORMS._instances = [];
FORMS._isCustom = (fieldKey) => Object.keys(FORMS._types).find((k) => k == fieldKey) !== undefined;
FORMS._types = {};
FORMS.type = (name, constructor) => {
	FORMS._types[name] = constructor;
};

module.exports = FORMS;

window._ = _ || {};
_.forms = FORMS;