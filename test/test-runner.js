var Mocha = require('mocha');

module.exports = function(System) {

  // standard systemjs configuration
  System.config({
    paths: {
      'app/': 'example-app/'
    },
    transpiler: 'plugin-babel',
    map: {
      'plugin-babel': '../node_modules/systemjs-plugin-babel/plugin-babel.js',
      'systemjs-babel-build': '../node_modules/systemjs-plugin-babel/systemjs-babel-browser.js',
      'unexpected': '../node_modules/unexpected/unexpected.js'
    }
  });

  // run the tests
  var runner = new Mocha({
    ui: 'exports',
    reporter: 'spec'
  });

  return System.import('./example-tests/index.js').then(function(tests) {
    runner.suite.emit('require', tests);

    return new Promise((resolve, reject) => {
      runner.run((failures) => {
        if (failures)
          reject(failures);
        else
          resolve();
      });
    });
  });
};
