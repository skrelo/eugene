//const url = "https://www.jenningsgroup.com/find-rental-property/";
const url = "https://jenningsgroup.appfolio.com/listings";

const Sites = require('../sites');
const moment = require('moment');
let rentals = [];

class Jennings extends Sites {
	constructor() {
		super( url );
		this.name = "Jennings Group";
		this.source = "jennings";
		this.image = "https://www.jenningsgroup.com/themes/slate/i/jennings_logo_2014.png";
		this.active = true;
	}

	run() {
		return super.execPage().then( ( $ ) => {

			const listings = $( '#result_container' ).children( '.listing-item' );
			listings.each( ( index, item ) => {
				//console.log($(item).html());process.exit();
				let bb = $( item ).find( '.js-listing-blurb-bed-bath' ).text();
				let bed = bb.match( /^(\d{1,}) bd/ );
				let bath = bb.match( /(\d{1,}) ba/ );
				let sqft = $( item ).find('.js-listing-square-feet').html();
				if ( sqft) {
					sqft = sqft.match( /Square Feet: (\d{1,})/i )[ 1 ];
				}

				let listing = {
					id           : $( item ).attr( 'id' ),
					source       : this.source,
					sourceName   : this.name,
					sourceImage  : this.image,
					photo        : $( item ).find( '.listing-item__image' ).attr( 'data-original' ),
					price        : $( item ).find( '.listing-item__facts__rent' ).text(),
					bedbath      : $( item ).find( '.js-listing-blurb-bed-bath' ).text(),
					title        : $( item ).find( '.listing-item-title a' ).text(),
					location     : $( item ).find( '.js-listing-address' ).text(),
					description  : $( item ).find( '.js-listing-description' ).html(),
					pets         : $( item ).find( '.js-listing-pet-policy' ).html(),
					available: $(item).find('.js-listing-available').html(),
					date         : moment().format( 'X' ),
					sqft         : sqft ? sqft : 0,
					beds         : bed ? bed[ 1 ] : 0,
					baths        : bath ? bath[ 1 ] : 0,
					dateNotActual: true,
					link         : 'https://trio.appfolio.com' + $( item ).find( '.js-hand-hidden-link-to-detail' ).attr( 'href' )
				};
				rentals.push( listing );
			} );
			console.log( 'rentals', rentals.length );
			return super.addListings( rentals );
		} )


	}

}
module.exports = Jennings;