const process = require( "process" );
const os = require( "os" );
const path = require( "path" );
const child = require( "child_process" );

function sleep( ms ) { return new Promise( resolve => setTimeout( resolve , ms ) ); }
module.exports.sleep = sleep;

// netstat -rn
function GET_DEFUALT_GATEWAY() {
	try {
		let output = child.spawnSync( 'netstat', [ '-r' , '-n' ] , { encoding: 'utf8' } );
		output = output.stdout.trim();
		const lines = output.split( "\n" );
		for ( let i = 0; i < lines.length; ++i ) {
			let items = lines[ i ].split( " " );
			items = items.filter( x => x !== "" );
			for ( let j = 0; j < items.length; ++j ) {
				let item = items[ j ].replace( /\s/g , "" );
				if ( item === "default" ) {
					let default_gateway = items[ j + 1 ];
					default_gateway = default_gateway.replace( /\s/g , "" );
					return default_gateway;
				}
			}
		}
		return false;
	}
	catch( error ) { console.log( error ); return false; }
}

// sudo nmap -sn 192.168.0.0/24
// function NMAP_GET_LAN_IPS() {
// 	try {
// 		let default_gateway = GET_DEFUALT_GATEWAY();
// 		default_gateway = `${default_gateway}/24`;
// 		let output = child.spawnSync( 'sudo', [ 'nmap' , '-sn' , default_gateway ] , { encoding: 'utf8' } );
// 		output = output.stdout.trim();
// 		const lines = output.split( "\n" );
// 		for ( let i = 0; i < lines.length; ++i ) {
// 			console.log( lines[ i ] );
// 			// let items = lines[ i ].split( " " );
// 			// items = items.filter( x => x !== "" );
// 			// for ( let j = 0; j < items.length; ++j ) {
// 			// 	let item = items[ j ].replace( /\s/g , "" );
// 			// 	if ( item === "default" ) {
// 			// 		let default_gateway = items[ j + 1 ];
// 			// 		default_gateway = default_gateway.replace( /\s/g , "" );
// 			// 		return default_gateway;
// 			// 	}
// 			// }
// 		}
// 		return false;
// 	}
// 	catch( error ) { console.log( error ); return false; }
// }

// arp -a
// ? (192.168.0.20) at (incomplete) on en0 ifscope [ethernet]
// ? (239.255.255.250) at 1:0:5e:7f:ff:fa on en0 ifscope permanent [ethernet]
function ARP_GET_LAN_IPS() {
	try {

		const interfaces = Object.keys( os.networkInterfaces() );
		console.log( "Interfaces ==== " );
		console.log( interfaces );

		let results = [];

		for( let j = 0; j < interfaces.length; ++j ) {
			let output = child.spawnSync( 'arp', [ '-i' , interfaces[ j ] , '-a' ] , { encoding: 'utf8' } );
			output = output.stdout.trim();
			const lines = output.split( "\n" );
			for ( let i = 0; i < lines.length; ++i ) {
				let items = lines[ i ].split( " " );
				items = items.filter( x => x !== "" );
				items = items.map( x => x.replace( /\s/g , "" ) );
				// //console.log( items );
				// if ( !items[ i ][ 1 ] ) { console.log( "no 1 ??" ); continue; }
				// if ( !items[ i ][ 3 ] ) { console.log( "no 3 ??" ); continue; }
				// if ( items[ i ][ 3 ] === "(incomplete)" ) { console.log( "incomplete ??" ); continue; }
				// if ( !items[ i ][ 5 ] ) { console.log( "no 5 ??" ); continue; }

				// if ( !items ) { continue; }
				// if ( !items[ 1 ] ) { continue; }
				if ( !!items[ 1 ] === false ) { continue; }

				let ip = items[ 1 ].split( "(" );
				if ( !ip ) { continue; }
				if ( !ip[ 1 ] ) { continue; }
				ip = ip[ 1 ].split( ")" );
				if ( !ip ) { continue; }
				if ( !ip[ 0 ] ) { continue; }
				let mac_prefix = items[ 3 ].split( ":" );
				mac_prefix = `${ mac_prefix[ 0 ] }:${ mac_prefix[ 1 ] }:${ mac_prefix[ 2 ] }`
				results.push({
					ip: ip[ 0 ] ,
					mac_address: items[ 3 ] ,
					mac_prefix: mac_prefix ,
					device: items[ 5 ]
				});
			}
		}

		return results;
	}
	catch( error ) { console.log( error ); return false; }
}

