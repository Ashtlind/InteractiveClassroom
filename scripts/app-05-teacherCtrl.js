angular.module('IC').controller('Teacher', ['$scope', '$firebaseObject', '$firebaseArray', '$routeParams', function ($scope, $firebaseObject, $firebaseArray, $routeParams) {
    var root = new Firebase("https://interactiveclassroom.firebaseio.com");

    $scope.classid = $routeParams.classid.substring(1);

    // Get the user's guid initially and subscribe to changes
    $rootScope.$broadcast('userGuidReq', 'Teacher');
    $scope.$on('userGuidTeacher', function (event, guid) {
      if (guid == undefined || guid == null)
        $scope.userData = {};
      else
        $scope.userData = $firebaseObject(root.child("Users").child(guid));
    });

    var classRef = new Firebase("https://interactiveclassroom.firebaseio.com/Classes/" + $scope.classid);

    // Get class info
    var classInfoRef = classRef.child("/Pub");
    $scope.classInfo = $firebaseObject(classInfoRef);

    // Get lamp list
    var lampsRef = new Firebase("https://huehue.firebaseio.com/Hue/Lamps");
    $scope.Lamps = $firebaseObject(lampsRef);
    $scope.Lamps.$loaded(function () {

    });

    $scope.Lesson = {};
    $scope.Topic = {};

    $scope.$watch('classInfo', function (newVal, oldVal){
      if (newVal.CurrentLesson != undefined && newVal.CurrentLesson != oldVal.CurrentLesson) {
        $scope.Lesson = $firebaseObject(classInfoRef.child("Lessons").child(newVal.CurrentLesson));
      }
      if (newVal.CurrentTopic != undefined && newVal.CurrentTopic != oldVal.CurrentTopic) {
        $scope.Lesson = $firebaseObject(classInfoRef.child("Lessons").child(newVal.CurrentLesson).child("Topics").child(newVal.CurrentTopic));
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
