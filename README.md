# Docker-CRDB
 
Start a Cluster in Docker

https://www.cockroachlabs.com/docs/stable/start-a-local-cluster-in-docker-mac.html

dockerhub cockroachdb/cockroach

https://hub.docker.com/r/cockroachdb/cockroach


Steps:

1. git clone https://github.com/world2mark/Docker-CRDB.git




2. Create a user-defined bridge network
docker network create w2m-crdb-net




3. docker-compose up -d




Connect to the instance:
cockroach sql --url "postgresql://root@127.0.0.1:26257/defaultdb?sslmode=disable"



Prometheus Portal: localhost:9090



Bridge Networking Tutorial:
https://www.tutorialworks.com/container-networking/



Simulate CRDB multi-region cluster on localhost
https://www.cockroachlabs.com/blog/simulate-cockroachdb-cluster-localhost-docker/





SECURED (start-single-node-certs) details:

cockroach sql --url "postgresql://root@127.0.0.1:26257/defaultdb?sslcert=docker-certs%2Fclient.root.crt&sslkey=docker-certs%2Fclient.root.key&sslmode=verify-full&sslrootcert=docker-certs%2Fca.crt"

