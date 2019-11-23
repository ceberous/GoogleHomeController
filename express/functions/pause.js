const Client = require( "castv2-client" ).Client;
const DefaultMediaReceiver = require( "castv2-client" ).DefaultMediaReceiver;
const GenericUtils = require( "../generic_utils.js" );

let GoogleHomeClient;
function CONNECT() {
	return new Promise( async function( resolve , reject ) {
		try {
			const ConfigFile = require( "../server.js" ).config_file;
			let google_home_ip = ConfigFile.self[ "ip" ];
			if ( !google_home_ip ) {
				ConfigFile.self[ "ip" ] = GenericUtils.getGoogleHomeIP();
				ConfigFile.save();
				google_home_ip = ConfigFile.self[ "ip" ];
			}
			console.log( "Trying to Connect To: " + google_home_ip );
			GoogleHomeClient = new Client();
			try {
				GoogleHomeClient.connect( google_home_ip , ()=> {
					console.log( "connected ??" );
					resolve();
					return;
				});
			}
			catch( error ) {
				console.log( error );
				ConfigFile.self[ "ip" ] = GenericUtils.getGoogleHomeIP();
				ConfigFile.save();
				console.log( "Trying to Connect To: " + google_home_ip );
				GoogleHomeClient = new Client();
				google_home_ip = ConfigFile.self[ "ip" ];
				GoogleHomeClient.connect( google_home_ip , ()=> {
					console.log( "connected ??" );
					resolve();
					return;
				});
			}
		}
		catch( error ) { console.log( error ); reject( error ); return; }
	});
}

function _pause( session ) {
	return new Promise( async function( resolve , reject ) {
		try {
			console.log( "Trying to _pause()" );
			if ( !session ) { resolve(); return; }
			GoogleHomeClient.join( session, DefaultMediaReceiver , ( err , app )=> {
				if ( !app ) { resolve(); return; }
				app.getStatus( ()=> {
					app.pause();
					resolve();
					return;
				});
			});
		}
		catch( error ) { console.log( error ); reject( error ); return; }
	});
}

function PAUSE() {
	return new Promise( async function( resolve , reject ) {
		try {
			await CONNECT();
			console.log( "Trying to Pause" );
			if ( !GoogleHomeClient ) { resolve(); return; }
			GoogleHomeClient.getSessions( async ( err , sessions )=> {
				for ( let i = 0; i < sessions.length; ++i ) {
					await _pause( sessions[ i ] );
				}
			});
		}
		catch( error ) { console.log( error ); reject( error ); return; }
	});
}
module.exports = PAUSE;