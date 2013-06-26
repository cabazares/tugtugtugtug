var http = require('http');
var url = require('url');
var querystring = require('querystring');
var chromelogger = require('chromelogger');


function start(route, handlers) {
    function onRequest(request, response) {
        var postData = '';
        var pathname = url.parse(request.url).pathname;

        request.setEncoding('utf8');
        request.addListener('data', function(postDataChunk) {
            postData += postDataChunk;
        });

        request.addListener('end', function() {
            route(handlers, pathname, request, response,
                  querystring.parse(postData));
            postData = '';
        });
    }
    var server = http.createServer();
    server.on('request', chromelogger.middleware);
    server.on('request', onRequest);
    server.listen(8888);

    console.log('Server has started.');
}

exports.start = start;
