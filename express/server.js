const process = require( "process" );

let session;
let app;
let server;

function CLEAN_EXIT( ...args ) {
	try{
		console.log( "CLEAN_EXIT()" );
		try { session.kill( "SIGINT" ); }
		catch( error ) {}
		console.log( args );
		console.trace();
		process.exit( 1 );
	}
	catch( error ) { console.log( error ); return; }
}
process.on( "unhandledRejection" , CLEAN_EXIT );
process.on( "uncaughtException" , CLEAN_EXIT );
process.on( "SIGINT" , CLEAN_EXIT );
process.on( "SIGTERM" , CLEAN_EXIT );

const port = process.env.PORT || 6969;
const ip = require( "ip" );

const child_process = require( "child_process" );
const emitter = new ( require( "events" ).EventEmitter );
module.exports.emitter = emitter;

function LoadSession() {
	return new Promise( function( resolve , reject ) {
		try {
			session = child_process.fork( "./interactive_session.js" );
			session.on( "message" , ( message ) => {
				console.log( "Recieved Message from Worker: [ interactive_session.js ]" );
				if ( message === "ready" ) {
					resolve();
					return;
				}
			});
			emitter.on( "session-command" , ( command ) => {
				console.log( `emitter.on( "session-command" , ${ command } )` );
				session.send( command );
			});
		}
		catch( error ) { console.log( error ); reject( error ); return; }
	});
}

function LoadServer() {
	return new Promise( function( resolve , reject ) {
		try {
			app = require( "./app.js" );
			server = require( "http" ).createServer( app );
			server.listen( port , () => {
				const localIP = ip.address();
				console.log( "\tServer Started on :" );
				console.log( "\thttp://" + localIP + ":" + port );
				console.log( "\t\t or" );
				console.log( "\thttp://localhost:" + port );
			});
			resolve();
			return;
		}
		catch( error ) { console.log( error ); reject( error ); return; }
	});
}

( async ()=> {
	await LoadSession();
	await LoadServer();
})();