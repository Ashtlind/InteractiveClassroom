angular.module('IC').controller('Student', ['$scope', '$firebaseObject', '$firebaseArray', '$routeParams', '$interval', function ($scope, $firebaseObject, $firebaseArray, $routeParams, $interval) {
    var root = new Firebase("https://interactiveclassroom.firebaseio.com");

    $scope.classid = $routeParams.classid.substring(1);

    // Get the user's guid initially and subscribe to changes
    $rootScope.$broadcast('userGuidReq', 'Student');
    $scope.$on('userGuidStudent', function (event, guid) {
      if (guid == undefined || guid == null)
        $scope.userData = {};
      else
        $scope.userData = $firebaseObject(root.child("Users").child(guid));
    });

    var classRef = root.child("Classes").child($scope.classid);

    // Get class info
    var classInfoRef = classRef.child("/Pub");
    $scope.classInfo = $firebaseObject(classInfoRef);

    $scope.currentAnswer = {};

    var heartbeatIntervalPromise = {};

    $scope.classInfo.$loaded(function () {
      var lessonRef = classRef.child("Lessons").child($scope.classInfo.CurrentLesson);
      var lessonHBRef = lessonRef.child("Students").child(authData.uid);
      $scope.myHeartbeat = $firebaseObject(lessonHBRef);
      // Setup a heartbeat loop
      $scope.myHeartbeat.$value = Date();
      $scope.myHeartbeat.$save();
      heartbeatIntervalPromise = $interval(function () {
        $scope.myHeartbeat.$value = Date();
        $scope.myHeartbeat.$save();
      }, 30000);
      // Get current topic answer
      var topicAnswer = lessonRef.child("Topics").child($scope.classInfo.CurrentTopic).child("Answers").child(authData.uid);
      $scope.currentAnswer = $firebaseObject(topicAnswer);
    });

    $scope.$on('$destroy', function () { $interval.cancel(heartbeatIntervalPromise); });

    $scope.answer = function (answer) {
      $scope.currentAnswer.Answer = answer;
      $scope.currentAnswer.Date = Date();
      $scope.currentAnswer.$save();
    };
}]);
