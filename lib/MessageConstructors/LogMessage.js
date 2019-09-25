const OriginInfo = require('./OriginInfo');

/**
 *
 * @param {MonitorNodeEnvelope} messageEnvelope
 * @returns {LogMessage}
 */
function fromMonitorNodeEnvelope(messageEnvelope) {
    const envelopedMessage = messageEnvelope.envelopedMessage;
    const time = envelopedMessage.time;
    const message = envelopedMessage.messages.join(' ');
    const level = envelopedMessage.level;

    const originInfo = OriginInfo.getOriginInfo(messageEnvelope);

    return new LogMessage(level, message, originInfo, time);
}


/**
 *
 * @param {string} level
 * @param {string} message
 * @param {OriginInfoObj} originInfo
 * @param {number} time
 * @constructor
 */
function LogMessage(level, message, originInfo, time) {
    this.level = level;
    this.message = message;
    this.originInfo = originInfo;
    this.time = time;
}

module.exports = {
    fromMonitorNodeEnvelope
};
