// setup angular app
var tug = angular.module('tugtugtugtug', []).run(function($rootScope) {
    // setup default values
    $rootScope.currentTrack = null;
    $rootScope.isPlaying = false;
    $rootScope.tracks = [{
        "artist": "TSP",
        "title": "Cro Magnon Man",
        "url": "http://www.jplayer.org/audio/mp3/TSP-01-Cro_magnon_man.mp3"
    },{
        "artist": "Miaow",
        "title": "The Separation",
        "url": "http://www.jplayer.org/audio/mp3/Miaow-05-The-separation.mp3"
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
                    // TODO: play next song
                },
                swfPath: "js",
                cssSelectorAncestor: ".playerControlsBox",
                supplied: "mp3",
                wmode: "window"
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
                player.jPlayer("play", time);
            });

            // pause player
            $rootScope.$on('trackPause', function(event, time) {
                player.jPlayer("pause", time);
            });
        }
    };
});
