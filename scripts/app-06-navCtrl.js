angular.module('IC').controller('Nav', ['$scope', '$firebaseObject', '$firebaseArray', 'Auth', '$timeout', '$location', '$rootScope', 'fbRef', function ($scope, $firebaseObject, $firebaseArray, Auth, $timeout, $location, $rootScope, fbRef) {
  var root = fbRef;

  // ***
  // User Authentication
  $rootScope.userData = {};

  //Auth._auth.addScope('email');
  console.log(Auth);
  Auth.$onAuthStateChanged(function (authData) {
    if (authData != null) {
      console.log("HEREVV");
      console.log(authData);
      console.log(authData.providerData[0]);
      console.log("HERE^^");
      $rootScope.userData = $firebaseObject(root.child("Users").child(authData.uid));
        $rootScope.userData.$loaded(function () {
          $rootScope.userData.uid = authData.uid;
          $rootScope.userData.email = authData.providerData[0].email;
          $rootScope.userData.name = authData.providerData[0].displayName;
          $rootScope.userData.profileImageURL = authData.providerData[0].photoURL;
          $rootScope.userData.LastLogin = Date();
          $rootScope.userData.$save().then(function () {
            // Tell the Controllers what's up
            $rootScope.$broadcast('userGuid', $rootScope.userData.uid);
          });
        });
      } else {
        $rootScope.userData = {};
        $rootScope.$broadcast('userGuid', undefined);
      }
  });

  // Controllers will ask for the authed user's guid - Send it back!
  $scope.$on('userGuidReq', function (event) {
      $rootScope.$broadcast('userGuid', $rootScope.userData.uid);
  });

  $scope.$watch('userData.uid', function (n, o) {
    // Start the first authentication request if none have been made - In case the user has already logged in
    if (n == undefined)
      Auth.$getAuth();
    console.log("watchauth: " + n);
  });

  $scope.$on('login', function () {
    // Add the firebase provided manually
    // That way we can add profile scopes for required information
    // https://developers.google.com/identity/protocols/googlescopes#google_sign-in
    var provider = new firebase.auth.GoogleAuthProvider();
    provider.addScope('email');
    provider.addScope('profile');
    Auth.$signInWithPopup(provider).then(function(authData) {
      // Handled in $onAuth event
    }).catch(function(error) {
      if (error.code === 'TRANSPORT_UNAVAILABLE') {
        Auth.$signInWithRedirect(provider).then(function(authData) {
          // Handled in $onAuth event
        });
      } else {
        $rootScope.$broadcast('userGuidHome', null);
      }
    });
  });

  $scope.$on('logout', function () {
    Auth.$signOut();
    $location.path('/');
  });
  // End User Authentication
  // ***

  $scope.nav = false;

  $scope.showNav = function () {
      if ($rootScope.userData.uid == undefined)
        return false;
      return true;
  }

  // Default nav items
  $scope.navitemsdef = new Array(
    {
      "icon" : "replay",
      "link" : "#/",
      "fb" : {
        "Name" : "Home"
      }
    },
    {
      "icon" : "highlight_off",
      "link" : "#/:logout",
      "fb" : {
        "Name" : "Log off"
      }
    }
  );
  // Complete list for the nav
  $scope.navitems = new Array();
  // Lists of classes that the user partakes in / teaches
  $scope.navitemspartakes = new Array();
  $scope.navitemsteaches = new Array();

  // update the complete list
  $scope.itemsUpdate = function () {
    var arrayOfArrays = [$scope.navitemspartakes, $scope.navitemsteaches, $scope.navitemsdef];
    $scope.navitems = [];
    angular.forEach(arrayOfArrays, function (array) {
      angular.forEach(array, function (item){
        $scope.navitems.push(item);
      });
    });
    if ($scope.nav) {
      $scope.items = $scope.navitems;
    }
  };

  $scope.$watch('userData.Partakes', function (newVal, oldVal) {
    $scope.navitemspartakes = new Array();
    if (newVal != undefined && newVal != null) {
      angular.forEach(newVal, function (partake, key) {
        var theClass = $firebaseObject(root.child("Classes").child(key).child("Pub"));
        theClass.$loaded(function () {
          var active = false;
          if (theClass.CurrentLesson != "") {
            active = true;
          }
          $scope.navitemspartakes.push({
            "icon" : "face",
            "link" : "#/class:" + key,
            "active" : active,
            "fb" : theClass
          });
          $scope.itemsUpdate();
        });
      });
    } else {
      $scope.itemsUpdate();
    }
  });

  $scope.$watch('userData.Teaches', function (newVal, oldVal) {
    $scope.navitemsteaches = new Array();
    if (newVal != undefined && newVal != null) {
      angular.forEach(newVal, function (teach, key) {
        var theClass = $firebaseObject(root.child("Classes").child(key).child("Pub"));
        theClass.$loaded(function () {
          var active = false;
          if (theClass.CurrentLesson != "") {
            active = true;
          }
          $scope.navitemsteaches.push({
            "icon" : "stars",
            "link" : "#/dashboard:" + key,
            "active" : active,
            "fb" : theClass
          });
          $scope.itemsUpdate();
        });
      });
    } else {
      $scope.itemsUpdate();
    }
  });

  // Toggle the nav
  $scope.toggle = function () {
    $scope.items = new Array();
    if (!$scope.nav) {
      $scope.items = $scope.navitems;
    }
    $scope.nav = !$scope.nav;
  };

}]);
