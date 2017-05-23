'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var sinon = require('sinon');

var AuraUtil = function AuraUtil() {
    _classCallCheck(this, AuraUtil);

    this.addClass = sinon.spy();
    this.removeClass = sinon.spy();
};

exports.AuraUtil = AuraUtil;