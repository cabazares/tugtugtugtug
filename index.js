var server = require('./server');
var router = require('./router');
var requestHandlers = require('./requestHandlers');


var handlers = [
    ['/nextTrack', requestHandlers.nextTrack],
    ['/.*/fbshare/?', requestHandlers.fbShare],
    ['/t/.*/?', requestHandlers.tracks],
    ['/a/.*/?', requestHandlers.artists],
]

server.start(router.route, handlers);
