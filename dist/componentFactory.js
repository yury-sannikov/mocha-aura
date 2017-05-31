'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var sinon = require('sinon');

var ComponentAdapters = {
    'default': function _default(instance) {
        return instance;
    }
};

function componentFactory() {
    var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'default';

    var instance = new Component(params);
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
    function Component(params) {
        var _this = this;

        _classCallCheck(this, Component);

        this.params = Object.assign({}, {
            findMap: {}
        }, params);

        this.getStub = sinon.stub(this, 'get').callsFake(function (name) {
            return _this.params[name] || _this.params[name.substring(2)];
        });

        this.setStub = sinon.stub(this, 'set').callsFake(function (name, value) {
            _this.params[name] = value;
        });
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
            return componentFactory(this.params, typeOrComponent);
        }
    }, {
        key: 'getLocalId',
        value: function getLocalId() {
            return this.params['aura:id'];
        }
    }]);

    return Component;
}();