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
        this.setStub = sinon.stub(this, 'set').callsFake((name, value) => params[name] = value);
        this.enqueueActionStub = sinon.stub(this, 'enqueueAction').callsFake((action) => action && action.invokeCallback && action.invokeCallback(true));
        sinon.stub(this, 'getReference');
        sinon.stub(this, 'getRoot').callsFake(() => {
            return this.rootComponent || (this.rootComponent = new componentFactory());
        })
        sinon.stub(this, 'reportError');
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
    createComponents(componentDefs, callback) {
        const result = componentDefs
            .map(def => this.createComponent(def[0], def[1]))
        if (callback) {
            callback(result, 'SUCCESS', result.map( _ => 'SUCCESS'));
        }
        return result;
    }
    getCallback(callback) {
        return function() {
            callback && callback();
        }
    }
    getComponent(id) {
        return this.params[id];
    }
    getReference() {}
    getRoot() {}
    getToken(name) {
        return this.params['token.' + name]
    }
    log(value, err) {
        console && console.log(value, err)
    }
    reportError() {}
}