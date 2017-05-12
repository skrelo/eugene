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

let listings = [];
let activeSites = [];
Promise.each( sites, ( site ) => {
	let bypass = false;
	let dontRun = false;
	var nSite = require( `./sites/${site}` );
	//let sName = site.replace(/\.js/, '');
	let siteObj = new nSite();
	if ( runOnly.length) {
		siteObj.active = false;
		if ( _.indexOf( runOnly, siteObj.source ) > -1 ) {
			bypass = true;
		}
	}
	if ( true === siteObj.active || true === bypass ) {
		console.log( 'running' );
		return siteObj.run().then( ( list ) => {
			listings = listings.concat( listings, list );
			//siteObj.done();
			activeSites.push(siteObj);
			return true;
		} );
	} else {
		return true;
	}
} ).then( () => {
	console.log( `SENDING ${listings.length} LISTINGS` );
	if ( listings.length) {
		const html = mail.format( listings );
		mail.send( transport, html );
	}
	activeSites.forEach( (site ) => {
		site.done();
	});
} );