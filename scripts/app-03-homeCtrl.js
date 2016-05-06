angular.module('IC').controller('Home', ['$scope', '$firebaseObject', '$firebaseArray', 'Auth', function ($scope, $firebaseObject, $firebaseArray, Auth) {
  $scope.login = function() {
    Auth.$authWithOAuthPopup('google').then(function(authData) {
    }).catch(function(error) {
      if (error.code === 'TRANSPORT_UNAVAILABLE') {
        Auth.$authWithOAuthPopup(authMethod).then(function(authData) {
        });
      } else {
        console.log(error);
      }
    });
  };
}]);
