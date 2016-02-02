var jsonfile = require('jsonfile')
//var objs = {}; //container for json data in runtime.

var lang = function (src, defaultLang) {
	var obj = null; //json object
	//if (typeof objs[src] !== 'undefined') {
	//	obj = objs[src];
	//} else {
		obj = jsonfile.readFileSync(src);
		//objs[src] = obj;
	//}
	//
	var LANG_KEYS = Object.keys(obj.LANGUAGES);
	var CURRENT_LANGUAGE = LANG_KEYS[0]; //EX: ES EN FRA
	
	LANG_KEYS.forEach(function (v) {
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
		LANG_KEYS.forEach(function (v) {
			if (typeof obj.DATA[v] !== 'undefined') {
				if (typeof obj.DATA[v][wordcode] !== 'undefined') {
					r = v;
				}
			}
		});
		return r;
	}

	var fn = function (_WORD_CODE) {
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
		return r;
	};
	fn.languages = function () {
		return obj.LANGUAGES;
	};
	fn.set = function (_LANGUAGE) {
		CURRENT_LANGUAGE = _LANGUAGE;
	};
	fn.isDefault=()=> CURRENT_LANGUAGE === defaultLang;
	fn.current = ()=> CURRENT_LANGUAGE;
	fn.availableLangs = LANG_KEYS;
	fn.reload = function(){
		obj = jsonfile.readFileSync(src);
	}
	return fn;
};
module.exports = lang;