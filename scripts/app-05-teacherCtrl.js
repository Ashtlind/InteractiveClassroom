angular.module('IC').controller('Teacher', ['$scope', '$firebaseObject', '$firebaseArray', '$routeParams', '$rootScope','hue', 'fbRef', '$interval', '$timeout', 'cfpLoadingBar', function ($scope, $firebaseObject, $firebaseArray, $routeParams, $rootScope, hue, fbRef, $interval, $timeout, cfpLoadingBar) {
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

    $scope.setHueColor = function (r,g,b) {
      var on = true;
      if (r<=0 && g<=0 && b<=0)
        on = false;
      var xy = $scope.convertRGBtoXY(r,g,b);
      myHue.setLightState(1, {"on": on, "bri": 254, "xy": xy, "transitiontime": 0}).then(function(response) {
        //$scope.lights[1].state.on = false;
        console.log('API response: ', response);
      });
    };

    // Get the user's guid initially and subscribe to changes
    cfpLoadingBar.start();
    $scope.$on('userGuid', function (event, guid) {
      if (guid == undefined || guid == null) {
        $scope.userData = {};
        $scope.colorsLive = {};
        $scope.colors = {};
        $scope.classPub = {};
      } else {
        $scope.userData = {};
        $scope.colorsLive = {};
        $scope.colors = {};
        $scope.classPub = {};
        // Init some controller globals
        $scope.userData = $firebaseObject(root.child("Users").child(guid).child("User"));
        // Load the color profile for hue
        $scope.colorsLive = $firebaseObject(root.child("Users").child(guid).child("Colors"));
        $scope.colorsLive.$loaded(function () {
          console.log($scope.colorsLive);
          if ($scope.colorsLive.$value == null) {
            // Set the defaults for the hue colors
            $scope.colorsLive.$value = [{"color":"Violet", "perc":10},
              {"color":"RoyalBlue", "perc":50},
              {"color":"Green", "perc":20},
              {"color":"Aqua", "perc":20}];
            $scope.colorsLive.$save();
          }
        });
        $scope.colorsLive.$watch(function (event) {
          // On changes to the live color - Syncronise to the local array
          var tempList = new Array();
          $scope.colorsLiveLength = 0;
          angular.forEach($scope.colorsLive, function (color, key) {
            $scope.colorsLiveLength += 1;
            if ($scope.colors[key] != undefined && ($scope.colors[key].color != color.color || $scope.colors[key].perc != color.perc)) {
              $scope.colors[key].color = color.color;
              $scope.colors[key].perc = color.perc;
            }
            tempList.push(angular.extend({}, color));
          });
          if ($scope.colors.length != $scope.colorsLiveLength) {
            $scope.colors = tempList;
          }
          $scope.findFlexBasis();
        });
        $scope.classPub = $firebaseObject(classRef.child("/Pub"));
        $scope.classPub.$loaded(function () {
          // Check if there is a current lesson or if the last has expired (2 hours)
          if ($scope.classPub.CurrentLesson == undefined || $scope.classPub.CurrentLesson.uid == "" || $scope.classPub.CurrentLesson.Date <= (Date.now() - (60000*60))) {
            // Create new lesson and topic set it as the current lesson
            if ($scope.classPub.CurrentLesson == undefined)
              $scope.classPub.CurrentLesson = {};
            if ($scope.classPub.CurrentTopic == undefined)
              $scope.classPub.CurrentTopic = {};
            var lessons = $firebaseArray(classRef.child("Lessons"));
            var lessonDate = Date.now();
            lessons.$add({
              "Date": lessonDate
            }).then(function (ref) {
              $scope.classPub.CurrentLesson.uid = ref.key;
              $scope.classPub.CurrentLesson.Date = lessonDate;
              var topic = $firebaseArray(classRef.child("Lessons").child(ref.key).child("Topics"));
              var topicDate = Date.now();
              topic.$add({
                "Date": topicDate
              }).then(function (ref) {
                $scope.classPub.CurrentTopic.uid = ref.key;
                $scope.classPub.CurrentTopic.Date = topicDate;
                $scope.classPub.$save();
              });
            });
          }
        });
        cfpLoadingBar.complete();
      }
    });
    $rootScope.$broadcast('userGuidReq');

    $scope.createNewTopic = function () {
      // Check if there is a current lesson or if the last has expired (2 hours)
      if ($scope.classPub.CurrentLesson.uid != "") {
        // Create new topic set it as the current topic
        if ($scope.classPub.CurrentTopic == undefined)
          $scope.classPub.CurrentTopic = {};
        var topic = $firebaseArray(classRef.child("Lessons").child($scope.classPub.CurrentLesson.uid).child("Topics"));
        var topicDate = Date.now();
        topic.$add({
          "Date": topicDate
        }).then(function (ref) {
          $scope.classPub.CurrentTopic.uid = ref.key;
          $scope.classPub.CurrentTopic.Date = topicDate;
          $scope.classPub.$save();
        });
      }
    }

    // Check the student list every 30 seconds to see if there are any students that are not active
    var activeStudentsIntervalPromise = $interval(function () {
      $scope.updateActiveStudents();
    }, 30000);
    $scope.$on('$destroy', function () { $interval.cancel(activeStudentsIntervalPromise); });

    // Updated on $watch even from firebase object > students
    $scope.updateActiveStudents = function () {
      if ($scope.Students != undefined && $scope.Students.List != undefined) {
        var totalStudents = 0;
        angular.forEach($scope.Students.List, function(student) {
          // If student client has checked in in the last ~1.15 minutes - add them to the current participating students
          var activeIndex = $scope.Students.ActiveList.indexOf(student);
          if (student.$value >= Date.now() - 70000) {
            totalStudents += 1;
            // Check if the student is in the active array - if not add them
            if (activeIndex < 0) {
              $scope.Students.ActiveList.push(student);
            }
          } else {
            // Check if the student is in the active array - if they are remove them
            if (activeIndex >= 0) {
              $scope.Students.ActiveList.splice(activeIndex, 1);
            }
          }
        });
        $scope.Students.StudentTotal = totalStudents;
        $scope.updateTopicAnswers();
      }
    };

    $scope.$watch('Students.List', function (newVal, oldVal) {
      $scope.updateActiveStudents();
    }, true);
    // Get class info and setup the basic structure
    $scope.$watch('classPub.CurrentLesson', function (newVal, oldVal) {
      if (newVal != undefined && newVal.uid != undefined) {
        // If any info is changed or loaded in the class/Pub dir refresh the other watched objects related to it
        if (oldVal == undefined || (newVal != oldVal) || (newVal === oldVal)) {
          // Update the lesson and students once the lesson has changed
          console.log("Update Lesson");
          console.log(newVal);
          if ($scope.Students == undefined) {
            $scope.Students = {};
          }
          $scope.Students.ActiveList = new Array();
          // Student list changes are listened for in a scope deep watch
          $scope.Students.List = $firebaseArray(classRef.child("Lessons").child(newVal.uid).child("Students"));
        }
      } else {
        console.log("Destory students");
        $scope.Students = {};
      }
    });
    $scope.$watch('classPub.CurrentTopic', function (newVal, oldVal) {
      if (newVal != undefined && newVal.uid != undefined) {
        // If any info is changed or loaded in the class/Pub dir refresh the other watched objects related to it
        if (oldVal == undefined || (newVal != oldVal) || (newVal === oldVal)) {
          console.log("Update Topic");
          console.log(newVal);
          // Update the current topic on change
          $scope.Topic = $firebaseObject(classRef.child("Lessons").child($scope.classPub.CurrentLesson.uid).child("Topics").child(newVal.uid));
        }
      } else {
        console.log("Destory topic");
        $scope.Topic = {};
      }
    });

    // Handle the answer calculations - triggered by topic answers watch event
    $scope.updateTopicAnswers = function () {
      if ($scope.Answers != undefined) {
        $scope.Answers.Total = 0;
        $scope.Answers.zero = 0;
        $scope.Answers.one = 0;
        $scope.Answers.two = 0;
        // Loop through the active students - and see if they have an answer
        if ($scope.Topic.Answers != undefined) {
          angular.forEach($scope.Students.ActiveList, function (student) {
            if ($scope.Topic.Answers[student.$id] != undefined) {
              $scope.Answers.Total += 1;
              if ($scope.Topic.Answers[student.$id].Answer < 1) {
                $scope.Answers.zero += 1;
              } else if ($scope.Topic.Answers[student.$id].Answer < 2) {
                $scope.Answers.one += 1;
              } else if ($scope.Topic.Answers[student.$id].Answer < 3) {
                $scope.Answers.two += 1;
              }
            }
          });
        }
        // Calculate the total percentage for the hue light to be based off
        if ($scope.Students.StudentTotal > 0) {
          $scope.Answers.Perc = 100 / ($scope.Students.StudentTotal / $scope.Answers.two);
        } else {
          $scope.Answers.Perc = 0;
        }
        $scope.findColor();
      } else {
        $scope.Answers = {Perc:0};
      }
    };
    $scope.$watch('Topic.Answers', function (newVal, oldVal) {
      $scope.updateTopicAnswers();
    });

    $scope.pluralsAreGoodIGuess = function (numb) {
      if(numb>1 || numb==0)
        return 's'
    }

    // Colors and settings
    $scope.colors = new Array();
    $scope.avalicolors = ["RoyalBlue","Aqua", "Green","Yellow","Orange","Red","Fuchsia","Violet","Lavender","Transparent"];
    $scope.removeColor = "REMOVE";

    $scope.$watch('colors', function (newVal, oldVal) {
      if (newVal != undefined) {
        // Update colorsLive to save the changes to firebase
        angular.forEach(newVal, function (color, key) {
          if ($scope.colorsLive[key] == undefined || $scope.colorsLive[key].color != color.color || $scope.colorsLive[key].perc != color.perc) {
            $scope.colorsLive[key] = color;
            $scope.colorsLive.$save();
          }
        });
        // Go through and trim down the colorsLive array
        var clearAfter = newVal.length;
        angular.forEach($scope.colorsLive, function (color, key) {
          if (key >= clearAfter) {
            $firebaseObject($scope.colorsLive.$ref().child(key)).$remove();
          }
        });
        // Wait 0.6 seconds to allow for the transition before changing the color - as it uses comnputed styles
        $timeout(function () {
          $scope.findColor();
        }, 600);
      }
    }, true);

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
        $scope.findFlexBasis();
      }

      if ($scope.colorbaradd != {}) {
        if ($scope.colorbaradd.left != undefined && $scope.colorbaradd.left != "") {
          $scope.colors.splice(0, 0, {"color": $scope.colorbaradd.left});
        }
        if ($scope.colorbaradd.right != undefined && $scope.colorbaradd.right != "") {
          $scope.colors.push({"color": $scope.colorbaradd.right});
        };
        $scope.colorbaradd = {};
        $scope.findFlexBasis();
      }
    };

    // Recalculates percentages for the colors - triggered on mouse up for resizing and on adding / remove
    $scope.recalcColor = function () {
      $(document).ready(function () {
        var containerWidth = $('.colorbar').width();
        var tot = 0;
        angular.forEach($scope.colors, function (color, key){
          var wth = ($('#color-' + key).outerWidth(true) / containerWidth) * 100;
          tot += wth;
          color.perc = wth;
        });
      });
    };

    // Get the current color based on the percentage - update light
    $scope.findColor = function () {
      $(document).ready(function () {
        var ret = "bgc-gray";
        var lastperc = 0;
        angular.forEach($scope.colors, function(col, key) {
          if (lastperc <= $scope.Answers.Perc && lastperc+col.perc > $scope.Answers.Perc) {
            ret = "bglc-" + col.color;
            var color = $("#color-" + key).css("color");
            var matchColors = /rgb\((\d{1,3}), (\d{1,3}), (\d{1,3})\)/;
            var match = matchColors.exec(color);
            if (match !== null) {
                $scope.setHueColor(match[1],match[2],match[3]);
            }
          }
          lastperc += col.perc;
        });
        return ret;
      });
    };

    // Change the defined percentages for the colors into px based flex basises
    // Update on window width change and on data load from firebase
    $scope.findFlexBasis = function () {
      $(document).ready(function () {
        var computedmargin = $("#color-0").outerWidth() - $("#color-0").width();
        angular.forEach($scope.colors, function(col, key) {
          // Apply flex basis to all except the last section
          if (key < $scope.colors.length - 1) {
            var containerWidth = $('.colorbar').width();
            var colorbasis = (containerWidth * (col.perc / 100)) - computedmargin;
            $("#color-" + key).css("flexBasis", colorbasis);
          }
        });
      });
    };
}]);
