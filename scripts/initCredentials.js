const http = require('http');
const fs = require('fs');
const path = require('path');
const config = require('../config.json');

const baseApi = '/api/v2/setup';
const configPath = '/root/.influxdbv2/psk-init-config.json';

if(fs.existsSync(configPath)) {
    const config = JSON.parse(fs.readFileSync(configPath).toString());
    writeTokenToLocalConfigSync(config.auth.token);
    writeOrgIdToLocalConfigSync(config.org.id);
    process.exit(0);
}

const data = JSON.stringify({
    bucket: 'base',
    org: config.organizationName,
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

        fs.writeFileSync(configPath, JSON.stringify(response));
        // console.log('response: ', response);
        if(response.auth) {
            const token = response.auth.token;

            writeTokenToLocalConfigSync(token);
        }

        if(response.org) {
            const orgId = response.org.id;

            writeOrgIdToLocalConfigSync(orgId);
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

function writeOrgIdToLocalConfigSync(orgId) {
    const configPath = path.resolve(path.join(__dirname, '../config.json'));
    const config = JSON.parse(fs.readFileSync(configPath));

    config.organizationId = orgId || "";
    fs.writeFileSync(configPath, JSON.stringify(config,  null, 2));
}

req.write(data);
req.end();
