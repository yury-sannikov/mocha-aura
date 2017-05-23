exports.eventFactory = function eventFactory(params = {}) {
    return new Event(params);
}

class Event {
    constructor(params) {
        this.params = params;
    }
    getParams() {
        return this.params;
    }
}