const process = require( "process" );
const http = require( "http" )
const ip = require( "ip" );
const JFODB = require( "jsonfile-obj-db" );

process.on( "unhandledRejection" , function( reason , p ) {
	console.error( reason, "Unhandled Rejection at Promise" , p );
	console.trace();
	process.exit( 1 );
});
process.on( "uncaughtException" , function( err ) {
	console.error( err , "Uncaught Exception thrown" );
	console.trace();
	process.exit( 1 );
});

const port = process.env.PORT || 23131;
const express_app = require( "./express_app.js" );
const GenericUtils = require( "./generic_utils.js" );

( async ()=> {

	const config_file = new JFODB( "last_known_google_home" );
	if ( !config_file.self ) { config_file.self = {}; config_file.save(); }
	if ( !config_file.self[ "mac_address_prefix" ] ) {
		config_file.self[ "mac_address_prefix" ] = "F4:F5:D8";
	}
	config_file.self[ "ip" ] = GenericUtils.getGoogleHomeIP();
	config_file.save();
	module.exports.config_file = config_file;

	const server = http.createServer( express_app );
	server.listen( port , () => {
		const localIP = ip.address();
		console.log( "\tServer Started on :" );
		console.log( "\thttp://" + localIP + ":" + port );
		console.log( "\t\t or" );
		console.log( "\thttp://localhost:" + port );
	});

})();