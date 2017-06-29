'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var sinon = require('sinon');
var _ = require('lodash');

var _require = require('./eventFactory'),
    eventFactory = _require.eventFactory;

var ComponentAdapters = {
    'default': function _default(instance) {
        return instance;
    }
};

function componentFactory() {
    var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'default';

    var instance = new Component(params, type);
    var adapter = ComponentAdapters[type.toLowerCase()];
    return adapter ? adapter(instance, params) : instance;
}

function useComponentAdapters(registrator) {
    var register = function register(componentType, adapter) {
        ComponentAdapters[componentType.toLowerCase()] = adapter;
    };
    registrator({ register: register });
}

exports.componentFactory = componentFactory;
exports.useComponentAdapters = useComponentAdapters;

var Component = function () {
    function Component(params, type) {
        var _this = this;

        _classCallCheck(this, Component);

        this.params = Object.assign({}, {
            findMap: {}
        }, params);
        this.type = type || 'default';
        this.getStub = sinon.stub(this, 'get').callsFake(function (name) {
            if (name.startsWith('v.') || name.startsWith('c.') || name.startsWith('e.')) {
                name = name.substring(2);
            }
            return _.get(_this.params, name);
        });

        this.setStub = sinon.stub(this, 'set').callsFake(function (name, value) {
            if (name.startsWith('v.')) {
                name = name.substring(2);
            }
            _this.params[name] = value;
        });
        sinon.stub(this, 'addEventHandler');
        sinon.stub(this, 'addHandler');
        sinon.stub(this, 'addValueHandler');
        sinon.stub(this, 'addValueProvider');
        sinon.stub(this, 'autoDestroy');
        sinon.stub(this, 'destroy');
        sinon.stub(this, 'removeEventHandler');
    }

    _createClass(Component, [{
        key: 'get',
        value: function get(name) {}
    }, {
        key: 'set',
        value: function set(name, value) {}
    }, {
        key: 'find',
        value: function find(name) {
            var typeOrComponent = this.params.findMap[name];
            if (typeOrComponent instanceof Component) {
                return typeOrComponent;
            }
            if (!typeOrComponent && this.params.findMap.hasOwnProperty(name)) {
                return typeOrComponent;
            }
            return componentFactory(this.params, typeOrComponent);
        }
    }, {
        key: 'getLocalId',
        value: function getLocalId() {
            return this.params['aura:id'];
        }
    }, {
        key: 'clearReference',
        value: function clearReference(key) {
            delete this.params[key];
        }
    }, {
        key: 'getConcreteComponent',
        value: function getConcreteComponent() {
            return this;
        }
    }, {
        key: 'getElement',
        value: function getElement() {
            return this;
        }
    }, {
        key: 'getElements',
        value: function getElements() {
            return [this];
        }
    }, {
        key: 'getEvent',
        value: function getEvent(name) {
            return this.params[name] || eventFactory();
        }
    }, {
        key: 'getGlobalId',
        value: function getGlobalId() {
            return 'global-' + this.params['aura:id'];
        }
    }, {
        key: 'getName',
        value: function getName() {
            return this.type;
        }
    }, {
        key: 'getType',
        value: function getType() {
            return this.type;
        }
    }, {
        key: 'getReference',
        value: function getReference(key) {
            return this.params[key];
        }
    }, {
        key: 'getSuper',
        value: function getSuper() {
            return null;
        }
    }, {
        key: 'getVersion',
        value: function getVersion() {
            return '1.0';
        }
    }, {
        key: 'isConcrete',
        value: function isConcrete() {
            return true;
        }
    }, {
        key: 'isInstanceOf',
        value: function isInstanceOf(name) {
            return this.type === name;
        }
    }, {
        key: 'isValid',
        value: function isValid() {
            return true;
        }
    }]);

    return Component;
}();