angular.module('IC').controller('Home', ['$scope', '$firebaseObject', '$firebaseArray', '$timeout', '$location', '$rootScope', '$routeParams', 'cfpLoadingBar', 'fbRef', function ($scope, $firebaseObject, $firebaseArray, $timeout, $location, $rootScope, $routeParams, cfpLoadingBar, fbRef) {
  var root = fbRef;

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
    if (guid == undefined || guid == null){
      $scope.userData = {};
      $scope.cancel();
      cfpLoadingBar.complete();
    } else {
      // That means we are authenticated
      $scope.userData = $firebaseObject(root.child("Users").child(guid).child("User"));
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
    // Add the class guid to teaches under the user
    var userTeaches = $firebaseArray(root.child("Users").child($scope.userData.uid).child("Classes").child("Teaches"));
    var newAdd = userTeaches.$add({
      "Date": ""
    }).then(function(ref) {
      var classGUID = ref.path.o[ref.path.o.length-1];
      // Add the class and set the teacher
      var theClass = $firebaseObject(root.child("Classes").child(classGUID));
      theClass.Pub = {
          "CurrentLesson" : null,
          "CurrentTopic" : null,
          "Name" : $scope.invitecode,
          "Teacher" : $scope.userData.uid
        };
      theClass.$save().then(function (newRef) {
        // Update the date on the users/classes/teaches to update the nav listener
        var teachesClassIndex = userTeaches.$indexFor(classGUID);
        userTeaches[teachesClassIndex].Date = Date.now();
        userTeaches.$save(teachesClassIndex);
        $location.path('/dashboard:' + classGUID);
      });
    });
  };
  // Join from invite text field
  $scope.joinClass = function () {
    if ($scope.invitecode != "" && $scope.invitecode.length > 3) {
      var joiner = $firebaseObject(root.child("Joiners").child($scope.invitecode));
      joiner.$loaded(function () {
        if (joiner != null && joiner != undefined) {
          // Now get the users /Classes
          var userClasses = $firebaseObject(root.child("Users").child($scope.userData.uid).child("Classes"));
          // Check if user partakes or teaches class - if not add it
          userClasses.$loaded(function () {
            if (userClasses.Partakes == undefined)
              userClasses.Partakes = {};
            if (userClasses.Partakes[joiner.Class] == undefined) {
              userClasses.Partakes[joiner.Class] = Date();
              userClasses.$save();
            }
            if (userClasses.Teaches != undefined && userClasses.Teaches[joiner.Class] != undefined) {
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
