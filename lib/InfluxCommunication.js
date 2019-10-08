const config = require('../config');
const lineProtocolUtils = require('./utils/lineProtocolUtils');
const request = require('request');

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

        console.log('sending to influx', requestOptions);
        request(requestOptions, (err) => {
            if (err) {
                console.error(err);
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
            const line = lineProtocolUtils.toLineProtocol({measurement, timestamp, tagSet: tags, fieldSet: fields});

            if (!bufferedRequestsForBucket.has(bucket)) {
                const bufferedRequest = getBufferedRequest(bucket, url, authToken);
                bufferedRequestsForBucket.set(bucket, bufferedRequest);
            }

            const bufferedRequest = bufferedRequestsForBucket.get(bucket);
            bufferedRequest.addLine(line);
        }
    }
}

module.exports = {
    getInfluxCommunication
};
