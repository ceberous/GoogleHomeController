const process = require( "process" );

process.on( "unhandledRejection" , function( reason , p ) {
	console.error( reason, "Unhandled Rejection at Promise" , p );
	console.trace();
});
process.on( "uncaughtException" , function( err ) {
	console.error( err , "Uncaught Exception thrown" );
	console.trace();
});

// https://github.com/thibauts/node-castv2-client/issues/81#issuecomment-394654077

// https://developers.google.com/cast/docs/reference/chrome/chrome.cast.media.Media#play

// https://github.com/thibauts/node-castv2-client/blob/master/examples/basic.js
const Client = require( "castv2-client" ).Client;
const DefaultMediaReceiver = require( "castv2-client" ).DefaultMediaReceiver;

const Utils = require( "./utils.js" );

let CLIENT;
let PLAYER;

const events = require( "events" ).EventEmitter;
const emitter = new events.EventEmitter();

function CONNECT( google_home_ip ) {
	return new Promise( async function( resolve , reject ) {
		try {
			if ( !google_home_ip ) {
				// google_home_ip = Utils.getGoogleHomeIPS();
				// if ( ! google_home_ip ) { resolve( false ); return false; }
				// google_home_ip = google_home_ip[ 0 ];

				google_home_ip = Utils.getGoogleHomeIP();
			}
			if ( !google_home_ip ) { resolve( false ); return false; }
			console.log( "Trying to Connect To: " + google_home_ip );
			CLIENT = new Client();
			CLIENT.connect( google_home_ip , ()=> {
				console.log( "connected ??" );
				resolve();
				return;
			});
		}
		catch( error ) { console.log( error ); reject( error ); return; }
	});
}

function LOAD_M3U8( mp3_url ) {
	return new Promise( async function( resolve , reject ) {
		try {
			mp3_url = mp3_url || test_mp3_url;
			CLIENT.launch( DefaultMediaReceiver , ( err , player ) => {
				PLAYER = player;
				const media_mp3 = {
					contentId: mp3_url ,
					contentType: 'application/x-mpegURL' ,
					streamType: 'BUFFERED' ,
				};
				PLAYER.on( 'status' , ( status ) => {
					if ( status ) {
						console.log( 'status broadcast playerState=%s' , status.playerState );
					}
				});
				PLAYER.load( media_mp3 , { autoplay: true } , ( error , status ) => {
					if ( status ) {
						console.log('media loaded playerState=%s', status.playerState );
					}
					resolve();
					return;
				});
				// emitter.on( "pause" , () => {
				// 	PLAYER.pause( () => {
				// 		console.log( "pause success??" );
				// 	});
				// });
			});
		}
		catch( error ) { console.log( error ); reject( error ); return; }
	});
}

function LOAD_MP3( mp3_url ) {
	return new Promise( async function( resolve , reject ) {
		try {
			mp3_url = mp3_url || test_mp3_url;
			CLIENT.launch( DefaultMediaReceiver , ( err , player ) => {
				PLAYER = player;
				const media_mp3 = {
					contentId: mp3_url ,
					contentType: 'audio/mp3' ,
					streamType: 'BUFFERED' ,
				};
				PLAYER.on( 'status' , ( status ) => {
					if ( status ) {
						console.log( 'status broadcast playerState=%s' , status.playerState );
					}
				});
				PLAYER.load( media_mp3 , { autoplay: true } , ( error , status ) => {
					if ( status ) {
						console.log('media loaded playerState=%s', status.playerState );
					}
					resolve();
					return;
				});
				// emitter.on( "pause" , () => {
				// 	PLAYER.pause( () => {
				// 		console.log( "pause success??" );
				// 	});
				// });
			});
		}
		catch( error ) { console.log( error ); reject( error ); return; }
	});
}

function GET_SESSIONS() {
	return new Promise( function( resolve , reject ) {
		try {
			CLIENT.getSessions( ( error , sessions ) => {
				resolve( sessions );
				return;
			});
		}
		catch( error ) { console.log( error ); reject( error ); return; }
	});
}

function GET_VOLUME() {
	return new Promise( function( resolve , reject ) {
		try {
			console.log( "inside GET_VOLUME()" );
			CLIENT.getVolume( ( error , status ) => {
				console.log( status );
				resolve( status );
				return;
			});
		}
		catch( error ) { console.log( error ); reject( error ); return; }
	});
}

// Doesn't Work
function SET_VOLUME( level ) {
	return new Promise( function( resolve , reject ) {
		try {
			if ( !level ) { resolve(); return; }
			console.log( `inside SET_VOLUME( ${ level } )` );
			CLIENT.setVolume( { level: level } , ( error , status ) => {
				console.log( "SET_VOLUME() success ???" );
				console.log( status );
				resolve( status );
				return;
			});
		}
		catch( error ) { console.log( error ); reject( error ); return; }
	});
}

// Basically 'Resets' to have nothing loaded , aka 'stopped'
function QUIT() {
	return new Promise( function( resolve , reject ) {
		try {
			if ( !CLIENT ) { resolve(); return; }
			console.log( "inside QUIT()" );
			CLIENT.launch( DefaultMediaReceiver , ( err , player ) => {
				console.log( "inside CLIENT.launch()" );
				const blank_mp3 = {
					contentId: "https://google.com/mp3" ,
					contentType: 'audio/mp3' ,
					streamType: 'BUFFERED' ,
				};
				try { // We Expect this to ALWAYS fail
					PLAYER.load( blank_mp3 , { autoplay: true } , ( error , status )=> {
						console.log( "inside PLAYER.load()" );
						player.stop( () => { resolve(); return; })
						// resolve();
						// return;
					});
				}
				catch( error ) { console.log( error ); resolve( false ); return; }
			});
		}
		catch( error ) { console.log( error ); reject( error ); return; }
	});
}

