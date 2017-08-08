const fs = require('fs');
const path = require('path');

let OS_Regexps = {}

// Check for /src/aura/Component/ComponentController.js or /src/aura/Component/ComponentHelper.js pattern
const buidRegexp = sep => {
  const separator = '\\' + sep;
  let regex = `src${separator}aura${separator}[^${separator}]+${separator}.+(Controller|Helper|Renderer).js$`;
  // Override regex with custom supplied regex
  if (process.env.AURA_HOOK_REGEX) {
    regex = process.env.AURA_HOOK_REGEX
  }
  return new RegExp(regex)
}
export const isAuraFile = (filename, sep = path.sep) => {
  let auraRegex = OS_Regexps[sep]
  if (!auraRegex) {
    auraRegex = OS_Regexps[sep] = buidRegexp(sep);
  }
  return auraRegex.test(filename);
}

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

export const runUnderIstanbul = (_cache, sep = path.sep) => Object.keys(_cache)
                          .some((key) => key.indexOf(`node_modules${sep}istanbul`) !== -1);



