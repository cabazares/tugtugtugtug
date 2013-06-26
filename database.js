var mongoose = require('mongoose');
var Schema = mongoose.Schema;
mongoose.connect('mongodb://localhost/tugtugtugtug');

// connect
var db = mongoose.connection;
var isConnected = false;
db.on('error', console.error.bind(console, 'connection error:'));

db.once('open', function callback () {
    isConnected = true;
});


// define artist
var artistSchema = Schema({
    name: String
});

var Artist = mongoose.model('Artist', artistSchema);


// define track
var trackSchema = Schema({
    name: String,
    artist: { type: Schema.Types.ObjectId, ref: 'Artist' },
    url: String
});

// return a random statistic
trackSchema.statics.random = function(callback) {
    this.count(function(err, count) {
        if (err) {
            return callback(err);
        }
        var rand = Math.floor(Math.random() * count);
        this.findOne().populate('artist').skip(rand).exec(callback);
    }.bind(this));
};

var Track = mongoose.model('Track', trackSchema);

exports.Artist = Artist
exports.Track = Track
