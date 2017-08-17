const _ = require('lodash');
import { eventFactory } from './eventFactory'
import { stubifyInstanceOnDemand } from './sinonHelpers'

const DefaultComponentAdapter = 'default'
const WellKnownComponents = ['aura:', 'force:', 'forceChatter:', 'lightning:', 'ui:', 'c:']

let ComponentAdapters = {
    [DefaultComponentAdapter]: instance => instance
}

function componentFactoryForArray(params, arrayOfTypes) {
    return arrayOfTypes.map(typeOrComponent => componentFactory(params, typeOrComponent));
}

export function componentFactory(params = {}, typeOrComponent = DefaultComponentAdapter) {
    if (Array.isArray(typeOrComponent)) {
        throw new Error('Unexpected type argument')
    }

    if (typeOrComponent === true) {
        typeOrComponent = DefaultComponentAdapter
    } else if (typeOrComponent instanceof Component) {
        return typeOrComponent;
    } else if (typeOrComponent === null) {
        return null;
    }

    let instance = stubifyInstanceOnDemand(Component, new Component(params, typeOrComponent));
    let adapterName = typeOrComponent.toLowerCase().replace('markup://', '')
    let adapter = ComponentAdapters[adapterName];
    if (!adapter) {
        if (!_.some(WellKnownComponents, name => adapterName.startsWith(name))) {
            /*eslint no-console: 0*/
            console.warn(`Unable to find component adapter ${typeOrComponent}`);
        }
        adapter = ComponentAdapters[DefaultComponentAdapter];
    }
    return adapter(instance, params);
}

export function useComponentAdapters(registrator) {
    const register = (componentType, adapter) => {
        const adapterName = componentType.toLowerCase();
        ComponentAdapters[adapterName] = adapter
    }
    registrator({register});
}

class Component {
    constructor(params, type) {
        this.params = Object.assign({}, {
            findMap: {}
        }, params);
        this.type = type || 'default';
        this.destroyed = false;
    }
    get(name) {
        if (name.startsWith('v.') || name.startsWith('c.') || name.startsWith('e.')) {
            name = name.substring(2);
        }
        return _.get(this.params, name);
    }
    set(name, value) {
        if (name.startsWith('v.') || name.startsWith('c.') || name.startsWith('e.')) {
            name = name.substring(2);
        }
        _.set(this.params, name, value);
    }
    find(name) {
        let typeOrComponent = this.params.findMap[name];
        if (!typeOrComponent && this.params.findMap.hasOwnProperty(name)) {
            return typeOrComponent;
        }
        const defaultParams = {
            'aura:id': name
        }
        
        const component = this.params.findMap[name] = (Array.isArray(typeOrComponent) ? 
            componentFactoryForArray(defaultParams, typeOrComponent) : 
            componentFactory(defaultParams, typeOrComponent))
        return component;
    }
    getLocalId() {
        return this.params['aura:id'];
    }
    clearReference(key) {
        delete this.params[key];
    }
    getConcreteComponent() {
        return this;
    }
    getElement() {
        return this;
    }
    getElements() {
        return [this];
    }
    getEvent(name) {
        return this.params[name] || eventFactory();
    }
    getGlobalId() {
        return `global-${this.params['aura:id']}`;
    }
    getName() {
        return this.type;
    }
    getType() {
        return this.type;
    }
    getReference(key) {
        return this.params[key];
    }
    getSuper() {
        return null;
    }
    getVersion() {
        return '1.0';
    }
    isConcrete() {
        return true;
    }
    isInstanceOf(name) {
        return this.type === name;
    }
    isValid() {
        return !this.destroyed;
    }
    addEventHandler() {}
    addHandler() {}
    addValueHandler() {}
    addValueProvider() {}
    autoDestroy() {}
    destroy() {
        this.destroyed = true;
    }
    removeEventHandler() {}

}