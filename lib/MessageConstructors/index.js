const EventMessage = require('./EventMessage');
const LogMessage = require('./LogMessage');

/**
 * @typedef MonitorNodeEnvelope
 *
 * @property {string} nodeName
 * @property {string} topic
 * @property {*} envelopedMessage
 */

module.exports = {
    EventMessage,
    LogMessage
};