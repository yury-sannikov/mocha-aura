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
    }
    setParams(params) {
        this.params = params;
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