/*
 * Simple SystemJS hook for Istanbul
 */
var istanbul = require('istanbul');
var remapIstanbul = require('remap-istanbul/lib/remap.js');
var fs = require('fs');
var path = require('path');

var istanbulGlobal;

var _originalSources = {};
exports.originalSources = _originalSources;

var filePrefixRExp;
if (/^win/.test(process.platform)) {
  // Windows adds the drive letter, so we must strip that too
  filePrefixRExp = /file:\/\/\/\w:\//;
} else {
  filePrefixRExp = /file:\/\/\//;
}
function fromFileURL(url) {
  return url.replace(filePrefixRExp);
}

exports.hookSystemJS = function(loader, exclude, coverageGlobal) {
  if (loader.translate.coverageAttached)
    return;

  if (coverageGlobal)
    istanbulGlobal = coverageGlobal;

  // attach istanbul coverage creation
  if (typeof global != 'undefined' && !istanbulGlobal)
    for (var g in global) {
      if (g.match(/\$\$cov_\d+\$\$/)) {
        istanbulGlobal = g;
        break;
      }
    }
  istanbulGlobal = istanbulGlobal || '__coverage__';

  var instrumenter = new istanbul.Instrumenter({
    coverageVariable: istanbulGlobal
  });

  var loaderTranslate = loader.translate;
  loader.translate = function(load) {
    var originalSource = load.source;
    return loaderTranslate.apply(this, arguments)
    .then(function(source) {
      if (load.metadata.format == 'json' || load.metadata.format == 'defined' || load.metadata.loader && load.metadata.loaderModule.build === false)
        return source;

      // excludes
      if (exclude && exclude(load.address))
        return source;

      // automatically exclude sources outside the baseURL
      if (load.address.substr(0, System.baseURL.length) != System.baseURL)
        return source;

      var name = load.address.substr(System.baseURL.length);

      _originalSources[name] = {
        source: originalSource,
        sourceMap: load.metadata.sourceMap
      };

      try {
        return instrumenter.instrumentSync(source, name);
      }
      catch (e) {
        var newErr = new Error('Unable to instrument "' + name + '" for istanbul.\n\t' + e.message);
        newErr.stack = 'Unable to instrument "' + name + '" for istanbul.\n\t' + e.stack;
        newErr.originalErr = e.originalErr || e;
        throw newErr;
      }
    });
  };
  loader.translate.coverageAttached = true;
}

function normalizeSourcePaths(sources) {
  if (!sources) return sources;
  Object.keys(sources).forEach(function (pathName) {
    sources[path.normalize(pathName)] = sources[pathName];
  });
  return sources;
}

exports.remapCoverage = function(coverage, originalSources) {
  coverage = coverage || global[istanbulGlobal];
  originalSources = normalizeSourcePaths(originalSources || _originalSources);
  var collector = remapIstanbul(coverage, {
    readFile: function(name) {
      return originalSources[name].source +
          (originalSources[name] && originalSources[name].sourceMap ? '\n//# sourceMappingURL=' + name.split('/').pop() + '.map' : '');
    },
    readJSON: function(name) {
      var originalSourcesObj = originalSources[name.substr(0, name.length - 4)];

      // non transpilation-created source map -> load the source map file directly
      if (!originalSourcesObj || !originalSourcesObj.sourceMap)
        return JSON.parse(fs.readFileSync(fromFileURL(name.substr(0, name.length - 4))));

      var sourceMap = originalSourcesObj.sourceMap;
      if (typeof sourceMap == 'string')
        sourceMap = JSON.parse(sourceMap);

      sourceMap.sourcesContent = sourceMap.sourcesContent || [];

      sourceMap.sources = sourceMap.sources.map((src, index) => {
        var sourcePath = path.relative(process.cwd(), path.resolve(path.dirname(name), sourceMap.sourceRoot || '.', src));
        if (originalSources[sourcePath] && !sourceMap.sourcesContent[index])
          sourceMap.sourcesContent[index] = originalSources[sourcePath].source;
        return sourcePath;
      });

      return sourceMap;
    },
    warn: function(msg) {
      if (msg.toString().indexOf('Could not find source map for') != -1)
        return;
    }
  });
  var coverage = collector.getFinalCoverage();
  Object.keys(coverage).forEach(function(key) {
    coverage[key].code = [coverage[key].code || originalSources[key].source];
  });
  return coverage;
};
