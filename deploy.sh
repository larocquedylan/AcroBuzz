#!/bin/bash

echo What version is this?
read VERSION

echo $VERSION

docker build -t larocquedylan/acrobuzz:$VERSION .
docker push larocquedylan/acrobuzz:$VERSION

ssh root@134.122.41.254 "docker pull larocquedylan/acrobuzz:$VERSION && docker tag larocquedylan/acrobuzz:$VERSION dokku/api:$VERSION && dokku deploy api $VERSION"