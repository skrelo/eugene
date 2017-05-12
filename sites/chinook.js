//const url = "https://www.jenningsgroup.com/find-rental-property/";
const url = "https://chinookproperties.appfolio.com/listings";

const Sites = require( '../sites' );
const moment = require( 'moment' );
const _ = require('lodash');
let rentals = [];

class Chinook extends Sites {
	constructor() {
		super( url );
		this.name = "Chinook Properties";
		this.source = "chinook";
		this.image = "http://www.chinookproperties.net/images/logo.png";
		this.active = true;
	}

	run() {
		return super.execPage().then( ( $ ) => {

			const listings = $( '#result_container' ).children( '.listing-item' );
			listings.each( ( index, item ) => {

				let listing = {
					id         : $( item ).attr( 'id' ),
					source     : this.source,
					sourceName : this.name,
					sourceImage: this.image,
					photo      : $( item ).find( '.listing-item__image' ).attr( 'data-original' ),
					link       : 'https://chinookproperties.appfolio.com' + $( item ).find( '.js-listing-title a' ).attr( 'href' ),
					title      : $( item ).find( '.js-listing-title a' ).text(),
					available  : $( item ).find( '.js-listing-available' ).html(),

					location   : $( item ).find( '.js-listing-address' ).text(),
					description: $( item ).find( '.js-listing-description' ).html(),
					pets       : $( item ).find( '.js-listing-pet-policy' ).html(),
					date       : moment().format( 'X' ),

					dateNotActual: true,

				};
				let box = $(item).find( '.detail-box__item' );
				box.each( ( index,details ) => {
					let value = $(details).children( '.detail-box__value' ).text();
					let label = $(details).children( '.detail-box__label' ).text();
					switch ( label ) {
						case 'Rent':
							listing.price = value;
							break;
						case 'Square Feet':
							listing.sqft = value;
							break;
						case 'Bed / Bath':
							let bb = value.match( /^(.*?) \/ (.*?)$/ );
							listing.beds = "undefined" !== typeof bb[1].replace(/\sbd/, '') ? bb[ 1 ] : '';
							listing.baths = "undefined" !== typeof bb[ 2 ].replace(/\sba/, '') ? bb[2] : '';
							break;
					}
				} );
				rentals.push( listing );
			} );
			console.log( 'rentals', rentals.length );
			return super.addListings( rentals );
		} )


	}

}
module.exports = Chinook;