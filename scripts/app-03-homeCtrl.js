angular.module('IC').controller('Home', ['$scope', '$firebaseObject', '$firebaseArray', 'Auth', '$timeout', function ($scope, $firebaseObject, $firebaseArray, Auth, $timeout) {
  var root = new Firebase("https://interactiveclassroom.firebaseio.com");

  $scope.userData = {};
  $scope.btngrpclass = "";
  $scope.invitecode = "";

  $scope.login = function() {
    Auth.$authWithOAuthPopup('google', {scope: "email"}).then(function(authData) {
      $scope.userData = $firebaseObject(root.child("Users").child(authData.uid));
      $scope.userData.uid = authData.uid;
      $scope.userData.email = authData.google.email;
      $scope.userData.name = authData.google.displayName;
      $scope.userData.profileImageURL = authData.google.profileImageURL;
      $scope.userData.$save();
    }).catch(function(error) {
      if (error.code === 'TRANSPORT_UNAVAILABLE') {
        Auth.$authWithOAuthPopup(authMethod).then(function(authData) {

        });
      } else {
        console.log(error);
      }
    });
  };

  $scope.joinClassroom = function () {
    if (Auth.$getAuth() == null) {
        $scope.btngrpclass = "homebtngrp--login";
        $scope.login();
        Auth.$onAuth(function(authData) {
          $scope.btngrpclass = "homebtngrp--loggedin";
          $scope.invitecode = "Welcome " + authData.google.displayName.split(" ")[0] + "!";
          $timeout(function () {
            $scope.invitecode = "";
            $scope.btngrpclass = "homebtngrp--invitecode";
            setTimeout(function() { $('.homebtngrp-left-input').focus(); }, 500);
          }, 2000);
        });
    } else {
      console.log(Auth.$getAuth());
      $scope.btngrpclass = "homebtngrp--invitecode";
      setTimeout(function() { $('.homebtngrp-left-input').focus(); }, 500);
    }
  };
}]);
