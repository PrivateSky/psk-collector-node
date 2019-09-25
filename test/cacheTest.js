const Cache = require('../lib/utils/Cache');
const {describe, it} = require('mocha');
const {expect} = require('chai');

describe('Cache', function () {
    const cacheKey = 'testKey';
    const cacheValue = 'testValue';

    it('should remain in cache before timeout ticks', function (done) {
        const cache = getCache(100);
        setTimeout(() => {
            const value = cache.get(cacheKey);
            expect(value).to.equal(cacheValue);
            done();
        }, 50);
    });

    it('should be removed from cache after timeout', function (done) {
        const cache = getCache(100);
        setTimeout(() => {
            const exists = cache.has(cacheKey);
            expect(exists).to.equal(false);
            done();
        }, 110);
    });


    function getCache(timeLimit) {
        const cache = Cache.getTimeCache();
        cache.add(cacheKey, cacheValue, timeLimit);

        return cache;
    }
});
