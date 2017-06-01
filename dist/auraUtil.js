'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var sinon = require('sinon');
var _ = require('lodash');

var AuraUtil = function AuraUtil() {
    _classCallCheck(this, AuraUtil);

    this.addClass = sinon.spy();
    this.removeClass = sinon.spy();
    this.isEmpty = _.isEmpty;
};

exports.AuraUtil = AuraUtil;