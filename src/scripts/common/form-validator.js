//ex:
/*	compare([
		'jorge','=','jorgee','Jorge no es igual',
		'mario','=','mario','Mario no es igual',
		'10','>','8','El telefono debe tener un maximo de 8 caracteres.'
	],function(messages){
		//messages: ['Jorge no es igual']
	})
*/

var COMPARISON = require('./constants').COMPARISION_OPERATOR;

function ifThenMessage(comparisons, messagesCallback, noMessagesCallback) {
	var messages = [];
	comparisons.forEach((comparison) => {
		var v1 = comparison[0];

		if (typeof v1 === 'function') {
			if (v1()) {
				messages.push(comparison[1]);
			}
		} else {
			var operator = comparison[1];
			var v2 = comparison[2];
			var m = comparison[3];
			var cb = comparison[4] || undefined; //custom cb for field when msg exists.
			if (operator == COMPARISON.eq) {
				if (v1 == v2) messages.push(m);
			}
			if (operator == COMPARISON.ne) {
				if (v1 != v2) messages.push(m);
			}
			if (operator == COMPARISON.gt) {
				if (v1 > v2) messages.push(m);
			}
			if (operator == COMPARISON.lt) {
				if (v1 < v2) messages.push(m);
			}
			if (operator == COMPARISON.ge) {
				if (v1 >= v2) messages.push(m);
			}
			if (operator == COMPARISON.le) {
				if (v1 <= v2) messages.push(m);
			}
		}
		if (messages.filter((_m) => _m == m).length > 0 && cb) cb();
	});
	if (messages.length > 0) {
		messagesCallback(messages);
	} else {
		noMessagesCallback();
	}
}

module.exports.ifThenMessage = ifThenMessage;