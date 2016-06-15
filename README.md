# InteractiveClassroom
Realtime classroom feedback with phillips hue

## Screenies
![homepage screenshot](/resources/home.jpg "Homepage")
![student dashboard screenshot](/resources/student.jpg "Student Dashboard")

### Firebase for realtime JSON database
http://firebase.google.com
See resources/struct.json and resources/rules.json for database layout and security.

### Deployment
Copy out the 'www' directory as the web-root, and run it up on pretty much any webserver.

### Development
* Clone the repository somewhere
* CD into the root of the project

##### Get set up
```
bower install
npm install
gulp build:all
```
##### Run the dev webserver and watch for file changes
```
gulp
```
