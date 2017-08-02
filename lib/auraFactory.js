import { stubifyInstance } from './sinonHelpers'
import { AuraUtil } from './auraUtil'

export function auraFactory(params = {}, stubifyParams) {
    return stubifyInstance(Aura, new Aura(params), stubifyParams);
}

import { componentFactory } from './componentFactory'

class Aura {
    constructor(params) {
        this.params = params;
        this.util = new AuraUtil();
    }
    
    setParams(params) {
        Object.assign(this.params, params);
    }

    get(name) {
        return this.params[name];
    }

    set(name, value) {
        this.params[name] = value;
    }
    
    enqueueAction(action) {
        action && action.invokeCallback && action.invokeCallback(true)
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
            callback(result, 'SUCCESS', result.map( () => 'SUCCESS'));
        }
        return result;
    }
    getCallback(callback) {
        return function(...args) {
            callback && callback(...args);
        }
    }
    getComponent(id) {
        return this.params[id];
    }
    getReference() {}
    getRoot() {
        return this.rootComponent || (this.rootComponent = new componentFactory());
    }
    getToken(name) {
        return this.params['token.' + name]
    }
    log(value, err) {
        /*eslint no-console: 0*/
        console && console.log(value, err)
    }
    reportError() {}
}