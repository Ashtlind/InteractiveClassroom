angular.module('IC').controller('Teacher', ['$scope', '$firebaseObject', '$firebaseArray', '$routeParams', '$rootScope','hue', 'fbRef', function ($scope, $firebaseObject, $firebaseArray, $routeParams, $rootScope, hue, fbRef) {
    var root = fbRef;

    $scope.classid = $routeParams.classid.substring(1);

/*
    // HUE Experiments
    // Get all lights
    var myHue = hue;
    myHue.setup({username: "datuserdoe", bridgeIP: "172.16.10.76", debug: true});
    // Create username
    var username = myHue.createUser({devicetype: "interactiveclassroom#amdevice"});
    console.log(username);

    myHue.getLights().then(function(lights) {
      $scope.lights = lights;

      // Switch light 1 on
      myHue.setLightState(1, {"on": true}).then(function(response) {
        $scope.lights[1].state.on = false;
        console.log('API response: ', response);
      });
    });
*/

    // Get the user's guid initially and subscribe to changes
    $rootScope.$broadcast('userGuidReq');
    $scope.$on('userGuid', function (event, guid) {
      if (guid == undefined || guid == null)
        $scope.userData = {};
      else
        $scope.userData = $firebaseObject(root.child("Users").child(guid));
    });

    // Get class info and setup the basic structure
    var classRef = root.child("Classes").child($scope.classid);
    $scope.$watch('classPub', function (newVal, oldVal){
      console.log(newVal);
      if (newVal.CurrentLesson != undefined) {
        // If any info is changed or loaded in the class/Pub dir refresh the other watched objects related to it
        if (newVal.CurrentLesson != oldVal.CurrentLesson) {
          // Update the lesson and students once the lesson has changed
          $scope.Lesson = $firebaseObject(classRef.child("Lessons").child(newVal.CurrentLesson));
          $scope.Students = $firebaseObject(classRef.child("Students"));
        }
        if (newVal.CurrentTopic != oldVal.CurrentTopic && newVal.CurrentTopic != undefined) {
          console.log("HWLLO?");
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
    $scope.classPub = $firebaseObject(classRef.child("/Pub"));

    // Count the answers
    $scope.$watch('Topic.Answers', function (newVal, oldVal) {
      if (newVal != undefined) {
        console.log(newVal);
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
