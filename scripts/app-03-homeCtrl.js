angular.module('IC').controller('Home', ['$scope', '$firebaseObject', '$firebaseArray', 'Auth', '$timeout', '$location', function ($scope, $firebaseObject, $firebaseArray, Auth, $timeout, $location) {
  var root = new Firebase("https://interactiveclassroom.firebaseio.com");

  $scope.userData = {};
  $scope.btngrpclass = "";
  $scope.invitecode = "";
  $scope.labeltext = "";

  //Init auth
  var initAuth = Auth.$getAuth();
  if (initAuth != null) {
    $scope.userData = $firebaseObject(root.child("Users").child(initAuth.uid));
  }

  $scope.login = function(addnew) {
    Auth.$authWithOAuthPopup('google', {scope: "email"}).then(function(authData) {
      $scope.userData = $firebaseObject(root.child("Users").child(authData.uid));
      $scope.userData.uid = authData.uid;
      $scope.userData.email = authData.google.email;
      $scope.userData.name = authData.google.displayName;
      $scope.userData.profileImageURL = authData.google.profileImageURL;
      $scope.$broadcast('userLogin', true, $scope.userData, addnew);
      $scope.userData.$save();
    }).catch(function(error) {
      if (error.code === 'TRANSPORT_UNAVAILABLE') {
        Auth.$authWithOAuthRedirect(authMethod).then(function(authData) {

        });
      } else {
        $scope.$broadcast('userLogin', false, $scope.userData, addnew);
        console.log(error);
      }
    });
  };

  $scope.cancel = function (){
    $scope.btngrpclass = "";
    $scope.invitecode = "";
  };

  $scope.$on('userLogin', function (event, success, userData, addnew) {
    if (success) {
      console.log(success);
      console.log(userData);
      console.log(addnew);
      $scope.btngrpclass = "homebtngrp--loggedin";
      $scope.invitecode = "Welcome " + userData.name.split(" ")[0] + "!";
      $timeout(function () {
        $scope.invitecode = "";
        $scope.labeltext = $scope.labelText(addnew);
        $scope.btngrpclass = "homebtngrp--invitecode";
        setTimeout(function() {
          $('.homebtngrp-left-input').focus();
        }, 500);
        }, 2000);
    } else {
      $scope.cancel();
    }
  });

  $scope.classroom = function (addnew) {
    if (Auth.$getAuth() == null) {
        $scope.btngrpclass = "homebtngrp--login";
        $scope.login(addnew);
    } else {
      $scope.labeltext = $scope.labelText(addnew);
      $scope.btngrpclass = "homebtngrp--invitecode";
      setTimeout(function() {
        $('.homebtngrp-left-input').focus();
      }, 500);
    }
  };

  $scope.labelText = function (addnew) {
    if (addnew) {
      return "Name your new class.";
    } else {
      return "Please enter your invite code.";
    }
  };

  $scope.secondary = function () {
    switch($scope.btngrpclass) {
    case "homebtngrp--login":
        // Retry login - then go to class or ask to create
        $scope.login();
        break;
    case "homebtngrp--loggedin":
        // Nothing
        break;
    case "homebtngrp--invitecode":
        // Open Class
        $scope.joinClass();
        break;
    default:
        // Create class
        $scope.classroom(true);
    }
  };

  $scope.joinClass = function () {
    if ($scope.invitecode != "" && $scope.invitecode.length > 3) {
      var joiner = $firebaseObject(root.child("Joiners").child($scope.invitecode));
      joiner.$loaded(function () {
        console.log(joiner);
        if (joiner != null && joiner != undefined) {
          // Check if user partakes in class - if not add it
          var user = $firebaseArray(root.child("Users").child($scope.userData.uid).child("Partakes"));
          console.log(user);
          user.$loaded(function () {
            if (user.Partakes != undefined) {
              var found = false;
              angular.forEach(user.Partakes, function (partake) {
                if (partake == joiner.Class) {
                  found = true;
                }
              });
              if (!found) {
                user.$add(joiner.Class);
              }
            }
          });
          console.log(joiner);
          $location.path('/class:' + joiner.Class);
          console.log(joiner.Class);
        }
      });
    }
  };

}]);
