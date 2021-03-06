const url = "https://roseburg.craigslist.org/search/apa?min_price=600&max_price=1800&availabilityMode=2&housing_type=2&housing_type=3&housing_type=4&housing_type=6&housing_type=9";

const moment = require('moment');
let rentals = [];
let count = 0;
const Sites = require('../sites');
const Promise = require('bluebird');
const cheerio = require('cheerio');
const request = require('request-promise');
const util = require('util');

const _ = require('lodash');


class Craigslist extends Sites {
	constructor() {
		super( url );
		this.name = "Craigslist";
		this.source = "craigslist";
		this.image = "";
		this.active = true;
	}

	run() {
		let rentals = [];
		let count = 0;
		return super.execPage().then( ( $ ) => {
			let listings = $( '#sortable-results' ).children( '.rows' ).children( '.result-row' ).toArray();
			listings = [listings[0]];
			return Promise.each(listings, ( item ) => {
				let listingUrl = $( item ).find( '.result-title' ).attr( 'href' );
				if ( _.isUndefined(listingUrl) ) {
					return true;
				}else {
					listingUrl = listingUrl.indexOf( '.craigslist.org' ) > -1 ? "https:" + listingUrl : "https://roseburg.craigslist.org" + listingUrl;
					let options = {
						method   : 'GET',
						uri      : listingUrl,
						transform: ( body ) => {
							return cheerio.load( body );
						}
					};
					return request( options ).then( ( $_ ) => {
						/*let bb = $_( '#titletextonly' ).html();
						 let bed = bb.match( /(\d{1,}) bedroom/ );
						 let bath = bb.match( /(\d+(\.\d{1,2})?) bath/ );*/

						let bb = $_( '.mapAndAttrs' ).children( '.attrgroup' ).text();
						let bed = bb.match( /(\d{1,2})br/i );
						let bath = bb.match( /(\d{1,2})ba/i );

						let group = $_( '.mapAndAttrs' ).text();
						const pets = group.indexOf( 'dogs are OK' ) > -1;
						let img = $_( '.swipe-wrap' ).find( '.slide.first' ).first().children( 'img' ).attr( 'src' );
						let dt = $_( '.timeago' ).attr( 'datetime' );
						const date = moment( dt ).format( 'X' );
						const link = $_( 'link[rel="canonical"]' ).attr( 'href' );
						let id = link.match( /(\d{1,})\.html/ );

						let listing = {
							id           : id[ 1 ],
							title        : $_( 'title' ).html(),
							price        : $_( '.price' ).html(),
							beds         : bed ? bed[ 1 ] : 0,
							baths        : bath ? bath[ 1 ] : 0,
							pets         : pets ? 'Dogs' : '',
							photo        : img,
							source       : this.source,
							sourceName   : this.name,
							sourceImage  : this.image,
							location     : $_( '.mapaddress' ).html(),
							available    : $_( '.property_date' ).html(),
							date         : date,
							dateNotActual: false,
							link         : link,
							description  : $_( '#postingbody' ).html()
						};
						//console.log( $_.html());

						const objId = listing.id + this.source;
						rentals.push(listing);
						count++;
						return true;
					} ).catch( ( err ) => {
						console.log( `Issue getting ${listingUrl}`, err );
						return true;
					} );
				}
			} ).then( () => {
				console.log( this.name + ' rentals', rentals.length );
				return super.addListings( rentals );
			});
		} );
	}
}

module.exports=Craigslist;

