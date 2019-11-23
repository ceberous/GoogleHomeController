#!/bin/bash
curl http://localhost:23131/commands/status
# jq '.[0] | "http://" + .Address + ":" + "\(.ServicePort)"'
# curl -s http://localhost:23131/commands/status | jq -r '.status.currentTime'