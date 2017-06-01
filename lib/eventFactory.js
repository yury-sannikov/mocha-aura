const sinon = require('sinon');

exports.eventFactory = function eventFactory(params = {}) {
    return new Event(params);
}

class Event {
    constructor(params) {
        this.params = params;
        this.fire = sinon.spy();
    }
    setParams(params) {
        this.params = params;
    }
    getParams() {
        return this.params;
    }
}