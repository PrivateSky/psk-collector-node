const config = require('../config');
const lineProtocolUtils = require('./utils/lineProtocolUtils');
const request = require('request');
const http = require('http');

/**
 * Buffers request to InfluxDB and sends them every 5 seconds or when 5000 messages are in buffer
 * @param {string} bucket
 * @param {string} url
 * @param {string} authToken
 * @returns {{addLine({string} line): void}}
 */
function getBufferedRequest(bucket, url, authToken) {
    const FLUSH_INTERVAL = 5000; // 5 seconds
    const FLUSH_INTERVAL_MAX_VARIATION = 50;
    const SIZE_THRESHOLD = 5000;

    let bufferedLines = [];
    let size = 0;
    let lastFlush = Date.now();

    function shouldFlush() {
        if (size === 0) {
            return false;
        }

        if (size >= SIZE_THRESHOLD) {
            return true;
        }

        const currentFlush = Date.now();
        const millisecondsDiff = currentFlush - lastFlush;

        if (millisecondsDiff > FLUSH_INTERVAL + FLUSH_INTERVAL_MAX_VARIATION) {
            return true;
        }

        return false;
    }

    function maybeFlushBySize() {
        if (size >= SIZE_THRESHOLD) {
            flush();
        }
    }


    function maybeFlushBuffers() {
        if (shouldFlush()) {
            flush();
        }
    }

    function flush() {
        const requestOptions = {
            url: `${url}/api/v2/write`,
            method: 'POST',
            qs: {
                'org': config.organizationName,
                bucket: bucket,
                precision: 'us'
            },
            body: bufferedLines.join('\n'),
            headers: {
                'Authorization': `Token ${authToken}`
            }
        };

        lastFlush = Date.now();

        bufferedLines = [];
        size = 0;

        request(requestOptions, (err, response, body) => {
            if (err) {
                console.error(err);
            }

            if(response && response.statusCode >= 400) {
                console.error(body);
            }
        });
    }


    setInterval(maybeFlushBuffers, FLUSH_INTERVAL);

    return {
        addLine(line) {
            bufferedLines.push(line);
            size += 1;
            maybeFlushBySize();
        }
    }
}


/**
 *
 * @param {string} url - URL to InfluxDb Database
 * @param {string} authToken - token for authentication provided by InfluxDb
 * @returns {InfluxCommunication}
 */
function getInfluxCommunication(url, authToken) {
    const bufferedRequestsForBucket = new Map();
    /** @namespace InfluxCommunication*/
    return {
        /**
         * @param {string} bucket - Corresponding bucket in InfluxDb (it must already exist)
         * @param {object} measurement
         * @param {number} timestamp
         * @param {?object} tags
         * @param {?object} fields
         */
        write(bucket, {measurement, timestamp, tags, fields}) {
            let line = {};
            try {
                line = lineProtocolUtils.toLineProtocol({measurement, timestamp, tagSet: tags, fieldSet: fields});
            } catch (e) {
                console.error('failed to transform message to line protocol', {measurement, timestamp, tags, fields});
            }


            if (!bufferedRequestsForBucket.has(bucket)) {
                createBucket(bucket); // async but should have enough time theoretically

                const bufferedRequest = getBufferedRequest(bucket, url, authToken);
                bufferedRequestsForBucket.set(bucket, bufferedRequest);
            }

            const bufferedRequest = bufferedRequestsForBucket.get(bucket);
            bufferedRequest.addLine(line);

        }
    }
}

function createBucket(bucketName) {
    const data = JSON.stringify({
        name: bucketName,
        retentionRules: [],
        orgID: config.organizationId
    });

    const options = {
        hostname: '127.0.0.1',
        port: 9999,
        path: `/api/v2/buckets`,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': data.length,
            'Authorization': `Token ${config.databaseAuthToken}`
        }
    };

    const req = http.request(options, (res) => {
        res.on('data', (resData) => {

        })
    });

    req.on('error', (error) => {
        console.error('error create bucket request', error);
    });

    req.end(data);
}

module.exports = {
    getInfluxCommunication
};
