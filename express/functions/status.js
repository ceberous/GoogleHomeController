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

function STATUS() {
	return new Promise( async function( resolve , reject ) {
		try {
			await CONNECT();
			console.log( "did we connect ??" );
			await GenericUtils.sleep( 1000 );
			GoogleHomeClient.getSessions( ( err , sessions )=> {
				const session = sessions[ 0 ];
				if ( !session ) { resolve(); return; }
				GoogleHomeClient.join( session, DefaultMediaReceiver , ( err , app )=> {
					if ( !app ) { resolve(); return; }
					app.getStatus( ( error , status )=> {
						GoogleHomeClient.getVolume( ( volume_error , volume_status ) => {
							console.log( `\nMedia Source === ${ status[ "media" ][ "contentId" ] }` );
							console.log( `Status === ${ status[ "playerState" ] }` );
							console.log( `Current Time === ${ status[ "currentTime" ] }` );
							console.log( `Duration === ${ status[ "media" ][ "duration" ] }` );
							console.log( `Volume === ` );
							console.log(  volume_status );
							resolve({
								status: status ,
								volume_status: volume_status
							});
							return;
						});
					});
				});
			});
		}
		catch( error ) { console.log( error ); reject( error ); return; }
	});
}
module.exports = STATUS;