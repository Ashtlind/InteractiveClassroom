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


// Auth factory
app.factory("Auth", ["$firebaseAuth",
  function($firebaseAuth) {
    var ref = new Firebase("https://interactiveclassroom.firebaseio.com");
    return $firebaseAuth(ref);
  }
]);
