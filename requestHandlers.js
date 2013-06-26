var db = require('./database');
var static = require('node-static');
var fileServer = new static.Server('./');


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


exports.tracks = tracks;
exports.artists = artists;
exports.nextTrack = nextTrack
