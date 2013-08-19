
angular.module('feed', ['firebase']).
    value('fbURL', 'https://near.firebaseio.com/').
    factory('Feeds',function (angularFireCollection, fbURL) {
        return angularFireCollection(fbURL);
    }).
    config(function ($routeProvider) {
        $routeProvider.
            when('/', {
                controller: Feed.List,
                templateUrl: 'templates/feed/home.html'
            }).
            otherwise({
                redirectTo: '/'
            });
    });

var Feed = {

    List: function($scope, $location, $timeout, Feeds) {

        $scope.save = function () {

            navigator.geolocation.getCurrentPosition(function (position) {
                $scope.feed.latitude = position.coords.latitude;
                $scope.feed.longitude = position.coords.longitude;

                $scope.feed.updatedAt = new Date().getTime();
                $scope.feed.createdAt = new Date().getTime();

                Feeds.add($scope.feed, function () {
                    $timeout(function () {
                        $location.path('/');
                    });
                });
            });

        };

        $scope.feeds = Feeds;
    },
};


function EditCtrl($scope, $location, $routeParams, angularFire, fbURL) {
    angularFire(fbURL + $routeParams.feedId, $scope, 'remote', {}).
        then(function () {
            $scope.feed = angular.copy($scope.remote);
            $scope.feed.$id = $routeParams.feedId;
            $scope.isClean = function () {
                return angular.equals($scope.remote, $scope.feed);
            };
            $scope.destroy = function () {
                $scope.remote = null;
                $location.path('/');
            };
            $scope.save = function () {
                $scope.remote = angular.copy($scope.feed);
                $location.path('/');
            };
        });
}
