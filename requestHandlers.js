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
    var artist = parsePath(obj.path, 'artist');
    db.Artist.findOne({
        '_id': artist
    }, function (err, artist) {
        respondJSON(artist || {});
    });
}

function tracks(obj) {
    response = obj.response;
    var track = parsePath(obj.path, "track");
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

function home(obj) {
    var URL = "http://www.tugtugtugtug.com";
    var OG_IMAGE = URL + "/images/tugtug_640.jpg";
    var OG_TITLE = "Tugtugtugtug";
    var filename = "./www/home.html";
    response = obj.response;

    var trackId = parsePath(obj.path, "t");
    fs.readFile(filename, 'utf8', function(err, data) {
        if (err) throw err;
        // retrieve track
        db.Track.findOne({
            '_id': trackId
        }).populate('artist').findOne(function (err, track) {
            // populate html
            data = data.replace('{OG_IMAGE}', OG_IMAGE);
            data = data.replace('{OG_URL}', URL + obj.request.url)
            if (track !== undefined) {
                track = JSON.parse(JSON.stringify(track));
                var og_title = track.artist.name + " - " + track.title;
                data = data.replace('{OG_TITLE}', og_title);
            } else {
                data = data.replace('{OG_TITLE}', OG_TITLE);
            }
            // respond
            respondHTML(data);
        });
    });
}


exports.tracks = tracks;
exports.artists = artists;
exports.nextTrack = nextTrack;

exports.home = home;
