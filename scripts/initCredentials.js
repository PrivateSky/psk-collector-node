const http = require('http');
const fs = require('fs');
const path = require('path');

const baseApi = '/api/v2/setup';
const tokenPath = '/root/.influxdbv2/psk-config-token.txt';

if(fs.existsSync(tokenPath)) {
    const token = fs.readFileSync(tokenPath).toString();
    writeTokenToLocalConfigSync(token);
    process.exit(0);
}

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
            const token = response.auth.token;

            writeTokenToLocalConfigSync(token);
            fs.writeFileSync(tokenPath, token);
        }
    })
});

req.on('error', (error) => {
    console.error(error)
});

function writeTokenToLocalConfigSync(token) {
    const configPath = path.resolve(path.join(__dirname, '../config.json'));
    const config = JSON.parse(fs.readFileSync(configPath));

    config.databaseAuthToken = token || "";
    fs.writeFileSync(configPath, JSON.stringify(config,  null, 2));
}

req.write(data);
req.end();
