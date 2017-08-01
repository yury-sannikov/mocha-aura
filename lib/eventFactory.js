import { stubifyInstanceOnDemand } from './sinonHelpers'

export function eventFactory(params = {}) {
    return stubifyInstanceOnDemand(Event, new Event(params));
}
const FAKE_EVENT_NAME = 'mocha-aura-fake-event'

class Event {
    constructor(params) {
        this.params = params || {};
    }
    setParams(params) {
        this.params = params;
    }
    setParam(key, value) {
        this.params[key] = value;
    }
    getParams() {
        return this.params;
    }
    getEventType() {
        return 'APPLICATION'
    }
    getName() {
        return this.params.eventName || FAKE_EVENT_NAME
    }
    getParam(name) {
        return this.params[name]
    }
    getPhase() {
        return 'default'
    }
    getSource() {
        return null
    }
    getType() {
        return `c:${FAKE_EVENT_NAME}`
    }
    fire() {}
    pause() {}
    preventDefault() {}
    resume() {}
    stopPropagation() {}
    

}