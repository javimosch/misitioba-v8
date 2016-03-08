require("babel-register");
var express = require('express');
var bodyParser = require('body-parser');
var app = express();
app.use(bodyParser.json());

require('./utils/cors').configure(app);
require('./routes/routes-main').configure(app);
require('./routes/routes-user').configure(app);
require('./routes/routes-testing').configure(app);

var PORT = process.env.PORT || 5000;
//app.use('/static', express.static(__dirname + '/public'));
//app.use('/', express.static('express/admin'));
app.listen(PORT, function() {
	console.log('Express running at port ' + PORT + '!');
});