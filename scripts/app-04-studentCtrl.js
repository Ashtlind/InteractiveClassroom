angular.module('IC').controller('Student', ['$scope', '$firebaseObject', '$firebaseArray', '$routeParams', '$interval', '$rootScope', 'cfpLoadingBar', 'fbRef', function ($scope, $firebaseObject, $firebaseArray, $routeParams, $interval, $rootScope, cfpLoadingBar, fbRef) {
    var root = fbRef;

    $scope.classid = $routeParams.classid.substring(1);

    $scope.classInfo = $firebaseObject(root.child("Classes").child($scope.classid).child("/Pub"));
    $scope.currentAnswer = {};
    var heartbeatIntervalPromise = {};

    // Get the user's guid initially and subscribe to changes
    cfpLoadingBar.start();
    $scope.$on('userGuid', function (event, guid) {
      if (guid == undefined || guid == null) {
        $scope.userData = {};
      } else {
        // Init user based scope vars
        $scope.classInfo.$loaded(function () {
          var lessonRef = root.child("Classes").child($scope.classid).child("Lessons").child($scope.classInfo.CurrentLesson);
          $scope.userData = $firebaseObject(root.child("Users").child(guid).child("User"));
          $scope.userData.$loaded(function () {
            $scope.myHeartbeat = $firebaseObject(lessonRef.child("Students").child($scope.userData.uid));
            // Setup a heartbeat loop
            $scope.myHeartbeat.$value = Date.now();
            $scope.myHeartbeat.$save();
            heartbeatIntervalPromise = $interval(function () {
              $scope.myHeartbeat.$value = Date.now();
              $scope.myHeartbeat.$save();
            }, 30000);
            $scope.currentAnswer = $firebaseObject(lessonRef.child("Topics").child($scope.classInfo.CurrentTopic).child("Answers").child($scope.userData.uid));
            cfpLoadingBar.complete();
          });
        });
      }
    });
    $rootScope.$broadcast('userGuidReq');

    $scope.$on('$destroy', function () { $interval.cancel(heartbeatIntervalPromise); });

    $scope.answer = function (answer) {
      $scope.currentAnswer.Answer = answer;
      $scope.currentAnswer.Date = Date();
      $scope.currentAnswer.$save();
    };
}]);
