const http = require('http');
const fs = require('fs');

const baseApi = '/api/v2/setup';

const data = JSON.stringify({
    bucket: '_base',
    org: 'PrivateSky',
    username: 'admin',
    password: 'pskadmin',
    retentionPeriodHrs: 0,
});

const options = {
    hostname: '127.0.0.1',
    port: 9999,
    path: baseApi,
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

const req = http.request(options, (res) => {
    console.log(`statusCode: ${res.statusCode}`);

    res.on('data', (resData) => {
        console.log('got data', resData.toString());
        const response = JSON.parse(resData);

        if(response.auth) {
            const config = JSON.parse(fs.readFileSync('../config.json'));
            config.databaseAuthToken = response.auth.token || "";
            fs.writeFileSync('../config.json', JSON.stringify(config));
        }
    })
});

req.on('error', (error) => {
    console.error(error)
});

req.write(data);
req.end();
