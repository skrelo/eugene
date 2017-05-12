var mongoose = require( 'mongoose' );
var Schema = mongoose.Schema;
var exports = module.exports = {};
exports.listings = new Schema ( {
	id      : String,
	source  : String,
	price   : String,
	beds    : String,
	baths   : String,
	title   : String,
	location: String,
	photo   : String,
	link: String,
	sqft: String,
	date: String,
	dateNotActual: Boolean
} );
