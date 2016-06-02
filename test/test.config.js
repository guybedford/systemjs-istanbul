// standard systemjs configuration
System.config({
  transpiler: 'plugin-babel',
  map: {
    'plugin-babel': 'node_modules/systemjs-plugin-babel/plugin-babel.js',
    'systemjs-babel-build': 'node_modules/systemjs-plugin-babel/systemjs-babel-browser.js',
    'mocha': 'node_modules/mocha/mocha.js',
    'unexpected': 'node_modules/unexpected/unexpected.js',
    'ts': 'node_modules/plugin-typescript/',
    'typescript': 'node_modules/typescript/'
  },
  meta: {
    '*.ts': {
      loader: 'ts'
    }
  },
  packages: {
    'ts': {
      'main': 'lib/plugin.js'
    },
    'typescript': {
      'main': 'lib/typescript.js',
      'meta': {
        'lib/typescript.js': {
          'exports': 'ts'
        }
      }
    }
  }
});