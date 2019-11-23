const express = require( "express" );
const router = express.Router();
const controller = require( "../controllers/commands.js" );

router.get( "/status" , controller.status );
router.get( "/pause" , controller.pause );
router.get( "/resume" , controller.resume );
router.get( "/stop" , controller.stop );
router.get( "/seek/:seconds" , controller.seek );
router.get( "/load/youtube/url/:url" , controller.load_youtube_url );
router.get( "/load/youtube/url/:url/:seek_seconds" , controller.load_youtube_url );
router.get( "/load/mp3/url/:url/:seek_seconds" , controller.load_mp3_url );
router.get( "/get/volume" , controller.get_volume );
router.get( "/set/volume/:level" , controller.set_volume );

module.exports = router;