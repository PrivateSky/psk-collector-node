const OriginInfo = require('./OriginInfo');

/**
 * @param {MonitorNodeEnvelope} messageEnvelope
 * @returns {EventMessage}
 */
function fromMonitorNodeEnvelope(messageEnvelope) {
    const envelopedMessage = messageEnvelope.envelopedMessage;
    const time = envelopedMessage.time;
    const message = JSON.stringify(envelopedMessage.messages);

    const originInfo = OriginInfo.getOriginInfo(messageEnvelope);

    return new EventMessage(message, originInfo, time);
}


/**
 * @param {string} message
 * @param {OriginInfoObj} originInfo
 * @param {number} time
 * @constructor
 */
function EventMessage(message, originInfo, time) {
    this.message = message;
    this.originInfo = originInfo;
    this.time = time;
}

module.exports = {
    fromMonitorNodeEnvelope
};
