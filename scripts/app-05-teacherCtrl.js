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

    $scope.testthethings = function () {
      myHue.getLights().then(function(lights) {
        $scope.lights = lights;
        console.log(lights);
        // Switch light 1 on
        var rgb = $scope.datinput.split(',');
        var xy = $scope.convertRGBtoXY(rgb[0], rgb[1], rgb[2]);
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
          $scope.Lesson = $firebaseObject(classRef.child("Lessons").child(newVal.CurrentLesson));
          $scope.Students = $firebaseObject(classRef.child("Students"));
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
        $scope.Lesson = {};
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

    // Get the Students
    $scope.$watch('Students', function (newVal, oldVal) {
      if (newVal != undefined) {
        var totalStudents = 0;
        angular.forEach(newVal, function(student) {
          totalStudents += 1;
        });
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

    // Create new lamp
    /*lampsRef.push(
    {
        'Name': 'Testing',
        'AppKey': '25cb29131e448e6f3b55c80b1e0df1e7',
        'Ip': '172.17.24.201',
        'Lamp':'5'
    });*/

    $scope.colorDrop = function () {
      console.log("Dropped!");
    };

    $scope.drag = "test";
    $scope.drop = "";

    $scope.$watch('drag', function (newVal, oldval) {
      console.log(newVal);
    });

    $scope.editc = false;
    // Colors and settings
    $scope.colors = new Array();
    $scope.avalicolors = ["Violet","RoyalBlue","LightSkyBlue","Aqua", "AquaMarine","Green","LimeGreen","Yellow","Goldenrod","Orange","Red","Pink","Fuchsia","Orchid","Lavender"];

    //tempsetup
    $scope.colors.push({"perc":"0%"}); // Util for start - to specify starting index
    $scope.colors.push({"color":"Violet", "perc":"40%"});
    $scope.colors.push({"color":"RoyalBlue", "perc":"50%"});
    $scope.colors.push({"color":"LightSkyBlue", "perc":"70%"});
    $scope.colors.push({"color":"AquaMarine", "perc":"100%"});

    $scope.colorPercDiff = function (color){
      var indx = $scope.colors.indexOf(color) - 1;
      var st = parseInt($scope.colors[indx].perc.substring(0, color.perc.length-1));
      var en = parseInt(color.perc.substring(0, color.perc.length-1));
      return en-st+"%";
    };

    $scope.findColor = function (perc){
      var ret = "bgc-gray";
      var lastperc = 0;
      angular.forEach($scope.colors, function(col){
        var en = parseInt(col.perc.substring(0, col.perc.length-1));
        if (lastperc <= perc && en > perc){
          ret = "bglc-" + col.color;
        }
        lastperc = en;
      });
      return ret;
    };

}]);
