/* global _ */

//var _ =  _ || {};

_.extend = (a, b) => {
	if (a == null) return null;
	return Object.assign(a, b);
};

var toggleClass = (el, cls, val) => {
	var has = el.className.indexOf(cls) !== -1;
	if (val === undefined) el.className = el.className += (!has) ? cls : '';
	if (val === true) {
		if (!has) el.className = (el.className + ' ' + cls).trim();
	}
	if (val === false && has) {
		el.className = el.className.replace(cls, '').trim();
	}
	return el;
}


_.extend(_, {
	dom: (t) =>{
		if(t.indexOf('<') !== -1){
			return _.el(_.el(document.createElement('output')).html(t).firstChild);
		}else{
			return _.el(document.createElement(t))	
		}
	},
	el: (() => {
		var element = (e) =>
			_.extend(e, {
				val:(v)=>{
					if(v===undefined) return e.value || undefined;
					e.value = v;
					return e;	
				},
				html: (raw) => {
					if (raw !== undefined) {
						e.innerHTML = raw;
						return e;
					} else {
						return e.innerHTML;
					}
				},
				append: (el) => {
					//console.log(el);
					e.appendChild(el);
					return e;
				},
				prependTo: (el) => {
					if (el.childNodes.length === 0) return e.append(el);
					else {
						el.insertBefore(e, el.childNodes[0])
						return e;
					}
				},
				appendTo: (el) => {
					el.appendChild(e);
					return e;
				},
				el: (n) => element(e.querySelector(n)),
				attr: (t) => {
					if (typeof t === 'string') e.getAttribute(t);
					else {
						Object.keys(t).forEach((k) => {
							e.setAttribute(k, t[k]);
						});
					}
					return e;
				},
				toggle: (cls, val) => toggleClass(e, cls, val),
				cls: (o) => {
					Object.keys(o).forEach((k) => e.toggle(k, o[k]));
					return e;
				}
			});

		var self = (t) => {
			if (typeof t === 'string') {
				return element(document.querySelector(t));
			} else {
				return element(t);
			}
		}
		return _.extend(self, {
			convert:(arr)=>{
				_.each(arr,(v,k)=>arr[k]=element(v));
				return arr;
			},
			all: (n) => _.el.convert(document.querySelectorAll(n)),
			each:(n,cb)=> _.each(_.el.all(n),cb),
			toggleClass: toggleClass
		});
	})()
});

