
require("babel-register");

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



var mongodb = require('mongodb');
var uri = "mongodb://root:root@ds051553.mongolab.com:51553/misitioba";
var mongoose = require('mongoose');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
	listen();
});
mongoose.connect(uri);

console.log('Connecting to mongo');


var Schema = mongoose.Schema;

var articleSchema = new Schema({
	title: String,
	author: String,
	content: String,
	date: {
		type: Date,
		default: Date.now
	},
	tags: {
		votes: Number,
		favs: Number
	}
});

var Article = mongoose.model('Article', articleSchema);

app.get('/article/count', function(req, res) {
	Article.count({title:"Poca madre"}).then(function(err, count){

		res.send("[" + count + "] entries found.");
	});
});


app.get('/article/save', function(req, res) {

	var a = new Article();
	a.title = "Poca madre";
	a.save().then((err, a, num) => {
		Article.count({}).then((err, count) => {
			res.send("[" + count + "] entries found.");
		});
	});

});

function listen() {
	var PORT = process.env.PORT || 3000;
	//app.use('/static', express.static(__dirname + '/public'));
	//app.use('/static', express.static('public'));
	app.listen(PORT, function() {
		console.log('Example app listening on port ' + PORT + '!');
	});
}