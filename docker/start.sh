#!/bin/bash
name="$(./util/name.sh -1)"

docker run --detach \
    --name "$name" \
    --publish 127.0.0.1:9999:9999 \
    --publish 127.0.0.1:3333:3333 \
    --publish 5558:5558 \
    --restart always \
    -v influxStorage:/root/.influxdbv2 \
    privatesky/collector
