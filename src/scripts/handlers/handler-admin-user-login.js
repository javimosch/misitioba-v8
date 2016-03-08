var HTTP_RESPONSE = require('../../scripts/common/constants').HTTP_RESPONSE;
var i18n = require('../i18n/i18n').i18n;
var WORD = require('../../scripts/common/constants').WORD;
var ifThenMessage = require('../common/form-validator').ifThenMessage;
var OPR = require('../common/constants').COMPARISION_OPERATOR;

window.app('admin-user-login',{
	route:'admin/login'
} ,(vm) => {

	console.log('admin-user-login');

	var r = new Ractive({
		el: _.el('output'),
		template: _.el("#tpl-login").html(),
		data: {
			login: undefined,
			pass: undefined,
			message:undefined
		},
		login: () => {

			ifThenMessage([
				[r.get('login'), OPR.eq, '', i18n(WORD.FIELD_REQUIRED, ['Login'])],
				[r.get('pass'), OPR.eq, '', i18n(WORD.FIELD_REQUIRED, ['Password'])],
			], (m) => {
				r.set('message', m[0]);
				setTimeout(() => r.set('message', ''), 2000);
			}, () => {
				_.http.json.post('/user/login', {
					login: r.get('login'),
					pass: r.get('pass')
				}).then((res) => {
					if (res.code == HTTP_RESPONSE.OBJECT_NOT_FOUND) {
						r.set('message', i18n(WORD.USER_LOGIN_INVALID, [r.get('login')]));
						setTimeout(() => r.set('message', ''), 2000);
						return;
					}
					if (_.includes([HTTP_RESPONSE.SESSION_CREATED,HTTP_RESPONSE.SESSION_RESTORED],res.code)) {
						vm.reroute('admin-home',{
							loggedAs:r.get('login')
						});
						return;
					}
					_.http.handleUnknownResponse(res);
				});
			});

		}
	});


	//list of users
	var users = new Ractive({
		el: _.el('output#users'),
		template: _.el("#tpl-users").html(),
		data: {
			items: []
		},
		onrender: () => {
			_.http.json.get('/user/list', {}).then((res) => {
				users.set('items', res.result);
			});
		}
	});

	//window.s = scope;
});