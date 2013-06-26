var server = require('./server');
var router = require('./router');
var requestHandlers = require('./requestHandlers');


var handlers = [
    ['/nextTrack', requestHandlers.nextTrack],
    ['/t/.*/?', requestHandlers.tracks],
    ['/a/.*/?', requestHandlers.artists],
]

server.start(router.route, handlers);
