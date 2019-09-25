const lineProtocolUtils = require('../lib/utils/lineProtocolUtils');
const {describe, it} = require('mocha');
const {Errors} = require('../lib/Errors');
const {expect} = require('chai');

describe('LineProtocol', function () {
    describe('#objectToTagsForLineProtocol', function () {
        it('should return comma separated values on input Object < string, string >', function () {
            const tagsForLine = lineProtocolUtils.objectToTagsForLineProtocol({tag1: 'value1', tag2: 'value2'});
            expect(tagsForLine).to.equal('tag1=value1,tag2=value2');
        });

        it('should transform spaces in escaped spaces for values', function () {
            const tagsForLine = lineProtocolUtils.objectToTagsForLineProtocol({tag1: 'test space'});
            expect(tagsForLine).to.equal('tag1=test\\ space');
        });

        it('should throw Errors.InvalidType on input Object < string, !string>', function () {
            expect(() => lineProtocolUtils.objectToTagsForLineProtocol({tag1: 1})).to.throw(Errors.InvalidType);
        });

        it('should return an empty string when input is empty object', function () {
            const tagsForLine = lineProtocolUtils.objectToTagsForLineProtocol({});
            expect(tagsForLine).to.equal('');
        });
    });

    describe('#objectToFieldsForLineProtocol', function () {
        it('should return comma separated values on input Object < string, string > with values having quotation marks', function () {
            const tagsForLine = lineProtocolUtils.objectToFieldsForLineProtocol({field1: 'value1', field2: 'value2'});
            expect(tagsForLine).to.equal('field1="value1",field2="value2"');
        });

        it('should return comma separated values on input Object < string, integer >', function () {
            const tagsForLine = lineProtocolUtils.objectToFieldsForLineProtocol({field1: 1, field2: 2});
            expect(tagsForLine).to.equal('field1=1,field2=2');
        });

        it('should return comma separated values on input Object < string, float > with values kept as they are', function () {
            const tagsForLine = lineProtocolUtils.objectToFieldsForLineProtocol({field1: 1.2, field2: 2.1});
            expect(tagsForLine).to.equal('field1=1.2,field2=2.1');
        });

        it('should treat floats that are whole numbers as integers', function () {
            const tagsForLine = lineProtocolUtils.objectToFieldsForLineProtocol({field1: 1.0, field2: 2.0});
            expect(tagsForLine).to.equal('field1=1,field2=2');
        });

        it('should return comma separated values on input Object < string, bool >', function () {
            const tagsForLine = lineProtocolUtils.objectToFieldsForLineProtocol({field1: true, field2: false});
            expect(tagsForLine).to.equal('field1=true,field2=false');
        });

        it('should mix well the cases above', function () {
            const fieldSet = {
                someString: 'str',
                someInt: 1,
                someFloat: 2.9,
                someStringAgain: '',
                wholeFloat: 4.0,
                bool: true
            };
            const tagsForLine = lineProtocolUtils.objectToFieldsForLineProtocol(fieldSet);
            expect(tagsForLine).to.equal('someString="str",someInt=1,someFloat=2.9,someStringAgain="",wholeFloat=4,bool=true');
        });

        it('should throw Errors.InvalidType when input values are objects', function () {
            expect(() => lineProtocolUtils.objectToFieldsForLineProtocol({field1: {}})).to.throw(Errors.InvalidType);
        });

        it('should throw Errors.InvalidType when input values are BigInt', function () {
            expect(() => lineProtocolUtils.objectToFieldsForLineProtocol({field1: 12n})).to.throw(Errors.InvalidType);
        });

        it('should throw Errors.InvalidType when input values are Symbol', function () {
            expect(() => lineProtocolUtils.objectToFieldsForLineProtocol({field1: Symbol('')})).to.throw(Errors.InvalidType);
        });

        it('should throw Errors.InvalidType when input values are Arrays', function () {
            expect(() => lineProtocolUtils.objectToFieldsForLineProtocol({field1: []})).to.throw(Errors.InvalidType);
        });

        it('should throw Errors.NumberOutOfRange when input values are numbers but not finite', function () {
            expect(() => lineProtocolUtils.objectToFieldsForLineProtocol({field1: Infinity})).to.throw(Errors.NumberOutOfRange);
        });

        it('should throw Errors.NumberOutOfRange when input values are NaN', function () {
            expect(() => lineProtocolUtils.objectToFieldsForLineProtocol({field1: NaN})).to.throw(Errors.NumberOutOfRange);
        });

        it('should throw Errors.InvalidType when input values are functions', function () {
            expect(() => lineProtocolUtils.objectToFieldsForLineProtocol({
                field1: function () {
                }
            })).to.throw(Errors.InvalidType);
        });

        it('should return an empty string when input is empty object', function () {
            const tagsForLine = lineProtocolUtils.objectToFieldsForLineProtocol({});
            expect(tagsForLine).to.equal('');
        });
    });

    describe('#toLineProtocol', function () {
        it('should return correct line protocol format', function () {
            const {performance} = require('perf_hooks');
            const timestamp = Math.round((performance.timeOrigin + performance.now()) * 100);

            const lineProtocolArguments = {
                measurement: 'pskLogs',
                tagSet: {tag1: 'some tag'},
                fieldSet: {field1: 1},
                timestamp: timestamp
            };
            const lineResult = lineProtocolUtils.toLineProtocol(lineProtocolArguments);

            expect(lineResult).to.equal(`pskLogs,tag1=some\\ tag field1=1 ${timestamp}`);
        });

        it('should allow missing tags', function () {
            const {performance} = require('perf_hooks');
            const timestamp = Math.round((performance.timeOrigin + performance.now()) * 100);

            const lineProtocolArguments = {
                measurement: 'pskLogs',
                fieldSet: {field1: 1},
                timestamp: timestamp
            };
            const lineResult = lineProtocolUtils.toLineProtocol(lineProtocolArguments);

            expect(lineResult).to.equal(`pskLogs field1=1 ${timestamp}`);
        })
    });
});
