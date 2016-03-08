var css = (function() {
	var scopes = {};
	function id(selectors){
		var rta = '';
		Object.keys(selectors).forEach(function(k){
			rta += k;
		});
		return btoa(rta);
	}
	function scope(selectors) {
		var _id = id(selectors);
		if(scopes[_id]!==undefined) return scopes[_id];
		//
		var el = document.createElement('style');
		el.setAttribute('type', 'text/css');
		el.id = _id;
		document.querySelector('head').appendChild(el);
		var data = {};
		var rta = {
			data:data,
			render: function() {
				var html = "";
				for (var selector in data) {
					var rules = data[selector];
					html += selector + "{";
					for (var rule in rules) {
						html += rule + ": " + rules[rule] + ';';
					}
					html += "}";
				}
				console.log('css.render');
				el.innerHTML = html;
			}
		};
		scopes[_id] = rta;
		return rta;
	}
	var fn = function(selectors) { //rule = {body:{background:"red"}}
		var self = scope(selectors);
		for (var selector in selectors) {
			if (self.data[selector] === undefined) {
				self.data[selector] = selectors[selector];
			} else {
				for (var prop in selectors[selector]) {
					self.data[selector][prop] = selectors[selector][prop];
				}
			}
		}
		self.render();
	};
	fn.to = function(selector) {
		var p = {};
		p[selector] = {};
		return {
			set: function(props) {
				p[selector] = props;
				fn(p);
			}
		};
	};
	return fn;
})();
module.exports = css;
top.css = css;