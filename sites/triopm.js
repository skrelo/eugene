const url = "https://trio.appfolio.com/listings";
const query = {
	1494249783168: '',
	theme_color  : "#006892",
	iframe_id    : "af_iframe_0"
};
let cookie = {
	key: "ASP.NET_SessionId",
	value: "fy5afhm1uu2o3jxpa0hnm0q0",
	domain: 'www.triopm.com',
	httpOnly: true,
	maxAge: 31536000
};

const moment = require( 'moment' );

const Sites = require( '../sites' );
const Promise = require( 'bluebird' );



class TrioPM extends Sites {
	constructor() {
		super( url, {} );
		this.name = "Trio PM";
		this.source = "triopm";
		this.image = "https://pa.cdn.appfolio.com/trio/images/95a1d4bd-1c10-49b8-8dbf-ea32f0c2fa51/medium.jpg";
		this.active = true;
	}

	run() {
		let rentals = [];
		let count = 0;
		//super.setCookie( cookie, "http://triopm.com");
		return super.execPage().then( ( $ ) => {
			const listings =  $( '#result_container' ).children( '.listing-item' ).toArray();
			return Promise.each( listings, (item) => {
				let bb = $(item).find( '.js-listing-blurb-bed-bath' ).text();
				let bed = bb.match(/^(\d{1,}) bd/);
				let bath = bb.match(/(\d{1,}) ba/);
				let sqft = $( item ).find('.js-listing-square-feet').html();

				if ( sqft) {
					sqft = sqft.match( /Square Feet: (\d{1,})/i )[ 1 ];
				}
				let listing = {
					id         : $(item).attr( 'id' ),
					source: this.source,
					sourceName: this.name,
					sourceImage: this.image,
					photo      : $(item).find( '.listing-item__image' ).attr( 'data-original' ),
					price      : $(item).find( '.listing-item__facts__rent' ).text(),
					bedbath    : $(item).find( '.js-listing-blurb-bed-bath' ).text(),
					title      : $(item).find( '.listing-item-title a' ).text(),
					location    : $(item).find( '.js-listing-address' ).text(),
					description: $(item).find( '.js-listing-description' ).html(),
					pets       : $(item).find( '.js-listing-pet-policy' ).html(),
					available: $(item).find('.js-listing-available').html(),
					date: moment().format('X'),
					sqft:sqft ? sqft : 0,
					beds:bed ? bed[1]: 0,
					baths:bath? bath[1]: 0,
					dateNotActual: true,
					link    : 'https://trio.appfolio.com' + $(item).find( '.js-hand-hidden-link-to-detail' ).attr( 'href' )
				};
				const objId = listing.id + this.source;
				rentals.push(listing);
				count++;
			}).then( () => {
				console.log( this.name + ' rentals', rentals.length );
				return super.addListings( rentals );
			});
		} );
	}
}

module.exports = TrioPM;