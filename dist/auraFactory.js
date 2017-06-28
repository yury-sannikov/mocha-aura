'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var sinon = require('sinon');

var _require = require('./auraUtil'),
    AuraUtil = _require.AuraUtil;

function auraFactory() {
    var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    return new Aura(params);
}

exports.auraFactory = auraFactory;

var _require2 = require('./componentFactory'),
    componentFactory = _require2.componentFactory;

var Aura = function () {
    function Aura(params) {
        var _this = this;

        _classCallCheck(this, Aura);

        this.params = params;
        this.util = new AuraUtil();
        this.getStub = sinon.stub(this, 'get').callsFake(function (name) {
            return params[name];
        });
        this.setStub = sinon.stub(this, 'set').callsFake(function (name, value) {
            return params[name] = value;
        });
        this.enqueueActionStub = sinon.stub(this, 'enqueueAction').callsFake(function (action) {
            return action && action.invokeCallback && action.invokeCallback(true);
        });
        sinon.stub(this, 'getReference');
        sinon.stub(this, 'getRoot').callsFake(function () {
            return _this.rootComponent || (_this.rootComponent = new componentFactory());
        });
        sinon.stub(this, 'reportError');
    }

    _createClass(Aura, [{
        key: 'setParams',
        value: function setParams(params) {
            Object.assign(this.params, params);
        }
    }, {
        key: 'get',
        value: function get(name) {}
    }, {
        key: 'enqueueAction',
        value: function enqueueAction() {}
    }, {
        key: 'createComponent',
        value: function createComponent(type, attributes, callback) {
            this.createComponent.type = type;
            this.createComponent.attributes = attributes;
            // Get component instance.
            // Use existing component instance if set
            // Create new default component if component not set
            var component = this.createComponent.component;

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
    }, {
        key: 'createComponents',
        value: function createComponents(componentDefs, callback) {
            var _this2 = this;

            var result = componentDefs.map(function (def) {
                return _this2.createComponent(def[0], def[1]);
            });
            if (callback) {
                callback(result, 'SUCCESS', result.map(function (_) {
                    return 'SUCCESS';
                }));
            }
            return result;
        }
    }, {
        key: 'getCallback',
        value: function getCallback(callback) {
            return function () {
                callback && callback();
            };
        }
    }, {
        key: 'getComponent',
        value: function getComponent(id) {
            return this.params[id];
        }
    }, {
        key: 'getReference',
        value: function getReference() {}
    }, {
        key: 'getRoot',
        value: function getRoot() {}
    }, {
        key: 'getToken',
        value: function getToken(name) {
            return this.params['token.' + name];
        }
    }, {
        key: 'log',
        value: function log(value, err) {
            console && console.log(value, err);
        }
    }, {
        key: 'reportError',
        value: function reportError() {}
    }]);

    return Aura;
}();