
var HelloService  = {}

HelloService.hello = function(call, callback){
    callback(null, {
        message: 'Hello ' + call.request.name + '!'
    });
   
}


module.exports = HelloService;