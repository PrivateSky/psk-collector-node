const http = require('http');
const fs = require('fs');
const path = require('path');
const config = require('../config');

const authToken = config.databaseAuthToken;

const configPath = '/root/.influxdbv2/psk-init-config.json';
// const configPath = './psk-init-config.json';
const baseApi = '/api/v2/dashboards';
const dashboardTemplatesDir = path.resolve(path.join(__dirname, '../dashboards'));

if (!fs.existsSync(configPath)) {
    throw new Error('Run initCredentials script first');
}

const authConfig = JSON.parse(fs.readFileSync(configPath).toString());
const localDashboardTemplates = fs.readdirSync(dashboardTemplatesDir);

localDashboardTemplates.forEach(createDashboard);


// const cellsData = {
//     name: dashboardDesc.content.data.attributes.name,
//     orgID: authConfig.org.id,
//     cells: cells
// };

// console.log('cells', cellsMapById);

// console.log('and cells', cellsData);
// });

function createDashboard(fileName) {
    const currentFilePath = path.join(dashboardTemplatesDir, fileName);
    const dashboardDesc = JSON.parse(fs.readFileSync(currentFilePath).toString());

    const data = JSON.stringify({
        name: dashboardDesc.content.data.attributes.name,
        description: dashboardDesc.content.data.attributes.description,
        orgID: authConfig.org.id
    });

    console.log('sending ', data);

    const options = {
        hostname: '127.0.0.1',
        port: 9999,
        path: baseApi,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': data.length,
            'Authorization': `Token ${authToken}`
        }
    };

    const req = http.request(options, (res) => {
        res.on('data', (resData) => {
            const response = JSON.parse(resData.toString());
            const dashboardId = response.id;

            createCellsForDashboard(dashboardId, dashboardDesc);
        })
    });

    req.on('error', (error) => {
        console.error('error dashboard request', error);
    });

    req.end(data);
}

function createCellsForDashboard(dashboardId, dashboardData) {
    // pair cells and views based on their id
    /** @type {Map<string, {cell: Object, view: Object}>} */
    const cellsMapById = dashboardData.content.included
        .reduce(((previousValue, currentValue) => {
            const id = currentValue.id;
            const valueToSet = previousValue.get(id) || {};

            valueToSet[currentValue.type] = currentValue.attributes;
            previousValue.set(id, valueToSet);

            return previousValue;
        }), new Map());


    for (const cellObj of cellsMapById.values()) {
        console.log('sending cell not view', cellObj.cell);
        const data = JSON.stringify(cellObj.cell);
        const options = {
            hostname: '127.0.0.1',
            port: 9999,
            path: `${baseApi}/${dashboardId}/cells`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': data.length,
                'Authorization': `Token ${authToken}`
            }
        };

        console.log('sending cell', data, options);

        const req = http.request(options, (res) => {
            res.on('data', (resData) => {
                console.log('got data from cell call', resData.toString());
                const response = JSON.parse(resData.toString());

                const cellId = response.id;
                console.log('response cell: ', response);
                sendViewForCell(dashboardId, cellId, cellObj.view);
            });

        });

        req.on('error', (error) => {
            console.error('error cell request', error);
        });

        req.end(data);
    }
}

function sendViewForCell(dashboardId, cellId, viewData) {
    const data = JSON.stringify(viewData);
    const options = {
        hostname: '127.0.0.1',
        port: 9999,
        path: `${baseApi}/${dashboardId}/cells/${cellId}/view`,
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': data.length,
            'Authorization': `Token ${authToken}`
        }
    };

    console.log('sending view', data, options);

    const req = http.request(options, (res) => {
        res.on('data', (resData) => {
            console.log('got data from view call', resData.toString());
            const response = JSON.parse(resData.toString());

            console.log('response view: ', response);
        })
    });

    req.on('error', (error) => {
        console.error('error view request', error);
    });

    req.end(data);
}

