

exports.QUERY = ['model'];

exports.validate = function(body,fields){
	console.log('Validating',body);
	fields.forEach(function(v,k){
		if(typeof body[v] === 'undefined'){
			throw Error('Request require parameter '+v);
		}
	});
	return true;
};