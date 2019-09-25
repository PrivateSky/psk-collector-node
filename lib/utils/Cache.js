function TimeCache() {
    const cache = new Map();
    const defaultTimeLimit = 60 * 1000; // 1 minute

    return {
        add(key, value, timeLimit = defaultTimeLimit) {
            this.cancel(key);
            const cancelableTimeout = setTimeout(() => cache.delete(key), timeLimit);

            cache.set(key, {value, cancelableTimeout});

        },
        cancel(key) {
            if (!cache.has(key)) {
                return;
            }

            const {cancelableTimeout} = cache.get(key);
            clearTimeout(cancelableTimeout);
        },
        get(key) {
            if (cache.has(key)) {
                return cache.get(key).value;
            }
        },
        delete: (key) => cache.delete(key),
        has: (key) => cache.has(key)
    };
}

module.exports = {
    getTimeCache() {
        return new TimeCache();
    }
};
