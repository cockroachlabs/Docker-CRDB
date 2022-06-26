'use strict';



// Environment variable:  run this command to automagically set the process.env.PORT field.
// PORT=9999 node server.js



const Typical_Event = {
    receiver: 'SMS Webhook',
    status: 'firing',
    alerts: [
        {
            status: 'firing',
            labels: {
                PhoneNumber: '613-555-6666',
                Email: 'mzlamal@cockroachlabs.com',
                alertname: 'SMS on Rate too High',
                payload: '{{ alert_payload }}'
            },
            annotations: {},
            startsAt: '2022-06-24T18:27:04.777175848Z',
            endsAt: '0001-01-01T00:00:00Z',
            generatorURL: 'http://localhost:3000/alerting/grafana/T1QOPtq7z/view',
            fingerprint: '479e596fd56f1e15',
            silenceURL: 'http://localhost:3000/alerting/silence/new?alertmanager=grafana&matcher=PhoneNumber%3D%22613-555-6666%22&matcher=alertname%3DSMS+on+Rate+too+High&matcher=payload%3D%7B%7B+alert_payload+%7D%7D',
            dashboardURL: '',
            panelURL: '',
            valueString: `[ var='B0' metric='{cluster="my-cockroachdb-cluster", instance="crdb-node02:8080", job="cockroachdb"}' labels={cluster=my-cockroachdb-cluster, instance=crdb-node02:8080, job=cockroachdb} value=4299.282962962963 ]`
        }
    ],
    groupLabels: {},
    commonLabels: {
        PhoneNumber: '"613-555-6666"',
        alertname: 'SMS on Rate too High',
        payload: '{{ alert_payload }}'
    },
    commonAnnotations: {
        description: 'My Description...',
        summary: 'My Summary... {{ alert_payload }}'
    },
    externalURL: 'http://localhost:3000/',
    version: '1',
    groupKey: '{}:{}',
    truncatedAlerts: 0,
    orgId: 1,
    title: '[FIRING:1]  (SMS on Rate too High "613-555-6666" {{ alert_payload }})',
    state: 'alerting',
    message: '**Firing**\n' +
        '\n' +
        `Value: [ var='B0' metric='{cluster="my-cockroachdb-cluster", instance="crdb-node02:8080", job="cockroachdb"}' labels={cluster=my-cockroachdb-cluster, instance=crdb-node02:8080, job=cockroachdb} value=4299.282962962963 ]\n` +
        'Labels:\n' +
        ' - alertname = SMS on Rate too High\n' +
        ' - PhoneNumber = "613-555-6666"\n' +
        ' - payload = {{ alert_payload }}\n' +
        'Annotations:\n' +
        ' - description = My Description...\n' +
        ' - summary = My Summary... {{ alert_payload }}\n' +
        'Source: http://localhost:3000/alerting/grafana/T1QOPtq7z/view\n' +
        'Silence: http://localhost:3000/alerting/silence/new?alertmanager=grafana&matcher=PhoneNumber%3D%22613-555-6666%22&matcher=alertname%3DSMS+on+Rate+too+High&matcher=payload%3D%7B%7B+alert_payload+%7D%7D\n'
};




const PATH = require('path');
const FS = require('fs');



const FavIcon = FS.readFileSync(PATH.join(__dirname, 'Images', 'favicon.ico'));



const LogHistoryArr = [];
const MAX_LOG_HISTORY_SIZE = 50;


function InsertLogItem(EventStr, ContextStr, AlertDetails) {
    LogHistoryArr.unshift({
        Event: EventStr,
        ContextStr: ContextStr,
        AlertDetails: AlertDetails,
        TS: Date.now()
    });
    if (LogHistoryArr.length > MAX_LOG_HISTORY_SIZE) {
        LogHistoryArr.pop();
    };
};



