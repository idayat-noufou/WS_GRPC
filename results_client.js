const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

const PROTO_PATH = './voting.proto';
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {});
const votingProto = grpc.loadPackageDefinition(packageDefinition).voting;

function main() {
    const client = new votingProto.VotingService('localhost:50051', grpc.credentials.createInsecure());
    const call = client.streamResults();

    call.on('data', (voteCount) => {
        console.log(`Drawing ID: ${voteCount.drawing_id}, Count: ${voteCount.count}`);
    });

    call.on('end', () => {
        console.log('Stream ended');
    });

    call.on('error', (e) => {
        console.error(e);
    });

    call.on('status', (status) => {
        console.log(status);
    });
}

main();