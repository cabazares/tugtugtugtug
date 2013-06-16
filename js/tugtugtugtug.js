// setup angular app
var tug = angular.module('tugtugtugtug', []).run(function($rootScope) {
    // setup default values
    $rootScope.currentTrack = null;
    $rootScope.isPlaying = false;
    $rootScope.tracks = [{
        "artist": "TSP",
        "title": "Cro Magnon Man",
        "url": "http://www.jplayer.org/audio/mp3/TSP-01-Cro_magnon_man.mp3",
        "image": "http://farm6.staticflickr.com/5018/5550180903_fede07b58d_b.jpg"
    }, {
        "artist": "Miaow",
        "title": "The Separation",
        "url": "http://www.jplayer.org/audio/mp3/Miaow-05-The-separation.mp3",
        "image": "http://userserve-ak.last.fm/serve/_/53168061/Miaow+joeandcath.jpg"
    }, {
        "artist": "Miaow",
        "title": "Lismore",
        "url": "http://www.jplayer.org/audio/mp3/Miaow-04-Lismore.mp3",
        "image": "http://www.messandnoise.com/images/3014425/404x275-c.jpeg"
    }, {
        "artist": "Miaow",
        "title": "Thin Ice",
        "url": "http://www.jplayer.org/audio/mp3/Miaow-10-Thin-ice.mp3",
        "image": "http://www.cloudberry-design.com/blog/cats.jpg"
    }];
});

tug.config([
    '$routeProvider',
    '$locationProvider',
    function($routeProvider, $locationProvider) {
        // setup routes
        $routeProvider.when('/', {
            controller: 'MainCtrl'
        });

        // set configurations
        $locationProvider.html5Mode(true);
    }
]);

// controllers
tug.controller('MainCtrl', function($rootScope, $scope) {

    $scope.test = "testers";

    // start playing on audio player load
    $rootScope.$on('audioPlayerInitialized', function(event) {
        $rootScope.$broadcast('trackLoad', $rootScope.tracks[0]);
    });

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
        if (index > 0) {
            var track = $rootScope.tracks[--index];
            $rootScope.$broadcast('trackLoad', track);
        }
    };

    // load next track
    $scope.loadNextTrack = function () {
        var tracks = $rootScope.tracks;
        var index = tracks.indexOf($rootScope.currentTrack);
        if (index < tracks.length - 1) {
            var track = $rootScope.tracks[++index];
            $rootScope.$broadcast('trackLoad', track);
        }
    };

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
            var bgElem = element.find("#backgroundImage");
            // on track load
            $rootScope.$on('trackLoaded', function(event, track) {
                bgElem.css({
                    'background-image': 'url(\'' + track.image + '\')'
                })
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
        }
    };
});