function ExtractAlertDetails(alertObject) {
    // A typical valueString (alertObject.valueString):
    // [ var='B0' metric='Value' labels={cluster=my-cockroachdb-cluster, instance=crdb-node02:8080, job=cockroachdb} value=0.11785714285714284 ]
    const valueStr = alertObject.valueString;
    const labelsStr = valueStr.substring(valueStr.indexOf('{') + 1, valueStr.indexOf('}'));
    const noQuotesStr = labelsStr.replace(/\"/g, '');
    const labelsArr = noQuotesStr.split(',');
    return labelsArr.map(expr => {
        const kv = expr.split('=');
        return {
            k: kv[0].trim(),
            v: kv[1].trim()
        };
    });
};



async function SendSMS(alertObject, alertDetails) {
    if (!alertObject.labels.PhoneNumber) {
        return;
    };

    if(AlertDetailsAreRecent(alertDetails)) {
        return;
    };

    const liveAccountSid = 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx';
    const liveAuthToken = 'yyyyyyyyyyyyyyyyyyyyyyyyyyyyyy';
    const MyTwilio = require('twilio');
    const MyTwilioClient = MyTwilio(liveAccountSid, liveAuthToken);
    const twilioResult = await MyTwilioClient.messages.create({
        body: 'Demo body node',
        from: '+16135556666',
        to: '+16137778888'
    });

    InsertLogItem(`Sent SMS to ${alertObject.labels.PhoneNumber}`, `${alertObject.labels.alertname}`);
};



function SendEmail(alertObject, alertDetails) {
    if (!alertObject.labels.Email) {
        return;
    };

    if(AlertDetailsAreRecent(alertDetails)) {
        return;
    };

    InsertLogItem(`Sent Email to ${alertObject.labels.Email}`, `${alertObject.labels.alertname}`);
};



const MyServices = {
    '/favicon.ico': (req, res) => res.end(FavIcon),
    '/': async (req, res) => {
        if (req.MyURLQuery.searchParams.get('TestTypical')) {
            req.MyFields = Typical_Event;
        };

        if (req.MyFields) {
            for (const myAlert of req.MyFields.alerts) {
                if (myAlert.status === 'firing') {
                    const alertDetails = ExtractAlertDetails(myAlert);
                    console.log(alertDetails);
                    await SendSMS(myAlert, alertDetails);
                    await SendEmail(myAlert, alertDetails);
                };
            };

            res.end('Alert processed');
            return;
        };

        const LogTableHTML = [];
        LogTableHTML.push('<table>');
        for (const logRow of LogHistoryArr) {
            LogTableHTML.push('<tr><td>');
            for (const [key, value] of Object.entries(logRow)) {
                if (key === 'TS') {
                    const MinutesAgo = Math.round((Date.now() - value) / (1000 * 60));
                    LogTableHTML.push(`&nbsp;&nbsp;<b>${key}:</b> ${value} (${MinutesAgo} minutes ago)&nbsp;&nbsp;`);
                } else {
                    LogTableHTML.push(`&nbsp;&nbsp;<b>${key}:</b> ${value}&nbsp;&nbsp;`);
                };
            };
            LogTableHTML.push('</td></tr>');
        };
        LogTableHTML.push('</table>');

        const TestTypicalEvent = `<p><a href=\'/?TestTypical=1\'>Test Typical Event</a></p>`;

        const MyHTML = `<html><body><h2>Alerts Running</h2><h3>Log History</h3>${LogTableHTML.join('')}${TestTypicalEvent}</body></html>`;
        res.end(MyHTML);
    },
};



function ExtractPostValues(req) {
    return new Promise((resolve, reject) => {
        let body = [];

        req.on('data', data => {
            body.push(data);

            if (body.length > 1e6) {
                // Too much POST data, kill the connection!
                // 1e6 === 1 * Math.pow(10, 6) === 1 * 1000000 ~~~ 1MB
                req.connection.destroy();
                reject();
            };
        });

        req.on('end', () => {
            const completeBody = body.join();
            resolve(JSON.parse(completeBody));
        });
    });
};



const HTTP = require('http');
const TheServer = HTTP.createServer(async (req, res) => {
    req.MyURLQuery = new URL(req.url, `http://localhost:${process.env.PORT}`);

    if (req.method === 'POST') {
        req.MyFields = await ExtractPostValues(req);
    };

    const myHandler = MyServices[req.MyURLQuery.pathname];
    if (myHandler) {
        try {
            await myHandler(req, res);
        } catch (err) {
            console.error(err);
            console.log(req.MyFields);
            res.end(JSON.stringify({
                Error: true,
                Message: err.message,
                Stack: err.stack
            }));
        };
    } else {
        RedirectHome(req, res);
    };
});



setTimeout(async () => {
    await new Promise(resolve => {
        TheServer.listen(parseInt(process.env.PORT), () => {
            resolve();
        });
    });

    console.log('Server running');

}, 250);


