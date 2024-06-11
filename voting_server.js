const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const express = require('express');
const app = express();

const PROTO_PATH = __dirname + '/voting.proto';
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,});
const votingProto = grpc.loadPackageDefinition(packageDefinition).voting;


const votes = {};
const subscribers = [];

function vote(call, callback) {
    const drawingId = call.request.drawingId;
    if (!votes[drawingId]) {
        votes[drawingId] = 0;
    }
    votes[drawingId]++;
    const response = {
        message: 'Vote counted'
    };
    callback(null, response);
    subscribers.forEach(subscriber => {
        subscriber.write({ drawingId: drawingId, count: votes[drawingId] });
    });
}

function streamResults(call) {
    subscribers.push(call);
    call.on('cancelled', () => {
        const index = subscribers.indexOf(call);
        if (index !== -1) {
            subscribers.splice(index, 1);
        }
    });
}

const server = new grpc.Server();
server.addService(votingProto.VotingService.service, { vote, streamResults });

const PORT = 50051;
server.bindAsync(`0.0.0.0:${PORT}`, grpc.ServerCredentials.createInsecure(), () => {
    console.log(`Server running at http://127.0.0.1:${PORT}`);
    // server.start();
});

const HTTP_PORT = 3000;
app.listen(HTTP_PORT, () => {
    console.log(`HTTP server running at http://127.0.0.1:${HTTP_PORT}`);
});