$(document).ready(function () {

    // Disable submitting of text field
    $('#StudentCount').keypress(function (e) {
        if (e.keyCode == '13') {
            e.preventDefault();
        }
    });
});


// Angular app
var app = angular.module("IC", ["firebase", "ngAnimate", "ngRoute", "angular-loading-bar", "hue"]);

var config = {
    apiKey: "AIzaSyBpdRvCW0oJH5ukKNWBZp3jipGVg8w0wyE",
    authDomain: "interactiveclassroom.firebaseapp.com",
    databaseURL: "https://interactiveclassroom.firebaseio.com",
    storageBucket: "project-3354574417935505015.appspot.com",
  };
firebase.initializeApp(config);

// Firebase factories
app.factory("fbRef", [
  function() {
    var ref = firebase.database().ref();
    return ref;
  }
]);
app.factory("Auth", ["$firebaseAuth",
  function($firebaseAuth) {
    return $firebaseAuth();
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
