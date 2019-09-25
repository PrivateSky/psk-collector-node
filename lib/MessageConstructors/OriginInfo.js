/**
 * @typedef OriginInfoObj - Suffixed with Obj otherwise collides with file and produces weird results
 *
 * @property {string} nodeName
 * @property {string} origin
 * @property {string} platform
 * @property {?string} agent
 * @property {?string} domain
 * @property {?string} processStartFile
 */

/**
 * @param {MonitorNodeEnvelope} messageEnvelope
 * @returns {OriginInfoObj}
 */
function getOriginInfo(messageEnvelope) {
    const nodeName = messageEnvelope.nodeName;
    const envelopeMeta = messageEnvelope.envelopedMessage.meta;

    const returnedObject = {
        origin: envelopeMeta.origin,
        nodeName: nodeName
    };

    const originInfo = getInfoBasedOnOrigin(envelopeMeta);

    return Object.assign(returnedObject, originInfo);
}

function getInfoBasedOnOrigin(envelopedMeta) {
    const origin = envelopedMeta.origin;

    if (origin in originsStrategies) {
        return originsStrategies[origin](envelopedMeta);
    } else {
        return {origin}
    }
}

const originsStrategies = {
    'node': getOriginInfoIfNode,
    'domain': getOriginInfoIfDomain,
    'agent': getOriginInfoIfAgent,
    'sandbox': getOriginInfoIfSandbox
};

function getOriginInfoIfDomain(envelopedMeta) {
    return {
        domain: envelopedMeta.domain,
        platform: envelopedMeta.platform
    }
}

function getOriginInfoIfAgent(envelopedMeta) {
    return {
        origin: envelopedMeta.origin,
        domain: envelopedMeta.domain,
        agent: envelopedMeta.agent,
        platform: envelopedMeta.platform
    }
}

function getOriginInfoIfSandbox(envelopedMeta) {
    return {
        origins: envelopedMeta.origin
    }
}

function getOriginInfoIfNode(envelopedMeta) {
    return {
        origin: envelopedMeta.origin,
        processStartFile: envelopedMeta.processStartFile,
        platform: envelopedMeta.platform
    }
}


module.exports = {
    getOriginInfo
};