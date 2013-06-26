function route(handlers, pathname, request, response, data) {
    var matched = false;
    for (var i  = 0; i < handlers.length && !matched; i++) {
        var item = handlers[i];
        var path = new RegExp(item[0]);
        var handler = item[1];

        if (path.test(pathname) && typeof handler === 'function') {
            handler({
                'path': pathname,
                'request': request,
                'response': response,
                'data': data
            });
            matched = true;
        }
    }
    if (!matched) {
        response.writeHead(404, {'Content-Type': 'text/plain'});
        response.write('404 Not found');
        response.end();
    }
}

exports.route = route;
