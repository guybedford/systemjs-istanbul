Provides a SystemJS `translate` hook for injecting Istanbul coverage reports into a SystemJS application.

In addition it comes with bundled support for the [remap-istanbul](https://github.com/SitePen/remap-istanbul) project. This provides
full coverage reports to the original sources be it ES6 or JSX etc, regardless of module format or SystemJS loader plugins used.

> This is an experimental project, use at your own risk and support may be limited.

### Using the coverage hook

The Istanbul coverage can be hooked into SystemJS through NodeJS via:

```
npm install systemjs-istanbul-hook
```

```javascript
var systemIstanbul = require('systemjs-istanbul-hook');

systemIstanbul.hookSystemJS(SystemJS, function exclude(address) {
  // custom exclude function to skip coverage instrumentation for files
  return false;
});
```

There is an optional third parameter to the hook which is the `coverageGlobal`, by default `__coverage__` is used.

### Remapping coverage with source maps

Having hooked the loader, any code run through `SystemJS.import` will start populating the global `__coverage__` object.

After running the code being tested, coverage can be remapped with source maps via:

```javascript
var remappedCoverage = systemIstanbul.remapCoverage();
fs.writeFileSync('coverage.json', JSON.stringify(remappedCoverage, null, 2));
```

The full report against original sources can then be viewed via istanbul commandline operations:

```
cd folder/containing/coverage.json
istanbul report
```

and then viewing `coverage/lcov-report/index.html`.

### Browser support

There are two ways to achieve coverage reports for browser code with this project:

#### 1. Hook the builder, then create a bundle with coverage instrumentation

With this approach, we hook the builder via:

```javascript
var Builder = require('systemjs-builder');
var systemIstanbul = require('systemjs-istanbul-hook');

var builder = new Builder('.');

// hook the builder loader before creating the bundle
systemIstanbul.hookSystemJS(builder.loader);

builder.bundle('test.js', 'out.js');

// having completed instrumentation, save the originalSources data
var originalSources = systemIstanbul.originalSources;
```

The rest is just wiring at this point - we then execute the bundle in the browser, and collect the `__coverage__` global from the browser,
before remapping back in the server:

```javascript
var remappedCoverage = systemIstanbul.remapCoverage(coverageFromBrowser, originalSources);
fs.writeFileSync('coverage.json', JSON.stringify(remappedCoverage, null, 2));
```

#### 2. Hook the builder, then use it to create a single-file precompilation server

This approach is identical to (1) above, except that instead of building a bundle, we can host a server that precompiles individual files:

```javascript
var Builder = require('systemjs-builder');
var systemIstanbul = require('systemjs-istanbul-hook');

var builder = new Builder('.');

// hook the builder loader before creating the bundle
systemIstanbul.hookSystemJS(builder.loader);

builder.compile(requestedModule).then(function(output) {
  respondWith(output.source);
});
```

Collecting the `__coverage__` from the browser and remapping it is then also identical to (1) above.

An example of this technique is included at https://github.com/guybedford/systemjs-istanbul/blob/master/test/compilation-server.js, which runs against the browser file https://github.com/guybedford/systemjs-istanbul/blob/master/test/test-browser.html.

### License

MIT