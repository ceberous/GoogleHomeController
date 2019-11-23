#!/bin/bash
ENCODEDURL=$(php -r "echo urlencode(\"https://www.youtube.com/watch?v=g8NVwN0_mks\");")
echo $ENCODEDURL
curl http://localhost:23131/commands/load/youtube/url/$ENCODEDURL
curl http://localhost:23131/commands/set/volume/0.5
curl 'http://localhost:23131/commands/seek/200'
curl http://localhost:23131/commands/status