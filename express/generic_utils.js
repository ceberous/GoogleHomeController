const child_process = require( "child_process" );

function sleep( ms ) { return new Promise( resolve => setTimeout( resolve , ms ) ); }
module.exports.sleep = sleep;

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

	function unix_universal() {
		const google_home_ip = child_process.execSync( `arp -na | grep -i ${ default_mac_prefix } | awk '{print $2}' | cut -d "(" -f2 | cut -d ")" -f1` ).toString().trim();
		console.log( `Google Home IP === ${ google_home_ip }` );
		return google_home_ip;
	}

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
				const google_home_ip = child_process.execSync( `nmap -sn ${ default_gateways[ i ] }/24 | grep '${ default_mac_prefix }' -B 2 | head -1 | awk '{print $(NF)}'` ).toString().trim();
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

	function _linux_fixed_part_2( interface="eth0" ) {
		try {
			const google_home_ip = child_process.execSync( `sudo arp-scan --interface=${ interface } --localnet | grep "f4:f5:d8:cc:ad:b0" | awk '{print $1}'` ).toString().trim();
			console.log( `Google Home IP === ${ google_home_ip }` );
			return google_home_ip;
		}
		catch( error ) { console.log( error ); return; }
	}

	function _linux_fixed() {
		try {
			const google_home_ip = child_process.execSync( `arp -ne | grep '${ default_mac_prefix.toLowerCase() }' | awk '{print $1}'` ).toString().trim();
			console.log( `Google Home IP === ${ google_home_ip }` );
			return google_home_ip;
		}
		catch( error ) { console.log( error ); return; }
	}

	function _linux() {
		try {
			// const default_gateway = child_process.execSync( `netstat -rn -A inet | grep -A 1 "Gateway" | tail -1 | awk '{print $2}'` );
			// console.log( `Default Gateway === ${ default_gateway }` );
			const default_interface = child_process.execSync( `netstat -rn -A inet | grep -A 1 "Gateway" | tail -1 | awk '{print $(NF)}'` );
			console.log( `Default Interface === ${ default_interface }` );
			let google_home_ip = _linux_fixed();
			if ( !google_home_ip ) {
				google_home_ip = _linux_fixed_part_2( default_interface );
			}
			else if ( google_home_ip.indexOf( "." ) === -1 ) {
				google_home_ip = _linux_fixed_part_2( default_interface );
			}
			return google_home_ip;
		}
		catch( error ) { console.log( error ); return; }
	}

	try {
		let google_home_ip = false;
		if ( process.platform === "darwin" ) {
			google_home_ip = unix_universal();
			if ( !google_home_ip ) { google_home_ip = unix_universal(); }
			else if ( google_home_ip.indexOf( "." ) === -1 ) {
				google_home_ip = unix_universal();
			}
		}
		else if ( process.platform === "linux" ) {
			google_home_ip = _linux();
			if ( !google_home_ip ) { google_home_ip = _linux(); }
			else if ( google_home_ip.indexOf( "." ) === -1 ) {
				google_home_ip = _linux();
			}
		}
		console.log( "Google Home IP === " + google_home_ip );
		return google_home_ip;
	}
	catch( error ) { console.log( error ); return false; }
}
module.exports.getGoogleHomeIP = GET_GOOGLE_HOME_IP;


// https://github.com/fluent-ffmpeg/node-fluent-ffmpeg
// https://github.com/dohliam/cast-playlist
// https://github.com/balloob/pychromecast
// https://github.com/skorokithakis/catt/
// https://developers.google.com/cast/docs/media
// https://developers.google.com/cast/docs/mpl/streaming_protocols
// streamlink https://www.youtube.com/watch?v=ia-NryuCzoA best --stream-url
// youtube-dl -g https://www.twitch.tv/chess
// youtube-dl --extract-audio --audio-format mp3 -g $1
// https://github.com/ytdl-org/youtube-dl/issues/18813
// youtube-dl --console-title --hls-prefer-native --hls-use-mpegts -c --no-part --fixup never "https://5bd725165e3d4.streamlock.net/test/_definst_/mp3:TOEIC/Audio/19990.mp3/master.m3u8" -o foo.mp3

function GET_YOUTUBE_DIRECT_MP3_URL( youtube_url ) {
	try {
		console.log( "Finding Direct MP3 URL for: " + youtube_url );
		// let output = child_process.spawnSync( 'youtube-dl', [ '--extract-audio' , '--audio-format' , 'mp3' , '-g' , youtube_url ] , { encoding: 'utf8' } );
		//output = output.stdout.trim();
		// const lines = output.split( "\n" );
		// if ( !lines ) { return false; }
		// if ( !lines[ 0 ] ) { return false; }
		// console.log( lines[ 0 ] );
		// return lines[ 0 ];
		const direct_url = child_process.execSync( `youtube-dl --extract-audio --audio-format mp3 -g ${ youtube_url }` ).toString().trim();
		console.log( direct_url );
		return direct_url;
	}
	catch( error ) { console.log( error ); return false; }
}
module.exports.getYoutubeDirectMP3Url = GET_YOUTUBE_DIRECT_MP3_URL;