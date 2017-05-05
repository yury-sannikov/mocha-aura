const Module = require('module');
import { hookIstanbul, hookRequire, runUnderIstanbul } from '../hooks';

if (runUnderIstanbul) {
  const istanbul = require('istanbul');  
  hookIstanbul(istanbul);
} else {
  hookRequire(Module);
}

// Conform to post-require-hook for istanbul
module.exports = function(matchFn, transformer, verbose) {
  return null;
}