const express = require( "express" );
const router = express.Router();
const controller = require( "../controllers/commands.js" );

// router.get( "/oauth2callback" , controller.oauth2callback );
// router.get( "/live/videos/" , controller.liveGetVideos );
// router.get( "/live/followers/" , controller.liveGetFollowers );
// router.get( "/live/follower/add/:wID/" , controller.liveAddFollower );
// router.get( "/live/follower/remove/:wID/" , controller.liveRemoveFollower );
// router.get( "/live/blacklist/" , controller.liveGetBlacklist );
// router.get( "/live/blacklist/add/:wID/" , controller.liveAddBlacklist );
// router.get( "/live/blacklist/remove/:wID/" , controller.liveRemoveBlacklist );

router.get( "/status" , controller.status );
router.get( "/pause" , controller.pause );
router.get( "/stop" , controller.stop );
router.get( "/quit" , controller.quit ); 
router.get( "/youtube/:url" , controller.youtube );
router.get( "/volume/:level" , controller.volume );

module.exports = router;