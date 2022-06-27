'use strict';



// Environment variable:  run this command to automagically set the process.env.PORT field.
// PORT=4568 node .



const Typical_Event = {
    receiver: 'SMS Webhook',
    status: 'firing',
    alerts: [
        {
            status: 'firing',
            labels: {
                PhoneNumber: '+1<my phone number>',
                RecipientName: 'Mark\'s pager',
                Email: 'Mark\'s Cockroach labs email',
                alertname: 'SMS on Rate too High',
                payload: '{{ alert_payload }}'
            },
            annotations: {},
            startsAt: '2022-06-24T18:27:04.777175848Z',
            endsAt: '0001-01-01T00:00:00Z',
            generatorURL: 'http://localhost:3000/alerting/grafana/T1QOPtq7z/view',
            fingerprint: '479e596fd56f1e15',
            silenceURL: 'http://localhost:3000/alerting/silence/new?alertmanager=grafana&matcher=PhoneNumber%3D%226134567890%22&matcher=alertname%3DSMS+on+Rate+too+High&matcher=payload%3D%7B%7B+alert_payload+%7D%7D',
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



function InsertLogItem(EventStr, ContextStr, alertDetails) {
    LogHistoryArr.unshift({
        Event: EventStr,
        ContextStr: ContextStr,
        AlertDetails: Object.assign({}, alertDetails),
        TS: Date.now()
    });
    if (LogHistoryArr.length > MAX_LOG_HISTORY_SIZE) {
        LogHistoryArr.pop();
    };
};


function compareFlatObj(obj1, obj2) {
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);
    if (keys1.length !== keys2.length) {
        return false;
    };
    for (const k1 of keys1) {
        if (obj1[k1] !== obj2[k1]) {
            return false;
        };
    };
    return true;
};


const RECENCY_DURATION = 1000 * 60 * 3; // 3 minutes;

function AlertDetailsAreRecent(testAlertDetails) {

    const NotRecentAfter = Date.now() - RECENCY_DURATION;

    for (const logEntry of LogHistoryArr) {
        if (compareFlatObj(testAlertDetails, logEntry.AlertDetails)) {
            if (logEntry.TS < NotRecentAfter) {
                return false;
            } else {
                return true;
            };
        };
    };

    return false;
};



function ExtractAlertDetails(alertObject) {
    // A typical valueString (alertObject.valueString):
    // [ var='B0' metric='Value' labels={cluster=my-cockroachdb-cluster, instance=crdb-node02:8080, job=cockroachdb} value=0.11785714285714284 ]

    if (!alertObject.valueString) {
        // Grafana bug: valueString is prepended with a comma... weird.
        return;
    }

    const valueStr = alertObject.valueString.trim();

    if (valueStr.length <= 0) {
        return;
    };

    const labelsStr = valueStr.substring(valueStr.indexOf('{') + 1, valueStr.indexOf('}'));
    const noQuotesStr = labelsStr.replace(/\"/g, '');
    const labelsArr = noQuotesStr.split(',');

    const AlertDetails = {};

    for (const expr of labelsArr) {
        const kv = expr.split('=');
        AlertDetails[kv[0].trim()] = kv[1].trim();
    };

    return AlertDetails;
};



async function SendSMS(alertObject, alertDetails) {
    if (!alertDetails) {
        return;
    };

    if (!alertObject.labels.PhoneNumber) {
        return;
    };

    alertDetails.Notification = 'SMS';

    if (AlertDetailsAreRecent(alertDetails)) {
        return;
    };

    if (!alertObject.labels.SMS_Key) {
        return;
    };

    const SMS_Key_Split = alertObject.labels.SMS_Key.split(':');
    const liveAccountSid = SMS_Key_Split[0];
    const liveAuthToken = SMS_Key_Split[1];

    const SMSBody = [];
    SMSBody.push(alertObject.labels.alertname);
    for (const [k, v] of Object.entries(alertDetails)) {
        SMSBody.push(`${k}: ${v}`);
    }
    SMSBody.push(`Trigger caused by: ${alertObject.generatorURL}`);

    if (!alertObject.labels.DisableNotifications) {
        const MyTwilio = require('twilio');
        const MyTwilioClient = MyTwilio(liveAccountSid, liveAuthToken);
        const twilioResult = await MyTwilioClient.messages.create({
            body: SMSBody.join('\n'),
            from: alertObject.labels.SMS_RootNumber,
            to: alertObject.labels.PhoneNumber
        });
    };

    InsertLogItem(
        `Sent SMS to ${alertObject.labels.PhoneNumber}`,
        `${alertObject.labels.alertname}`,
        alertDetails);
};



async function SendEmail(alertObject, alertDetails) {
    if (!alertDetails) {
        return;
    };

    if (!alertObject.labels.Email) {
        return;
    };

    alertDetails.Notification = 'Email';

    if (AlertDetailsAreRecent(alertDetails)) {
        return;
    };

    const htmlEmail = [];
    htmlEmail.push('<div>');
    htmlEmail.push(`</h2>Database Alerts Triggered!</h2>`);

    htmlEmail.push('<p>This is an automated alert triggered by your monitoring service.</p>');

    htmlEmail.push(`<h3>Alert Name: ${alertObject.labels.alertname}</h3>`);
    htmlEmail.push(`<div style=\'width: 100%;border-bottom: 1px solid gray\'></div>`);
    const formattedTags = `<pre style=\'color:red\'>${JSON.stringify(alertDetails, null, 3)}</pre>`;
    htmlEmail.push(formattedTags);
    htmlEmail.push(`<div style=\'width: 100%;border-bottom: 1px solid gray\'></div>`);

    htmlEmail.push(`<p>Source of trigger: <a href=\'${alertObject.generatorURL}\'>Direct Link</a></p>`);
    htmlEmail.push(`<p>Silence this alert: <a href=\'${alertObject.silenceURL}\'>Grafana portal with context</a></p>`);
    htmlEmail.push(`<div style=\'width: 100%;border-bottom: 2px solid gray\'></div>`);
    htmlEmail.push('<span style=\'font-size: 0.75em;\'>Mark Zlamal, Cockroach Labs</span>');
    htmlEmail.push('</div>');

    const myEmailObj = {
        to: {
            name: alertObject.labels.RecipientName.trim(),
            email: alertObject.labels.Email.trim()
        },
        from: {
            name: 'Database Alerts Service',
            email: 'do-not-reply@companyname.com'
        },
        subject: `Database alert triggered for: ${alertObject.labels.alertname}`,
        text: JSON.stringify(alertDetails, null, 3),
        html: htmlEmail.join('')
    };


    if (!alertObject.labels.DisableNotifications) {
        const MySendGridInterface = require('@sendgrid/mail');
        MySendGridInterface.setApiKey(alertObject.labels.Sendgrid_Api_Key);
        const emailResult = await MySendGridInterface.send(myEmailObj);
    };

    InsertLogItem(
        `Sent Email to ${alertObject.labels.Email}`,
        `${alertObject.labels.alertname}`,
        alertDetails);
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
                    //                    console.log(alertDetails);
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
                let displayValue = value;
                if (key === 'AlertDetails') {
                    displayValue = JSON.stringify(value);
                };
                if (key === 'TS') {
                    const MinutesAgo = Math.round((Date.now() - value) / (1000 * 60));
                    LogTableHTML.push(`&nbsp;&nbsp;<b>${key}:</b> ${displayValue} (${MinutesAgo} minutes ago)&nbsp;&nbsp;`);
                } else {
                    LogTableHTML.push(`&nbsp;&nbsp;<b>${key}:</b> ${displayValue}&nbsp;&nbsp;`);
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


