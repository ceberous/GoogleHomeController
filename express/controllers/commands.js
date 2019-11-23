const Status = require( "../functions/status.js" );
const Pause = require( "../functions/pause.js" );
const Resume = require( "../functions/resume.js" );
const Stop = require( "../functions/stop.js" );
const Seek = require( "../functions/seek.js" );
const GetVolume = require( "../functions/get_volume.js" );
const SetVolume = require( "../functions/set_volume.js" );
const LoadYoutubeURL = require( "../functions/load_youtube_url.js" );
const LoadYoutubeURLAndSeek = require( "../functions/load_youtube_url_and_seek.js" );
const LoadMP3URL = require( "../functions/load_mp3_url.js" );
const LoadMP3URLAndSeek = require( "../functions/load_mp3_url_and_seek.js" );

module.exports.status = async ( req , res )=> {
	console.log( "GET --> /commands/status/" );
	const status = await Status();
	console.log( status );
	res.status( 200 );
	res.json( status );
};
module.exports.pause = async ( req , res )=> {
	console.log( "GET --> /commands/pause/" );
	await Pause();
	const result = { "success": true };
	res.status( 200 );
	res.json( result );
};
module.exports.stop = async ( req , res )=> {
	console.log( "GET --> /commands/stop/" );
	await Stop();
	const result = { "success": true };
	res.status( 200 );
	res.json( result );
};
module.exports.resume = async ( req , res )=> {
	console.log( "GET --> /commands/resume/" );
	await Resume();
	const result = { "success": true };
	res.status( 200 );
	res.json( result );
};
module.exports.seek = async ( req , res )=> {
	console.log( "GET --> /commands/resume/" );
	await Seek( req.params.seconds );
	const result = { "success": true };
	res.status( 200 );
	res.json( result );
};

module.exports.load_youtube_url = async ( req , res )=> {
	let url = req.params.url;
	let seek_seconds = false;
	if ( !!req.body.url )	{
		url = req.body.url;
	}
	if ( !!req.body.seek_seconds ) {
		seek_seconds = req.body.seek_seconds;
	}
	if ( req.params.seek_seconds ) {
		seek_seconds =  req.params.seek_seconds;
	}
	if ( seek_seconds ) {
		await LoadYoutubeURLAndSeek( url , seek_seconds );
	}
	else {
		await LoadYoutubeURL( url );
	}
	const result = { "success": true };
	res.status( 200 );
	res.json( result );
};

module.exports.load_mp3_url = async ( req , res )=> {
	console.log( "GET --> /commands/load/mp3/url/" + req.params.url );
	if ( req.params.seek_seconds ) {
		await LoadMP3URLAndSeek( req.params.url , req.params.seek_seconds );
	}
	else {
		await LoadMP3URL( req.params.url );
	}
	const result = { "success": true };
	res.status( 200 );
	res.json( result );
};

module.exports.get_volume = async ( req , res )=> {
	console.log( "GET --> /commands/volume/" + req.params.level );
	const volume = await GetVolume();
	res.status( 200 );
	res.json( volume );
};
module.exports.set_volume = async ( req , res )=> {
	console.log( "GET --> /commands/volume/" + req.params.level );
	await SetVolume( req.params.level );
	const result = { "success": true };
	res.status( 200 );
	res.json( result );
};

module.exports.set_volume = async ( req , res )=> {
	let level = req.params.level;
	if ( !!req.body.level ) {
		level = req.body.level;
	}
	await SetVolume( level );
	res.status( 200 );
	res.redirect( '/form?success=true' );
};