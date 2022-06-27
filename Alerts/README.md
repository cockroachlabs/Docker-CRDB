# Docker-CRDB
 

docker build . -t world2mark/alerts-app

This will build the docker image saved into the local Docker repo
(note that it's saved as none/nonde)

Also note that docker-compose.yml indicates a build rather than a public repo image.

docker-compose build
vs
docker-compose up -d
Both build the image if it doesn't exist.


Localhost running & Dev:

PORT=4567 node .



Alerting contact point for CONTAINER
http://alerts:4567

Alerting contact point for localhost DEVELOPMENT
http://host.docker.internal:4568