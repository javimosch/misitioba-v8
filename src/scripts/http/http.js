(() => {
	//https://github.com/ded/Reqwest
	
	//var apiURL = 'https://misitioba-express.herokuapp.com/api';
	//var apiURL = 'http://localhost:3000/api';
	var apiURL = 'http://localhost:5000/api';

	var defaults = {
		url: apiURL,
		//type: 'json',
		method: 'post',
		contentType: 'application/json',
		crossOrigin: true,
		data: ''
	};

	function validate(n,p){
		p.forEach((d)=>{
			if(_.isUndefined(d[1]) || _.isNull(d[1]) ){
				throw Error('http ['+n+'] :'+ d[0]+' required');
			}
		});
	}

	function call(p) {
		return reqwest(_.extend(_.clone(defaults), p));
	}

	function jsonPost(url, data) {
		validate('jsonPost',[['url',url],['data',data]]);
		return call({
			data: JSON.stringify(data),
			url: defaults.url + url
		});
	}

	function jsonGet(url, data) {
		validate('jsonGet',[['url',url],['data',data]]);
		return call({
			data: JSON.stringify(data),
			url: defaults.url + url,
			method:"get"
		});
	}

	function handleUnknownResponse(res){
		console.warn(res);
		throw Error('http : unknown response.');
	}

	_.extend(_, {
		http: {
			defaults: defaults,
			json: {
				post: jsonPost,
				get:jsonGet
			},
			handleUnknownResponse:handleUnknownResponse
		}
	});
})();