// setup angular app
var tug = angular.module('tugtugtugtug', []).run(function($rootScope) {
    // setup default values
    $rootScope.currentTrack = null;
    $rootScope.isPlaying = false;
    $rootScope.tracks = [];
});

tug.service('Config', function () {
    this.maxTrials = 10;
});

tug.config([
    '$routeProvider',
    '$locationProvider',
    function($routeProvider, $locationProvider) {
        // setup routes
        $routeProvider.when('/', {
            controller: 'MainCtrl'
        });
        $routeProvider.when('/t/:trackId', {
            controller: 'MainCtrl'
        });

        // set configurations
        $locationProvider.html5Mode(true);
    }
]);

// controllers
tug.controller('MainCtrl', function(Config, $rootScope, $scope, $location,
                                    $routeParams, Tracks) {

    // start playing on audio player load
    $rootScope.$on('audioPlayerInitialized', function(event) {
        // if track id is set in the url else load random track
        var request = $scope.getNextTrack($routeParams.trackId);
        request.then(function (track) {
            $rootScope.$broadcast('trackLoad', track);
        });
    });

    $scope.getNextTrack = function (trackId) {
        var deferred = $.Deferred();
        var tries = 0;
        var handleTrack = function (track) {
            // check if track not yet in tracks
            var ids = $.map($rootScope.tracks, function (v) {
                return v._id
            });
            if (ids.indexOf(track._id) == -1) {
                track.artist_id = track.artist._id;
                // replace artist text
                track.artist = track.artist.name;
                $rootScope.tracks.push(track);
                deferred.resolve(track);
            } else if (tries >= Config.maxTrials) {
                deferred.fail();
            } else {
                tries++;
                Tracks.getRandomTrack().then(handleTrack);
            }
        };
        // get random track if trackID not set) {
        if (trackId === undefined) {
            Tracks.getRandomTrack().then(handleTrack);
        } else {
            Tracks.getTrack(trackId).then(handleTrack);
        }
        return deferred;
    };

    $scope.playTrack = function (time) {
        $rootScope.$broadcast('trackPlay', time);
    };

    $scope.pauseTrack = function (time) {
        $rootScope.$broadcast('trackPause', time);
    };

    // load previous track
    $scope.loadPrevTrack = function () {
        var tracks = $rootScope.tracks;
        var index = tracks.indexOf($rootScope.currentTrack);
        var getPrevious = function () {
            var track = $rootScope.tracks[--index];
            $rootScope.$broadcast('trackLoad', track);
        };
        if (index > 0) {
            getPrevious();
        } else {
            $scope.getNextTrack().then(getPrevious);
        }
    };

    // load next track
    $scope.loadNextTrack = function () {
        var tracks = $rootScope.tracks;
        var index = tracks.indexOf($rootScope.currentTrack);
        var getNext = function () {
            var track = $rootScope.tracks[++index];
            $rootScope.$broadcast('trackLoad', track);
        };
        if (index < tracks.length - 1) {
            getNext();
        } else {
            $scope.getNextTrack().then(getNext);
        };
    };

    $scope.$on('trackLoaded', function (event, curr, prev) {
        // set location
        $location.path("/t/" + curr._id);
        // set document title
        window.document.title = curr.artist + " - " + curr.title;
    });
});

tug.factory('Tracks', function(Config) {
    var nextTrackURL = "/nextTrack";
    var getTrackURL = "/track/";
    return {
        getRandomTrack: function() {
            return $.ajax({
                'url': nextTrackURL + "?rand=" + Math.random(),
                'dataType': 'json'
            });
        },
        getTrack: function(trackId) {
            return $.ajax({
                'url': getTrackURL + trackId,
                'dataType': 'json'
            });
        }
    }
});


