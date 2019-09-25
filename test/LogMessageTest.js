const {describe, it} = require('mocha');
const {expect} = require('chai');
const {LogMessage} = require('../lib/MessageConstructors/index');

describe('LogMessage', function () {

    it('should correctly parse a monitor node enveloped message', function () {
        const envelopedMessage = {
            nodeName: 'testNode',
            topic: 'someTopic',
            envelopedMessage: {
                level: 'log',
                messages: ['message1', 'message2'],
                meta: {
                    origin: 'node',
                    processStartFile: '/psk/launcher.js',
                    platform: 'linux'
                },
                time: 100
            }
        };

        const parsedMessage = LogMessage.fromMonitorNodeEnvelope(envelopedMessage);

        expect(parsedMessage).to.deep.equal({
            level: 'log',
            message: 'message1 message2',
            originInfo: {
                origin: 'node',
                nodeName: 'testNode',
                processStartFile: '/psk/launcher.js',
                platform: 'linux'
            },
            time: 100
        });
    });

});
