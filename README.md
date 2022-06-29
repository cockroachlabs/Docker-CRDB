# Docker-CRDB

This repo encapsulates an operational CockroachDB environment with built-in logging and monitoring.
I've integrated Grafana, Prometheus, Fluentd, and LOKI to capture the logging and metrics from CRDB.

Also included is Alerting which is connected via WebHooks from Grafana to a running "Alerts" container that fire requests to Twilio (SMS message notifications), and SendGrid (Email notificatios))

Start a Cluster in Docker

https://www.cockroachlabs.com/docs/stable/start-a-local-cluster-in-docker-mac.html

dockerhub cockroachdb/cockroach

https://hub.docker.com/r/cockroachdb/cockroach


<p align="center">
<img src="images/architecture-3-Node.png" alt="Architecture" width="75%">
</p>

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




cockroach sql --url "postgresql://mark@localhost:26257?sslcert=%2Fcockroach%2Flocalhost-certs%2Fclient.root.crt&sslkey=%2Fcockroach%2Flocalhost-certs%2Fclient.root.key&sslmode=verify-full&sslrootcert=localhost-certs%2Fca.crt"


cockroach workload init bank "postgresql://mark:zlamal@localhost:26257?sslcert=%2Fcockroach%2Flocalhost-certs%2Fclient.root.crt&sslkey=%2Fcockroach%2Flocalhost-certs%2Fclient.root.key&sslmode=verify-full&sslrootcert=localhost-certs%2Fca.crt"


// NODE 01 Example
cockroach workload run bank "postgresql://root@crdb-node01:26257/bank?sslcert=%2Fcockroach%2Fcerts%2Fclient.root.crt&sslkey=%2Fcockroach%2Fcerts%2Fclient.root.key&sslmode=verify-full&sslrootcert=%2Fcockroach%2Fcerts%2Fca.crt"


// NODE 02 Example
cockroach workload run bank "postgresql://root@crdb-node02:26257/bank?sslcert=%2Fcockroach%2Fcerts%2Fclient.root.crt&sslkey=%2Fcockroach%2Fcerts%2Fclient.root.key&sslmode=verify-full&sslrootcert=%2Fcockroach%2Fcerts%2Fca.crt"


// NODE 03 Example
cockroach workload run bank "postgresql://root@crdb-node03:26257/bank?sslcert=%2Fcockroach%2Fcerts%2Fclient.root.crt&sslkey=%2Fcockroach%2Fcerts%2Fclient.root.key&sslmode=verify-full&sslrootcert=%2Fcockroach%2Fcerts%2Fca.crt"



<p align="center">
<img src="images/cl-labs.webp" alt="Cockroach Labs" width="250px"/>
</p>
