angular.module('IC').controller('Home', ['$scope', '$firebaseObject', '$firebaseArray', '$timeout', '$location', function ($scope, $firebaseObject, $firebaseArray, Auth, $timeout, $location) {
  var root = new Firebase("https://interactiveclassroom.firebaseio.com");

  $scope.btngrpclass = "";
  $scope.invitecode = "";
  $scope.labeltext = "";
  $scope.addingClass = false;
  $scope.joinBtn = false;

  // Get the user's guid initially and subscribe to changes
  $rootScope.$broadcast('userGuidReq', 'Home');
  $scope.$on('userGuidHome', function (event, guid) {
    if (guid == undefined || guid == null){
      $scope.userData = {};
    } else {
      // That means we are authenticated
      $scope.userData = $firebaseObject(root.child("Users").child(guid));
      $scope.userData.$loaded(function () {
        if ($scope.joinBtn){
          // If we had pressed a call to action and now authenticated - continue
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
        }
      });
    }
  });

  $scope.cancel = function (){
    $scope.btngrpclass = "";
    $scope.invitecode = "";
    $scope.addingClass = false;
    $scope.joinBtn = false;
  };

  $scope.classroom = function (addnew) {
      $scope.addingClass = addnew;
    if ($scope.userData.uid == undefined) {
        $scope.btngrpclass = "homebtngrp--login";
        $scope.joinBtn = true;
        $rootScope.$broadcast('login');
    } else {
      $scope.labeltext = $scope.labelText();
      $scope.btngrpclass = "homebtngrp--invitecode";
      setTimeout(function() {
        $('.homebtngrp-left-input').focus();
      }, 500);
    }
  };

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
        $scope.login();
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
