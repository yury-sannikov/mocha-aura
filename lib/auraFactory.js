const sinon = require('sinon');

const { AuraUtil } = require('./auraUtil')

exports.auraFactory = function auraFactory(params = {}) {
    return new Aura(params);
}

const { componentFactory } = require('./componentFactory')

class Aura {
    constructor(params) {
        this.params = params;
        this.util = new AuraUtil();
        this.getStub = sinon.stub(this, 'get', (name) => params[name]);
    }

    get(name) {
    }

    createComponent(type, attributes, callback) {
        this.createComponent.type = type;
        this.createComponent.attributes = attributes;
        // Get component instance.
        // Use existing component instance if set
        // Create new default component if component not set
        let { component } = this.createComponent;
        if (!component) {
            component = new componentFactory(attributes, type);
        } else {
            this.createComponent.component = null;
        }
        if (callback) {
            callback(component, 'SUCCESS', ['SUCCESS']);
        }
        return component;
    }
    getCallback(callback) {
        return function() {
            callback && callback();
        }
    }
}