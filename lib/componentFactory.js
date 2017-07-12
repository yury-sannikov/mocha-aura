const sinon = require('sinon');
const _ = require('lodash');
import { eventFactory } from './eventFactory'

const DefaultComponentAdapter = 'default'
const WellKnownComponents = ['aura:', 'force:', 'forceChatter:', 'lightning:', 'ui:', 'c:']

let ComponentAdapters = {
    [DefaultComponentAdapter]: instance => instance
}

export function componentFactory(params = {}, type = DefaultComponentAdapter) {
    let instance = new Component(params, type);
    let adapterName = type.toLowerCase().replace('markup://', '')
    let adapter = ComponentAdapters[adapterName];
    if (!adapter) {
        if (!_.some(WellKnownComponents, name => adapterName.startsWith(name))) {
            /*eslint no-console: 0*/
            console.warn(`Unable to find component adapter ${type}`);
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
        this.getStub = sinon.stub(this, 'get').callsFake((name) => {
            if (name.startsWith('v.') || name.startsWith('c.') || name.startsWith('e.')) {
                name = name.substring(2);
            }
            return _.get(this.params, name);
        });

        this.setStub = sinon.stub(this, 'set').callsFake((name, value) => {
            if (name.startsWith('v.') || name.startsWith('c.') || name.startsWith('e.')) {
                name = name.substring(2);
            }
            _.set(this.params, name, value);
        });
        sinon.stub(this, 'addEventHandler');
        sinon.stub(this, 'addHandler');
        sinon.stub(this, 'addValueHandler');
        sinon.stub(this, 'addValueProvider');
        sinon.stub(this, 'autoDestroy');
        sinon.stub(this, 'destroy');
        sinon.stub(this, 'removeEventHandler');
    }

    get() {
    }
    set() {
    }

    find(name) {
        let typeOrComponent = this.params.findMap[name];
        if (typeOrComponent instanceof Component) {
            return typeOrComponent;
        }
        if (!typeOrComponent && this.params.findMap.hasOwnProperty(name)) {
            return typeOrComponent;
        }
        if (typeOrComponent === true) {
            typeOrComponent = DefaultComponentAdapter
        }
        const component = this.params.findMap[name] = componentFactory(this.params, typeOrComponent);
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
        return true;
    }

}