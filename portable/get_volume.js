#!/usr/bin/env node
const process = require( "process" );
const child_process = require( "child_process" );

const Client = require( "castv2-client" ).Client;
const DefaultMediaReceiver = require( "castv2-client" ).DefaultMediaReceiver;

process.on( "unhandledRejection" , function( reason , p ) {
	console.error( reason, "Unhandled Rejection at Promise" , p );
	console.trace();
});
process.on( "uncaughtException" , function( err ) {
	console.error( err , "Uncaught Exception thrown" );
	console.trace();
});

const GOOGLE_MAC_ADDRESS_PREFIXES = [
	"00:1a:11" ,
	"3c:5a:b4" ,
	"54:60:09" ,
	"94:eb:2c" ,
	"a4:77:33" ,
	"da:a1:19" ,
	"f4:03:04" ,
	"f4:f5:d8" , // Google Home ?
	"f4:f5:e8" ,
	"f8:8f:ca" ,
];

function GET_GOOGLE_HOME_IP( default_mac_prefix="F4:F5:D8" ) {

	// You need to install 'ip' command
	// brew install iproute2mac
	function _darwin_fixed() {
		try {
			let default_gateway = child_process.execSync( `ip route ls | grep default` ).toString();
			default_gateway = default_gateway.split( "\n" );
			let default_gateways = [];
			for ( let i = 0; i < default_gateway.length; ++i ) {
				let line = default_gateway[ i ].split( " " );
				if ( !line ) { continue; }
				if ( !line[ 0 ] ) { continue; }
				if( line[ 0 ] !== "default" ) { continue; }
				default_gateways.push( line[ 2 ] );
			}
			let google_home_ips = [];
			for ( let i = 0; i < default_gateways.length; ++i ) {
				console.log( `Searching Default Gateway: ${ default_gateways[ i ] }` );
				const google_home_ip = child_process.execSync( `sudo nmap -sn ${ default_gateways[ i ] }/24 | grep '${ default_mac_prefix }' -B 2 | head -1 | awk '{print $(NF)}'` ).toString().trim();
				if ( google_home_ip ) {
					google_home_ips.push( google_home_ip );
				}
			}
			return google_home_ips[ 0 ];
		}
		catch( error ) { console.log( error ); return; }
	}

	function _darwin() {
		try {
			const default_gateway = child_process.execSync( `netstat -rn -f inet | grep -A 1 "Gateway" | tail -1 | awk '{print $2}'` ).toString().trim();
			console.log( `Default Gateway === ${ default_gateway }` );
			const google_home_ip = child_process.execSync( `sudo nmap -sn ${ default_gateway }/24 | grep '${ default_mac_prefix }' -B 2 | head -1 | awk '{print $(NF)}'` ).toString().trim();
			console.log( `Google Home IP === ${ google_home_ip }` );
			return google_home_ip;
		}
		catch( error ) { console.log( error ); return; }
	}

	function _linux() {
		try {
			const default_gateway = child_process.execSync( `netstat -rn -A inet | grep -A 1 "Gateway" | tail -1 | awk '{print $2}'` );
			console.log( `Default Gateway === ${ default_gateway }` );
			const google_home_ip = child_process.execSync( `sudo nmap -sn ${ default_gateway }/24 | grep '${ default_mac_prefix }' -B 2 | head -1 | awk '{print $(NF)}'` ).toString().trim();
			console.log( `Google Home IP === ${ google_home_ip }` );
			return google_home_ip;
		}
		catch( error ) { console.log( error ); return; }
	}

	try {
		let google_home_ip = false;
		if ( process.platform === "darwin" ) {
			google_home_ip = _darwin_fixed();
			if ( !google_home_ip ) { google_home_ip = _darwin_fixed(); }
			else if ( google_home_ip.indexOf( "." ) === -1 ) {
				google_home_ip = _darwin_fixed();
			}
		}
		else if ( process.platform === "linux" ) {
			google_home_ip = _linux();
			if ( !google_home_ip ) { google_home_ip = _linux(); }
			else if ( google_home_ip.indexOf( "." ) === -1 ) {
				google_home_ip = _linux();
			}
		}
		return google_home_ip;
	}
	catch( error ) { console.log( error ); return false; }
}

let GoogleHomeClient;
function CONNECT( google_home_ip ) {
	return new Promise( async function( resolve , reject ) {
		try {
			if ( !google_home_ip ) { resolve( false ); return false; }
			console.log( "Trying to Connect To: " + google_home_ip );
			GoogleHomeClient = new Client();
			GoogleHomeClient.connect( google_home_ip , ()=> {
				console.log( "connected ??" );
				resolve();
				return;
			});
		}
		catch( error ) { console.log( error ); reject( error ); return; }
	});
}

( async ()=> {

	const google_home_ip = GET_GOOGLE_HOME_IP();

	await CONNECT( google_home_ip );
	console.log( "Trying to Pause" );

	GoogleHomeClient.getVolume( ( error , status ) => {
		console.log( status );
		process.exit( 1 );
	});


})();