const sinon = require('sinon');

class AuraUtil {
    constructor() {
        this.addClass = sinon.spy();
        this.removeClass = sinon.spy();
    }
}

exports.AuraUtil = AuraUtil
