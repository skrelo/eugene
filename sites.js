'use strict';

const Promise = require( 'bluebird' );
const request = require( 'request-promise' );
const errors = require( 'request-promise/errors' );


const path = require( 'path' );
const childProcess = require( 'child_process' );
const phantomjs = require( 'phantomjs' );
const cheerio = require( 'cheerio' );
const tough = require( 'tough-cookie' );
const email = require( 'nodemailer' );
const xoauth2 = require( 'xoauth2' );


let binPath = phantomjs.path;
let childArgs = [];


const mail = require( './lib/mail' );

module.exports = class Sites {
	constructor( url, query = {} ) {
		this.url = url;
		this.query = query;
		this.pagination = [];
		this.name = "Sites";
		this.source = "";
		this.image = "";

		this.isBin = false;
		this.isJSON = false;
		this.headers = {
			'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:47.0) Gecko/20100101 Firefox/47.0 Mozilla/5.0 (Macintosh; Intel Mac OS X x.y; rv:42.0) Gecko/20100101 Firefox/42.0'
		};
		this.binFile = "";
		this.method = "GET";
		this.active = true;
		//this.cookieJar = null;
		this.currentPage = 1;
		this.listings = [];

		this.connection = require( './lib/mongo' );
		const schema = require( './lib/Schema' );
		this.Rentals = this.connection.model( 'rentals', schema.listings );
		this.connection.Promise = Promise;
	}

	setPagination( urls ) {
		this.pagination = urls;
	}

	getPage() {
		return Promise.reject( null );
	}

	getPages() {
		if ( !this.pagination.length ) {
			return false;
		}
	}

	parsePage() {
		return Promise.reject( null );
	}

	isActive() {
		return true === this.active;
	}

	setCookie( cookie, domain ) {
		const c = new tough.Cookie( cookie );
		const jar = request.jar();
		jar.setCookie( c, domain );
	}

	setHeader( key, value ) {
		this.headers[ key ] = value;
	}

	execPage() {
		if ( true === this.isBin ) {
			return this.execBin();
		} else {
			//url = this.query ? `${this.url}?${this.query}` : this.url;
			let options = {
				method   : this.method,
				uri      : this.url,
				transform: ( body ) => {
					return cheerio.load( body );
				},
				json     : this.isJSON,
				headers  : this.headers
			};
			if ( this.cookieJar ) {
				options.cookieJar = this.cookieJar;
			}
			if ( this.query ) {
				options.qs = this.query;
			}
			return request( options ).then( ( $ ) => {

				return Promise.resolve( $ );
			} ).catch( errors.TransformError, function ( reason ) {
				console.log( reason.cause ); // => Transform failed!
				// reason.response is the original response for which the transform operation failed
			} );
		}
	}

	addListings( listings ) {
		let fullListings = [];
		const vm = this;
		return Promise.each( listings, ( listing ) => {
			return this.Rentals.find( { id: listing.id, source: listing.source } ).then( ( existing ) => {
				if ( !existing.length ) {
					var rental = new this.Rentals( listing );
					return rental.save().then( () => {
						fullListings.push( listing );
						return true;
					} ).catch( ( err ) => {
						console.log( 'err save', err);
						throw err;
						process.exit();
					} );
				}else {
					console.log( 'existed');
					return true;
				}
			} ).catch( ( err ) => {
				console.error( 'catch', err );
				throw err;
				process.exit();
			} );

		} ).then( () => {
			console.log( 'resolved');
			//return vm.sendListings( fullListings );
			return Promise.resolve(fullListings);
		} ).catch( ( err ) => {
			console.log( 'err', err);
			throw err;
			process.exit();
		} );
	}

	sendListings( listings ) {
		console.log( 'retrieving listings', listings.length );
		if ( listings.length ) {

			const html = mail.format( listings );
			//mail.send( transport, html );
		} else {
			console.log( 'No listings to send' );
		}
		this.done();
		return Promise.resolve(html);
	}

	execBin() {
		childArgs = [ path.join( __dirname + "/../phantom/", this.binFile ) ];
	}

	run() {
		console.log( "'run' method must be extended in this class" );
		process.exit();
	}

	done() {
		this.connection.close();
	}
}