// directives
tug.directive('tugAudioPlayer', function ($rootScope) {
    return {
        restrict: 'C',
        link: function ($scope, element, attr) {
            // save player in rootscope
            var player = $(element);
            $rootScope.player = player;

            // initialize player
            player.jPlayer({
                ready: function () {
                    $rootScope.$broadcast('audioPlayerInitialized');
                },
                play: function (event) {
                    $rootScope.isPlaying = true;
                    $rootScope.$broadcast('audioPlayerPlayed', event);
                    $scope.$apply();
                },
                pause: function (event) {
                    $rootScope.isPlaying = false;
                    $rootScope.$broadcast('audioPlayerPaused', event);
                    $scope.$apply();
                },
                ended: function(event) {
                    // play next song
                    $scope.loadNextTrack();
                },
                timeupdate: function(event) {
                    $rootScope.$broadcast('audioPlayerTimeUpdate', event);
                },
                swfPath: 'js',
                cssSelectorAncestor: '.playerControlsBox',
                supplied: 'mp3',
                wmode: 'window'
            });

            $rootScope.$on('trackLoad', function(event, track) {
                // assign the loaded track as the 'current'
                $rootScope.currentTrack = track;

                // play media in player
                player.jPlayer("setMedia", {
                    mp3: track.url
                });

                // broadcast loaded event
                $rootScope.$broadcast('trackLoaded', track);

                // auto play
                $rootScope.$broadcast('trackPlay', track);
            });

            // play/resume player
            $rootScope.$on('trackPlay', function(event, time) {
                player.jPlayer('play', time);
            });

            // pause player
            $rootScope.$on('trackPause', function(event, time) {
                player.jPlayer('pause', time);
            });
        }
    };
});


tug.directive('tugBackgroundImage', function ($rootScope) {
    return {
        restrict: 'C',
        link: function ($scope, element, attr) {
            var defaultImage = "/images/tugtug_bg.jpg";
            var bgElem = element.find("#backgroundImage");
            // on track load
            $rootScope.$on('trackLoaded', function(event, track) {
                var bgImage = defaultImage;
                if (track.image) {
                    bgImage = track.image;
                }
                bgElem.css({
                    'background-image': 'url(\'' + bgImage + '\')'
                });
            });
        }
    };
});


tug.directive('tugCurrentSongArtist', function ($rootScope) {
    return {
        restrict: 'C',
        link: function ($scope, element, attr) {
            // on track load
            $rootScope.$on('trackLoaded', function(event, track) {
                element.animate({
                    "margin-top": -1 * (element.height() * 4)
                }, {
                    duration: 0,
                    complete: function () {
                        element.animate({
                            "margin-top": 0
                        })
                    }
                })
            });
        }
    };
});


tug.directive('tugPlayerControlsBox', function ($rootScope) {
    return {
        restrict: 'C',
        link: function ($scope, element, attr) {
            var volumeSlider = element.find(".volumeSlider");
            var seekSlider = element.find(".seekSlider");
            var maxVolume = element.find(".volumeMax");
            // slider event handler
            var onChange = function(event, ui) {
                var value = ui.value / 100;
                $rootScope.player.jPlayer("volume", value);
                var position = 3;
                if (ui.value < 25) {
                    position = 0;
                } else if (ui.value < 50) {
                    position = 1;
                } else if (ui.value < 75) {
                    position = 2;
                }
                maxVolume.css({
                    'background-position': position * -16 + 'px 0px'
                });
            };
            volumeSlider.slider({
                value: 100,
                slide: onChange,
                change: onChange
            });
            // set max volume
            maxVolume.on("click", function () {
               volumeSlider.slider("value", 100).trigger('slide');
            });


            var playerData = $rootScope.player.data("jPlayer");
            seekSlider.slider({
                max: 100,
                range: "min",
                step: 0.1,
                value : 0,
                slide: function(event, ui) {
                    var sp = playerData.status.seekPercent;
                    if (sp > 0) {
                        // Move the play-head to the value and
                        // factor in the seek percent.
                        $rootScope.player.jPlayer("playHead",
                                                   ui.value * (100 / sp));
                    } else {
                        // Create a timeout to reset this slider to zero.
                        setTimeout(function() {
                            seekSlider.slider("value", 0);
                        }, 0);
                    }
                }
            });

            var win = $(window);
            var seekBarMargin = 24;
            var resizeSlider = function () {
                seekSlider.css('width', win.width() - seekBarMargin);
            };
            win.on('resize', resizeSlider);
            resizeSlider();

            $rootScope.$on('audioPlayerTimeUpdate', function(event, status) {
                var value = status.jPlayer.status.currentPercentAbsolute;
                seekSlider.slider("value", value);
            });
        }
    };
});
