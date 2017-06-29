const sinon = require('sinon');

function apexCallFactory(params = {}) {
    return new ApexCall(params);
}

function apexSuccessResult(response = {}) {
    return new ApexCallResult(response);
}

function apexErrorResult(message) {
    return new ApexCallResult(null, message);
}

exports.apexCallFactory = apexCallFactory;
exports.apexSuccessResult = apexSuccessResult;
exports.apexErrorResult = apexErrorResult;


class ApexCall {
    constructor(result, invokeCallbackOnEnqueue = true) {
        this.params = null;
        this.result = result;
        this.invokeCallbackOnEnqueue = invokeCallbackOnEnqueue;
        this.isBackground = false;
        this.setAbortable = false;
        sinon.stub(this, 'setStorable');
        sinon.stub(this, 'setAbortable');
    }
    setParams(params) {
        this.params = params;
    }
    setParam(key, value) {
        this.params = Object.assign(this.params, {[key] : value});
    }
    getParams() {
        return this.params;
    }
    setCallback(ctx, callback) {
        this.ctx = ctx;
        this.callback = callback;
    }
    invokeCallback(fromEnqueue = false) {
        if (fromEnqueue && !this.invokeCallbackOnEnqueue) {
            return;
        }
        this.callback && this.callback.bind(this.ctx)(this.result);
    }
    getError() {
        return this.result.getError();
    }
    getParam(name) {
        return this.params ? this.params[name] : null;
    }
    getReturnValue() {
        return this.result;
    }
    getState() {
        return this.result.getState();
    }
    isBackground() {
        return this.isBackground;
    }
    setAbortable() {
    }
    setBackground() {
        this.isBackground = true;
    }
    setStorable() {
    }
}

class ApexCallResult {
    constructor(response, errorMessage = null) {
        this.response = response;
        this.errorMessage = errorMessage;
    }
    getState() {
        return this.errorMessage ? 'ERROR' : 'SUCCESS'
    }
    getError() {
        return this.errorMessage ? [{message: this.errorMessage}] : []
    }
    getReturnValue() {
        return this.response;
    }
}