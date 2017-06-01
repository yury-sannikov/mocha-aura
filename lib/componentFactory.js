const sinon = require('sinon');
const _ = require('lodash');

let ComponentAdapters = {
    'default': instance => instance
}

function componentFactory(params = {}, type = 'default') {
    let instance = new Component(params);
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
    constructor(params) {
        this.params = Object.assign({}, {
            findMap: {}
        }, params);

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
}