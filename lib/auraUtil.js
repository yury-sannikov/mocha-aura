const sinon = require('sinon');
const _ = require('lodash');

class AuraUtil {
    constructor() {
        this.addClass = sinon.spy();
        this.removeClass = sinon.spy();
        this.isEmpty = _.isEmpty;
    }
}

exports.AuraUtil = AuraUtil
