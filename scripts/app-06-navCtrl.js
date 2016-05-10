angular.module('IC').controller('Nav', ['$scope', '$firebaseObject', '$firebaseArray', 'Auth', '$timeout', '$location', '$rootScope', function ($scope, $firebaseObject, $firebaseArray, Auth, $timeout, $location, $rootScope) {
  $scope.nav = false;

  $scope.userData = {};

  //Init auth
  var initAuth = Auth.$getAuth();

  $scope.$onAuth(function () {
    $scope.userData = $firebaseObject(root.child("Users").child(initAuth.uid));
    $rootScope.$broadcast('authed', true);
  });

  $scope.$on('authUID', function(){
    if ($scope.userData.uid != undefined)
      return $scope.userData.uid;
    return "";
  });


  var root = new Firebase("https://interactiveclassroom.firebaseio.com");

  $scope.navitems = new Array();
  $scope.items = [];

  $scope.buildNav = function () {
    Auth.$requireAuth().then(function (userData) {
      var user = $firebaseObject(root.child("Users").child(userData.uid));
      user.$loaded(function () {
          console.log(user);
          if (user.Partakes != undefined) {
            angular.forEach(user.Partakes, function (partake, key) {
              var className = $firebaseObject(root.child("Classes").child(key).child("Pub").child("Name"));
              className.$loaded(function () {
                $scope.navitems.push({
                  "name" : "S - " + className.$value,
                  "link" : "class:" + key
                });
              });
            });
          }
          if (user.Teaches != undefined) {
            angular.forEach(user.Teaches, function (teach, key) {
              var className = $firebaseObject(root.child("Classes").child(key).child("Pub").child("Name"));
              className.$loaded(function () {
                $scope.navitems.push({
                  "name" : "T - " + className.$value,
                  "link" : "dashboard:" + key
                });
              });
            });
          }
          console.log($scope.navitems);
      });
    });
  };

  $scope.buildNav();

  $scope.toggle = function () {
    if (!$scope.nav) {
      $scope.items = $scope.navitems;
    } else {
      $scope.items = [];
    }
    $scope.nav = !$scope.nav;
  };

}]);
