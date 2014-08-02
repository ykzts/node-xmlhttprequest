
var assert = require('assert');
var http = require('http');
var url = require('url');


function parseQueryString(uri) {
  var urlObj = url.parse(uri, true);
  return urlObj.query;
}

function receiveRequest(req, res) {
  var query = parseQueryString(req.url);
  var body = query.body || '';
  res.writeHead(+(query.status || 200), {
    'Content-Type': 'text/plain'
  });
  res.write(body);
  res.end();
}

var server = http.createServer();
server.on('request', receiveRequest);

var port = 10000;

(function retry(port) {
  try {
    server.listen(port, function() {
      process.send({ baseUri: 'http://127.0.0.1:' + port });
    });
  } catch (e) {
    retry(port + 1);
  }
})(port);
