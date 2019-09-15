#!/usr/bin/env node

const process = require( "process" );

process.on( "unhandledRejection" , function( reason , p ) {
    console.error( reason, "Unhandled Rejection at Promise" , p );
    console.trace();
});
process.on( "uncaughtException" , function( err ) {
    console.error( err , "Uncaught Exception thrown" );
    console.trace();
});

let CLIENT;
let PLAYER;

function CONNECT( google_home_ip ) {
    return new Promise( async function( resolve , reject ) {
        try {
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
                //  PLAYER.pause( () => {
                //      console.log( "pause success??" );
                //  });
                // });
            });
        }
        catch( error ) { console.log( error ); reject( error ); return; }
    });
}


( async ()=> {
    await CONNECT( "192.168.1.5" ); // 6105 - Google Home
    await LOAD_MP3( process.argv[ 2 ] );
})();
