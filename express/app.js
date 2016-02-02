var express = require('express');
var app = express();

var NAME = process.env.NAME || 'KIKO';

app.get('/', function(req, res) {
	res.send('Hello ' + NAME + '!');
});



var api_key = 'key-XXXXXXXXXXXXXXXXXXXXXXX';
var domain = 'mydomain.mailgun.org';
var mailgun = require('mailgun-js')({
	apiKey: 'key-4b58a66565bdaeceeaa5c3a0b29f64f8',
	domain: 'sandbox6495084a9e554582a14b91bf2b45baa0.mailgun.org'
});


var data = {
	to: "arancibiajav@gmail.com",
	from: "contacto@misitioba.com",
	subject: "Soporte tecnico",
	text: "Hola, vengo a flotar"
};



app.get('/send', function(req, res) {

	mailgun.messages().send(data, function(error, body) {
		res.send(body);
	});

});


var PORT = process.env.PORT || 3000;
app.listen(PORT, function() {
	console.log('Example app listening on port ' + PORT + '!');
});