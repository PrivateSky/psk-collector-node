const OriginInfo = require('../lib/MessageConstructors/OriginInfo');
const {describe, it} = require('mocha');
const {expect} = require('chai');

describe('OriginInfo', function () {

    it('should correctly parse meta with origin agent', function () {
        const meta = {
            origin: 'agent',
            domain: 'testDomain',
            agent: 'testAgent',
            platform: 'linux'
        };

        const message = {
            nodeName: 'testNode',
            envelopedMessage: {
                meta
            }
        };

        const result = OriginInfo.getOriginInfo(message);

        expect(result.origin).to.equal('agent');
        expect(result.nodeName).to.equal('testNode');
        expect(result.domain).to.equal('testDomain');
        expect(result.agent).to.equal('testAgent');
        expect(result.platform).to.equal('linux');

        const resultKeys = Object.keys(result);
        expect(resultKeys).to.have.lengthOf(5, 'it contains keys that should not exist')
    });

    it('should correctly parse meta with origin domain', function () {
        const meta = {
            origin: 'domain',
            domain: 'testDomain',
            platform: 'linux'
        };

        const message = {
            nodeName: 'testNode',
            envelopedMessage: {
                meta
            }
        };

        const result = OriginInfo.getOriginInfo(message);

        expect(result.origin).to.equal('domain');
        expect(result.nodeName).to.equal('testNode');
        expect(result.domain).to.equal('testDomain');
        expect(result.platform).to.equal('linux');

        const resultKeys = Object.keys(result);
        expect(resultKeys).to.have.lengthOf(4, 'it contains keys that should not exist')
    });

    it('should correctly parse meta with origin node', function () {
        const meta = {
            origin: 'node',
            processStartFile: '/psk/launcher.js',
            platform: 'linux'
        };

        const message = {
            nodeName: 'testNode',
            envelopedMessage: {
                meta
            }
        };

        const result = OriginInfo.getOriginInfo(message);

        expect(result.origin).to.equal('node');
        expect(result.nodeName).to.equal('testNode');
        expect(result.processStartFile).to.equal('/psk/launcher.js');
        expect(result.platform).to.equal('linux');

        const resultKeys = Object.keys(result);
        expect(resultKeys).to.have.lengthOf(4, 'it contains keys that should not exist')
    });
});
