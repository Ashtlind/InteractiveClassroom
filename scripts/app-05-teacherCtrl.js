angular.module('IC').controller('Teacher', ['$scope', '$firebaseObject', '$firebaseArray', '$routeParams', '$rootScope','hue', 'fbRef', function ($scope, $firebaseObject, $firebaseArray, $routeParams, $rootScope, hue, fbRef) {
    var root = fbRef;

    $scope.classid = $routeParams.classid.substring(1);
    var classRef = root.child("Classes").child($scope.classid);


    // HUE Experiments
    // Get all lights
    var myHue = hue;
    myHue.setup({username: "SzDOKancs7zL7Vubik2dn3MAqJJ8QU46iRZa7qpB", bridgeIP: "172.16.11.40", debug: true});
    // Create username - Goes to /api/username/api .... insted of just / api and getting the username as a response
    //var username = myHue.createUser("interactiveclassroom#amdevice", "imauser");
    //console.log(username);

    myHue.getLights().then(function(lights) {
      $scope.lights = lights;

      console.log(lights);

      // Switch light 1 on
      myHue.setLightState(1, {"on": true}).then(function(response) {
        //$scope.lights[1].state.on = false;
        console.log('API response: ', response);
      });
    });

    $scope.convertRGBtoXY = function (red, green, blue) {
      // http://www.developers.meethue.com/content/rgb-hue-color0-65535-javascript-language
      // Gamma correction
      red = (red > 0.04045) ? Math.pow((red + 0.055) / (1.0 + 0.055), 2.4) : (red / 12.92);
      green = (green > 0.04045) ? Math.pow((green + 0.055) / (1.0 + 0.055), 2.4) : (green / 12.92);
      blue = (blue > 0.04045) ? Math.pow((blue + 0.055) / (1.0 + 0.055), 2.4) : (blue / 12.92);

      // Apply wide gamut conversion D65
      var X = red * 0.664511 + green * 0.154324 + blue * 0.162028;
      var Y = red * 0.283881 + green * 0.668433 + blue * 0.047685;
      var Z = red * 0.000088 + green * 0.072310 + blue * 0.986039;

      var fx = X / (X + Y + Z);
      var fy = Y / (X + Y + Z);
      if (isNaN(fx)) {
          fx = 0.0;
      }
      if (isNaN(fy)) {
          fy = 0.0;
      }

      // return x and y value in an array [0] being x and [1] being y
      return [fx,fy];
    };

    $scope.testthethings = function (r,g,b) {
      myHue.getLights().then(function(lights) {
        $scope.lights = lights;
        // Switch light 1 on
        var xy = $scope.convertRGBtoXY(r,g,b);
        myHue.setLightState(1, {"on": true, "xy": xy, "transitiontime": 0}).then(function(response) {
          //$scope.lights[1].state.on = false;
          console.log('API response: ', response);
        });
      });
    };

    // Get the user's guid initially and subscribe to changes
    $rootScope.$broadcast('userGuidReq');
    $scope.$on('userGuid', function (event, guid) {
      if (guid == undefined || guid == null) {
        $scope.userData = {};
      } else {
        // Init some controller globals
        $scope.userData = $firebaseObject(root.child("Users").child(guid).child("User"));
        $scope.classPub = $firebaseObject(classRef.child("/Pub"));
      }
    });

    // Get class info and setup the basic structure
    $scope.$watch('classPub', function (newVal, oldVal){
      if (newVal != undefined && newVal.CurrentLesson != undefined) {
        // If any info is changed or loaded in the class/Pub dir refresh the other watched objects related to it
        if (oldVal == undefined || (newVal.CurrentLesson != oldVal.CurrentLesson)) {
          // Update the lesson and students once the lesson has changed
          $scope.Students.List = $firebaseArray(classRef.child("Lessons").child(newVal.CurrentLesson).child("Students"));
          $scope.Students.List.$watch(function (event) {
            if ($scope.Students != undefined && $scope.Students.List != undefined) {
              var totalStudents = 0;
              angular.forEach($scope.Students.List, function(student) {
                // If student client has checked in in the last ~1.15 minutes - add them to the current participating students
                if (student.$value >= Date.now() - 70000) {
                  totalStudents += 1;
                }
              });
              $scope.Students.StudentTotal = totalStudents;
            }
          });
        }
        if (oldVal == undefined || (newVal.CurrentTopic != oldVal.CurrentTopic && newVal.CurrentTopic != undefined)) {
          // Update the current topic on change
          $scope.Topic = $firebaseObject(classRef.child("Lessons").child(newVal.CurrentLesson).child("Topics").child(newVal.CurrentTopic));
          console.log($scope.Topic);
          $scope.Topic.$loaded(function () {
            console.log($scope.Topic);
          });
        }
      } else {
        $scope.Students = {};
        $scope.Topic = {};
      }
    });

    // Handle the answer calculations
    $scope.$watch('Topic.Answers', function (newVal, oldVal) {
      if (newVal != undefined) {
        $scope.Answers.Total = 0;
        $scope.Answers.zero = 0;
        $scope.Answers.one = 0;
        $scope.Answers.two = 0;
        angular.forEach(newVal, function (Answer){
          $scope.Answers.Total += 1;
          if (Answer.Answer < 1) {
            $scope.Answers.zero += 1;
          } else if (Answer.Answer < 2) {
            $scope.Answers.one += 1;
          } else if (Answer.Answer < 3) {
            $scope.Answers.two += 1;
          }
        });
        console.log($scope.Answers);
      } else {
        $scope.Answers = {};
      }
    });

    $scope.pluralsAreGoodIGuess = function (numb){
      if(numb>1)
        return 's'
    }


    // *** old stuff below ***
    // *** old stuff below ***
    // *** old stuff below ***
    $scope.$watch('lampSel', function(newVal) {
        angular.forEach($scope.Lamps, function (lamp, key) {
            if (newVal == lamp) {
                $scope.Settings.Lamp = key;
                $scope.Settings.$save();
            }
        });

    });
    $scope.createNewLesson = function() {

        // Create lesson with a new session
        var newLessonRef = new Firebase($scope.fbRefClass + "/Lessons");

        var lesson = {
            'Date': Date(),
            'Students': null
        };
        var theNewLesson = newLessonRef.push(les);

        // Set the current lesson in settings
        var newSessionRef = new Firebase(theNewLesson.toString() + "/Sessions");
        var sesh = {
            'Date': Date(),
            'StudentCount': $scope.stuCount,
            'TrueCount': 0,
            'FalseCount': 0
        };
        var theNewSession = newSessionRef.push(sesh);

        // Change the settings to reflect the change
        $scope.Settings.CurrentLesson = theNewLesson.key();
        $scope.Settings.CurrentSession = theNewSession.key();
        $scope.Settings.$save();
    };

    $scope.createNewSession = function ()
    {
        // Set the current lesson in settings
        var newSessionRef = new Firebase($scope.fbRefClass + "/Lessons/" + $scope.Settings.CurrentLesson + "/Sessions");
        var sesh = {
            'Date': Date(),
            'StudentCount': $scope.stuCount,
            'TrueCount': 0,
            'FalseCount': 0
        };
        var theNewSession = newSessionRef.push(sesh);

        // Change the settings to reflect the change
        $scope.Settings.CurrentSession = theNewSession.key();
        $scope.Settings.$save();
    }

    $scope.finishLesson = function () {
        $scope.Settings.CurrentSession = "";
        $scope.Settings.CurrentLesson = "";
        $scope.Settings.$save();
        $scope.CurrentSession = {};
    };

    // Colors and settings
    $scope.colors = new Array();
    $scope.avalicolors = ["RoyalBlue","Aqua", "Green","Yellow","Orange","Red","Fuchsia","Violet","Lavender","Transparent"];
    $scope.removeColor = "REMOVE";

    //$scope.colors.push({"perc":"0%"}); // Util for start - to specify starting index
    $scope.colors.push({"color":"Violet", "perc":"10"});
    $scope.colors.push({"color":"RoyalBlue", "perc":"50"});
    $scope.colors.push({"color":"Green", "perc":"20"});
    $scope.colors.push({"color":"Aqua", "perc":"20"});

    $scope.draggingColor = false;
    $scope.draggingColorStart = function () {
      $scope.$apply(function () {
        $scope.draggingColor = true;
      });
    };
    $scope.draggingColorStop = function () {
      $scope.$apply(function () {
        $scope.draggingColor = false;
      });
    };
    $scope.draggingColorRemove = false;
    $scope.draggingColorRemoveStart = function () {
      $scope.$apply(function () {
        $scope.draggingColorRemove = true;
      });
    };
    $scope.draggingColorRemoveStop = function () {
      $scope.$apply(function () {
        $scope.draggingColorRemove = false;
      });
    };

    $scope.dropColorHoverOver = function (ele) {
      angular.element(ele.target).addClass("colorbarcolorhover");
    };
    $scope.dropColorHoverOut = function (ele) {
      angular.element(ele.target).removeClass("colorbarcolorhover");
    };

    // Used for adding colors to each end of the bar
    $scope.colorbaradd = {};
    $scope.droppedColor = function (ele) {
      angular.element(ele.target).removeClass("colorbarcolorhover");
      console.log(ele);

      if ($scope.draggingColorRemove) {
        // Loop though the colors and remove any that are incorrect
        angular.forEach($scope.colors, function (color, key) {
          if (color.color == "REMOVE") {
            $scope.colors.splice(key, 1);
          }
        });
      }

      if ($scope.colorbaradd != {}) {
        if ($scope.colorbaradd.left != undefined && $scope.colorbaradd.left != "") {
          $scope.colors.splice(0, 0, {"color": $scope.colorbaradd.left});
        }
        if ($scope.colorbaradd.right != undefined && $scope.colorbaradd.right != "") {
          $scope.colors.push({"color": $scope.colorbaradd.right});
        };
        $scope.colorbaradd = {};
      }
    };

    // Recalculates percentages for the colors - triggered on mouse up for resizing and on adding / remove
    $scope.recalcColor = function () {
      var containerWidth = $('.colorbar').width();
      var tot = 0;
      angular.forEach($scope.colors, function (color, key){
        var wth = ($('#color-' + key).outerWidth(true) / containerWidth) * 100;
        tot += wth;
        color.perc = wth;
      });
    };

    // Get the current color based on the percentage - update light
    $scope.findColor = function (perc) {
      var ret = "bgc-gray";
      var lastperc = 0;
      angular.forEach($scope.colors, function(col, key) {
        if (lastperc <= perc && lastperc+col.perc > perc) {
          console.log("found one!");
          ret = "bglc-" + col.color;
          var color = $("#color-" + key).css("color");
          console.log(color);
          var matchColors = /rgb\((\d{1,3}), (\d{1,3}), (\d{1,3})\)/;
          var match = matchColors.exec(color);
          if (match !== null) {
              console.log('Red: ' + match[1] + ' Green: ' + match[2] + ' Blue: ' + match[3]);
              $scope.testthethings(match[1],match[2],match[3]);
          }
        }
        lastperc += col.perc;
      });
      return ret;
    };

    // Change the defined percentages for the colors into px based flex basises
    // Update on window width change and on data load from firebase
    $scope.findFlexBasis = function () {
      var computedmargin = $("#color-0").outerWidth() - $("#color-0").width();
      angular.forEach($scope.colors, function(col, key) {
        var containerWidth = $('.colorbar').width();
        var colorbasis = (containerWidth * (col.perc / 100)) - computedmargin;
        $("#color-" + key).css("flexBasis", colorbasis);
      });
    };
}]);
