var http = require('http'),
    https = require('https'),
    httpProxy = require('http-proxy'),
    fs = require('fs');

var targets = {
  'bridge.dev': 'http://',
  'bridge.one' : 'http://'
};

const options = {
  key: fs.readFileSync('key.pem', 'utf8'),
  cert: fs.readFileSync('certificate.pem', 'utf8')
};

var proxy = httpProxy.createServer({});

https.createServer(options, function(req, res) {
  var tar = targets[req.headers.proxytarget];
  if (res!=undefined) {
    // Add CORS header to the response
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS, PUT, DELETE, HEAD');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'content-type, proxytarget');
  }
  if (tar!=undefined) {
    var options = {
      target: tar
    };
    proxy.web(req, res, options);
  } else {
    res.end();
  }
}).listen(8000);

proxy.on('error', function(err, req, res) {
  if (res!=undefined) {
    // End the request's connection safely on any errors
    res.end();
  }
});
