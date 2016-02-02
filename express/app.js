require("babel-register");
var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var cors = require('express-cors');

app.use(bodyParser.json());

app.use(cors({
	allowedOrigins: [
		'*.misitioba.com'
	]
}));

require('./routes/routes-main').configure(app);
require('./routes/routes-testing').configure(app);

var PORT = process.env.PORT || 3000;
//app.use('/static', express.static(__dirname + '/public'));
app.use('/', express.static('express/admin'));
app.listen(PORT, function() {
	console.log('Express running at port ' + PORT + '!');
});