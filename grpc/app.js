var PROTO_PATH = __dirname + '/protos/nightingale.proto';
var grpc = require('@grpc/grpc-js');
var protoLoader = require('@grpc/proto-loader');

var helloService = require('./services/hello.js');



var packageDefinition = protoLoader.loadSync(
    PROTO_PATH,
    {keepCase: true,
     longs: String,
     enums: String,
     defaults: true,
     oneofs: true
    });
var protoDescriptor = grpc.loadPackageDefinition(packageDefinition);
// The protoDescriptor object has the full package hierarchy
var nightingale = protoDescriptor.nightingale;

function getServer() {
  var server = new grpc.Server();
  server.addService(nightingale.Nightingale.service, {
    hello: helloService.hello,
  });
  return server;
}

var routeServer = getServer();
routeServer.bindAsync('0.0.0.0:3001', grpc.ServerCredentials.createInsecure(), () => {
    console.log('Nightingale gRPC server running on port 3001');
  routeServer.start();
});
