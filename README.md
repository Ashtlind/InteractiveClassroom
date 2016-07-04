# InteractiveClassroom
Realtime classroom feedback with phillips hue

## Screenies
![homepage screenshot](/resources/home.jpg "Homepage")
![student dashboard screenshot](/resources/student.jpg "Student Dashboard")

### Firebase for realtime JSON database
http://firebase.google.com
See resources/struct.json and resources/database.rules.json for database layout and security.
* You will require a firebase.google.com account with a new blank project for development or deployment
* Edit /scripts/app-01-init.js config as below
```js
var config = {
    apiKey: "<Your firebase app key>",
    authDomain: "<Your firebase auth url>",
    databaseURL: "<Your firebase url>",
    storageBucket: "<Your firebase storage url>",
  };
```

### Deployment
Copy out the 'www' directory as the web-root, and run it up on pretty much any webserver.
```
git clone https://github.com/SPLCIS/InteractiveClassroom.git
cd InteractiveClassroom/www
```

Or deploy the project directly to firebase hosting:
```
git clone https://github.com/SPLCIS/InteractiveClassroom.git
cd InteractiveClassroom
firebase login
firebase deploy
```

### Development
##### Get set up
```
git clone https://github.com/SPLCIS/InteractiveClassroom.git
cd InteractiveClassroom
bower install
npm install
gulp build:all
```
##### Run the dev webserver and watch for file changes
```
gulp
```
