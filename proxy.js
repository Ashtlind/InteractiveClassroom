var http = require('http'),
    httpProxy = require('http-proxy');

httpProxy.createServer({
  target: {
    host: '172.16.11.40',
    port: 80
  }
}).listen(8009);
