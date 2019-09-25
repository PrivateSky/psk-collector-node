/**
 * @class
 *
 * @name PrefixKeyMiddleware
 */

/**
 * Register function that will get executed when a prefix match is found on their channel
 * The functions will be passed the remaining part of the channel (the one that did not match)
 * to be able to recursively apply the same pattern
 *
 * Effectively, this class acts as nodes in a prefix tree with leaf nodes actually handling the original sent object
 *
 * @example
 * if registering middleware for channel 'channel.subChannel.1', a call of send('channel', ...) will
 * call the corresponding method with first parameter being '.subChannel.1'
 * This function in turn can call another prefixKeyMiddleware with .send('.subChannel.1', ...) to recursively
 * match prefixes
 * @return {PrefixKeyMiddleware}
 */
function getPrefixKeyMiddleware() {
    const middlewarePairs = []; // array instead of Map because I can match more than one middleware

    return {
        /**
         * @name PrefixKeyMiddleware#on
         * @param {string} channel
         * @param {function} handler
         * @param {boolean} preventPropagation=false
         */
        on(channel, handler, preventPropagation = false) {
            middlewarePairs.push([channel, handler, preventPropagation]);
        },
        /**
         * @name PrefixKeyMiddleware#send
         * @param {string} channel
         * @param {*} data
         */
        send(channel, data) {
            for (const [registeredChannel, handler, preventPropagation] of middlewarePairs) {

                // matches the provided channel against all registered ones by "on" method
                if (channel.startsWith(registeredChannel)) {
                    const unmatchedChannel = channel.substring(registeredChannel.length);
                    // send the remaining part of the channel (the part that did not match) to the handler
                    handler(unmatchedChannel, data);

                    if (preventPropagation) {
                        break;
                    }
                }
            }
        }
    }
}

module.exports = {
    getPrefixKeyMiddleware: getPrefixKeyMiddleware
};
