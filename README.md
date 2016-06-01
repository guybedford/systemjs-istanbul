### Example

```
npm install systemjs-istanbul
```

Integrate into a test runner with:

test.js
```javascript
var System = require('systemjs');
var systemIstanbul = require('systemjs-istanbul');

var fs = require('fs');

// hook coverage generation into SystemJS pipeline
systemIstanbul.hookSystemJS(System, function exclude(address) {
  // files to ignore coverage
  return !address.match(/example-app|example-tests/);
});

// run any custom test code through systemjs
System.import('tests.js')
.then(function() {
  // process coverage
  var coverage = systemIstanbul.remapCoverage();
  fs.writeFileSync('coverage.json', JSON.stringify(coverage, null, 2));  
})
.catch(function(e) {
  console.log(e && e.stack || e);
})
```

Run test and generate coverage report:

```
node test.js
istanbul report
open coverage/lcov-report/index.html
```