// Google Home Mac Address Masks
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

function GET_GOOGLE_HOME_IP() {
	try {
		const default_gateway = child.execSync( `route -n | awk '$4 == "UG" {print $2}'` ).toString().trim();
		const defualt_interface = child.execSync( `ip link | awk -F: '$0 !~ "lo|vir|wl|^[^0-9]"{print $2;getline}'` ).toString().trim();
		const google_home_ip = child.execSync( `sudo nmap -sn ${ default_gateway }/24 | grep 'AD:B0' -A 1 | tail -1 | awk '{print $(NF)}'` ).toString().trim();

		console.log( default_gateway );
		console.log( defualt_interface );
		console.log( google_home_ip );

		return google_home_ip;
	}
	catch( error ) { console.log( error ); return false; }
}
module.exports.getGoogleHomeIP = GET_GOOGLE_HOME_IP;


function GET_GOOGLE_HOME_IPS() {
	try {
		const lan_ips = ARP_GET_LAN_IPS();
		console.log( "Lan IPS === " );
		console.log( lan_ips );
		let google_ips = [];
		for ( let i = 0; i < lan_ips.length; ++i ) {
			//console.log( lan_ips[ i ][ "mac_address" ] );
			for ( let j = 0; j < GOOGLE_MAC_ADDRESS_PREFIXES.length; ++j ) {
				//console.log( `${ lan_ips[ i ][ "mac_prefix" ] } === ${ GOOGLE_MAC_ADDRESS_PREFIXES[ j ] }` );
				if ( lan_ips[ i ][ "mac_prefix" ] === GOOGLE_MAC_ADDRESS_PREFIXES[ j ] ) {
					google_ips.push( lan_ips[ i ][ "ip" ] );
				}
			}
		}
		console.log( "Found These 'Google' devices from MAC address scheme" );
		console.log( google_ips );
		return google_ips;
	}
	catch( error ) { console.log( error ); return false; }
}
module.exports.getGoogleHomeIPS = GET_GOOGLE_HOME_IPS;
// Testing
// ==========================
// ( async ()=> {
// 	const google_home_ips = GET_GOOGLE_HOME_IPS();
// 	console.log( google_home_ips );
// })();

// youtube-dl --extract-audio --audio-format mp3 -g  https://www.youtube.com/watch?v=WL8k-eeP6h0
function GET_YOUTUBE_DIRECT_MP3_URL( youtube_url ) {
	try {
		console.log( "Finding Direct MP3 URL for: " + youtube_url );
		let output = child.spawnSync( 'youtube-dl', [ '--extract-audio' , '--audio-format' , 'mp3' , '-g' , youtube_url ] , { encoding: 'utf8' } );
		output = output.stdout.trim();
		const lines = output.split( "\n" );
		if ( !lines ) { return false; }
		if ( !lines[ 0 ] ) { return false; }
		console.log( lines[ 0 ] );
		return lines[ 0 ];
	}
	catch( error ) { console.log( error ); return false; }
}
module.exports.getYoutubeDirectMP3Url = GET_YOUTUBE_DIRECT_MP3_URL;
// Testing
// ==========================
// ( async ()=> {
// 	const youtube_direct_mp3_url = GET_YOUTUBE_DIRECT_MP3_URL( "https://www.youtube.com/watch?v=WL8k-eeP6h0" );
// 	console.log( youtube_direct_mp3_url );
// })();





