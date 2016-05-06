angular.module('IC').controller('Student', ['$scope', '$firebaseObject', '$firebaseArray', function ($scope, $firebaseObject, $firebaseArray) {
    console.log("loaded!");
    // This will be set from synergetic current class code:
    // ***
    $scope.clas = "MAT0813_23C";
    //$scope.userID = "79051";
    // ***

    $scope.fbRefClass = "https://interactiveclassroom.firebaseio.com/Classes/" + $scope.clas;

    // Get current session and settings from class and lesson
    var settingsRef = new Firebase($scope.fbRefClass + "/Settings");
    $scope.Settings = $firebaseObject(settingsRef);

    $scope.answer = function(ans) {

        if ($scope.Settings.CurrentLesson != "" && $scope.Settings.CurrentSession != "") {
            var answersRef = new Firebase($scope.fbRefClass + "/Lessons/" + $scope.Settings.CurrentLesson + "/Sessions/" + $scope.Settings.CurrentSession + "/Answers/" + $scope.tempuserid);
            var current = $firebaseObject(answersRef);

            current.$loaded(function () {
                // If answer is not the first take one from the other also
                var changing = current.Answer != undefined;

                // Update firebase if answer has changed
                if (current.Answer != ans) {
                    answersRef.set({ 'Answer': ans, 'Date': Date() });

                    var sessionTrue = new Firebase($scope.fbRefClass + "/Lessons/" + $scope.Settings.CurrentLesson + "/Sessions/" + $scope.Settings.CurrentSession + "/TrueCount");
                    var sessionFalse = new Firebase($scope.fbRefClass + "/Lessons/" + $scope.Settings.CurrentLesson + "/Sessions/" + $scope.Settings.CurrentSession + "/FalseCount");

                    if (ans) {
                        sessionTrue.transaction(function(current_value) {
                            return (current_value || 0) + 1;
                        });
                        if (changing) {
                            sessionFalse.transaction(function (current_value) {
                                return (current_value || 0) - 1;
                            });
                        }
                    } else {
                        sessionFalse.transaction(function(current_value) {
                            return (current_value || 0) + 1;
                        });
                        if (changing) {
                            sessionTrue.transaction(function(current_value) {
                                return (current_value || 0) - 1;
                            });
                        }
                    }
                }
            });
        }
    };
}]);
