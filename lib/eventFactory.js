const sinon = require('sinon');

exports.eventFactory = function eventFactory() {
    return new Event();
}

class Event {
    constructor() {
        this.fire = sinon.spy();
    }
    setParams(params) {
        this.params = params;
    }
    getParams() {
        return this.params;
    }
}