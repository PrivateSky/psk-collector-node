const {LogMessage} = require('../MessageConstructors/index');

/**
 *
 * @param {PrefixKeyMiddleware} middleware
 * @param {InfluxCommunication} influxCommunication
 */
function logsProcessor(middleware, influxCommunication) {

    middleware.on('', (channel, data) => {
        const message = LogMessage.fromMonitorNodeEnvelope(data);

        const tagsWithUndefined = {
            agent: message.originInfo.agent,
            context: message.originInfo.domain,
            nodeName: message.originInfo.nodeName,
            origin: message.originInfo.origin,
            platform: message.originInfo.agent
        };

        const tagsWithoutUndefined = JSON.parse(JSON.stringify(tagsWithUndefined));

        influxCommunication.write('logs', {
            measurement: channel.substring(1),
            tags: tagsWithoutUndefined,
            fields: {message: message.message},
            timestamp: Math.round(message.time * 1000)
        })
    });
}

module.exports = logsProcessor;
