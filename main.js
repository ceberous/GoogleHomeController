process.on( "unhandledRejection" , function( reason , p ) {
	console.error( reason, "Unhandled Rejection at Promise" , p );
	console.trace();
});
process.on( "uncaughtException" , function( err ) {
	console.error( err , "Uncaught Exception thrown" );
	console.trace();
});

// https://github.com/thibauts/node-castv2-client/blob/master/examples/basic.js
const Client = require( "castv2-client" ).Client;
const DefaultMediaReceiver = require( "castv2-client" ).DefaultMediaReceiver;

const Utils = require( "./utils.js" );

let GLOBAL_CLIENT;
let GLOBAL_PLAYER;

function GLOBAL_CLIENT_CONNECT( google_home_ip ) {
	return new Promise( async function( resolve , reject ) {
		try {
			if ( !google_home_ip ) {
				google_home_ip = Utils.getGoogleHomeIPS();
				if ( ! google_home_ip ) { resolve( false ); return false; }
				google_home_ip = google_home_ip[ 0 ];
			}
			console.log( "Trying to Connect To: " + google_home_ip );
			GLOBAL_CLIENT = new Client();
			GLOBAL_CLIENT.connect( google_home_ip , ()=> {
				console.log( "connected ??" );
				resolve();
				return;
			});
		}
		catch( error ) { console.log( error ); reject( error ); return; }
	});
}

function GLOBAL_PLAYER_LOAD_MP3( mp3_url ) {
	return new Promise( async function( resolve , reject ) {
		try {
			mp3_url = mp3_url || test_mp3_url;
			GLOBAL_CLIENT.launch( DefaultMediaReceiver , ( err , player )=> {
				GLOBAL_PLAYER = player;
				const media_mp3 = {
					contentId: mp3_url ,
					contentType: 'audio/mp3' ,
					streamType: 'BUFFERED' ,
				};
				GLOBAL_PLAYER.on( 'status' , function( status ) {
					console.log( 'status broadcast playerState=%s' , status.playerState );
				});
				GLOBAL_PLAYER.load( media_mp3 , { autoplay: true } , ( error , status )=> {
					console.log('media loaded playerState=%s', status.playerState);
					resolve();
					return;
				});
			});
		}
		catch( error ) { console.log( error ); reject( error ); return; }
	});
}

function GLOBAL_PLAYER_STOP() {
	return new Promise( function( resolve , reject ) {
		try {
			GLOBAL_PLAYER.stop( ()=> {
				console.log( "we are stoppping" );
				resolve();
				return;
			});
		}
		catch( error ) { console.log( error ); reject( error ); return; }
	});
}

function GLOBAL_PLAYER_SEEK( seek_seconds ) {
	return new Promise( function( resolve , reject ) {
		try {
			GLOBAL_PLAYER.seek( seek_seconds , ( err , status )=> {
				console.log( "we are seeking: " + seek_seconds.toString() );
				resolve();
				return;
			});
		}
		catch( error ) { console.log( error ); reject( error ); return; }
	});
}



// BUILT COMMAND_LINE COMMANDS
// ===================================================
function COMMAND_LINE_PLAY_YOUTUBE_MP3( youtube_url , initial_seek_seconds ) {
	return new Promise( async function( resolve , reject ) {
		try {
			const direct_mp3_url = Utils.getYoutubeDirectMP3Url( youtube_url );
			await GLOBAL_CLIENT_CONNECT();
			await GLOBAL_PLAYER_LOAD_MP3( direct_mp3_url );
			if ( initial_seek_seconds ) {
				await Utils.sleep( 1000 );
				await GLOBAL_PLAYER_SEEK( initial_seek_seconds );
			}
		}
		catch( error ) { console.log( error ); reject( error ); return; }
	});
}
// Testing
// =================================================
// ( async ()=> {
// 	await COMMAND_LINE_PLAY_YOUTUBE_MP3( "https://www.youtube.com/watch?v=EfZu4BCi644" , ( 10 * 60 ) ); // Example 10 Minute Seek
// 	console.log( "wadu ??" );
// })();

function COMMAND_LINE_STOP() {
	return new Promise( async function( resolve , reject ) {
		try {
			await GLOBAL_CLIENT_CONNECT();
			GLOBAL_CLIENT.launch( DefaultMediaReceiver , ( err , player )=> {
				try{
					player.stop( ()=> {
						resolve();
						return;
					});
				}
				catch( error ) { resolve( false ); return; }
			});
		}
		catch( error ) { console.log( error ); reject( error ); return; }
	});
}
// Testing
// =================================================
( async ()=> {
	await COMMAND_LINE_STOP();
	console.log( "wadu ??" );
})();















// MP4 Example
// =================================
// var media = {

// 	// Here you can plug an URL to any mp4, webm, mp3 or jpg file with the proper contentType.
// 	contentId: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/big_buck_bunny_1080p.mp4',
// 	contentType: 'video/mp4',
// 	streamType: 'BUFFERED', // or LIVE

// 	// Title and cover displayed while buffering
// 	metadata: {
// 	  type: 0,
// 	  metadataType: 0,
// 	  title: "Big Buck Bunny",
// 	  images: [
// 		{ url: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/BigBuckBunny.jpg' }
// 	  ]
// 	}
// };




// OLD TESTS
// ============================================================================================================
// ============================================================================================================

// ( async ()=> {

// 	const GoogleHome = require( "node-googlehome" );

// 	let device =  new GoogleHome.Connecter( google_home_ip );
// 	//device.config( { lang: "en" } );

// 	await device.readySpeaker();

// 	device.playMedia( test_mp3_url )
//   	.then( console.log( "so were done??" ) )
//   	.catch( console.log( "error blah blah like that" ) )

// })();

// ( async ()=> {

// 	const GoogleHomePlayer = require( "google-home-player" );

// 	let googleHome = new GoogleHomePlayer( google_home_ip , "en" , 1 );

// 	await googleHome.say( "do you have a walrus in your sock?" );

// })();