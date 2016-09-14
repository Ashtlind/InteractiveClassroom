# InteractiveClassroom
Realtime classroom feedback with phillips hue

## Screenies
### Landing Page
![homepage screenshot](/resources/Home.png "Homepage")
### Student Feedback Interface
![student dashboard screenshot](/resources/Student.png "Student Dashboard")
### Teacher Dashboard
![student dashboard screenshot](/resources/Teacher.png "Teacher Dashboard")

### Deployment
```
git clone https://github.com/Ashtlind/InteractiveClassroom.git
cd InteractiveClassroom
```
#### Firebase for realtime JSON database
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
##### Run the following to build these config changes
```
npm install
gulp build:scripts
```
##### Copy out the 'www' directory as the web-root, and run it up on pretty much any webserver. Then deploy the database
```
cd InteractiveClassroom
cp -r www/ somewhereawesome/
firebase login
firebase use --add
firebase deploy --only database
```
##### Or deploy the project directly and database to firebase hosting
```
cd InteractiveClassroom
firebase login
firebase use --add
firebase deploy
```

#### Add Phillips hue bridges
Simply add the bride's information to the root of your firebase database in the following structure.
To Generate a new username for a phillips hue bridge see here:  http://www.developers.meethue.com/documentation/configuration-api
Remove proxytarget unless using https, see the below section [https proxy](#A-note-on-HTTPS-and-phillips-hue).
```json
"Hue" : {
  "UniqueName" : {
    "Name" : "Bridge Name",
    "ip" : "http://ip.of.the.bridge or https://node.js.proxy.ip",
    "proxytarget" : "",
    "username" : "phillipsHueBridgeUniqueUsername"
  }
}
```

#### A note on HTTPS and phillips hue
Phillips hue currently does not have HTTPS support..
Browser security features disable 'Mixed Content' when using https, preventing non ssl http requests.
As a work around there is a simple nodejs https > http proxy included 'proxy.js' to be run somewhere on your network.
Simply modify the targets object contained in 'proxy.js' by adding each hue bridge with a unique ID and ip to direct the traffic too. This unique ID is then referenced by a header in the HTTP request to the proxy.
```js
var targets = {
  'bridge.dev': 'http://155.12.11.40',
  'bridge.one' : 'http://155.12.11.41'
};

const options = {
  key: fs.readFileSync('<Your ssl key.pem>', 'utf8'),
  cert: fs.readFileSync('<Your ssl certificate.pem>', 'utf8')
};
```

Then run the proxy using 'forever' for nodejs
```
npm install -g forever
forever start proxy.js
```

### Development
##### Repeat deployment steps then
```
bower install
npm install --dev
gulp build:all
```
##### Run the dev webserver and watch for file changes
```
gulp
```
