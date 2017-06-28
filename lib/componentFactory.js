const sinon = require('sinon');
const _ = require('lodash');
const { eventFactory } = require('./eventFactory');

let ComponentAdapters = {
    'default': instance => instance
}

function componentFactory(params = {}, type = 'default') {
    let instance = new Component(params, type);
    const adapter = ComponentAdapters[type.toLowerCase()];
    return adapter ? adapter(instance, params) : instance;
}

function useComponentAdapters(registrator) {
    const register = (componentType, adapter) => {
        ComponentAdapters[componentType.toLowerCase()] = adapter
    }
    registrator({register});
}

exports.componentFactory = componentFactory;
exports.useComponentAdapters = useComponentAdapters;

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
            if (name.startsWith('v.')) {
                name = name.substring(2);
            }
            this.params[name] = value;
        });
        sinon.stub(this, 'addEventHandler');
        sinon.stub(this, 'addHandler');
        sinon.stub(this, 'addValueHandler');
        sinon.stub(this, 'addValueProvider');
        sinon.stub(this, 'autoDestroy');
        sinon.stub(this, 'destroy');
        sinon.stub(this, 'removeEventHandler');
    }

    get(name) {
    }
    set(name, value) {
    }

    find(name) {
        const typeOrComponent = this.params.findMap[name];
        if (typeOrComponent instanceof Component) {
            return typeOrComponent;
        }
        if (!typeOrComponent && this.params.findMap.hasOwnProperty(name)) {
            return typeOrComponent;
        }
        return componentFactory(this.params, typeOrComponent);
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