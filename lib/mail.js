const moment = require( 'moment' );
const _ = require( 'lodash' );
const numeral = require( 'numeral' );

const noimage = "https://www.rentler.com/images/noimage-200x150.png";
const email = require( 'nodemailer-promise' );

const SendMail = {
	format( listings ) {
		let html = "",
			rentals = 0;
		for( let listing_id in listings) {
			let listing = listings[listing_id];
			const data_id = moment().format( 'X' );
			rentals++;
			const notActual = _.has( listing, 'dateNotActual' ) && true === listing.dateNotActual ? "( Not Actual Date )" : "";
			if (!_.has(listing, 'date')) {
				listing.date = new Date().getTime();
			}
			const rentalDate = moment( listing.date, 'X' ).format( 'LLLL' ) + " " + notActual;
			const price = numeral( listing.price ).format( '$0,0' );
			const image = listing.sourceImage ? `<img src="${listing.sourceImage}" style="width:100px" />` : listing.sourceName;
			const listingImage = listing.photo ? listing.photo : noimage;
			const mapLink = listing.location ? "<a href='https://maps.google.com/maps/search/" + encodeURIComponent( listing.location ) + "'>Map It</a>" : "";

			html += `
				<table data-id='${data_id}'>
					<tr>
						<td colspan=2>${rentals}</td>
					</tr>
					<tr>
						<td colspan=2 align='center'>${image}</td>
					</tr>
					<tr>
						<td colspan=2 align='center'>${listing.available}</td>
					</tr>
					<tr>
						<td>${listing.id}</td>
						<td style='text-align:right'>${rentalDate}</td>
					</tr>
					<tr>
						<td width='200'><a href='${listing.date}'><img src='${listingImage}' style='max-width:100%' /></a></td>
						<td>
							<table>
								<tr>
									<td style='font-size:18px'>${price} </td>
								</tr>
								<tr>
									<td><a href='${listing.link}'>${listing.title} ${listing.location}</a>
										${mapLink}</td>
								</tr>
								<tr>
									<td>${listing.beds} beds / ${listing.baths} baths</td>
								</tr>
								<tr>
									<td>${listing.sqft} sqft.</td>
								</tr>
								<tr>
									<td>${listing.pets}</td>
								</tr>
							</table>
						</td>
					</tr>
				</table><hr />`;
		}

		return html;
	},
	send( transport, html ) {
		const date = moment().format( 'LLLL' );
		const text = ` 
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html>
<head>
<title>${date}</title>
                                   
                                   
                                   
                                   
                                   
                                   
                                   
                                   
	</head> 
	<body style="background-color:#ffffff;">${html}</body></html>`;
		let mailOptions = {
			subject: 'Rental Listings: ' + moment().format( 'LLL' ),
			html   : text,
			headers: {
				'Content-Type': 'text/html'
			},
			from   : "skrelo@gmail.com",
			to     : "Scott Krelo <skrelo@gmail.com>,Jenn Krelo <jennkrelo@gmail.com>"//, Nate Divine <nate.divine@gmail.com>"
			//to: "Christine MacPherson <happybookreader@gmail.com>, Ethyn Davis <ethyndavis@gmail.com>"
		};
		transport.sendMail( mailOptions ).then( ( info ) => {
			console.log( 'message sent: ' + info.response );
			return true;

		} ).catch( ( err ) => {
			console.error( error );
			throw error;
		} );
	}
};
module.exports = SendMail;