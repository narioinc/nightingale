var PROTO_PATH = __dirname + '/protos/nightingale.proto';
var grpc = require('@grpc/grpc-js');
var protoLoader = require('@grpc/proto-loader');

console.log('Loading proto file:', PROTO_PATH);

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

function hello(call, callback){
    console.log('hello called');
    callback(null, {
        message: 'Hello ' + call.request.name + '!'
    });
   
}

function getServer() {
  var server = new grpc.Server();
  server.addService(nightingale.Nightingale.service, {
    hello: hello
  });
  return server;
}

var routeServer = getServer();
routeServer.bindAsync('0.0.0.0:3001', grpc.ServerCredentials.createInsecure(), () => {
  routeServer.start();
});
