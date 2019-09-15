#!/usr/bin/env node
const process = require( "process" );
const child_process = require( "child_process" );
const read_line_sync = require( "readline-sync" );

process.on( "unhandledRejection" , function( reason , p ) {
	console.error( reason, "Unhandled Rejection at Promise" , p );
	console.trace();
});
process.on( "uncaughtException" , function( err ) {
	console.error( err , "Uncaught Exception thrown" );
	console.trace();
});

let session;

function CLEAN_EXIT() {
	try{
		console.log( "CLEAN_EXIT()" );
		session.kill( "SIGINT" );
		process.exit( 1 );
	}
	catch( error ) { console.log( error ); return; }
}

function AWAIT_INPUT_INFINIT_LOOP() {
	console.log( "Starting Infinite Input Loop" );
	read_line_sync.promptCLLoop({
		playlist: function( url ) {
			session.send( "playlist@@@" + url );
		} ,
		youtube: function( url ) {
			session.send( "youtube-id@@@" + url );
		} ,
		pause: function( target ) {
			session.send( "pause" );
		} ,
		status: function( target ) {
			session.send( "status" );
		} ,
		stop: function( target ) {
			session.send( "stop" );
		} ,
		volume: function( target ) {
			if ( !target ) {
				session.send( "get-volume" );
			}
			else {
				session.send( "set-volume@@@" + target.toString() );
			}
		} ,
		exit: function() {
			session.send( "quit" );
			return true;
		} ,
		quit: function() {
			session.send( "quit" );
			setTimeout( () => {
				return true;
			} , 1000 );
		}

	});
	console.log( "Infinite Input Loop Ended" );
	CLEAN_EXIT();
}

// Use Express.js FailFish
// https://github.com/dkundel/spotify-chromecast-api/blob/master/index.js
( async ()=> {

	process.on( "unhandledRejection" , CLEAN_EXIT );
	process.on( "uncaughtException" , CLEAN_EXIT );
	process.on( "SIGINT" , CLEAN_EXIT );
	process.on( "SIGTERM" , CLEAN_EXIT );

	session = child_process.fork( "./interactive_session.js" );
	session.on( "message" , ( message ) => {
		console.log( "Recieved Message from Worker: [ interactive_session.js ]" );
		if ( message === "ready" ) {
			AWAIT_INPUT_INFINIT_LOOP();
		}
	});

})();