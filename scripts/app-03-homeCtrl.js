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
        // Open Class or Create class
        $scope.joinClass();
        break;
    default:
        $scope.classroom(true);
    }
  };

  $scope.createClass = function () {
    var classes = $firebaseArray(root.child("Classes"));
    classes.$add({
      "Pub" : {
        "CurrentLesson" : null,
        "CurrentTopic" : null,
        "Name" : $scope.invitecode,
        "Teacher" : $scope.userData.uid
      },
      "Lessons" : null
    }).then(function (newRef) {
      var user = $firebaseObject(root.child("Users").child($scope.userData.uid).child("Teaches").child(newRef.key()));
      user.$loaded(function () {
          if (user.$value == null) {
            user.$value = Date();
            user.$save();
          }
          $location.path('/dashboard:' + newRef.key());
      });
    });
  };

  $scope.joinClass = function () {
    if ($scope.invitecode != "" && $scope.invitecode.length > 3) {
      var joiner = $firebaseObject(root.child("Joiners").child($scope.invitecode));
      joiner.$loaded(function () {
        if (joiner != null && joiner != undefined) {
          // Check if user partakes or teaches class - if not add it
          var user = $firebaseObject(root.child("Users").child($scope.userData.uid));
          user.$loaded(function () {
              if (user.Partakes == undefined)
                user.Partakes = {};
              if (user.Partakes[joiner.Class] == undefined) {
                user.Partakes[joiner.Class] = Date();
                user.$save();
              }
              if (user.Teaches != undefined && user.Teaches[joiner.Class] != undefined) {
                $location.path('/dashboard:' + joiner.Class);
              } else {
                $location.path('/class:' + joiner.Class);
              }
          });
        }
      });
    }
  };

}]);
