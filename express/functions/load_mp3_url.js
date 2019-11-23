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

function LOAD_MP3_URL( mp3_url ) {
	return new Promise( async function( resolve , reject ) {
		try {
			console.log( "Trying to Load MP3 URL: " + mp3_url );
			await CONNECT();
			if ( !GoogleHomeClient ) { resolve(); return; }
			GoogleHomeClient.launch( DefaultMediaReceiver , ( err , player ) => {
				const media_mp3 = {
					contentId: mp3_url ,
					contentType: 'audio/mp3' ,
					streamType: 'BUFFERED' ,
				};
				player.on( 'status' , ( status ) => {
					if ( status ) {
						console.log( 'status broadcast playerState=%s' , status.playerState );
					}
				});
				player.load( media_mp3 , { autoplay: true } , ( error , status ) => {
					if ( status ) {
						console.log( 'media loaded playerState=%s' , status.playerState );
						if ( status.playerState ) {
							if ( status.playerState === "PLAYING" ) {
								resolve();
								return;
							}
						}
					}
				});
			});
		}
		catch( error ) { console.log( error ); reject( error ); return; }
	});
}
module.exports = LOAD_MP3_URL;