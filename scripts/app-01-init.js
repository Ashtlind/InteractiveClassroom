$(document).ready(function () {

    // Disable submitting of text field
    $('#StudentCount').keypress(function (e) {
        if (e.keyCode == '13') {
            e.preventDefault();
        }
    });
});


// Angular app
var app = angular.module("IC", ["firebase", "ngAnimate", "ngRoute", "ngTouch", "angular-loading-bar", "hue", "angularResizable", "ngDragDrop"]);

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
// Driective for window horizontal resize
app.directive('myResize', ['$window', function ($window) {
    return function (scope, element, attrs) {
        angular.element($window).bind('resize', function() {
            scope.$apply(function (){
                scope.$eval(attrs.gothing);
            });
          });
    };
}]);

app.directive('clickAnywhereButHere', ['$document', function ($document) {
    return {
        link: function postLink(scope, element, attrs) {
            var onClick = function (event) {
                var isChild = element[0].contains(event.target);
                var isSelf = element[0] == event.target;
                var isInside = isChild || isSelf;
                if (!isInside) {
                    scope.$apply(attrs.clickAnywhereButHere)
                }
            }
            scope.$watch(attrs.isActive, function(newValue, oldValue) {
                if (newValue !== oldValue && newValue == true) {
                    $document.bind('click', onClick);
                }
                else if (newValue !== oldValue && newValue == false) {
                    $document.unbind('click', onClick);
                }
            });
        }
    };
}]);
