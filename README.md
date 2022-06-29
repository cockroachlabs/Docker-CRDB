# Docker-CRDB

This repo encapsulates an operational CockroachDB environment with built-in logging and monitoring.
I've integrated Grafana, Prometheus, Fluentd, and LOKI to capture the logging and metrics from CRDB.

Also included is *Alerting* which is connected via WebHooks from Grafana to a running "Alerts" container that fire requests to Twilio (SMS message notifications), and SendGrid (Email notifications).
Note that Altering is included in this repo as a NodeJS container, but is not shown in the architecture below.

This is a complete platform that's running in a Docker environment, leveraging a custom named bridge network designed to avoid any IP conflicts.

## Pre-Reqs: binaries, tools, certificates
* Docker, Docker Desktop, Docker-Compose
    Ensure that you install and verify that Docker, Docker Desktop, and Docker-Compose are operational
* CRDB Installed
    Please visit https://github.com/cockroachdb/cockroach and download the latest CRDB installation (22.1.0 at the time of this commit)
* Certificates generated
    Please visit https://www.cockroachlabs.com/docs/stable/secure-cockroachdb-kubernetes.html#example-rotating-certificates-signed-with-cockroach-cert for details into generating self-signed certificates
* 
    

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




## Direct PostgreSQL access to a running node (example: Node01)
There are 2 ways to access the database
* Using your command shell, which requires the *cockroach* binary installed on your system
  ```
  Folder: ...\Docker-CRDB\crdb01
  Command: cockroach sql --url "postgresql://root@crdb-node01:26257/defaultdb?sslcert=certs%2Fclient.root.crt&sslkey=certs%2Fclient.root.key&sslmode=verify-full&sslrootcert=certs%2Fca.crt"

  ```
 is using the SSH feature using Docker-Desktop, the other is
cockroach sql --url "postgresql://root@crdb-node01:26257/bank?sslcert=%2Fcockroach%2Fcerts%2Fclient.root.crt&sslkey=%2Fcockroach%2Fcerts%2Fclient.root.key&sslmode=verify-full&sslrootcert=%2Fcockroach%2Fcerts%2Fca.crt"




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
