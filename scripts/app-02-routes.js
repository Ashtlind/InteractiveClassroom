angular.module('IC').run(["$rootScope", "$location", function($rootScope, $location) {
  $rootScope.$on("$routeChangeError", function(event, next, previous, error) {
    // We can catch the error thrown when the $requireAuth promise is rejected
    // and redirect the user back to the home page
    if (error === "AUTH_REQUIRED") {
      $location.path("/");
    }
  });
}]);

angular.module('IC').config(["$routeProvider", function($routeProvider) {
  $routeProvider.when("/class:classid", {
    // the rest is the same for ui-router and ngRoute...
    controller: "Student",
    templateUrl: "student.html",
    resolve: {
      // controller will not be loaded until $requireAuth resolves
      // Auth refers to our $firebaseAuth wrapper in the example above
      "currentAuth": ["Auth", function(Auth) {
        // $requireAuth returns a promise so the resolve waits for it to complete
        // If the promise is rejected, it will throw a $stateChangeError (see above)
        return Auth.$requireSignIn();
      }]
    }
  }).when("/dashboard:classid", {
    // the rest is the same for ui-router and ngRoute...
    controller: "Teacher",
    templateUrl: "teacher.html",
    resolve: {
      // controller will not be loaded until $requireAuth resolves
      // Auth refers to our $firebaseAuth wrapper in the example above
      "currentAuth": ["Auth", function(Auth) {
        // $requireAuth returns a promise so the resolve waits for it to complete
        // If the promise is rejected, it will throw a $stateChangeError (see above)
        return Auth.$requireSignIn();
      }]
    }
  }).when('/', {
    templateUrl : 'home.html',
    controller  : 'Home'
  }).when('/:action', {
    templateUrl : 'home.html',
    controller  : 'Home'
  }).otherwise({
    redirectTo: '/'
  });
}]);
