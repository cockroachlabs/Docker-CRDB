# Docker-CRDB

This repo encapsulates a multi-node CockroachDB environment with integrated logging and monitoring.
Containerized components such as Grafana, Prometheus, Fluentd, and LOKI are configured and used to capture the logging and metrics originating from the CRDB cluster.

Also included is *Alerting* which is connected via WebHooks from Grafana to a running "Alerts" container that fire requests to Twilio (SMS message notifications), and SendGrid (Email notifications).
The *altering* container is a NodeJS web app, shown in the second architecture below.

This is a complete platform that's running in a Docker environment, leveraging a custom named bridge network designed to avoid any IP conflicts.


## Overall architectures
This project is divided into distict containers to showcase the separation of duty and isolation of components.
Generally speaking each container is driving a single image here for simplicity and consistency, but it makes sense to group certain services together (eg: CRDB + Fluentd) that share logical services and have tight dependencies.

## Core components ##
<p align="center">
<img src="images/architecture-3-Node.png" alt="Architecture" width="75%">
</p>

## Alerting components ##
Alerting was separated from the core architecture because it's an optional capability and requires service keys from 3rd party cloud services.
In this example, Twilio is used to send email and SMS messages when Grafana triggers are defined.

<p align="center">
<img src="images/alerting.png" alt="Architecture" width="75%">
</p>


## Pre-Reqs: installation, binaries, tools, certificate generation
* **Docker, Docker Desktop, Docker-Compose:**
    Ensure that you install Docker, Docker Desktop, and Docker-Compose.
    Verify that these services are operational.
* **NodeJS:**
    https://nodejs.org/en/ is the homepage for runtimes, binaries.
    Please install this run-time platform if you wish to use Alerts.
* **Alert web services:**
    Alerting relies on Twilio cloud services, and will require API keys to operate.
    SMS is a paid service, while the email service offers 100 sends per month for free.
* **CRDB Installed:**
    Please visit https://github.com/cockroachdb/cockroach and download the latest CRDB installation (22.1.0 at the time of this commit)
* **Certificates for secure mode:**
    - Cheat sheet on certificate creation for this project:
      ```
      // in the crdb01 folder:
      mkdir certs
      mkdir ca
      cockroach cert create-ca --certs-dir=certs --ca-key=ca/ca.key
      cockroach cert create-node localhost crdb-node01 crdb-node02 crdb-node03 --ca-key=ca/ca.key --certs-dir=certs
      cockroach cert create-client root --certs-dir=certs --ca-key=ca/ca.key
      cockroach --certs-dir=certs cert list

      ```
    - The ***ca*** and ***certs*** folders are populated with certs & keys. Just copy these 2 folders and paste them into the **crdb02** and **crdb03** folders to complete the cluster security settings.
    - The **certs list** command in the last step is informative, and should return the list of certificates similar to this:
    ```
    markzlamal@crl_my_laptop crdb01 % cockroach --certs-dir=certs cert list 
    Certificate directory: certs
    Usage  | Certificate File |    Key File     |  Expires   |                     Notes                                | Error
    -------+------------------+-----------------+------------+----------------------------------------------------------+--------
    CA     | ca.crt           |                 | 2032/07/07 | num certs: 1                                             |
    Node   | node.crt         | node.key        | 2027/07/04 | addresses: localhost,crdb-node01,crdb-node02,crdb-node03 |
    Client | client.root.crt  | client.root.key | 2027/07/04 | user: root                                               |
    (3 rows)
    ```
* **Create user account (optional one-time step):**
    To avoid using **root** user account and relying on root CA keys, create yourself an admin-granted named user account to operate your CRDB instance.
    You will need to connect to any of the CRDB instances in your cluster using root for this one-time process as follows:
    ```
    cockroach sql --url "postgresql://root@localhost:26257/bank?sslcert=certs/client.root.crt&sslkey=certs/client.root.key&sslmode=verify-full&sslrootcert=certs/ca.crt"
    ```
    ...and then run the following user-creation commands (example is *mark* and *zlamal* below):
    ```
    CREATE USER mark WITH PASSWORD 'zlamal';
    GRANT admin TO mark;
    ```
## Start the cluster + logging in Docker
The *start sequence* of your containers is important due to the networking expectations between the components.
This project expects containers to be launched in the following order.
Different sequences will work, but you will needlessly generate logging related to temporary network connection problems as the contaners establish connections.
1. Alerts (optional)
2. LOKI
3. Prometheus
4. Grafana
5. fluentd01 (_relies on **LOKI**_)
6. fluentd02 (_relies on **LOKI**_)
7. fluentd03 (_relies on **LOKI**_)
8. crdb01 (_relies on **fluentd01**_)
9. crdb02 (_relies on **fluentd2**_)
10. crdb03 (_relies on **fluentd03**_)

Each component folder contains a **docker-compose.yml** file that is the descriptor for the container & image.


1. git clone https://github.com/cockroachlabs/Docker-CRDB.git

2. Create a user-defined bridge network
    ```
    docker network create w2m-crdb-net

    ```
Additional options can be specified to define a unique subnet range if desired.

3. In each folder (eg: Loki, Prometheus, fluentd01, etc), running this command will create and start the associated container.
    ```
    docker-compose up -d

    ```
Note that the **alerts** container is built, while the others are pulled from public repositories.

## Endpoints for Dockerized deployments
**Alerting Web UI**
- http://localhost:4567

**Grafana UI**
- http://localhost:3000

**Prometheus UI**
- http://localhost:9090

**CRDB Management console**
- http://localhost:8080
- http://localhost:8081
- http://localhost:8082

**CRDB Interactive SQL channels**
- postgresql://localhost:26257 (connection string)
- postgresql://localhost:26258 (connection string)
- postgresql://localhost:26259 (connection string)


## Guides and References 
 - Certificates: https://www.cockroachlabs.com/docs/v22.1/cockroach-cert
 - Simulate CRDB multi-region cluster on localhost: https://www.cockroachlabs.com/blog/simulate-cockroachdb-cluster-localhost-docker/
 - CRDB clusters on a MAC: https://www.cockroachlabs.com/docs/stable/start-a-local-cluster-in-docker-mac.html
 - dockerhub (cockroachdb/cockroach): https://hub.docker.com/r/cockroachdb/cockroach
 - Docker bridge networking: https://www.tutorialworks.com/container-networking/


<p align="center">
<img src="images/cl-labs.webp" alt="Cockroach Labs" width="250px"/>
<br>
<span>Mark Zlamal, June 2022, Cockroach Labs</span>
</p>
