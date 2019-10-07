const http = require('http');
const fs = require('fs');
const path = require('path');

const baseApi = '/api/v2/setup';

const data = JSON.stringify({
    bucket: 'base',
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
    res.on('data', (resData) => {
        const response = JSON.parse(resData);

        console.log('response: ', response);
        if(response.auth) {
            const configPath = path.resolve(path.join(__dirname, '../config.json'));
            console.log('writing to', configPath);
            const config = JSON.parse(fs.readFileSync(configPath));
            config.databaseAuthToken = response.auth.token || "";

            console.log('writing data:', JSON.stringify(config));
            fs.writeFileSync(configPath, JSON.stringify(config,  null, 2));
        }
    })
});

req.on('error', (error) => {
    console.error(error)
});

req.write(data);
req.end();
