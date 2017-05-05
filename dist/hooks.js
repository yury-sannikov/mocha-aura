'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.hookIstanbul = hookIstanbul;
exports.hookRequire = hookRequire;
var fs = require('fs');

// Check for /src/aura/Component/ComponentController.js or /src/aura/Component/ComponentHelper.js pattern
var isAuraFile = exports.isAuraFile = function isAuraFile(filename) {
  return (/src\/aura\/[^\/]+\/.+(Controller|Helper).js$/.test(filename)
  );
};

// Add module.exports for every aura file
var auraCodeTransformer = exports.auraCodeTransformer = function auraCodeTransformer(code) {
  return 'module.exports=' + code;
};

function hookIstanbul(_istanbul) {
  // This method relies on a --post-require-hook mocha-aura parameter for istanbul cover
  var originalHookRequire = _istanbul.hook.hookRequire;

  _istanbul.hook.hookRequire = function (matcher, transformer, options) {
    function transformerWrapper(code, filename) {
      return transformer(isAuraFile(filename) ? auraCodeTransformer(code) : code, filename);
    }
    return originalHookRequire(matcher, transformerWrapper, options);
  };
}

function hookRequire(_Module) {
  var originalJsExtension = _Module._extensions['.js'];

  _Module._extensions['.js'] = function (module, filename) {

    if (!isAuraFile(filename)) {
      return originalJsExtension(module, filename);
    }

    var code = auraCodeTransformer(fs.readFileSync(filename, 'utf8'), filename);
    module._compile(code, filename);
  };
}

var runUnderIstanbul = exports.runUnderIstanbul = function runUnderIstanbul(_cache) {
  return Object.keys(_cache).some(function (key) {
    return key.indexOf('node_modules/istanbul') !== -1;
  });
};