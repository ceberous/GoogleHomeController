const emitter = require( "../server.js" ).emitter;

module.exports.status = async ( req , res ) => {
	console.log( "GET --> /commands/status/" );
	emitter.emit( "session-command" , "status" );
	const result = {};
	//const result = await require( "" ).status();
	res.status( 200 );
	res.json( result );
};
module.exports.pause = async ( req , res ) => {
	console.log( "GET --> /commands/pause/" );
	emitter.emit( "session-command" , "pause" );
	const result = {};
	res.status( 200 );
	res.json( result );
};
module.exports.stop = async ( req , res ) => {
	console.log( "GET --> /commands/stop/" );
	emitter.emit( "session-command" , "stop" );
	const result = {};
	res.status( 200 );
	res.json( result );
};

module.exports.quit = async ( req , res ) => {
	console.log( "GET --> /commands/quit/" );
	emitter.emit( "session-command" , "quit" );
	const result = {};
	res.status( 200 );
	res.json( result );
};

module.exports.youtube = async ( req , res ) => {
	console.log( "GET --> /commands/youtube/" + req.params.url );
	emitter.emit( "session-command" , "youtube@@@" + req.params.url );
	const result = {};
	res.status( 200 );
	res.json( result );
};

module.exports.volume = async ( req , res ) => {
	console.log( "GET --> /commands/volume/" + req.params.level );
	emitter.emit( "session-command" , "volume@@@" + req.params.level );
	const result = {};
	res.status( 200 );
	res.json( result );
};