var mailgun = require('../mailing/mailing').mailgun;
var mailgunHTML = require('../mailing/mailing').mailgunHTML;

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

	app.get('/mailing/html', function(req, res) {
		var html = ""+
		"<img src='http://www.misitioba.com/img/logo.jpg'/>"+
		"<h1 style='text-align: center'>A beautiful WYSIWYG HTML text editor</h1>"+
		"<h3 class='text-light' style='text-align: center'><a href='/wysiwyg-editor/docs/examples' title='Examples'>Tons of examples</a> make it easy to integrate and your users will simply love its clean design.</h3>";

		var data = {
			to: "arancibiajav@gmail.com",
			from: "contacto@misitioba.com",
			subject: "JA/Misitioba: Propuesta de sitio web",
			//text: "",
			//body: "",
			html: html,
		};

		mailgunHTML(data,function(json){
			res.json(json);
		});

	});


	



};