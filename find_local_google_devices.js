process.on( "unhandledRejection" , function( reason , p ) {
    console.error( reason, "Unhandled Rejection at Promise" , p );
    console.trace();
});
process.on( "uncaughtException" , function( err ) {
    console.error( err , "Uncaught Exception thrown" );
    console.trace();
});

( async ()=> {

    const Utils = require( "./utils.js" );
    const google_ips = Utils.getGoogleHomeIPS();

})();