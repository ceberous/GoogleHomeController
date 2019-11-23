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

function SET_VOLUME( volume_level ) {
	return new Promise( async function( resolve , reject ) {
		try {
			await CONNECT();
			console.log( `Trying to Set Volume to: ${ volume_level } seconds` );
			if ( !GoogleHomeClient ) { resolve(); return; }
			volume_level = parseFloat( volume_level );
			GoogleHomeClient.setVolume( { level: volume_level } , ( error , status ) => {
				console.log( status );
				resolve( status );
				return;
			});
		}
		catch( error ) { console.log( error ); reject( error ); return; }
	});
}
module.exports = SET_VOLUME;