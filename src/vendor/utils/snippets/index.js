

var toggleClass = (el, cls, val) => {
	var has = el.className.indexOf(cls) !== -1;
	if (val === undefined) el.className = el.className += (!has) ? cls : '';
	if (val === true) {
		if (!has) el.className = (el.className + ' ' + cls).trim();
	}
	if (val === false && has) {
		el.className = el.className.replace(cls, '').trim();
	}
}

function camelToDash(str, lower) {
	if(!str) return str;
	var r = str.replace(/\W+/g, '-')
		.replace(/([a-z\d])([A-Z])/g, '$1-$2');
	if (lower) {
		r = r.toLowerCase();
	}
	return r;
}

function dashToCamel(str) {
	return str.replace(/\W+(.)/g, function (x, chr) {
		return chr.toUpperCase();
	})
}
	
	
//-When the file dialog is opened and a file is selected
var bindFileInput = ((input, callback) => {
				function readSingleFile(e) {
		var file = e.target.files[0];
		if (!file) {
			return;
		}
		var reader = new FileReader();
		reader.onload = function (e) {
			var contents = e.target.result;
			callback(contents);
			document.querySelector(input).value = '';
		};
		reader.readAsText(file);
				}
				document.querySelector(input).addEventListener('change', readSingleFile, false);
});


var inlineif = (condition, a, b) => (condition) ? a : b;

var push = (arr,val)=> {
	arr.push(val);
	return arr;
};

module.exports = (_) => {
	_.toggleClass = toggleClass;
	_.camelToDash = camelToDash;
	_.dashToCamel = dashToCamel;
	_.bindFileInput = bindFileInput;
	_.if = inlineif;
	_.push = push;
};