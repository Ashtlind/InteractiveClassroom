angular.module('IC').controller('Nav', ['$scope', '$firebaseObject', '$firebaseArray', 'Auth', '$timeout', '$location', '$rootScope', function ($scope, $firebaseObject, $firebaseArray, Auth, $timeout, $location, $rootScope) {
  var root = new Firebase("https://interactiveclassroom.firebaseio.com");

  // ***
  // User Authentication
  $scope.userData = {};

  Auth.$onAuth(function (authData) {
    $scope.userData = $firebaseObject(root.child("Users").child(authData.uid));
    $scope.userData.$loaded(function () {
      $scope.userData.uid = authData.uid;
      $scope.userData.email = authData.google.email;
      $scope.userData.name = authData.google.displayName;
      $scope.userData.profileImageURL = authData.google.profileImageURL;
      $scope.userData.LastLogin = Date();
      userData.$save().then(function () {
        // Tell the home controller what's up
        $rootScope.$broadcast('userGuidHome', $scope.userData);
      });
    });
  });

  // Controllers will ask for the authed user's guid - Send it back!
  $scope.$on('userGuidReq', function (event, sender) {
    $rootScope.$broadcast('userGuid' + sender, $scope.userData);
  });

  $scope.$on('login', function () {
    Auth.$authWithOAuthPopup('google', {scope: "email"}).then(function(authData) {
      // Handled in $onAuth event
    }).catch(function(error) {
      if (error.code === 'TRANSPORT_UNAVAILABLE') {
        Auth.$authWithOAuthRedirect(authMethod).then(function(authData) {
          // Handled in $onAuth event
        });
      } else {
        $rootScope.$broadcast('authed', false, $scope.userData);
      }
    });
  });

  // Start the first authentication request if none have been made - In case the user has already logged in
  if ($scope.userData == {})
    Auth.$getAuth();

  // End User Authentication
  // ***

  $scope.nav = false;

  $scope.navitems = new Array();
  $scope.items = [];

  $scope.$watch('userData.Partakes', function (newVal, oldVal) {
    if (newVal != undefined && newVal != null) {
      angular.forEach(newVal, function (partake, key) {
        var className = $firebaseObject(root.child("Classes").child(key).child("Pub").child("Name"));
        className.$loaded(function () {
          $scope.navitems.push({
            "name" : "S - " + className.$value,
            "link" : "class:" + key
          });
        });
      });
    }
  });

  $scope.$watch('userData.Teaches', function (newVal, oldVal) {
    if (newVal != undefined && newVal != null) {
      angular.forEach(newVal, function (teach, key) {
        var className = $firebaseObject(root.child("Classes").child(key).child("Pub").child("Name"));
        className.$loaded(function () {
          $scope.navitems.push({
            "name" : "T - " + className.$value,
            "link" : "dashboard:" + key
          });
        });
      });
    }
  });

  $scope.toggle = function () {
    if (!$scope.nav) {
      $scope.items = $scope.navitems;
    } else {
      $scope.items = [];
    }
    $scope.nav = !$scope.nav;
  };

}]);
