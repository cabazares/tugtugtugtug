var server = require('./server');
var router = require('./router');
var requestHandlers = require('./requestHandlers');


var handlers = [
    ['/nextTrack', requestHandlers.nextTrack],
    ['/track/.*/?', requestHandlers.tracks],
    ['/artist/.*/?', requestHandlers.artists],
    ['/.*', requestHandlers.home],
]

server.start(router.route, handlers);
