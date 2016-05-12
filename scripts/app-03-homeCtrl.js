angular.module('IC').controller('Home', ['$scope', '$firebaseObject', '$firebaseArray', '$timeout', '$location', '$rootScope', '$routeParams', 'cfpLoadingBar', function ($scope, $firebaseObject, $firebaseArray, $timeout, $location, $rootScope, $routeParams, cfpLoadingBar) {
  var root = new Firebase("https://interactiveclassroom.firebaseio.com");

  // Route action - if any
  if ($routeParams.action != undefined){
    var action = $routeParams.action.substring(1);
    switch(action) {
    case "logout":
        $rootScope.$broadcast('logout');
        break;
    }
  }

  $scope.btngrpclass = "";
  $scope.invitecode = "";
  $scope.labeltext = "";
  $scope.addingClass = false;
  $scope.joinBtn = false;

  // Revert defaults - mainly for the main call to action buttons
  $scope.cancel = function () {
    $scope.btngrpclass = "";
    $scope.invitecode = "";
    $scope.addingClass = false;
    $scope.joinBtn = false;
  };

  // Get the user's guid initially and subscribe to changes
  // More complex due to allowing anonymous users only on the home page
  $scope.userData = {};
  cfpLoadingBar.start();
  $scope.$on('userGuid', function (event, guid) {
    console.log(guid);
    if (guid == undefined || guid == null){
      $scope.userData = {};
      $scope.cancel();
    } else {
      // That means we are authenticated
      $scope.userData = $firebaseObject(root.child("Users").child(guid));
      $scope.userData.$loaded(function () {
        if ($scope.joinBtn) {
          // If we had pressed a call to action and now authenticated - continue
          $scope.btngrpclass = "homebtngrp--loggedin";
          $scope.invitecode = "Welcome " + $scope.userData.name.split(" ")[0] + "!";
          $timeout(function () {
            $scope.invitecode = "";
            $scope.labeltext = $scope.labelText();
            $scope.btngrpclass = "homebtngrp--invitecode";
              setTimeout(function() {
                $('.homebtngrp-left-input').focus();
              }, 500);
            }, 2000);
          } else {
            $scope.cancel();
          }
          cfpLoadingBar.complete();
      });
    }
  });
  $rootScope.$broadcast('userGuidReq');

  // Start the ball rolling from the main "Join a classrroom" call to action
  $scope.classroom = function (addnew) {
      $scope.addingClass = addnew;
    if ($scope.userData.uid == undefined) {
        // We need to authenticate the user
        $scope.btngrpclass = "homebtngrp--login";
        $scope.joinBtn = true;
        $rootScope.$broadcast('login');
    } else {
      // We have a firebase guid - we are authenticated
      $scope.labeltext = $scope.labelText();
      $scope.btngrpclass = "homebtngrp--invitecode";
      setTimeout(function() {
        $('.homebtngrp-left-input').focus();
      }, 500);
    }
  };

  // Textinput helper text for primary call to action
  $scope.labelText = function () {
    if ($scope.addingClass) {
      return "Name your new class.";
    } else {
      return "Please enter your invite code.";
    }
  };

  $scope.secondary = function () {
    switch($scope.btngrpclass) {
    case "homebtngrp--login":
        // Retry login - then go to class or ask to create
        $rootScope.$broadcast('login');
        break;
    case "homebtngrp--loggedin":
        // Nothing
        break;
    case "homebtngrp--invitecode":
        // Open Class or Create class
        if ($scope.addingClass)
          $scope.createClass();
        else
          $scope.joinClass();
        break;
    default:
        $scope.classroom(true);
    }
  };

  // Create from invite text field
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
      if ($scope.userData.Teaches[newRef.key()] == undefined && $scope.userData.Teaches[newRef.key()] != null) {
        $scope.userData.Teaches[newRef.key()] = Date();
        $scope.userData.$save();
      }
      $location.path('/dashboard:' + newRef.key());
    });
  };
  // Join from invite text field
  $scope.joinClass = function () {
    if ($scope.invitecode != "" && $scope.invitecode.length > 3) {
      var joiner = $firebaseObject(root.child("Joiners").child($scope.invitecode));
      joiner.$loaded(function () {
        if (joiner != null && joiner != undefined) {
          // Check if user partakes or teaches class - if not add it
          if ($scope.userData.Partakes == undefined)
            $scope.userData.Partakes = {};
          if ($scope.userData.Partakes[joiner.Class] == undefined) {
            $scope.userData.Partakes[joiner.Class] = Date();
            $scope.userData.$save();
          }
          if ($scope.userData.Teaches != undefined && $scope.userData.Teaches[joiner.Class] != undefined) {
            $location.path('/dashboard:' + joiner.Class);
          } else {
            $location.path('/class:' + joiner.Class);
          }
        }
      });
    }
  };

}]);
