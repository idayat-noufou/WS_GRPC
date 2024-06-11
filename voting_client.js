const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

const PROTO_PATH = './voting.proto';
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {});
const votingProto = grpc.loadPackageDefinition(packageDefinition).voting;

function main() {
    const client = new votingProto.VotingService('localhost:50051', grpc.credentials.createInsecure());

    client.vote({ user: 1, drawingId: 1 }, (err, response) => {
        if (err) console.error(err);
        else console.log(response.message);
    });
}

main();