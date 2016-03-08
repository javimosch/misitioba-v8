var HTTP_RESPONSE = require('../../scripts/common/constants').HTTP_RESPONSE;
var i18n = require('../i18n/i18n').i18n;
var WORD = require('../../scripts/common/constants').WORD;
var ifThenMessage = require('../common/form-validator').ifThenMessage;
var OPR = require('../common/constants').COMPARISION_OPERATOR;

window.app('admin-user-create',{
	route:'admin/user/create'
}, () => {
	console.log('admin-user-create');
	r = new Ractive({
		el: _.el('output'),
		template: _.el("#tpl-user-create").html(),
		data: {
			login: undefined,
			pass: undefined,
			message: undefined
		},
		register: () => {
			ifThenMessage([
				[r.get('login'), OPR.eq, '', i18n(WORD.FIELD_REQUIRED, ['Login'])],
				[() => r.get('login').length > 8, i18n(WORD.LENGTH_MAX_REQUIRED, ['Login', 8])],
				[r.get('pass'), OPR.eq, '', i18n(WORD.FIELD_REQUIRED, ['Password'])],
				[r.get('pass').length, OPR.lt, 6, i18n(WORD.LENGTH_MIN_REQUIRED, ['Password', 6])]
			], (m) => {
				r.set('message', m[0]);
				setTimeout(() => r.set('message', ''), 2000);
			}, () => {
				//validations ok
				_.http.json.post('/user/create', {
					login: r.get('login'),
					pass: r.get('pass')
				}).then((res) => {
					if (res.code == HTTP_RESPONSE.SAVED_SUCCESS) {
						r.set('message', i18n(WORD.USER_SAVED, [r.get('login')]));
						setTimeout(() => r.set('message', ''), 2000);
						return;
					}
					if (res.code == HTTP_RESPONSE.OBJECT_EXISTS) {
						r.set('message', i18n(WORD.USER_EXISTS));
						setTimeout(() => r.set('message', ''), 2000);
						return;
					}
					_.http.handleUnknownResponse(res);
				});

			});
		}
	});
});