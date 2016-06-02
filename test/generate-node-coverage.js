var System = require('systemjs');
var istanbulSystem = require('../index.js');
var Mocha = require('mocha');

var fs = require('fs');

// hook coverage into SystemJS
istanbulSystem.hookSystemJS(System, function exclude(address) {
  // files to ignore coverage
  // return !address.match(/example-app|example-tests/);
  return false;
});

// paths are the environment-specific configuration
System.config({
  paths: {
    'node_modules/': '../node_modules/',
    'app/': './example-app/'
  }
});

System.import('./test-runner.js')
.then(function(runTests) {
  return runTests(Mocha);
})
.then(function() {
  // process coverage
  var coverage = istanbulSystem.remapCoverage();
  fs.writeFileSync('coverage.json', JSON.stringify(coverage, null, 2));  
})
.catch(function(e) {
  console.log(e && e.stack || e);
});