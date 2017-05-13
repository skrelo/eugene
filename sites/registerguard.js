var url = "http://housing.registerguard.com/homes/search/results?terms=for-rent#PropertyType_singlefamily=single_family%7C1%7C&page=1";

const moment = require( 'moment' );
const _ = require('lodash');
const Sites = require( '../sites' );
const cheerio = require('cheerio');
const Promise = require('bluebird');
const request = require('request-promise');
const md5 = require('md5');
let rentals = [];
let count = 0;

class RegisterGuard extends Sites {
	constructor() {
		super( url, {} );
		this.name = "Register Guard";
		this.source = "registerguard";
		this.image = "http://static.registerguard.com/v5/drone/prod/1.0.0/20140609/1/images/flag.png";
		this.active = true;
	}

	run() {
		//super.setCookie( cookie, "http://RegisterGuard.com");
		return super.execPage().then( ( $ ) => {
			const listings =  $( '#docHolder').children('.aiResultsWrapper');
			var l = [];

			return Promise.each(listings.toArray(), (item) => {
				let listingUrl = 'http://housing.registerguard.com' + $(item).find( '.aiResultsDescriptionNoAdvert' ).children('a').attr( 'href' );
				let options = {
					method   : 'GET',
					uri      : listingUrl,
					transform: ( body ) => {
						return cheerio.load( body );
					}
				};
				const keys = {'Rent': 'price', 'Post Date': 'date', 'Address':'location', 'Bedrooms':'beds', 'Square Feet':'sqft'};
				return request( options ).then( ( $_ ) => {
					let listing = {};
					let table = $_( '#detailTabTable' ).find( 'tr' );
					table.each( ( index,tr ) => {
						let cell = $_( tr ).find( 'td' );
						for ( let ky in keys ) {
							if ( $_( cell[ 0 ] ).text().indexOf( ky ) > -1 ) {
								listing[ keys[ ky ] ] = String($_( cell[ 1 ] ).text()).trim().replace(/  /g, '');
							}
						}
					} );
					if ( listing.date) {
						listing.date = moment( new Date(listing.date) ).format( 'X' );
					}
					listing.photo = "http://slb.adicio.com/platform/images/realestate/search/noPhotoAvailableLrg.jpg";
					listing.title = $_( '.aiDetailPageTitle' ).find( 'span' ).text();
					listing.dateNotActual = false;
					listing.link = listingUrl;
					listing.source = this.source;
					listing.sourceName = this.name;
					listing.sourceImage = this.image;

					const desciframe = $_( '#iframeDescription' ).attr( 'src' );

					var noptions = {
						method   : 'GET',
						uri      : `http://housing.registerguard.com${desciframe}`,
						transform: ( body ) => {
							return cheerio.load( body );
						}
					};
					return request( noptions ).then( ( $__ ) => {
						listing.description = String($__( '.detailDesc' ).html()).trim();
						listing.id = md5(listing.description + listing.title);
						const objId = listing.id + this.source;
						rentals.push(listing);
						count++;
						return true;
					} );
				});

			}).then( () => {
				console.log( this.name + ' rentals', rentals.length );
				return super.addListings( rentals );
			});
		} );
	}
}

module.exports = RegisterGuard;