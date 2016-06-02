// simple SystemJS compilation server
// precompiles SystemJS translations
var Builder = require('systemjs-builder');

var istanbulSystem = require('../index.js');
var fs = require('fs');

var builder = new Builder('.');

// paths are the environment-specific config which comes first
builder.config({
  paths: {
    'node_modules/': '../node_modules/'
  },
  meta: {
    '*.js': {
      // ensure plugin-babel doesn't output ESM code in translate for compilation
      outputESM: false
    }
  }
});
builder.loadConfig('./test.config.js');

// hook coverage generation into the loader translate to serve instrumented code to the browser
istanbulSystem.hookSystemJS(builder.loader, function exclude(address) {
  return false;
});

// this should really be http/2, gzipped, cached...
var http = require('http');

var server = http.createServer(function(req, res) {
  if (req.method == 'GET') {
    builder.compile(req.url.substr(1))
    .then(function(output) {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(output.source);
    })
    .catch(function(e) {
      if (e.originalErr && e.originalErr.code == 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/plain'});
        res.end('Not found');
      }
      else {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        console.log(e.stack || e);
        res.end((e.stack || e).toString());
      }
    });
  }
  // accept a special coverage generation request
  else if (req.method == 'POST' && req.url == '/generate-coverage') {
    var data = [];
    req.on('data', data.push.bind(data));
    req.on('end', function(chunk) {
      data.push(chunk);
      res.end();

      var coverage = istanbulSystem.remapCoverage(JSON.parse(data.join('')));
      fs.writeFileSync('coverage.json', JSON.stringify(coverage, null, 2));
      server.close();
      process.exit(0);
    });
  }
  else {
    res.statusCode = 401;
    res.end();
  }
});

server.listen(8080);