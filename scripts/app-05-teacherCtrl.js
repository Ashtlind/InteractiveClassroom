angular.module('IC').controller('Teacher', ['$scope', '$firebaseObject', '$firebaseArray', function ($scope, $firebaseObject, $firebaseArray) {

    // This will be set from synergetic current class code:
    // ***
    $scope.clas = "MAT0813_23C";
    // ***

    $scope.fbRefClass = "https://huehue.firebaseio.com/Classes/" + $scope.clas;

    $scope.stuCount = 24;
    $scope.lampSel = {};

    $scope.CurrentSession = {};

    // Get current session and settings from class and lesson
    var settingsRef = new Firebase($scope.fbRefClass + "/Settings");
    $scope.Settings = $firebaseObject(settingsRef);


    // Get lamp list
    var lampsRef = new Firebase("https://huehue.firebaseio.com/Hue/Lamps");
    $scope.Lamps = $firebaseObject(lampsRef);
    $scope.Lamps.$loaded(function () {

    });

    // If there is no class settings, allow for creating new lesson with will populate this
    $scope.Settings.$loaded(function () {
        if ($scope.Settings.CurrentSession == undefined) {
            $scope.Settings.CurrentLesson = "";
        }

        if ($scope.Settings.CurrentLesson != "" && $scope.Settings.CurrentLesson != undefined) {
            if ($scope.Settings.Lamp != undefined) {
                angular.forEach($scope.Lamps, function(lamp, key) {
                    if (key == $scope.Settings.Lamp) {
                        $scope.lampSel = lamp;
                    }
                });

                console.log($scope.lampSel);
            }
        }
    });

    // Session Changed in settings - Update the current session and values
    $scope.$watch('Settings.CurrentSession', function (newVal, oldVal) {
        if (newVal != "" && newVal != undefined) {
            console.log("NEW Session!");
            var sessionRef = new Firebase($scope.fbRefClass + "/Lessons/" + $scope.Settings.CurrentLesson + "/Sessions/" + $scope.Settings.CurrentSession);
            $scope.CurrentSession = $firebaseObject(sessionRef);

            $scope.CurrentSession.$loaded(function () {
                console.log($scope.CurrentSession);

                if ($scope.CurrentSession.StudentCount != undefined) {
                    $scope.stuCount = $scope.CurrentSession.StudentCount;
                } else {
                    $scope.stuCount = 24;
                }

            });
        }
    });

    $scope.pluralsAreGoodIGuess = function (numb){
      if(numb>1)
        return 's'
    }

    $scope.$watch('lampSel', function(newVal) {
        console.log(newVal);
        angular.forEach($scope.Lamps, function (lamp, key) {
            if (newVal == lamp) {
                $scope.Settings.Lamp = key;
                $scope.Settings.$save();
            }
        });

    });


    $scope.stuCountChange = function (keyEvent) {
        if (keyEvent.which === 13 && $scope.stuCount > 0) {
            var lessonRef = new Firebase($scope.fbRefClass + "/Lessons/" + $scope.Settings.CurrentLesson);
            var sessionRef = new Firebase($scope.fbRefClass + "/Lessons/" + $scope.Settings.CurrentLesson + "/Sessions/" + $scope.Settings.CurrentSession);

            lessonRef.update({ 'StudentCount': $scope.stuCount });
            sessionRef.update({ 'StudentCount': $scope.stuCount });
        }
    };


    $scope.createNewLesson = function() {

        // Create lesson with a new session
        var newLessonRef = new Firebase($scope.fbRefClass + "/Lessons");

        var les = {
            'Date': Date(),
            'StudentCount': $scope.stuCount
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
