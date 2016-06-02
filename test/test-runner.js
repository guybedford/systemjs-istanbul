var browser = require('@system-env').browser;

require('test.config.js');

module.exports = function(Mocha) {
  return System.import('example-tests/index.js')
  .then(function(tests) {
    // run the tests
    var runner = new Mocha({
      ui: 'exports',
      reporter: browser ? 'html' : 'spec'
    });

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
