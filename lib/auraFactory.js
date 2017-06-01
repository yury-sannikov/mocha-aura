const sinon = require('sinon');

const { AuraUtil } = require('./auraUtil')

function auraFactory(params = {}) {
    return new Aura(params);
}

exports.auraFactory = auraFactory;

const { componentFactory } = require('./componentFactory')

class Aura {
    constructor(params) {
        this.params = params;
        this.util = new AuraUtil();
        this.getStub = sinon.stub(this, 'get').callsFake((name) => params[name]);
        this.enqueueActionStub = sinon.stub(this, 'enqueueAction').callsFake((action) => action && action.invokeCallback && action.invokeCallback(true));
    }
    
    setParams(params) {
        Object.assign(this.params, params);
    }

    get(name) {
    }
    
    enqueueAction() {
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