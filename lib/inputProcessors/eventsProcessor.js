const {EventMessage} = require('../MessageConstructors/index');

/**
 *
 * @param {PrefixKeyMiddleware} middleware
 * @param {InfluxCommunication} influxCommunication
 */
function eventsProcessor(middleware, influxCommunication) {

    middleware.on('.swarm', (channel, data) => {
        const message = EventMessage.fromMonitorNodeEnvelope(data);

        const tagsWithUndefined = {
            agent: message.originInfo.agent,
            context: message.originInfo.domain,
            nodeName: message.originInfo.nodeName,
            origin: message.originInfo.origin,
            platform: message.originInfo.agent
        };

        const tagsWithoutUndefined = JSON.parse(JSON.stringify(tagsWithUndefined));
        const time = message.time;

        influxCommunication.write('swarmEvents', {
            measurement: 'all',
            tags: tagsWithoutUndefined,
            fields: {messages: message.message},
            timestamp: Math.round(time * 1000)
        });
    });
}

module.exports = eventsProcessor;
