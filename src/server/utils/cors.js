var cors = require('express-cors');
var argv = require('yargs').argv;

var allowedOrigins = [
	'*.misitioba.com',
];

console.log(argv);

var allowLocalHost = process.env.allowLocalHostOrigin === '1';
if (allowLocalHost || argv.local) {
	allowedOrigins.push('http://localhost:3000',
		'http://localhost:5000', '*.localhost:*');
}

if(process.env.allowLocalHostAny === '1' || argv.local){
	allowedOrigins.push('*');	
}

exports.configure = function(app) {
	app.use(cors({
		allowedOrigins: allowedOrigins
	}));
};