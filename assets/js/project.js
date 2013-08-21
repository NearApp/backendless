
// Start our app with firebase in mind
angular.module('near.feed', ['firebase']).
    value('fbURL', 'https://near.firebaseio.com/feeds').
    factory('Feeds',function (angularFireCollection, fbURL) {
        return angularFireCollection(fbURL);
    });

angular.module('near.auth', ['firebase']).
    factory('firebaseAuth', function ($rootScope) {
        var auth = {},
            FBRef = new Firebase('https://near.firebaseio.com/');

        auth.broadcastAuthEvent = function () {
            $rootScope.$broadcast('authEvent');
        };

        auth.client = new FirebaseSimpleLogin(FBRef, function (error, user) {
            if (error) {
            } else if (user) {
                auth.user = user;
                auth.broadcastAuthEvent();
            } else {
                auth.user = null;
                auth.broadcastAuthEvent();
            }
        });

        auth.login = function () {
            this.client.login('facebook');
        };

        auth.logout = function () {
            this.client.logout();
        };

        return auth;
    });


angular.module('near.service', []);

angular.module('near.directive', []);

angular.module('near.filter', []);

var nearModule = angular.module('near', ['near.feed']);
nearModule.config(function ($routeProvider) {
    $routeProvider.
        when('/', {
            controller: Feed.List,
            templateUrl: 'templates/feed/home.html'
        }).
        when('/feed/map', {
            controller: Feed.MapList,
            templateUrl: 'templates/feed/map.html'
        }).
        when('/login', {
            controller: AuthCtrl.Login
        });
});

var AuthCtrl = function($scope, firebaseAuth) {
    $scope.login = function() {
        firebaseAuth.login();
    };

    $scope.logout = function() {
        firebaseAuth.logout();
    };

    $scope.isLoggedIn = function() {
        return !!$scope.user;
    };

// src: Alex Vanston (https://coderwall.com/p/ngisma)
    $scope.safeApply = function(fn) {
        var phase = this.$root.$$phase;
        if (phase == '$apply' || phase == '$digest') {
            if(fn && (typeof(fn) === 'function')) {
                fn();
            }
        } else {
            this.$apply(fn);
        }
    };

    $scope.$on('authEvent', function() {
        $scope.safeApply(function() {
            $scope.user = firebaseAuth.user;
        });
    });
};

/*

var feedModule = angular.module('feed', ['firebase']).value('fbURL', 'https://near.firebaseio.com/feeds');

// Setup the factory and the connection to Firebase
feedModule.factory('Feeds',function (angularFireCollection, fbURL) {
    return angularFireCollection(fbURL);
});

// Setup the routes and config
feedModule.config(function ($routeProvider) {
    $routeProvider.
        when('/', {
            controller: Feed.List,
            templateUrl: 'templates/feed/home.html'
        });
});


var chatModule = angular.module('chat', ['firebase']).value('fbURL', 'https://near.firebaseio.com/feeds');

// Setup the factory and the connection to Firebase
chatModule.factory('Messages',function (angularFireCollection, fbURL) {
    return angularFireCollection(fbURL);
});

// Setup the routes and config
chatModule.config(function ($routeProvider) {
    $routeProvider.
        when('/messages', {
            controller: Message.List,
            templateUrl: 'templates/message/list.html'
        });
});


var authModule = angular.module('auth', ['firebase']);

authModule.factory('firebaseAuth', function($rootScope) {
    var auth = {},
        FBRef = new Firebase('https://near.firebaseio.com/');

    auth.broadcastAuthEvent = function() {
        $rootScope.$broadcast('authEvent');
    };

    auth.client = new FirebaseAuthClient(FBref, function(error, user) {
        if (error) {
        } else if (user) {
            auth.user = user;
            auth.broadcastAuthEvent();
        } else {
            auth.user = null;
            auth.broadcastAuthEvent();
        }
    });

    auth.login = function() {
        this.client.login('facebook');
    };
    auth.login();

    auth.logout = function() {
        this.client.logout();
    };

    return auth;
});

authModule.config(function ($routeProvider) {
    $routeProvider.
        when('/login', {
            controller: Auth.Login
        });
});




    */
var Auth = {

    Login: function($scope, $location, $timeout, firebaseAuth) {

        console.log("Attempting Login");

        firebaseAuth.login();

    }

};

var Feed = {

    Populate: function(feedObject) {
        console.log(feedObject);

    },

    MapList: function($scope, $location, $timeout, Feeds) {
        $scope.feeds = Feeds;

        $('#content').css({height: window.innerHeight});

        navigator.geolocation.getCurrentPosition(function (position) {

            var mapOptions = {
                center: new google.maps.LatLng(position.coords.latitude, position.coords.longitude),
                zoom: 10,
                mapTypeId: google.maps.MapTypeId.ROADMAP
            };
            var map = new google.maps.Map(document.getElementById("fullMap"),
                mapOptions);

            var markers = [];
            for(var i = 0; i < $scope.feeds.length; i++) {
                var feed = $scope.feeds[i];

                var mark = new google.maps.Marker({
                    map: map,
                    draggable: false,
                    position:  new google.maps.LatLng(feed.latitude, feed.longitude),
                });
            }

        });

    },

    List: function($scope, $location, $timeout, Feeds) {
        $scope.feeds = Feeds;

        $scope.save = function () {

            navigator.geolocation.getCurrentPosition(function (position) {
                $scope.feed.fid = Math.round(Math.random() * (10000000000000 - 1)) + 1;

                $scope.feed.latitude = position.coords.latitude;
                $scope.feed.longitude = position.coords.longitude;

                $scope.feed.updatedAt = new Date().getTime();
                $scope.feed.createdAt = new Date().getTime();

                Feeds.add($scope.feed, function () {
                    $timeout(function () {
                        $location.path('/');
                    });

                    $('#newCheckin').slideUp();
                });
            });

        };

        $scope.map = function(feed) {
            console.log("Doing map stuff with :: ", feed);

            var mapOptions = {
                center: new google.maps.LatLng(feed.latitude, feed.longitude),
                zoom: 15,
                mapTypeId: google.maps.MapTypeId.ROADMAP
            };
            var map = new google.maps.Map(document.getElementsByClassName("map-"+feed.fid)[0],
                mapOptions);

            var marker = new google.maps.Marker({
                map: map,
                draggable: false,
                position: mapOptions.center
            });
        };

    }
};

var Message = {

    List: function($scope, $location, $timeout, Messages) {

    }

};
