const Middleware = require('../lib/utils/Middleware');
const {describe, it, beforeEach} = require('mocha');
const {expect} = require('chai');

describe('PrefixKeyMiddleware', function () {
    /** @type {PrefixKeyMiddleware} */
    let middleware;

    beforeEach(() => {
        middleware = Middleware.getPrefixKeyMiddleware();
    });

    it('should call all handlers for matching keys', () => {
        let counter = 0;

        middleware.on('channel.1.2.3', (remainingChannel, amount) => counter += amount);
        middleware.on('channel.1.2', (remainingChannel, amount) => counter += amount);
        middleware.on('channel.1', (remainingChannel, amount) => counter += amount);

        middleware.send('channel.1.2.3', 2);

        expect(counter).to.equal(6);
    });

    it('should should call all handler until one sets preventPropagation to true', () => {
        let counter = 0;

        middleware.on('channel.1.2.3', (remainingChannel, amount) => counter += amount);
        middleware.on('channel.1.2', (remainingChannel, amount) => counter += amount, true);
        middleware.on('channel.1', (remainingChannel, amount) => counter += amount);

        middleware.send('channel.1.2.3', 2);

        expect(counter).to.equal(4);
    });

    it('should correctly report the remaining unmatched channel to handler', () => {
        middleware.on('channel', (remainingChannel) => {
            expect(remainingChannel).to.equal('.subChannel');
        });

        middleware.send('channel.subChannel', null);
    });

});
