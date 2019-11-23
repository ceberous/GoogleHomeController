#!/bin/bash
ENCODEDMESSAGE=$(php -r "echo urlencode(\"$1\");")
echo $ENCODEDMESSAGE
curl http://localhost:23131/commands/load/youtube/url/$ENCODEDMESSAGE