const config = require('./config');
const eventsProcessor = require('./lib/inputProcessors/eventsProcessor');
const InfluxCommunication = require('./lib/InfluxCommunication');
const logsProcessor = require('./lib/inputProcessors/logsProcessor');
const Middleware = require('./lib/utils/Middleware');
const zmq = require('zeromq');

const receiver = zmq.socket('pull');

if(!config.databaseAuthToken || config.databaseAuthToken === '') {
    throw new Error('You first need to obtain an auth token for database and save in in config.js')
}

const ENDPOINT = config.databaseEndpoint;
const TOKEN = config.databaseAuthToken;

const influxCommunication = InfluxCommunication.getInfluxCommunication(ENDPOINT, TOKEN);


const middleware = Middleware.getPrefixKeyMiddleware();
const eventsMiddleware = Middleware.getPrefixKeyMiddleware();
const logsMiddleware = Middleware.getPrefixKeyMiddleware();

// register middleware for each processor, this way they can execute more targeted function based on the topic
eventsProcessor(eventsMiddleware, influxCommunication);
logsProcessor(logsMiddleware, influxCommunication);


// when topic starts with events, send the message and the difference of the channel to eventsMiddleware
middleware.on('events', (channel, data) => {
   eventsMiddleware.send(channel, data);
});

// when topic starts with logs, send the message and the difference of the channel to logsMiddleware
middleware.on('logs', (channel, data) => {
   logsMiddleware.send(channel, data);
});

/**
 * Main listener on ZeroMQ channels, it distributes the incoming messages to a middleware that routes it
 * to the corresponding "inputProcessor" based on the topic
 */
receiver.on('message', function (message) {
    message = message.toString();
    console.log('message: ', message);
    const parsedMessage = JSON.parse(message);

    let topic = parsedMessage.topic;

    middleware.send(topic, parsedMessage);

});

console.log('BINDING ADDRESS', config.zeroMQBindAddress);
receiver.bindSync(config.zeroMQBindAddress);
