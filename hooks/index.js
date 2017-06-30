const Module = require('module');
import { hookIstanbul, hookRequire, runUnderIstanbul } from './hooks';

if (runUnderIstanbul(require.cache)) {
  const istanbul = require('istanbul');  
  hookIstanbul(istanbul);
} else {
  hookRequire(Module);
}

// Conform to post-require-hook for istanbul
module.exports = function() {
  return null;
}