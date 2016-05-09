angular.module('IC').controller('Student', ['$scope', '$firebaseObject', '$firebaseArray', '$routeParams', 'Auth', '$interval', function ($scope, $firebaseObject, $firebaseArray, $routeParams, Auth, $interval) {
    $scope.classid = $routeParams.classid.substring(1);

    var authData = Auth.$getAuth();

    var classRef = new Firebase("https://interactiveclassroom.firebaseio.com/Classes/" + $scope.classid);

    // Get class info
    var classInfoRef = classRef.child("/Pub");
    $scope.classInfo = $firebaseObject(classInfoRef);

    $scope.currentAnswer = {};

    $scope.classInfo.$loaded(function () {
      var lessonRef = classRef.child("Lessons").child($scope.classInfo.CurrentLesson);
      Auth.$requireAuth().then(function () {
        var lessonHBRef = lessonRef.child("Students").child(authData.uid);
        $scope.myHeartbeat = $firebaseObject(lessonHBRef);
        // Setup a heartbeat loop
        $scope.myHeartbeat.$value = Date();
        $scope.myHeartbeat.$save();
        $interval(function () {
          $scope.myHeartbeat.$value = Date();
          $scope.myHeartbeat.$save();
        }, 30000);
        // Get current topic answer
        var topicAnswer = lessonRef.child("Topics").child($scope.classInfo.CurrentTopic).child("Answers").child(authData.uid);
        $scope.currentAnswer = $firebaseObject(topicAnswer);
      });
    });

    $scope.answer = function (answer) {
      $scope.currentAnswer.Answer = answer;
      $scope.currentAnswer.Date = Date();
      $scope.currentAnswer.$save();
    };
}]);
