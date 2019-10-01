const {EventMessage} = require('../MessageConstructors/index');

/**
 *
 * @param {PrefixKeyMiddleware} middleware
 * @param {InfluxCommunication} influxCommunication
 */
function eventsProcessor(middleware, influxCommunication) {
    // TODO: the processing is repetitive, allow middleware to modify data and then trigger the listeners
    middleware.on('.swarm.call', (channel, data) => {
        const message = EventMessage.fromMonitorNodeEnvelope(data);
        const payload = message.message[0];
        if(!payload) {
            return;
        }

        const tagsWithUndefined = {
            agent: message.originInfo.agent,
            context: message.originInfo.domain,
            nodeName: message.originInfo.nodeName,
            origin: message.originInfo.origin,
            platform: message.originInfo.agent,
            swarmTypeName: payload.swarmTypeName,
            phaseName: payload.phaseName
        };

        const tagsWithoutUndefined = JSON.parse(JSON.stringify(tagsWithUndefined));
        const time = message.time;

        if(!payload.swarmId) {
            console.log(message.message[0], typeof message.message[0]);
        }

        influxCommunication.write('swarms', {
            measurement: 'call',
            tags: tagsWithoutUndefined,
            fields: {swarmId: payload.swarmId},
            timestamp: Math.round(time * 1000)
        });
    }, true);

    middleware.on('.resources', (channel, data) => {
        const message = EventMessage.fromMonitorNodeEnvelope(data);
        const payload = message.message[0];
        if(!payload) {
            return;
        }

        const tagsWithUndefined = {
            agent: message.originInfo.agent,
            context: message.originInfo.domain,
            nodeName: message.originInfo.nodeName,
            origin: message.originInfo.origin,
            platform: message.originInfo.agent,
        };

        const tagsWithoutUndefined = JSON.parse(JSON.stringify(tagsWithUndefined));
        const payloadWithoutUndefined = JSON.parse(JSON.stringify(payload));
        const time = message.time;

        influxCommunication.write('resources', {
            measurement: 'usedByNodes',
            tags: tagsWithoutUndefined,
            fields: payloadWithoutUndefined,
            timestamp: Math.round(time * 1000)
        });
    }, true);

    middleware.on('.status.domains.', (channel, data) => {
        const message = EventMessage.fromMonitorNodeEnvelope(data);
        const payload = message.message[0];
        if(!payload) {
            return;
        }

        // channel is either boot or restart

        const tagsWithUndefined = {
            agent: message.originInfo.agent,
            context: message.originInfo.domain,
            nodeName: message.originInfo.nodeName,
            origin: message.originInfo.origin,
            platform: message.originInfo.agent,
            type: channel
        };

        const tagsWithoutUndefined = JSON.parse(JSON.stringify(tagsWithUndefined));
        const payloadWithoutUndefined = JSON.parse(JSON.stringify(payload));
        const time = message.time;

        influxCommunication.write('resources', {
            measurement: 'domains',
            tags: tagsWithoutUndefined,
            fields: payloadWithoutUndefined,
            timestamp: Math.round(time * 1000)
        });
    }, true);

    middleware.on('.status.agents.', (channel, data) => {
        const message = EventMessage.fromMonitorNodeEnvelope(data);
        const payload = message.message[0];
        if(!payload) {
            return;
        }

        // channel is "boot" at this time

        const tagsWithUndefined = {
            agent: message.originInfo.agent,
            context: message.originInfo.domain,
            nodeName: message.originInfo.nodeName,
            origin: message.originInfo.origin,
            platform: message.originInfo.agent,
            type: channel
        };

        const tagsWithoutUndefined = JSON.parse(JSON.stringify(tagsWithUndefined));
        const payloadWithoutUndefined = JSON.parse(JSON.stringify(payload));
        const time = message.time;

        influxCommunication.write('resources', {
            measurement: 'agents',
            tags: tagsWithoutUndefined,
            fields: payloadWithoutUndefined,
            timestamp: Math.round(time * 1000)
        });
    }, true);
}

module.exports = eventsProcessor;