function STOP() {
	return new Promise( async function( resolve , reject ) {
		try {
			console.log( "we are stoppping" );
			if ( PLAYER ) {
				PLAYER.stop( () => {
					resolve();
					return;
				});
			}
			// Doesn't Work Either
			// else {
			// 	const sessions = await GET_SESSIONS();
			// 	console.log( sessions );
			// 	if ( !sessions ) { resolve(); return; }
			// 	if ( sessions.length < 1 ) { resolve(); return; }
			// 	CLIENT.stop( sessions[ 0 ].sessionId , ( err , result ) => {
			// 		console.log( "Stopped Session: " + sessions[ 0 ].sessionId );
			// 		resolve();
			// 		return;
			// 	});
			// }
		}
		catch( error ) { console.log( error ); reject( error ); return; }
	});
}

function SEEK( seek_seconds ) {
	return new Promise( function( resolve , reject ) {
		try {
			PLAYER.seek( seek_seconds , ( err , status )=> {
				console.log( "we are seeking: " + seek_seconds.toString() );
				resolve();
				return;
			});
		}
		catch( error ) { console.log( error ); reject( error ); return; }
	});
}

function STATUS() {
	return new Promise( function( resolve , reject ) {
		try {
			CLIENT.getStatus( ( err , status )=> {
				console.log( "player status === " );
				console.log( status );
				resolve( status );
				return status;
			});
		}
		catch( error ) { console.log( error ); reject( error ); return; }
	});
}


function RESUME() {
	return new Promise( function( resolve , reject ) {
		try {
			CLIENT.getSessions(function(err, sessions) {
				const session = sessions[0];
				CLIENT.join(session, DefaultMediaReceiver, function(err, app) {
					if (!app.media.currentSession){
						app.getStatus(function() {
							app.play();
						});
					} else {
						app.play();
					}
					resolve();
					return;
				});
			});
			//emitter.emit( "pause" );
		}
		catch( error ) { console.log( error ); reject( error ); return; }
	});
}

function PAUSE() {
	return new Promise( function( resolve , reject ) {
		try {
			// PLAYER.pause( ( err , status )=> {
			// 	console.log( "pausing playback" );
			// 	resolve();
			// 	return;
			// });
			emitter.emit( "pause" );
		}
		catch( error ) { console.log( error ); reject( error ); return; }
	});
}


( async ()=> {
	await CONNECT();
	process.send( "ready" );
	process.on( "message" , async ( message ) => {
		console.log( "Worker: [ interactive_session.js ] Recieved Message" );
		console.log( message );
		let instructions = message.split( "@@@" );
		if ( !instructions ) { return; }
		if ( !instructions[ 0 ] ) { return; }
		const task = instructions[ 0 ];
		let args = false;
		if ( instructions[ 1 ] ) { args = instructions[ 1 ]; }
		if ( task === "playlist" ) {
			if ( args ) {
				const m3u8_url = await Utils.getYoutubeDirectMP3Url( args );
				await LOAD_M3U8( m3u8_url );
			}
		}
		if ( task === "youtube" ) {
			if ( args ) {
				const mp3_url = await Utils.getYoutubeDirectMP3Url( args );
				console.log( mp3_url );
				await LOAD_MP3( mp3_url );
			}
		}
		else if ( task === "status" ) {
			const status = await STATUS();
		}
		else if ( task === "resume" ) {
			await RESUME();
		}
		else if ( task === "pause" ) {
			//PAUSE();
			// CLIENT.sessionRequest({ type: 'PAUSE' } , ()=>{
			// 	console.log( "paused ??" );
			// });
			CLIENT.getSessions(function(err, sessions) {
				const session = sessions[0];
				CLIENT.join(session, DefaultMediaReceiver, function(err, app) {
					if (!app.media.currentSession){
						app.getStatus(function() {
							app.pause();
						});
					} else {
						app.pause();
					}
				});
			});
		}
		else if ( task === "play" ) {
			const status = await STATUS();
		}
		else if ( task === "stop" ) {
			await STOP();
		}
		else if ( task === "quit" ) {
			await QUIT();
		}
		else if ( task === "get-volume" ) {
			await GET_VOLUME();
		}
		else if ( task === "set-volume" ) {
			await SET_VOLUME( args );
		}
	});
})();



// MP4 Example
// =================================
// var media = {

//  // Here you can plug an URL to any mp4, webm, mp3 or jpg file with the proper contentType.
//  contentId: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/big_buck_bunny_1080p.mp4',
//  contentType: 'video/mp4',
//  streamType: 'BUFFERED', // or LIVE

//  // Title and cover displayed while buffering
//  metadata: {
//    type: 0,
//    metadataType: 0,
//    title: "Big Buck Bunny",
//    images: [
//      { url: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/BigBuckBunny.jpg' }
//    ]
//  }
// };

// OLD TESTS
// ============================================================================================================
// ============================================================================================================

// ( async ()=> {

//  const GoogleHome = require( "node-googlehome" );

//  let device =  new GoogleHome.Connecter( google_home_ip );
//  //device.config( { lang: "en" } );

//  await device.readySpeaker();

//  device.playMedia( test_mp3_url )
//      .then( console.log( "so were done??" ) )
//      .catch( console.log( "error blah blah like that" ) )

// })();

// ( async ()=> {

//  const GoogleHomePlayer = require( "google-home-player" );

//  let googleHome = new GoogleHomePlayer( google_home_ip , "en" , 1 );

//  await googleHome.say( "do you have a walrus in your sock?" );

// })();