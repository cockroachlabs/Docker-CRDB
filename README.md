# Docker-CRDB

This repo encapsulates an operational CockroachDB environment with built-in logging and monitoring.
I've integrated Grafana, Prometheus, Fluentd, and LOKI to capture the logging and metrics from CRDB.

Also included is *Alerting* which is connected via WebHooks from Grafana to a running "Alerts" container that fire requests to Twilio (SMS message notifications), and SendGrid (Email notifications).
The *altering* container is a NodeJS web app, shown in the second architecture below.

This is a complete platform that's running in a Docker environment, leveraging a custom named bridge network designed to avoid any IP conflicts.


## Overall architectures
This project is divided into distict containers to showcase the separation of duty and isolation of components.
Generally speaking each container is driving a single image here for simplicity and consistency, but it makes sense to group certain services together (eg: CRDB + Fluentd) that share logical services and have tight dependencies.

##core architecture##
<p align="center">
<img src="images/architecture-3-Node.png" alt="Architecture" width="75%">
</p>

##alerting components##
<p align="center">
<img src="images/alerting.png" alt="Architecture" width="75%">
</p>


## Pre-Reqs: installation, binaries, tools, certificate generation
* **Docker, Docker Desktop, Docker-Compose:**
    Ensure that you install and verify that Docker, Docker Desktop, and Docker-Compose are operational
* **CRDB Installed:**
    Please visit https://github.com/cockroachdb/cockroach and download the latest CRDB installation (22.1.0 at the time of this commit)
* **Certificates for secure mode:**
    - Cheat sheet on certificate creation for this project:
      - ```
      // in the crdb01 folder:
      mkdir certs
      mkdir ca
      cockroach cert create-ca --certs-dir=certs --ca-key=ca/ca.key
      cockroach cert create-node crlMBP-C02FL0LJMD6TMzE1.local --ca-key=ca/ca.key --certs-dir=certs
      cockroach cert create-client root --certs-dir=certs --ca-key=ca/ca.key
      ```
    - dulpicate the ** **ca** ** and ** **certs** folders for the crdb02 and crdb03
    - For a general overview into generating self-signed certificates, visit https://www.cockroachlabs.com/docs/v22.1/cockroach-cert 
* 
    

## Start a Cluster in Docker
The *start sequence* of your containers is important due to the networking expectations between the components.
This project expects containers to be launched in the following order.
Different sequences will work, but you will needlessly generate logging related to temporary network connection problems as the contaners establish connections.
1. Alerts (optional)
2. LOKI
3. Prometheus
4. Grafana
5. fluentd01 (*relies on **LOKI** *)
6. fluentd02 (*relies on **LOKI** *)
7. fluentd03 (*relies on **LOKI** *)
8. crdb01 (*relies on **fluentd01** *)
9. crdb02 (*relies on **fluentd2** *)
10. crdb03 (*relies on **fluentd03** *)


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
