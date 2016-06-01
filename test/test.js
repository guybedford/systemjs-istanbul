var System = require('systemjs');
var istanbulSystem = require('../index.js');
var runTests = require('./test-runner.js');

var fs = require('fs');

// hook coverage into SystemJS
istanbulSystem.hookSystemJS(System, function exclude(address) {
  // files to ignore coverage
  return !address.match(/example-app|example-tests/);
});

return runTests(System)
.then(function() {
  // process coverage
  var coverage = istanbulSystem.remapCoverage();
  fs.writeFileSync('coverage.json', JSON.stringify(coverage, null, 2));  
})
.catch(function(e) {
  console.log(e && e.stack || e);
})