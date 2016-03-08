var lang = function(src, defaultLang) {
	var obj = null; //json object

	function fetchJson(url, params) {
		var request, method = 'GET';
		if (window.XMLHttpRequest) {
			request = new window.XMLHttpRequest();
		} else {
			try {
				request = new ActiveXObject("MSXML2.XMLHTTP");
			} catch (ex) {
				return null;
			}
		}
		request.open(method, url, false);
		request.send(null);
		if (request.readyState === 4 && request.status === 200)
			return JSON.parse(request.responseText);
		return null;
	}

	obj = fetchJson(src);

	var LANG_KEYS = Object.keys(obj.LANGUAGES);
	var CURRENT_LANGUAGE = LANG_KEYS[0]; //EX: ES EN FRA

	LANG_KEYS.forEach(function(v) {
		if (defaultLang == v) {
			CURRENT_LANGUAGE = defaultLang;
		}
	});

	//console.log('Current Lang ', CURRENT_LANGUAGE);

	function currentLanguageHasTheGivenWord(wordcode) {
		if (typeof obj.DATA[CURRENT_LANGUAGE] === 'undefined') {
			return false;
		} else {
			if (typeof obj.DATA[CURRENT_LANGUAGE][wordcode] === 'undefined') {
				return false;
			}
		}
		return true;
	}

	function bestAvailableLangWithTheGivenWord(wordcode) {
		var r = null;
		LANG_KEYS.forEach(function(v) {
			if (typeof obj.DATA[v] !== 'undefined') {
				if (typeof obj.DATA[v][wordcode] !== 'undefined') {
					r = v;
				}
			}
		});
		return r;
	}

	var fn = function(_WORD_CODE, parameters) {
		var r = "";
		if (currentLanguageHasTheGivenWord(_WORD_CODE)) {
			r = obj.DATA[CURRENT_LANGUAGE][_WORD_CODE];
		} else {
			var langCode = bestAvailableLangWithTheGivenWord(_WORD_CODE);
			if (langCode) {
				r = obj.DATA[langCode][_WORD_CODE];
			} else {
				r = '{' + _WORD_CODE + '}';
			}
		}
		if (parameters) {
			parameters.forEach((p, index) => {
				//console.log('replacing','{' + (parseInt(index)+1) + '}',p);
				r = r.replace('{' + (parseInt(index) + 1) + '}', p);
			});
		}
		return r;
	};
	fn.languages = function() {
		return obj.LANGUAGES;
	};
	fn.set = function(_LANGUAGE) {
		CURRENT_LANGUAGE = _LANGUAGE;
	};
	fn.isDefault = () => CURRENT_LANGUAGE === defaultLang;
	fn.current = () => CURRENT_LANGUAGE;
	fn.availableLangs = LANG_KEYS;
	fn.reload = function() {
		obj = fetchJson(src);
	};
	return fn;
};
module.exports = lang;

var filePath = location.origin + document.head.dataset.root +
	'/files/i18n/language.json';
module.exports.filePath = filePath;
module.exports.i18n = lang(filePath);
module.exports.i18n.set(document.head.dataset.language);