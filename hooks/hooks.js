const fs = require('fs');

// Check for /src/aura/Component/ComponentController.js or /src/aura/Component/ComponentHelper.js pattern
export const isAuraFile = (filename) => /src\/aura\/[^/]+\/.+(Controller|Helper|Renderer).js$/.test(filename);

// Add module.exports for every aura file
export const auraCodeTransformer = (code) => {
  return 'module.exports=' + code;
}


export function hookIstanbul(_istanbul) {
  // This method relies on a --post-require-hook mocha-aura parameter for istanbul cover
  var originalHookRequire = _istanbul.hook.hookRequire;

  _istanbul.hook.hookRequire = function(matcher, transformer, options) {
    function transformerWrapper(code, filename) {
      return transformer(isAuraFile(filename) ?  auraCodeTransformer(code) : code, filename);
    }
    return originalHookRequire(matcher, transformerWrapper, options);
  }
}

export function hookRequire(_Module) {
  const originalJsExtension = _Module._extensions['.js'];

  _Module._extensions['.js'] = function (module, filename) {
      
      if (!isAuraFile(filename)) {
        return originalJsExtension(module, filename);
      }

      var code = auraCodeTransformer(fs.readFileSync(filename, 'utf8'), filename);
      module._compile(code, filename);
  };
}

export const runUnderIstanbul = (_cache) => Object.keys(_cache)
                          .some((key) => key.indexOf('node_modules/istanbul') !== -1);



