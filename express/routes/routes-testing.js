var mailgun = require('../mailing/mailing').mailgun;

exports.configure = function(app) {
	

	app.get('/mailing/test', function(req, res) {
		var data = {
			to: "arancibiajav@gmail.com",
			from: "contacto@misitioba.com",
			subject: "Soporte tecnico",
			text: "Hola, vengo a flotar"
		};
		mailgun.messages().send(data, function(error, body) {
			res.send(body);
		});

	});


};