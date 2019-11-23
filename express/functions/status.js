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
				if ( !session ) { resolve( { status: "IDLE" , volume_status: "UNKNOWN"  } ); return; }
				GoogleHomeClient.join( session, DefaultMediaReceiver , ( err , app )=> {
					if ( !app ) { resolve( { status: "IDLE" , volume_status: "UNKNOWN"  } ); return; }
					app.getStatus( ( error , status )=> {
						let content_id = false;
						let player_state = false;
						let current_time = false;
						let duration = false;
						if ( status ) {
							if ( status.contentId ) {
								content_id = status.contentId;
							}
							if ( status.playerState ) {
								player_state = status.playerState;
							}
							if ( status.currentTime ) {
								current_time = status.currentTime;
							}
							if ( status.media ) {
								if ( status.media.duration ) {
									duration = status.media.duration;
								}

							}
						}
						GoogleHomeClient.getVolume( ( volume_error , volume_status ) => {
							console.log( `\nMedia Source === ${ content_id }` );
							console.log( `Status === ${ player_state }` );
							console.log( `Current Time === ${ current_time }` );
							console.log( `Duration === ${ duration }` );
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