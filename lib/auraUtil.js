const sinon = require('sinon');
const _ = require('lodash');

class AuraUtil {
    constructor() {
        this.addClass = sinon.spy();
        this.removeClass = sinon.spy();
        this.isEmpty = obj => {
            if (obj === undefined || obj === null || obj === '') {
                return true;
            }
            if (Array.isArray(obj)) {
                return obj.length === 0;
            } else if (typeof obj === 'object' && Object.prototype.toString.call(obj) === '[object Object]') {
                return Object.keys(obj).length === 0;
            }
            return false;
        };
        this.isUndefinedOrNull = obj => {
            return obj === undefined || obj === null;
        };
    }
}

exports.AuraUtil = AuraUtil
