const fs = require( 'fs' );
const Promise = require( 'bluebird' );
const sites = fs.readdirSync( './sites/' );
const _ = require('lodash');

const mail = require( './lib/mail' );
const email = require('nodemailer');

const transport = email.createTransport( {
	service: 'Gmail',
	auth   : {
		user: 'skrelo@gmail.com',
		pass: 'ngRg2424'
	}
} );

let runOnly = [];//['premier'];


function Index() {
	let listings = {};
	let activeSites = [];
	let siteRan = [];

	Promise.each( sites, ( site ) => {
		let bypass = false;
		let dontRun = false;
		var nSite = require( `./sites/${site}` );
		//let sName = site.replace(/\.js/, '');
		let siteObj = new nSite();
		if ( runOnly.length ) {
			siteObj.active = false;
			if ( _.indexOf( runOnly, siteObj.source ) > -1 ) {
				bypass = true;
			}
		}
		if ( true === siteObj.active || true === bypass ) {
			if ( _.indexOf( siteRan, siteObj.source ) > -1 ) {
				return true;
			} else {
				console.log( 'Running ' + siteObj.name );
				return siteObj.run().then( ( list ) => {
					//listings = listings.concat( listings, list );
					listings = Object.assign( {}, listings, list );
					//siteObj.done();
					activeSites.push( siteObj );
					siteRan.push( siteObj.source );
					return true;
				} );
			}
		} else {
			return true;
		}
	} ).then( () => {
		let len = Object.keys( listings ).length;
		console.log( `SENDING ${len} LISTINGS` );
		if ( len ) {
			const html = mail.format( listings );
			mail.send( transport, html );
		}else {
			console.log( 'NO NEW LISTINGS' );
		}
		/*activeSites.forEach( ( site ) => {
			site.done();
		} );*/
	} );

}

setInterval( Index, 300000);