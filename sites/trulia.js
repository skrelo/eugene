const url = "https://www.trulia.com/for_rent/Eugene,OR/1200-1800_price/SINGLE-FAMILY_HOME_type/lg_dogs,sm_dogs_pets/";

const Sites = require('../sites');
const moment = require('moment');
const cheerio = require('cheerio');
const Promise = require('bluebird');
const request = require('request-promise');


class Trulia extends Sites {
	constructor() {
		super( url );
		this.name = "Trulia";
		this.source = "trulia";
		this.active = true;
		this.image = "";

	}

	run() {
		let rentals = [];
		return super.execPage().then( ( $ ) => {
			let rentals = [];
			const listings = $( '.mvn.containerFluid' ).children( 'li.smlCol12' ).toArray();
			return Promise.each( listings, ( item ) => {
				let id = $(item).find('.tileLink').attr('href');
				id = id.match(/\/rental\/(\d{1,})-/);
				let listing = {
					id        : id[1],//$( item ).attr( 'data-reactid' ),
					//photo     : $( item ).find( '.cardPhoto' ).css( 'background-image' ),
					price     : $( item ).find( '.cardPrice' ).text(),
					beds      : $( item ).find( 'li[data-auto-test="beds"]' ).text(),
					baths     : $( item ).find( 'li[data-auto-test="baths"]' ).text(),
					sqft      : $( item ).find( 'li[data-auto-test="sqft"]' ).text(),
					source    : this.source,
					sourceName: this.name,
					link      : "https://www.trulia.com" + $( item ).find( '.tileLink' ).attr( 'href' ),
					//title     : $( item ).find( '.typeTruncate' ).text(),
				};
				let options = {
					method   : "GET",
					uri      : listing.link,
					transform: ( body ) => {
						return cheerio.load( body );
					}
				};
				return request( options ).then( ( $j ) => {
					const date = $j( '.pbn' ).children( 'span' ).text();
					listing.date = moment( new Date(date) ).format( 'X' );
					listing.address = $j( '.headingDoubleSuper' ).text();
					listing.title = $j( '.cols14' ).children( '.h5' ).text();
					listing.description = String($j( '#corepropertydescription' ).html() + " " + $j( '#moreDescription' ).html()).trim();
					listing.dateNotActual = false;
					listing.pets = $j( '.badgeSecondary' ).text().indexOf( 'Pet Friendly' ) > -1 ? 'Yes' : 'No';
					let img =  $j('.photoPlayerCurrentItem').attr('style');
					img = img.match(/url\('(.*?)'\)/);
					listing.photo = "https:" + img[1];

					const id = `${listing.id}${this.source}`
					rentals.push(listing);
					return true;
				} );
			} ).catch( ( err ) => {
				console.log( err );
				return true;
			} );
		} ).then( () => {
			console.log( this.name + ' rentals', rentals.length );
			return super.addListings( rentals );
		} );
	}
}

module.exports = Trulia;

