'use strict';

var _hooks = require('./hooks');

var Module = require('module');


if ((0, _hooks.runUnderIstanbul)(require.cache)) {
  var istanbul = require('istanbul');
  (0, _hooks.hookIstanbul)(istanbul);
} else {
  (0, _hooks.hookRequire)(Module);
}

// Conform to post-require-hook for istanbul
module.exports = function (matchFn, transformer, verbose) {
  return null;
};