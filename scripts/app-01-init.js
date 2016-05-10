$(document).ready(function () {

    // Disable submitting of text field
    $('#StudentCount').keypress(function (e) {
        if (e.keyCode == '13') {
            e.preventDefault();
        }
    });
});


// Angular app
var app = angular.module("IC", ["firebase", "ngAnimate", "ngRoute"]);


// Firebase auth factory
app.factory("Auth", ["$firebaseAuth",
  function($firebaseAuth) {
    var ref = new Firebase("https://interactiveclassroom.firebaseio.com");
    return $firebaseAuth(ref);
  }
]);

// enter directive for input submission
app.directive('myEnter', function () {
    return function (scope, element, attrs) {
        element.bind("keydown keypress", function (event) {
            if(event.which === 13) {
                scope.$apply(function (){
                    scope.$eval(attrs.myEnter);
                });

                event.preventDefault();
            }
        });
    };
});
