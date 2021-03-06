const url = "https://northwoods.appfolio.com/listings/";

const Sites = require( '../sites' );
const moment = require( 'moment' );
const Promise = require( 'bluebird' );



class Northwoods extends Sites {
	constructor() {
		super( url );
		this.name = "Northwoods Property Management";
		this.source = "northwoods";
		this.image = "http://www.northwoodspm.com/images/common/logo.jpg";
		this.active = true;
	}

	run() {
		let rentals = [];
		let count = 0;
		return super.execPage().then( ( $ ) => {

			const listings = $( '#result_container' ).children( '.listing-item' ).toArray();
			return Promise.each(listings, ( item ) => {

				let listing = {
					id         : $( item ).attr( 'id' ),
					source     : this.source,
					sourceName : this.name,
					sourceImage: this.image,
					photo      : $( item ).find( '.listing-item__image' ).attr( 'data-original' ),
					link       : 'https://northwoods.appfolio.com' + $( item ).find( '.js-listing-title a' ).attr( 'href' ),
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
				const objId = listing.id + this.source;
				rentals.push(listing);
				count++;
				return true;
			} ).then ( () => {
				console.log( this.name + ' rentals', rentals.length );
				return super.addListings( rentals );
			});
		} )


	}

}
module.exports = Northwoods;