var db = require('./database');
var static = require('node-static');
var fs = require('fs');


var parsePath = function (path, tag) {
    var pathSplit = path.split('/');
    var index = pathSplit.indexOf(tag) + 1;
    return pathSplit[index];
}

var respondJSON = function (data) {
    response.writeHead(200, {'Content-Type': 'application/json'});
    response.write(JSON.stringify(data));
    response.end();
}

var respondHTML = function (data) {
    response.writeHead(200, {'Content-Type': 'text/html'});
    response.write(data);
    response.end();
}


function artists(obj) {
    response = obj.response;
    var artist = parsePath(obj.path, 'a');
    db.Artist.findOne({
        '_id': artist
    }, function (err, artist) {
        respondJSON(artist || {});
    });
}

function tracks(obj) {
    response = obj.response;
    var track = parsePath(obj.path, "t");
    db.Track.findOne({
        '_id': track
    }).populate('artist').findOne(function (err, track) {
        respondJSON(track || {});
    });
}

function nextTrack(obj) {
    response = obj.response;
    db.Track.random(function (err, track) {
        respondJSON(track || {});
    });
}

function fbShare(obj) {
    var filename = "./www/fbshare.html";
    response = obj.response;

    var trackId = parsePath(obj.path, "t");
    fs.readFile(filename, 'utf8', function(err, data) {
        if (err) throw err;
        db.Track.findOne({
            '_id': trackId
        }).populate('artist').findOne(function (err, track) {
            track = JSON.parse(JSON.stringify(track))
            data = data.replace('{URL}', obj.request.url)
            data = data.replace('{ARTIST}', track.artist.name);
            data = data.replace('{TITLE}', track.title);
            data = data.replace('{REDIRECT_URL}',
                                obj.request.url.replace('/fbshare', ''))
            respondHTML(data);
        });
    });
}


exports.tracks = tracks;
exports.artists = artists;
exports.nextTrack = nextTrack;

exports.fbShare = fbShare;

