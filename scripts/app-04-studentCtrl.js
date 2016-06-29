angular.module('IC').controller('Student', ['$scope', '$firebaseObject', '$firebaseArray', '$routeParams', '$interval', '$rootScope', 'cfpLoadingBar', 'fbRef', '$location', function ($scope, $firebaseObject, $firebaseArray, $routeParams, $interval, $rootScope, cfpLoadingBar, fbRef, $location) {
    var root = fbRef;

    $scope.classid = $routeParams.classid.substring(1);

    $scope.currentAnswer = {};
    var heartbeatIntervalPromise = {};

    // Get the user's guid initially and subscribe to changes
    cfpLoadingBar.start();
    $scope.$on('userGuid', function (event, guid) {
      if (guid == undefined || guid == null) {
        $scope.userData = {};
      } else {
        // Init user based scope vars
        $scope.userData = $firebaseObject(root.child("Users").child(guid).child("User"));
        $scope.userData.$loaded(function () {
          $scope.classInfo = $firebaseObject(root.child("Classes").child($scope.classid).child("/Pub"));
          $scope.classInfo.$loaded(function () {
            cfpLoadingBar.complete();
          });
        });
      }
    });
    $rootScope.$broadcast('userGuidReq');

    // Setup a heartbeat loop
    heartbeatIntervalPromise = $interval(function () {
      if ($scope.myHeartbeat != undefined) {
        $scope.myHeartbeat.Date = Date.now();
        $scope.myHeartbeat.$save();
      }
    }, 30000);

    $scope.$on('$destroy', function () { $interval.cancel(heartbeatIntervalPromise); });

    $scope.$watch("classInfo.CurrentLesson", function (newVal, oldVal) {
      if (newVal != undefined) {
        // if this class is marked as inactive or expired redirect to the homepage
        if (($scope.classInfo.CurrentLesson.Date != undefined && $scope.classInfo.CurrentLesson.Date <= (Date.now() - (60000*60))) || $scope.classInfo.CurrentLesson.Completed) {
          $location.path('/');
        }

        // Get the referance point for the current lesson based on class info
        $scope.lessonRef = root.child("Classes").child($scope.classid).child("Lessons").child($scope.classInfo.CurrentLesson.uid);

        // Set the heartbeat location based on the current lesson
        $scope.myHeartbeat = $firebaseObject($scope.lessonRef.child("Students").child($scope.userData.uid));
        $scope.myHeartbeat.Date = Date.now();
        // Also set our profile picture path for easy access in the teacher dashboard
        if ($scope.userData.profileImageURL != undefined)
          $scope.myHeartbeat.ProfilePicture = $scope.userData.profileImageURL;
        $scope.myHeartbeat.$save();
      }
    });

    $scope.updateCurrentTopic = function () {
      // Set the current answering location based on the current lesson and topic
      // Future if needed - Make sure that we are in the current lesson, as topic and lesson could technicaly update out of order
      $scope.currentAnswer = $firebaseObject($scope.lessonRef.child("Topics").child($scope.classInfo.CurrentTopic.uid).child("Answers").child($scope.userData.uid));
      $scope.currentAnswer.$loaded(function () {
        if ($scope.currentAnswer.Answer == undefined) {
          $scope.answer(1);
        }
      });
    };
    $scope.$watch("classInfo.CurrentTopic", function (newVal, oldVal) {
      if (newVal != undefined) {
        $scope.updateCurrentTopic();
      }
    });

    $scope.getLeft = function () {
      switch ($scope.currentAnswer.Answer) {
        case 0:
          return 66.666;
          break;
        case 2:
          return 0;
          break;
        default:
          return 33.333;
      }
    };

    $scope.answer = function (answer) {
      $scope.currentAnswer.Answer = answer;
      $scope.currentAnswer.Date = Date();
      $scope.currentAnswer.$save();
    };
}]);
