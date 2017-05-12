const mongoose = require('mongoose');
mongoose.Promise = require('bluebird');


let connection = mongoose.connection;
const uri = 'mongodb://127.0.0.1:27017/rentals';
let db = mongoose.connect(uri);

connection.on('connected', function () {
	console.log('Mongoose default connection open to ' + uri);
});

connection.on('error',function (err) {
	console.log('Mongoose default connection error: ' + err);
});

connection.on('disconnected', function () {
	console.log('Mongoose default connection disconnected');
});

process.on('SIGINT', function() {
	connection.close(function () {
		console.log('Mongoose default connection disconnected through app termination');
		process.exit(0);
	});
});

connection.once('open', function() {
	console.log( "Mongoose Connected" );
});

module.exports = connection;