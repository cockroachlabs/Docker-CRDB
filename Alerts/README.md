# Alerting service
This container interfaces with Grafana using the *Alert Manager*.


## Building and debugging
```
docker-compose up -d
```
This will build the image if it doesn't exist, and start the container.


To operate this service in a localhost environment (run & debug), you will need to do a one-time NPM installation:
```
npm install
```
This will install the dependencies.

To run this app outside of Docker, use the following command.
```
PORT=4567 node .
```
This automatically set the PORT environment variable in the NodeJS runtime.
Note that you can change the port number to any free port on your system.

## Configuring an alert
When editing an alert rule, the following **Custom Labels** in the grafana UI need to be completed to enable alerting.

**Note that case-sensitivity is critical in these labels**

1. **Email** = mark@somewhere.com
2. **RecipientName** = Mark (company pager)
3. **Sendgrid_Api_Key** = SGxxxxxxxxxxxxxxxxxxx
4. **PhoneNumber** = +16135556666
5. **SMS_RootNumber** = +16135556666
6. **SMS_Key** = xxxxxxxxxxxxxxxxxx

Description of these fields:
- *Email* is the destination for this alert
- *RecipientName* is the display-name of the recipient
- *Sengrid_Api_Key* is the API key for SendGrid to operate the email service
- *PhoneNumber* is the destination number where to send the SMS
- *SMS_RootNumber* is the source phone number (Twilio assigns a number to your account that must be used)
- *SMS_Key* is the API key for Twilio to operate the SMS service

## Endpoints for Dockerized deployments
Alerting contact point within the private network
- http://alerts:4567

Alerting contact point for localhost access
- http://localhost:4567

<p align="center">
<img src="../images/cl-labs.webp" alt="Cockroach Labs" width="250px"/>
<br>
<span>Mark Zlamal, June 2022, Cockroach Labs</span>
</p>
