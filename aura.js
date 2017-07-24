var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
  return typeof obj;
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
};











var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();





var defineProperty = function (obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
};

var sinon = require('sinon');

function eventFactory() {
    var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    return new Event(params);
}
var FAKE_EVENT_NAME = 'mocha-aura-fake-event';

var Event = function () {
    function Event(params) {
        classCallCheck(this, Event);

        this.params = params || {};
        this.fire = sinon.spy();
        this.pause = sinon.spy();
        this.preventDefault = sinon.spy();
        this.resume = sinon.spy();
        this.stopPropagation = sinon.spy();
    }

    createClass(Event, [{
        key: 'setParams',
        value: function setParams(params) {
            this.params = params;
        }
    }, {
        key: 'setParam',
        value: function setParam(key, value) {
            this.params[key] = value;
        }
    }, {
        key: 'getParams',
        value: function getParams() {
            return this.params;
        }
    }, {
        key: 'getEventType',
        value: function getEventType() {
            return 'APPLICATION';
        }
    }, {
        key: 'getName',
        value: function getName() {
            return this.params.eventName || FAKE_EVENT_NAME;
        }
    }, {
        key: 'getParam',
        value: function getParam(name) {
            return this.params[name];
        }
    }, {
        key: 'getPhase',
        value: function getPhase() {
            return 'default';
        }
    }, {
        key: 'getSource',
        value: function getSource() {
            return null;
        }
    }, {
        key: 'getType',
        value: function getType() {
            return 'c:' + FAKE_EVENT_NAME;
        }
    }]);
    return Event;
}();

var sinon$1 = require('sinon');
var _ = require('lodash');
var DefaultComponentAdapter = 'default';
var WellKnownComponents = ['aura:', 'force:', 'forceChatter:', 'lightning:', 'ui:', 'c:'];

var ComponentAdapters = defineProperty({}, DefaultComponentAdapter, function (instance) {
    return instance;
});

function componentFactory() {
    var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : DefaultComponentAdapter;

    if (Array.isArray(type)) {
        return type.map(function (t) {
            return componentFactory(params, t);
        });
    }
    var instance = new Component(params, type);
    var adapterName = type.toLowerCase().replace('markup://', '');
    var adapter = ComponentAdapters[adapterName];
    if (!adapter) {
        if (!_.some(WellKnownComponents, function (name) {
            return adapterName.startsWith(name);
        })) {
            /*eslint no-console: 0*/
            console.warn('Unable to find component adapter ' + type);
        }
        adapter = ComponentAdapters[DefaultComponentAdapter];
    }
    return adapter(instance, params);
}

function useComponentAdapters(registrator) {
    var register = function register(componentType, adapter) {
        var adapterName = componentType.toLowerCase();
        ComponentAdapters[adapterName] = adapter;
    };
    registrator({ register: register });
}

var Component = function () {
    function Component(params, type) {
        var _this = this;

        classCallCheck(this, Component);

        this.params = Object.assign({}, {
            findMap: {}
        }, params);
        this.type = type || 'default';
        this.getStub = sinon$1.stub(this, 'get').callsFake(function (name) {
            if (name.startsWith('v.') || name.startsWith('c.') || name.startsWith('e.')) {
                name = name.substring(2);
            }
            return _.get(_this.params, name);
        });

        this.setStub = sinon$1.stub(this, 'set').callsFake(function (name, value) {
            if (name.startsWith('v.') || name.startsWith('c.') || name.startsWith('e.')) {
                name = name.substring(2);
            }
            _.set(_this.params, name, value);
        });
        sinon$1.stub(this, 'addEventHandler');
        sinon$1.stub(this, 'addHandler');
        sinon$1.stub(this, 'addValueHandler');
        sinon$1.stub(this, 'addValueProvider');
        sinon$1.stub(this, 'autoDestroy');
        sinon$1.stub(this, 'destroy');
        sinon$1.stub(this, 'removeEventHandler');
    }

    createClass(Component, [{
        key: 'get',
        value: function get$$1() {}
    }, {
        key: 'set',
        value: function set$$1() {}
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
            if (typeOrComponent === true) {
                typeOrComponent = DefaultComponentAdapter;
            }
            var component = this.params.findMap[name] = componentFactory(this.params, typeOrComponent);
            return component;
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

var sinon$3 = require('sinon');

var classNameToComponentVar = function classNameToComponentVar(className) {
    return 'v.__cls_' + className;
};
var AuraUtil = function () {
    function AuraUtil() {
        classCallCheck(this, AuraUtil);

        sinon$3.stub(this, 'addClass').callsFake(function (component, className) {
            return component.set(classNameToComponentVar(className), true);
        });
        sinon$3.stub(this, 'removeClass').callsFake(function (component, className) {
            return component.set(classNameToComponentVar(className), false);
        });
        sinon$3.stub(this, 'hasClass').callsFake(function (component, className) {
            return component.get(classNameToComponentVar(className));
        });
        sinon$3.stub(this, 'toggleClass').callsFake(function (component, className) {
            component.set(classNameToComponentVar(className), !component.get(classNameToComponentVar(className)));
        });
        this.isEmpty = function (obj) {
            if (obj === undefined || obj === null || obj === '') {
                return true;
            }
            if (Array.isArray(obj)) {
                return obj.length === 0;
            } else if ((typeof obj === 'undefined' ? 'undefined' : _typeof(obj)) === 'object' && Object.prototype.toString.call(obj) === '[object Object]') {
                return Object.keys(obj).length === 0;
            }
            return false;
        };
        this.isUndefinedOrNull = function (obj) {
            return obj === undefined || obj === null;
        };
    }

    createClass(AuraUtil, [{
        key: 'addClass',
        value: function addClass() {}
    }, {
        key: 'removeClass',
        value: function removeClass() {}
    }, {
        key: 'hasClass',
        value: function hasClass() {}
    }, {
        key: 'toggleClass',
        value: function toggleClass() {}
    }, {
        key: 'getBooleanValue',
        value: function getBooleanValue(val) {
            // Ported: https://github.com/forcedotcom/aura/blob/master/aura-impl/src/main/resources/aura/util/Util.js#L366
            return val !== undefined && val !== null && val !== false && val !== 0 && val !== 'false' && val !== '' && val !== 'f';
        }
    }, {
        key: 'isArray',
        value: function isArray(arr) {
            // Ported: https://github.com/forcedotcom/aura/blob/master/aura-impl/src/main/resources/aura/util/Util.js#L189
            return (typeof Array.isArray === "function" ? Array.isArray : function (arg) {
                return Object.prototype.toString.call(arg) === '[object Array]';
            })(arr);
        }
    }, {
        key: 'isObject',
        value: function isObject(obj) {
            //Ported: https://github.com/forcedotcom/aura/blob/master/aura-impl/src/main/resources/aura/util/Util.js#L204
            return (typeof obj === 'undefined' ? 'undefined' : _typeof(obj)) === "object" && obj !== null && !Array.isArray(obj);
        }
    }, {
        key: 'isUndefined',
        value: function isUndefined(obj) {
            //Ported: https://github.com/forcedotcom/aura/blob/master/aura-impl/src/main/resources/aura/util/Util.js#L319
            return obj === undefined;
        }
    }]);
    return AuraUtil;
}();

var sinon$2 = require('sinon');

function auraFactory() {
    var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    return new Aura(params);
}

var Aura = function () {
    function Aura(params) {
        var _this = this;

        classCallCheck(this, Aura);

        this.params = params;
        this.util = new AuraUtil();
        this.getStub = sinon$2.stub(this, 'get').callsFake(function (name) {
            return params[name];
        });
        this.setStub = sinon$2.stub(this, 'set').callsFake(function (name, value) {
            return params[name] = value;
        });
        this.enqueueActionStub = sinon$2.stub(this, 'enqueueAction').callsFake(function (action) {
            return action && action.invokeCallback && action.invokeCallback(true);
        });
        sinon$2.stub(this, 'getReference');
        sinon$2.stub(this, 'getRoot').callsFake(function () {
            return _this.rootComponent || (_this.rootComponent = new componentFactory());
        });
        sinon$2.stub(this, 'reportError');
    }

    createClass(Aura, [{
        key: 'setParams',
        value: function setParams(params) {
            Object.assign(this.params, params);
        }
    }, {
        key: 'get',
        value: function get$$1() {}
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
                callback(result, 'SUCCESS', result.map(function () {
                    return 'SUCCESS';
                }));
            }
            return result;
        }
    }, {
        key: 'getCallback',
        value: function getCallback(callback) {
            return function () {
                callback && callback.apply(undefined, arguments);
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
            /*eslint no-console: 0*/
            console && console.log(value, err);
        }
    }, {
        key: 'reportError',
        value: function reportError() {}
    }]);
    return Aura;
}();

var sinon$4 = require('sinon');

function apexCallFactory() {
    var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    return new ApexCall(params);
}

function apexSuccessResult() {
    var response = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    return new ApexCallResult(response);
}

function apexErrorResult(message) {
    return new ApexCallResult(null, message);
}

var ApexCall = function () {
    function ApexCall(result) {
        var invokeCallbackOnEnqueue = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
        classCallCheck(this, ApexCall);

        this.params = null;
        this.result = result;
        this.invokeCallbackOnEnqueue = invokeCallbackOnEnqueue;
        this.isBackground = false;
        this.setAbortable = false;
        sinon$4.stub(this, 'setStorable');
        sinon$4.stub(this, 'setAbortable');
    }

    createClass(ApexCall, [{
        key: 'setParams',
        value: function setParams(params) {
            this.params = params;
        }
    }, {
        key: 'setParam',
        value: function setParam(key, value) {
            this.params = Object.assign(this.params, defineProperty({}, key, value));
        }
    }, {
        key: 'getParams',
        value: function getParams() {
            return this.params;
        }
    }, {
        key: 'setCallback',
        value: function setCallback(ctx, callback) {
            this.ctx = ctx;
            this.callback = callback;
        }
    }, {
        key: 'invokeCallback',
        value: function invokeCallback() {
            var fromEnqueue = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

            if (fromEnqueue && !this.invokeCallbackOnEnqueue) {
                return;
            }
            this.callback && this.callback.bind(this.ctx)(this.result);
        }
    }, {
        key: 'getError',
        value: function getError() {
            return this.result.getError();
        }
    }, {
        key: 'getParam',
        value: function getParam(name) {
            return this.params ? this.params[name] : null;
        }
    }, {
        key: 'getReturnValue',
        value: function getReturnValue() {
            return this.result;
        }
    }, {
        key: 'getState',
        value: function getState() {
            return this.result.getState();
        }
    }, {
        key: 'isBackground',
        value: function isBackground() {
            return this.isBackground;
        }
    }, {
        key: 'setAbortable',
        value: function setAbortable() {}
    }, {
        key: 'setBackground',
        value: function setBackground() {
            this.isBackground = true;
        }
    }, {
        key: 'setStorable',
        value: function setStorable() {}
    }]);
    return ApexCall;
}();

var ApexCallResult = function () {
    function ApexCallResult(response) {
        var errorMessage = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
        classCallCheck(this, ApexCallResult);

        this.response = response;
        this.errorMessage = errorMessage;
    }

    createClass(ApexCallResult, [{
        key: 'getState',
        value: function getState() {
            return this.errorMessage ? 'ERROR' : 'SUCCESS';
        }
    }, {
        key: 'getError',
        value: function getError() {
            return this.errorMessage ? [{ message: this.errorMessage }] : [];
        }
    }, {
        key: 'getReturnValue',
        value: function getReturnValue() {
            return this.response;
        }
    }]);
    return ApexCallResult;
}();

module.exports = {
    AuraUtil: AuraUtil,
    eventFactory: eventFactory,
    componentFactory: componentFactory,
    useComponentAdapters: useComponentAdapters,
    auraFactory: auraFactory,
    apexCallFactory: apexCallFactory,
    apexSuccessResult: apexSuccessResult,
    apexErrorResult: apexErrorResult
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXVyYS5qcyIsInNvdXJjZXMiOlsibGliL2V2ZW50RmFjdG9yeS5qcyIsImxpYi9jb21wb25lbnRGYWN0b3J5LmpzIiwibGliL2F1cmFVdGlsLmpzIiwibGliL2F1cmFGYWN0b3J5LmpzIiwibGliL2FwZXhDYWxsRmFjdG9yeS5qcyIsImxpYi9hdXJhLmpzIl0sInNvdXJjZXNDb250ZW50IjpbImNvbnN0IHNpbm9uID0gcmVxdWlyZSgnc2lub24nKTtcblxuZXhwb3J0IGZ1bmN0aW9uIGV2ZW50RmFjdG9yeShwYXJhbXMgPSB7fSkge1xuICAgIHJldHVybiBuZXcgRXZlbnQocGFyYW1zKTtcbn1cbmNvbnN0IEZBS0VfRVZFTlRfTkFNRSA9ICdtb2NoYS1hdXJhLWZha2UtZXZlbnQnXG5jbGFzcyBFdmVudCB7XG4gICAgY29uc3RydWN0b3IocGFyYW1zKSB7XG4gICAgICAgIHRoaXMucGFyYW1zID0gcGFyYW1zIHx8IHt9O1xuICAgICAgICB0aGlzLmZpcmUgPSBzaW5vbi5zcHkoKTtcbiAgICAgICAgdGhpcy5wYXVzZSA9IHNpbm9uLnNweSgpO1xuICAgICAgICB0aGlzLnByZXZlbnREZWZhdWx0ID0gc2lub24uc3B5KCk7XG4gICAgICAgIHRoaXMucmVzdW1lID0gc2lub24uc3B5KCk7XG4gICAgICAgIHRoaXMuc3RvcFByb3BhZ2F0aW9uID0gc2lub24uc3B5KCk7XG4gICAgfVxuICAgIHNldFBhcmFtcyhwYXJhbXMpIHtcbiAgICAgICAgdGhpcy5wYXJhbXMgPSBwYXJhbXM7XG4gICAgfVxuICAgIHNldFBhcmFtKGtleSwgdmFsdWUpIHtcbiAgICAgICAgdGhpcy5wYXJhbXNba2V5XSA9IHZhbHVlO1xuICAgIH1cbiAgICBnZXRQYXJhbXMoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnBhcmFtcztcbiAgICB9XG4gICAgZ2V0RXZlbnRUeXBlKCkge1xuICAgICAgICByZXR1cm4gJ0FQUExJQ0FUSU9OJ1xuICAgIH1cbiAgICBnZXROYW1lKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wYXJhbXMuZXZlbnROYW1lIHx8IEZBS0VfRVZFTlRfTkFNRVxuICAgIH1cbiAgICBnZXRQYXJhbShuYW1lKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnBhcmFtc1tuYW1lXVxuICAgIH1cbiAgICBnZXRQaGFzZSgpIHtcbiAgICAgICAgcmV0dXJuICdkZWZhdWx0J1xuICAgIH1cbiAgICBnZXRTb3VyY2UoKSB7XG4gICAgICAgIHJldHVybiBudWxsXG4gICAgfVxuICAgIGdldFR5cGUoKSB7XG4gICAgICAgIHJldHVybiBgYzoke0ZBS0VfRVZFTlRfTkFNRX1gXG4gICAgfVxuXG59IiwiY29uc3Qgc2lub24gPSByZXF1aXJlKCdzaW5vbicpO1xuY29uc3QgXyA9IHJlcXVpcmUoJ2xvZGFzaCcpO1xuaW1wb3J0IHsgZXZlbnRGYWN0b3J5IH0gZnJvbSAnLi9ldmVudEZhY3RvcnknXG5cbmNvbnN0IERlZmF1bHRDb21wb25lbnRBZGFwdGVyID0gJ2RlZmF1bHQnXG5jb25zdCBXZWxsS25vd25Db21wb25lbnRzID0gWydhdXJhOicsICdmb3JjZTonLCAnZm9yY2VDaGF0dGVyOicsICdsaWdodG5pbmc6JywgJ3VpOicsICdjOiddXG5cbmxldCBDb21wb25lbnRBZGFwdGVycyA9IHtcbiAgICBbRGVmYXVsdENvbXBvbmVudEFkYXB0ZXJdOiBpbnN0YW5jZSA9PiBpbnN0YW5jZVxufVxuXG5leHBvcnQgZnVuY3Rpb24gY29tcG9uZW50RmFjdG9yeShwYXJhbXMgPSB7fSwgdHlwZSA9IERlZmF1bHRDb21wb25lbnRBZGFwdGVyKSB7XG4gICAgaWYgKEFycmF5LmlzQXJyYXkodHlwZSkpIHtcbiAgICAgICAgcmV0dXJuIHR5cGUubWFwKHQgPT4gY29tcG9uZW50RmFjdG9yeShwYXJhbXMsIHQpKTtcbiAgICB9XG4gICAgbGV0IGluc3RhbmNlID0gbmV3IENvbXBvbmVudChwYXJhbXMsIHR5cGUpO1xuICAgIGxldCBhZGFwdGVyTmFtZSA9IHR5cGUudG9Mb3dlckNhc2UoKS5yZXBsYWNlKCdtYXJrdXA6Ly8nLCAnJylcbiAgICBsZXQgYWRhcHRlciA9IENvbXBvbmVudEFkYXB0ZXJzW2FkYXB0ZXJOYW1lXTtcbiAgICBpZiAoIWFkYXB0ZXIpIHtcbiAgICAgICAgaWYgKCFfLnNvbWUoV2VsbEtub3duQ29tcG9uZW50cywgbmFtZSA9PiBhZGFwdGVyTmFtZS5zdGFydHNXaXRoKG5hbWUpKSkge1xuICAgICAgICAgICAgLyplc2xpbnQgbm8tY29uc29sZTogMCovXG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYFVuYWJsZSB0byBmaW5kIGNvbXBvbmVudCBhZGFwdGVyICR7dHlwZX1gKTtcbiAgICAgICAgfVxuICAgICAgICBhZGFwdGVyID0gQ29tcG9uZW50QWRhcHRlcnNbRGVmYXVsdENvbXBvbmVudEFkYXB0ZXJdO1xuICAgIH1cbiAgICByZXR1cm4gYWRhcHRlcihpbnN0YW5jZSwgcGFyYW1zKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHVzZUNvbXBvbmVudEFkYXB0ZXJzKHJlZ2lzdHJhdG9yKSB7XG4gICAgY29uc3QgcmVnaXN0ZXIgPSAoY29tcG9uZW50VHlwZSwgYWRhcHRlcikgPT4ge1xuICAgICAgICBjb25zdCBhZGFwdGVyTmFtZSA9IGNvbXBvbmVudFR5cGUudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgQ29tcG9uZW50QWRhcHRlcnNbYWRhcHRlck5hbWVdID0gYWRhcHRlclxuICAgIH1cbiAgICByZWdpc3RyYXRvcih7cmVnaXN0ZXJ9KTtcbn1cblxuY2xhc3MgQ29tcG9uZW50IHtcbiAgICBjb25zdHJ1Y3RvcihwYXJhbXMsIHR5cGUpIHtcbiAgICAgICAgdGhpcy5wYXJhbXMgPSBPYmplY3QuYXNzaWduKHt9LCB7XG4gICAgICAgICAgICBmaW5kTWFwOiB7fVxuICAgICAgICB9LCBwYXJhbXMpO1xuICAgICAgICB0aGlzLnR5cGUgPSB0eXBlIHx8ICdkZWZhdWx0JztcbiAgICAgICAgdGhpcy5nZXRTdHViID0gc2lub24uc3R1Yih0aGlzLCAnZ2V0JykuY2FsbHNGYWtlKChuYW1lKSA9PiB7XG4gICAgICAgICAgICBpZiAobmFtZS5zdGFydHNXaXRoKCd2LicpIHx8IG5hbWUuc3RhcnRzV2l0aCgnYy4nKSB8fCBuYW1lLnN0YXJ0c1dpdGgoJ2UuJykpIHtcbiAgICAgICAgICAgICAgICBuYW1lID0gbmFtZS5zdWJzdHJpbmcoMik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gXy5nZXQodGhpcy5wYXJhbXMsIG5hbWUpO1xuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLnNldFN0dWIgPSBzaW5vbi5zdHViKHRoaXMsICdzZXQnKS5jYWxsc0Zha2UoKG5hbWUsIHZhbHVlKSA9PiB7XG4gICAgICAgICAgICBpZiAobmFtZS5zdGFydHNXaXRoKCd2LicpIHx8IG5hbWUuc3RhcnRzV2l0aCgnYy4nKSB8fCBuYW1lLnN0YXJ0c1dpdGgoJ2UuJykpIHtcbiAgICAgICAgICAgICAgICBuYW1lID0gbmFtZS5zdWJzdHJpbmcoMik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBfLnNldCh0aGlzLnBhcmFtcywgbmFtZSwgdmFsdWUpO1xuICAgICAgICB9KTtcbiAgICAgICAgc2lub24uc3R1Yih0aGlzLCAnYWRkRXZlbnRIYW5kbGVyJyk7XG4gICAgICAgIHNpbm9uLnN0dWIodGhpcywgJ2FkZEhhbmRsZXInKTtcbiAgICAgICAgc2lub24uc3R1Yih0aGlzLCAnYWRkVmFsdWVIYW5kbGVyJyk7XG4gICAgICAgIHNpbm9uLnN0dWIodGhpcywgJ2FkZFZhbHVlUHJvdmlkZXInKTtcbiAgICAgICAgc2lub24uc3R1Yih0aGlzLCAnYXV0b0Rlc3Ryb3knKTtcbiAgICAgICAgc2lub24uc3R1Yih0aGlzLCAnZGVzdHJveScpO1xuICAgICAgICBzaW5vbi5zdHViKHRoaXMsICdyZW1vdmVFdmVudEhhbmRsZXInKTtcbiAgICB9XG5cbiAgICBnZXQoKSB7XG4gICAgfVxuICAgIHNldCgpIHtcbiAgICB9XG5cbiAgICBmaW5kKG5hbWUpIHtcbiAgICAgICAgbGV0IHR5cGVPckNvbXBvbmVudCA9IHRoaXMucGFyYW1zLmZpbmRNYXBbbmFtZV07XG4gICAgICAgIGlmICh0eXBlT3JDb21wb25lbnQgaW5zdGFuY2VvZiBDb21wb25lbnQpIHtcbiAgICAgICAgICAgIHJldHVybiB0eXBlT3JDb21wb25lbnQ7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCF0eXBlT3JDb21wb25lbnQgJiYgdGhpcy5wYXJhbXMuZmluZE1hcC5oYXNPd25Qcm9wZXJ0eShuYW1lKSkge1xuICAgICAgICAgICAgcmV0dXJuIHR5cGVPckNvbXBvbmVudDtcbiAgICAgICAgfVxuICAgICAgICBpZiAodHlwZU9yQ29tcG9uZW50ID09PSB0cnVlKSB7XG4gICAgICAgICAgICB0eXBlT3JDb21wb25lbnQgPSBEZWZhdWx0Q29tcG9uZW50QWRhcHRlclxuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGNvbXBvbmVudCA9IHRoaXMucGFyYW1zLmZpbmRNYXBbbmFtZV0gPSBjb21wb25lbnRGYWN0b3J5KHRoaXMucGFyYW1zLCB0eXBlT3JDb21wb25lbnQpO1xuICAgICAgICByZXR1cm4gY29tcG9uZW50O1xuICAgIH1cbiAgICBnZXRMb2NhbElkKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wYXJhbXNbJ2F1cmE6aWQnXTtcbiAgICB9XG4gICAgY2xlYXJSZWZlcmVuY2Uoa2V5KSB7XG4gICAgICAgIGRlbGV0ZSB0aGlzLnBhcmFtc1trZXldO1xuICAgIH1cbiAgICBnZXRDb25jcmV0ZUNvbXBvbmVudCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIGdldEVsZW1lbnQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICBnZXRFbGVtZW50cygpIHtcbiAgICAgICAgcmV0dXJuIFt0aGlzXTtcbiAgICB9XG4gICAgZ2V0RXZlbnQobmFtZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5wYXJhbXNbbmFtZV0gfHwgZXZlbnRGYWN0b3J5KCk7XG4gICAgfVxuICAgIGdldEdsb2JhbElkKCkge1xuICAgICAgICByZXR1cm4gYGdsb2JhbC0ke3RoaXMucGFyYW1zWydhdXJhOmlkJ119YDtcbiAgICB9XG4gICAgZ2V0TmFtZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudHlwZTtcbiAgICB9XG4gICAgZ2V0VHlwZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudHlwZTtcbiAgICB9XG4gICAgZ2V0UmVmZXJlbmNlKGtleSkge1xuICAgICAgICByZXR1cm4gdGhpcy5wYXJhbXNba2V5XTtcbiAgICB9XG4gICAgZ2V0U3VwZXIoKSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBnZXRWZXJzaW9uKCkge1xuICAgICAgICByZXR1cm4gJzEuMCc7XG4gICAgfVxuICAgIGlzQ29uY3JldGUoKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICBpc0luc3RhbmNlT2YobmFtZSkge1xuICAgICAgICByZXR1cm4gdGhpcy50eXBlID09PSBuYW1lO1xuICAgIH1cbiAgICBpc1ZhbGlkKCkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbn0iLCJjb25zdCBzaW5vbiA9IHJlcXVpcmUoJ3Npbm9uJyk7XG5cbmNvbnN0IGNsYXNzTmFtZVRvQ29tcG9uZW50VmFyID0gY2xhc3NOYW1lID0+IGB2Ll9fY2xzXyR7Y2xhc3NOYW1lfWBcbmV4cG9ydCBjbGFzcyBBdXJhVXRpbCB7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHNpbm9uLnN0dWIodGhpcywgJ2FkZENsYXNzJykuY2FsbHNGYWtlKChjb21wb25lbnQsIGNsYXNzTmFtZSkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIGNvbXBvbmVudC5zZXQoY2xhc3NOYW1lVG9Db21wb25lbnRWYXIoY2xhc3NOYW1lKSwgdHJ1ZSk7XG4gICAgICAgIH0pXG4gICAgICAgIHNpbm9uLnN0dWIodGhpcywgJ3JlbW92ZUNsYXNzJykuY2FsbHNGYWtlKChjb21wb25lbnQsIGNsYXNzTmFtZSkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIGNvbXBvbmVudC5zZXQoY2xhc3NOYW1lVG9Db21wb25lbnRWYXIoY2xhc3NOYW1lKSwgZmFsc2UpO1xuICAgICAgICB9KVxuICAgICAgICBzaW5vbi5zdHViKHRoaXMsICdoYXNDbGFzcycpLmNhbGxzRmFrZSgoY29tcG9uZW50LCBjbGFzc05hbWUpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBjb21wb25lbnQuZ2V0KGNsYXNzTmFtZVRvQ29tcG9uZW50VmFyKGNsYXNzTmFtZSkpO1xuICAgICAgICB9KVxuICAgICAgICBzaW5vbi5zdHViKHRoaXMsICd0b2dnbGVDbGFzcycpLmNhbGxzRmFrZSgoY29tcG9uZW50LCBjbGFzc05hbWUpID0+IHtcbiAgICAgICAgICAgIGNvbXBvbmVudC5zZXQoY2xhc3NOYW1lVG9Db21wb25lbnRWYXIoY2xhc3NOYW1lKSwgIWNvbXBvbmVudC5nZXQoY2xhc3NOYW1lVG9Db21wb25lbnRWYXIoY2xhc3NOYW1lKSkpO1xuICAgICAgICB9KVxuICAgICAgICB0aGlzLmlzRW1wdHkgPSBvYmogPT4ge1xuICAgICAgICAgICAgaWYgKG9iaiA9PT0gdW5kZWZpbmVkIHx8IG9iaiA9PT0gbnVsbCB8fCBvYmogPT09ICcnKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShvYmopKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG9iai5sZW5ndGggPT09IDA7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiBvYmogPT09ICdvYmplY3QnICYmIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChvYmopID09PSAnW29iamVjdCBPYmplY3RdJykge1xuICAgICAgICAgICAgICAgIHJldHVybiBPYmplY3Qua2V5cyhvYmopLmxlbmd0aCA9PT0gMDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5pc1VuZGVmaW5lZE9yTnVsbCA9IG9iaiA9PiB7XG4gICAgICAgICAgICByZXR1cm4gb2JqID09PSB1bmRlZmluZWQgfHwgb2JqID09PSBudWxsO1xuICAgICAgICB9O1xuICAgIH1cbiAgICBhZGRDbGFzcygpIHt9XG4gICAgcmVtb3ZlQ2xhc3MoKSB7fVxuICAgIGhhc0NsYXNzKCkge31cbiAgICB0b2dnbGVDbGFzcygpIHt9XG4gICAgZ2V0Qm9vbGVhblZhbHVlKHZhbCkge1xuICAgICAgICAvLyBQb3J0ZWQ6IGh0dHBzOi8vZ2l0aHViLmNvbS9mb3JjZWRvdGNvbS9hdXJhL2Jsb2IvbWFzdGVyL2F1cmEtaW1wbC9zcmMvbWFpbi9yZXNvdXJjZXMvYXVyYS91dGlsL1V0aWwuanMjTDM2NlxuICAgICAgICByZXR1cm4gdmFsICE9PSB1bmRlZmluZWQgJiYgdmFsICE9PSBudWxsICYmIHZhbCAhPT0gZmFsc2UgJiYgdmFsICE9PSAwICYmIHZhbCAhPT0gJ2ZhbHNlJyAmJiB2YWwgIT09ICcnICYmIHZhbCAhPT0gJ2YnO1xuICAgIH1cbiAgICBpc0FycmF5KGFycikge1xuICAgICAgICAvLyBQb3J0ZWQ6IGh0dHBzOi8vZ2l0aHViLmNvbS9mb3JjZWRvdGNvbS9hdXJhL2Jsb2IvbWFzdGVyL2F1cmEtaW1wbC9zcmMvbWFpbi9yZXNvdXJjZXMvYXVyYS91dGlsL1V0aWwuanMjTDE4OVxuICAgICAgICByZXR1cm4gKHR5cGVvZiBBcnJheS5pc0FycmF5ID09PSBcImZ1bmN0aW9uXCIgPyBBcnJheS5pc0FycmF5IDogZnVuY3Rpb24oYXJnKSB7XG4gICAgICAgICAgICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKGFyZykgPT09ICdbb2JqZWN0IEFycmF5XSc7XG4gICAgICAgIH0pKGFycik7XG4gICAgfVxuICAgIGlzT2JqZWN0KG9iaikge1xuICAgICAgICAvL1BvcnRlZDogaHR0cHM6Ly9naXRodWIuY29tL2ZvcmNlZG90Y29tL2F1cmEvYmxvYi9tYXN0ZXIvYXVyYS1pbXBsL3NyYy9tYWluL3Jlc291cmNlcy9hdXJhL3V0aWwvVXRpbC5qcyNMMjA0XG4gICAgICAgIHJldHVybiB0eXBlb2Ygb2JqID09PSBcIm9iamVjdFwiICYmIG9iaiAhPT0gbnVsbCAmJiAhQXJyYXkuaXNBcnJheShvYmopO1xuICAgIH1cbiAgICBpc1VuZGVmaW5lZChvYmope1xuICAgICAgICAvL1BvcnRlZDogaHR0cHM6Ly9naXRodWIuY29tL2ZvcmNlZG90Y29tL2F1cmEvYmxvYi9tYXN0ZXIvYXVyYS1pbXBsL3NyYy9tYWluL3Jlc291cmNlcy9hdXJhL3V0aWwvVXRpbC5qcyNMMzE5XG4gICAgICAgIHJldHVybiBvYmogPT09IHVuZGVmaW5lZDtcbiAgICB9XG59XG5cbiIsImNvbnN0IHNpbm9uID0gcmVxdWlyZSgnc2lub24nKTtcblxuaW1wb3J0IHsgQXVyYVV0aWwgfSBmcm9tICcuL2F1cmFVdGlsJ1xuXG5leHBvcnQgZnVuY3Rpb24gYXVyYUZhY3RvcnkocGFyYW1zID0ge30pIHtcbiAgICByZXR1cm4gbmV3IEF1cmEocGFyYW1zKTtcbn1cblxuaW1wb3J0IHsgY29tcG9uZW50RmFjdG9yeSB9IGZyb20gJy4vY29tcG9uZW50RmFjdG9yeSdcblxuY2xhc3MgQXVyYSB7XG4gICAgY29uc3RydWN0b3IocGFyYW1zKSB7XG4gICAgICAgIHRoaXMucGFyYW1zID0gcGFyYW1zO1xuICAgICAgICB0aGlzLnV0aWwgPSBuZXcgQXVyYVV0aWwoKTtcbiAgICAgICAgdGhpcy5nZXRTdHViID0gc2lub24uc3R1Yih0aGlzLCAnZ2V0JykuY2FsbHNGYWtlKChuYW1lKSA9PiBwYXJhbXNbbmFtZV0pO1xuICAgICAgICB0aGlzLnNldFN0dWIgPSBzaW5vbi5zdHViKHRoaXMsICdzZXQnKS5jYWxsc0Zha2UoKG5hbWUsIHZhbHVlKSA9PiBwYXJhbXNbbmFtZV0gPSB2YWx1ZSk7XG4gICAgICAgIHRoaXMuZW5xdWV1ZUFjdGlvblN0dWIgPSBzaW5vbi5zdHViKHRoaXMsICdlbnF1ZXVlQWN0aW9uJykuY2FsbHNGYWtlKChhY3Rpb24pID0+IGFjdGlvbiAmJiBhY3Rpb24uaW52b2tlQ2FsbGJhY2sgJiYgYWN0aW9uLmludm9rZUNhbGxiYWNrKHRydWUpKTtcbiAgICAgICAgc2lub24uc3R1Yih0aGlzLCAnZ2V0UmVmZXJlbmNlJyk7XG4gICAgICAgIHNpbm9uLnN0dWIodGhpcywgJ2dldFJvb3QnKS5jYWxsc0Zha2UoKCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMucm9vdENvbXBvbmVudCB8fCAodGhpcy5yb290Q29tcG9uZW50ID0gbmV3IGNvbXBvbmVudEZhY3RvcnkoKSk7XG4gICAgICAgIH0pXG4gICAgICAgIHNpbm9uLnN0dWIodGhpcywgJ3JlcG9ydEVycm9yJyk7XG4gICAgfVxuICAgIFxuICAgIHNldFBhcmFtcyhwYXJhbXMpIHtcbiAgICAgICAgT2JqZWN0LmFzc2lnbih0aGlzLnBhcmFtcywgcGFyYW1zKTtcbiAgICB9XG5cbiAgICBnZXQoKSB7XG4gICAgfVxuICAgIFxuICAgIGVucXVldWVBY3Rpb24oKSB7XG4gICAgfVxuXG4gICAgY3JlYXRlQ29tcG9uZW50KHR5cGUsIGF0dHJpYnV0ZXMsIGNhbGxiYWNrKSB7XG4gICAgICAgIHRoaXMuY3JlYXRlQ29tcG9uZW50LnR5cGUgPSB0eXBlO1xuICAgICAgICB0aGlzLmNyZWF0ZUNvbXBvbmVudC5hdHRyaWJ1dGVzID0gYXR0cmlidXRlcztcbiAgICAgICAgLy8gR2V0IGNvbXBvbmVudCBpbnN0YW5jZS5cbiAgICAgICAgLy8gVXNlIGV4aXN0aW5nIGNvbXBvbmVudCBpbnN0YW5jZSBpZiBzZXRcbiAgICAgICAgLy8gQ3JlYXRlIG5ldyBkZWZhdWx0IGNvbXBvbmVudCBpZiBjb21wb25lbnQgbm90IHNldFxuICAgICAgICBsZXQgeyBjb21wb25lbnQgfSA9IHRoaXMuY3JlYXRlQ29tcG9uZW50O1xuICAgICAgICBpZiAoIWNvbXBvbmVudCkge1xuICAgICAgICAgICAgY29tcG9uZW50ID0gbmV3IGNvbXBvbmVudEZhY3RvcnkoYXR0cmlidXRlcywgdHlwZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmNyZWF0ZUNvbXBvbmVudC5jb21wb25lbnQgPSBudWxsO1xuICAgICAgICB9XG4gICAgICAgIGlmIChjYWxsYmFjaykge1xuICAgICAgICAgICAgY2FsbGJhY2soY29tcG9uZW50LCAnU1VDQ0VTUycsIFsnU1VDQ0VTUyddKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gY29tcG9uZW50O1xuICAgIH1cbiAgICBjcmVhdGVDb21wb25lbnRzKGNvbXBvbmVudERlZnMsIGNhbGxiYWNrKSB7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGNvbXBvbmVudERlZnNcbiAgICAgICAgICAgIC5tYXAoZGVmID0+IHRoaXMuY3JlYXRlQ29tcG9uZW50KGRlZlswXSwgZGVmWzFdKSlcbiAgICAgICAgaWYgKGNhbGxiYWNrKSB7XG4gICAgICAgICAgICBjYWxsYmFjayhyZXN1bHQsICdTVUNDRVNTJywgcmVzdWx0Lm1hcCggKCkgPT4gJ1NVQ0NFU1MnKSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG4gICAgZ2V0Q2FsbGJhY2soY2FsbGJhY2spIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKC4uLmFyZ3MpIHtcbiAgICAgICAgICAgIGNhbGxiYWNrICYmIGNhbGxiYWNrKC4uLmFyZ3MpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGdldENvbXBvbmVudChpZCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wYXJhbXNbaWRdO1xuICAgIH1cbiAgICBnZXRSZWZlcmVuY2UoKSB7fVxuICAgIGdldFJvb3QoKSB7fVxuICAgIGdldFRva2VuKG5hbWUpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucGFyYW1zWyd0b2tlbi4nICsgbmFtZV1cbiAgICB9XG4gICAgbG9nKHZhbHVlLCBlcnIpIHtcbiAgICAgICAgLyplc2xpbnQgbm8tY29uc29sZTogMCovXG4gICAgICAgIGNvbnNvbGUgJiYgY29uc29sZS5sb2codmFsdWUsIGVycilcbiAgICB9XG4gICAgcmVwb3J0RXJyb3IoKSB7fVxufSIsImNvbnN0IHNpbm9uID0gcmVxdWlyZSgnc2lub24nKTtcblxuZXhwb3J0IGZ1bmN0aW9uIGFwZXhDYWxsRmFjdG9yeShwYXJhbXMgPSB7fSkge1xuICAgIHJldHVybiBuZXcgQXBleENhbGwocGFyYW1zKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGFwZXhTdWNjZXNzUmVzdWx0KHJlc3BvbnNlID0ge30pIHtcbiAgICByZXR1cm4gbmV3IEFwZXhDYWxsUmVzdWx0KHJlc3BvbnNlKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGFwZXhFcnJvclJlc3VsdChtZXNzYWdlKSB7XG4gICAgcmV0dXJuIG5ldyBBcGV4Q2FsbFJlc3VsdChudWxsLCBtZXNzYWdlKTtcbn1cblxuY2xhc3MgQXBleENhbGwge1xuICAgIGNvbnN0cnVjdG9yKHJlc3VsdCwgaW52b2tlQ2FsbGJhY2tPbkVucXVldWUgPSB0cnVlKSB7XG4gICAgICAgIHRoaXMucGFyYW1zID0gbnVsbDtcbiAgICAgICAgdGhpcy5yZXN1bHQgPSByZXN1bHQ7XG4gICAgICAgIHRoaXMuaW52b2tlQ2FsbGJhY2tPbkVucXVldWUgPSBpbnZva2VDYWxsYmFja09uRW5xdWV1ZTtcbiAgICAgICAgdGhpcy5pc0JhY2tncm91bmQgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5zZXRBYm9ydGFibGUgPSBmYWxzZTtcbiAgICAgICAgc2lub24uc3R1Yih0aGlzLCAnc2V0U3RvcmFibGUnKTtcbiAgICAgICAgc2lub24uc3R1Yih0aGlzLCAnc2V0QWJvcnRhYmxlJyk7XG4gICAgfVxuICAgIHNldFBhcmFtcyhwYXJhbXMpIHtcbiAgICAgICAgdGhpcy5wYXJhbXMgPSBwYXJhbXM7XG4gICAgfVxuICAgIHNldFBhcmFtKGtleSwgdmFsdWUpIHtcbiAgICAgICAgdGhpcy5wYXJhbXMgPSBPYmplY3QuYXNzaWduKHRoaXMucGFyYW1zLCB7W2tleV0gOiB2YWx1ZX0pO1xuICAgIH1cbiAgICBnZXRQYXJhbXMoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnBhcmFtcztcbiAgICB9XG4gICAgc2V0Q2FsbGJhY2soY3R4LCBjYWxsYmFjaykge1xuICAgICAgICB0aGlzLmN0eCA9IGN0eDtcbiAgICAgICAgdGhpcy5jYWxsYmFjayA9IGNhbGxiYWNrO1xuICAgIH1cbiAgICBpbnZva2VDYWxsYmFjayhmcm9tRW5xdWV1ZSA9IGZhbHNlKSB7XG4gICAgICAgIGlmIChmcm9tRW5xdWV1ZSAmJiAhdGhpcy5pbnZva2VDYWxsYmFja09uRW5xdWV1ZSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuY2FsbGJhY2sgJiYgdGhpcy5jYWxsYmFjay5iaW5kKHRoaXMuY3R4KSh0aGlzLnJlc3VsdCk7XG4gICAgfVxuICAgIGdldEVycm9yKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5yZXN1bHQuZ2V0RXJyb3IoKTtcbiAgICB9XG4gICAgZ2V0UGFyYW0obmFtZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5wYXJhbXMgPyB0aGlzLnBhcmFtc1tuYW1lXSA6IG51bGw7XG4gICAgfVxuICAgIGdldFJldHVyblZhbHVlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5yZXN1bHQ7XG4gICAgfVxuICAgIGdldFN0YXRlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5yZXN1bHQuZ2V0U3RhdGUoKTtcbiAgICB9XG4gICAgaXNCYWNrZ3JvdW5kKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5pc0JhY2tncm91bmQ7XG4gICAgfVxuICAgIHNldEFib3J0YWJsZSgpIHtcbiAgICB9XG4gICAgc2V0QmFja2dyb3VuZCgpIHtcbiAgICAgICAgdGhpcy5pc0JhY2tncm91bmQgPSB0cnVlO1xuICAgIH1cbiAgICBzZXRTdG9yYWJsZSgpIHtcbiAgICB9XG59XG5cbmNsYXNzIEFwZXhDYWxsUmVzdWx0IHtcbiAgICBjb25zdHJ1Y3RvcihyZXNwb25zZSwgZXJyb3JNZXNzYWdlID0gbnVsbCkge1xuICAgICAgICB0aGlzLnJlc3BvbnNlID0gcmVzcG9uc2U7XG4gICAgICAgIHRoaXMuZXJyb3JNZXNzYWdlID0gZXJyb3JNZXNzYWdlO1xuICAgIH1cbiAgICBnZXRTdGF0ZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZXJyb3JNZXNzYWdlID8gJ0VSUk9SJyA6ICdTVUNDRVNTJ1xuICAgIH1cbiAgICBnZXRFcnJvcigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZXJyb3JNZXNzYWdlID8gW3ttZXNzYWdlOiB0aGlzLmVycm9yTWVzc2FnZX1dIDogW11cbiAgICB9XG4gICAgZ2V0UmV0dXJuVmFsdWUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnJlc3BvbnNlO1xuICAgIH1cbn0iLCJpbXBvcnQgeyBldmVudEZhY3RvcnkgfSBmcm9tICcuL2V2ZW50RmFjdG9yeSdcbmltcG9ydCB7IGNvbXBvbmVudEZhY3RvcnksIHVzZUNvbXBvbmVudEFkYXB0ZXJzIH0gZnJvbSAnLi9jb21wb25lbnRGYWN0b3J5J1xuaW1wb3J0IHsgYXVyYUZhY3RvcnkgfSBmcm9tICcuL2F1cmFGYWN0b3J5J1xuaW1wb3J0IHsgQXVyYVV0aWwgfSBmcm9tICcuL2F1cmFVdGlsJ1xuaW1wb3J0IHsgYXBleENhbGxGYWN0b3J5LCBhcGV4U3VjY2Vzc1Jlc3VsdCwgYXBleEVycm9yUmVzdWx0IH0gZnJvbSAnLi9hcGV4Q2FsbEZhY3RvcnknXG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIEF1cmFVdGlsLFxuICAgIGV2ZW50RmFjdG9yeSxcbiAgICBjb21wb25lbnRGYWN0b3J5LFxuICAgIHVzZUNvbXBvbmVudEFkYXB0ZXJzLFxuICAgIGF1cmFGYWN0b3J5LFxuICAgIGFwZXhDYWxsRmFjdG9yeSxcbiAgICBhcGV4U3VjY2Vzc1Jlc3VsdCxcbiAgICBhcGV4RXJyb3JSZXN1bHRcbn0iXSwibmFtZXMiOlsic2lub24iLCJyZXF1aXJlIiwiZXZlbnRGYWN0b3J5IiwicGFyYW1zIiwiRXZlbnQiLCJGQUtFX0VWRU5UX05BTUUiLCJmaXJlIiwic3B5IiwicGF1c2UiLCJwcmV2ZW50RGVmYXVsdCIsInJlc3VtZSIsInN0b3BQcm9wYWdhdGlvbiIsImtleSIsInZhbHVlIiwiZXZlbnROYW1lIiwibmFtZSIsIl8iLCJEZWZhdWx0Q29tcG9uZW50QWRhcHRlciIsIldlbGxLbm93bkNvbXBvbmVudHMiLCJDb21wb25lbnRBZGFwdGVycyIsImluc3RhbmNlIiwiY29tcG9uZW50RmFjdG9yeSIsInR5cGUiLCJBcnJheSIsImlzQXJyYXkiLCJtYXAiLCJ0IiwiQ29tcG9uZW50IiwiYWRhcHRlck5hbWUiLCJ0b0xvd2VyQ2FzZSIsInJlcGxhY2UiLCJhZGFwdGVyIiwic29tZSIsInN0YXJ0c1dpdGgiLCJ3YXJuIiwidXNlQ29tcG9uZW50QWRhcHRlcnMiLCJyZWdpc3RyYXRvciIsInJlZ2lzdGVyIiwiY29tcG9uZW50VHlwZSIsIk9iamVjdCIsImFzc2lnbiIsImdldFN0dWIiLCJzdHViIiwiY2FsbHNGYWtlIiwic3Vic3RyaW5nIiwiZ2V0Iiwic2V0U3R1YiIsInNldCIsInR5cGVPckNvbXBvbmVudCIsImZpbmRNYXAiLCJoYXNPd25Qcm9wZXJ0eSIsImNvbXBvbmVudCIsImNsYXNzTmFtZVRvQ29tcG9uZW50VmFyIiwiY2xhc3NOYW1lIiwiQXVyYVV0aWwiLCJpc0VtcHR5Iiwib2JqIiwidW5kZWZpbmVkIiwibGVuZ3RoIiwicHJvdG90eXBlIiwidG9TdHJpbmciLCJjYWxsIiwia2V5cyIsImlzVW5kZWZpbmVkT3JOdWxsIiwidmFsIiwiYXJyIiwiYXJnIiwiYXVyYUZhY3RvcnkiLCJBdXJhIiwidXRpbCIsImVucXVldWVBY3Rpb25TdHViIiwiYWN0aW9uIiwiaW52b2tlQ2FsbGJhY2siLCJyb290Q29tcG9uZW50IiwiYXR0cmlidXRlcyIsImNhbGxiYWNrIiwiY3JlYXRlQ29tcG9uZW50IiwiY29tcG9uZW50RGVmcyIsInJlc3VsdCIsImRlZiIsImlkIiwiZXJyIiwiY29uc29sZSIsImxvZyIsImFwZXhDYWxsRmFjdG9yeSIsIkFwZXhDYWxsIiwiYXBleFN1Y2Nlc3NSZXN1bHQiLCJyZXNwb25zZSIsIkFwZXhDYWxsUmVzdWx0IiwiYXBleEVycm9yUmVzdWx0IiwibWVzc2FnZSIsImludm9rZUNhbGxiYWNrT25FbnF1ZXVlIiwiaXNCYWNrZ3JvdW5kIiwic2V0QWJvcnRhYmxlIiwiY3R4IiwiZnJvbUVucXVldWUiLCJiaW5kIiwiZ2V0RXJyb3IiLCJnZXRTdGF0ZSIsImVycm9yTWVzc2FnZSIsIm1vZHVsZSIsImV4cG9ydHMiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsSUFBTUEsUUFBUUMsUUFBUSxPQUFSLENBQWQ7O0FBRUEsQUFBTyxTQUFTQyxZQUFULEdBQW1DO1FBQWJDLE1BQWEsdUVBQUosRUFBSTs7V0FDL0IsSUFBSUMsS0FBSixDQUFVRCxNQUFWLENBQVA7O0FBRUosSUFBTUUsa0JBQWtCLHVCQUF4Qjs7SUFDTUQ7bUJBQ1VELE1BQVosRUFBb0I7OzthQUNYQSxNQUFMLEdBQWNBLFVBQVUsRUFBeEI7YUFDS0csSUFBTCxHQUFZTixNQUFNTyxHQUFOLEVBQVo7YUFDS0MsS0FBTCxHQUFhUixNQUFNTyxHQUFOLEVBQWI7YUFDS0UsY0FBTCxHQUFzQlQsTUFBTU8sR0FBTixFQUF0QjthQUNLRyxNQUFMLEdBQWNWLE1BQU1PLEdBQU4sRUFBZDthQUNLSSxlQUFMLEdBQXVCWCxNQUFNTyxHQUFOLEVBQXZCOzs7OztrQ0FFTUosUUFBUTtpQkFDVEEsTUFBTCxHQUFjQSxNQUFkOzs7O2lDQUVLUyxLQUFLQyxPQUFPO2lCQUNaVixNQUFMLENBQVlTLEdBQVosSUFBbUJDLEtBQW5COzs7O29DQUVRO21CQUNELEtBQUtWLE1BQVo7Ozs7dUNBRVc7bUJBQ0osYUFBUDs7OztrQ0FFTTttQkFDQyxLQUFLQSxNQUFMLENBQVlXLFNBQVosSUFBeUJULGVBQWhDOzs7O2lDQUVLVSxNQUFNO21CQUNKLEtBQUtaLE1BQUwsQ0FBWVksSUFBWixDQUFQOzs7O21DQUVPO21CQUNBLFNBQVA7Ozs7b0NBRVE7bUJBQ0QsSUFBUDs7OztrQ0FFTTswQkFDTVYsZUFBWjs7Ozs7O0FDeENSLElBQU1MLFVBQVFDLFFBQVEsT0FBUixDQUFkO0FBQ0EsSUFBTWUsSUFBSWYsUUFBUSxRQUFSLENBQVY7QUFDQSxBQUVBLElBQU1nQiwwQkFBMEIsU0FBaEM7QUFDQSxJQUFNQyxzQkFBc0IsQ0FBQyxPQUFELEVBQVUsUUFBVixFQUFvQixlQUFwQixFQUFxQyxZQUFyQyxFQUFtRCxLQUFuRCxFQUEwRCxJQUExRCxDQUE1Qjs7QUFFQSxJQUFJQyx1Q0FDQ0YsdUJBREQsRUFDMkI7V0FBWUcsUUFBWjtDQUQzQixDQUFKOztBQUlBLEFBQU8sU0FBU0MsZ0JBQVQsR0FBdUU7UUFBN0NsQixNQUE2Qyx1RUFBcEMsRUFBb0M7UUFBaENtQixJQUFnQyx1RUFBekJMLHVCQUF5Qjs7UUFDdEVNLE1BQU1DLE9BQU4sQ0FBY0YsSUFBZCxDQUFKLEVBQXlCO2VBQ2RBLEtBQUtHLEdBQUwsQ0FBUzttQkFBS0osaUJBQWlCbEIsTUFBakIsRUFBeUJ1QixDQUF6QixDQUFMO1NBQVQsQ0FBUDs7UUFFQU4sV0FBVyxJQUFJTyxTQUFKLENBQWN4QixNQUFkLEVBQXNCbUIsSUFBdEIsQ0FBZjtRQUNJTSxjQUFjTixLQUFLTyxXQUFMLEdBQW1CQyxPQUFuQixDQUEyQixXQUEzQixFQUF3QyxFQUF4QyxDQUFsQjtRQUNJQyxVQUFVWixrQkFBa0JTLFdBQWxCLENBQWQ7UUFDSSxDQUFDRyxPQUFMLEVBQWM7WUFDTixDQUFDZixFQUFFZ0IsSUFBRixDQUFPZCxtQkFBUCxFQUE0QjttQkFBUVUsWUFBWUssVUFBWixDQUF1QmxCLElBQXZCLENBQVI7U0FBNUIsQ0FBTCxFQUF3RTs7b0JBRTVEbUIsSUFBUix1Q0FBaURaLElBQWpEOztrQkFFTUgsa0JBQWtCRix1QkFBbEIsQ0FBVjs7V0FFR2MsUUFBUVgsUUFBUixFQUFrQmpCLE1BQWxCLENBQVA7OztBQUdKLEFBQU8sU0FBU2dDLG9CQUFULENBQThCQyxXQUE5QixFQUEyQztRQUN4Q0MsV0FBVyxTQUFYQSxRQUFXLENBQUNDLGFBQUQsRUFBZ0JQLE9BQWhCLEVBQTRCO1lBQ25DSCxjQUFjVSxjQUFjVCxXQUFkLEVBQXBCOzBCQUNrQkQsV0FBbEIsSUFBaUNHLE9BQWpDO0tBRko7Z0JBSVksRUFBQ00sa0JBQUQsRUFBWjs7O0lBR0VWO3VCQUNVeEIsTUFBWixFQUFvQm1CLElBQXBCLEVBQTBCOzs7OzthQUNqQm5CLE1BQUwsR0FBY29DLE9BQU9DLE1BQVAsQ0FBYyxFQUFkLEVBQWtCO3FCQUNuQjtTQURDLEVBRVhyQyxNQUZXLENBQWQ7YUFHS21CLElBQUwsR0FBWUEsUUFBUSxTQUFwQjthQUNLbUIsT0FBTCxHQUFlekMsUUFBTTBDLElBQU4sQ0FBVyxJQUFYLEVBQWlCLEtBQWpCLEVBQXdCQyxTQUF4QixDQUFrQyxVQUFDNUIsSUFBRCxFQUFVO2dCQUNuREEsS0FBS2tCLFVBQUwsQ0FBZ0IsSUFBaEIsS0FBeUJsQixLQUFLa0IsVUFBTCxDQUFnQixJQUFoQixDQUF6QixJQUFrRGxCLEtBQUtrQixVQUFMLENBQWdCLElBQWhCLENBQXRELEVBQTZFO3VCQUNsRWxCLEtBQUs2QixTQUFMLENBQWUsQ0FBZixDQUFQOzttQkFFRzVCLEVBQUU2QixHQUFGLENBQU0sTUFBSzFDLE1BQVgsRUFBbUJZLElBQW5CLENBQVA7U0FKVyxDQUFmOzthQU9LK0IsT0FBTCxHQUFlOUMsUUFBTTBDLElBQU4sQ0FBVyxJQUFYLEVBQWlCLEtBQWpCLEVBQXdCQyxTQUF4QixDQUFrQyxVQUFDNUIsSUFBRCxFQUFPRixLQUFQLEVBQWlCO2dCQUMxREUsS0FBS2tCLFVBQUwsQ0FBZ0IsSUFBaEIsS0FBeUJsQixLQUFLa0IsVUFBTCxDQUFnQixJQUFoQixDQUF6QixJQUFrRGxCLEtBQUtrQixVQUFMLENBQWdCLElBQWhCLENBQXRELEVBQTZFO3VCQUNsRWxCLEtBQUs2QixTQUFMLENBQWUsQ0FBZixDQUFQOztjQUVGRyxHQUFGLENBQU0sTUFBSzVDLE1BQVgsRUFBbUJZLElBQW5CLEVBQXlCRixLQUF6QjtTQUpXLENBQWY7Z0JBTU02QixJQUFOLENBQVcsSUFBWCxFQUFpQixpQkFBakI7Z0JBQ01BLElBQU4sQ0FBVyxJQUFYLEVBQWlCLFlBQWpCO2dCQUNNQSxJQUFOLENBQVcsSUFBWCxFQUFpQixpQkFBakI7Z0JBQ01BLElBQU4sQ0FBVyxJQUFYLEVBQWlCLGtCQUFqQjtnQkFDTUEsSUFBTixDQUFXLElBQVgsRUFBaUIsYUFBakI7Z0JBQ01BLElBQU4sQ0FBVyxJQUFYLEVBQWlCLFNBQWpCO2dCQUNNQSxJQUFOLENBQVcsSUFBWCxFQUFpQixvQkFBakI7Ozs7O2lDQUdFOzs7aUNBRUE7Ozs2QkFHRDNCLE1BQU07Z0JBQ0hpQyxrQkFBa0IsS0FBSzdDLE1BQUwsQ0FBWThDLE9BQVosQ0FBb0JsQyxJQUFwQixDQUF0QjtnQkFDSWlDLDJCQUEyQnJCLFNBQS9CLEVBQTBDO3VCQUMvQnFCLGVBQVA7O2dCQUVBLENBQUNBLGVBQUQsSUFBb0IsS0FBSzdDLE1BQUwsQ0FBWThDLE9BQVosQ0FBb0JDLGNBQXBCLENBQW1DbkMsSUFBbkMsQ0FBeEIsRUFBa0U7dUJBQ3ZEaUMsZUFBUDs7Z0JBRUFBLG9CQUFvQixJQUF4QixFQUE4QjtrQ0FDUi9CLHVCQUFsQjs7Z0JBRUVrQyxZQUFZLEtBQUtoRCxNQUFMLENBQVk4QyxPQUFaLENBQW9CbEMsSUFBcEIsSUFBNEJNLGlCQUFpQixLQUFLbEIsTUFBdEIsRUFBOEI2QyxlQUE5QixDQUE5QzttQkFDT0csU0FBUDs7OztxQ0FFUzttQkFDRixLQUFLaEQsTUFBTCxDQUFZLFNBQVosQ0FBUDs7Ozt1Q0FFV1MsS0FBSzttQkFDVCxLQUFLVCxNQUFMLENBQVlTLEdBQVosQ0FBUDs7OzsrQ0FFbUI7bUJBQ1osSUFBUDs7OztxQ0FFUzttQkFDRixJQUFQOzs7O3NDQUVVO21CQUNILENBQUMsSUFBRCxDQUFQOzs7O2lDQUVLRyxNQUFNO21CQUNKLEtBQUtaLE1BQUwsQ0FBWVksSUFBWixLQUFxQmIsY0FBNUI7Ozs7c0NBRVU7K0JBQ08sS0FBS0MsTUFBTCxDQUFZLFNBQVosQ0FBakI7Ozs7a0NBRU07bUJBQ0MsS0FBS21CLElBQVo7Ozs7a0NBRU07bUJBQ0MsS0FBS0EsSUFBWjs7OztxQ0FFU1YsS0FBSzttQkFDUCxLQUFLVCxNQUFMLENBQVlTLEdBQVosQ0FBUDs7OzttQ0FFTzttQkFDQSxJQUFQOzs7O3FDQUVTO21CQUNGLEtBQVA7Ozs7cUNBRVM7bUJBQ0YsSUFBUDs7OztxQ0FFU0csTUFBTTttQkFDUixLQUFLTyxJQUFMLEtBQWNQLElBQXJCOzs7O2tDQUVNO21CQUNDLElBQVA7Ozs7OztBQzlIUixJQUFNZixVQUFRQyxRQUFRLE9BQVIsQ0FBZDs7QUFFQSxJQUFNbUQsMEJBQTBCLFNBQTFCQSx1QkFBMEI7d0JBQXdCQyxTQUF4QjtDQUFoQztBQUNBLElBQWFDLFFBQWI7d0JBQ2tCOzs7Z0JBQ0paLElBQU4sQ0FBVyxJQUFYLEVBQWlCLFVBQWpCLEVBQTZCQyxTQUE3QixDQUF1QyxVQUFDUSxTQUFELEVBQVlFLFNBQVosRUFBMEI7bUJBQ3RERixVQUFVSixHQUFWLENBQWNLLHdCQUF3QkMsU0FBeEIsQ0FBZCxFQUFrRCxJQUFsRCxDQUFQO1NBREo7Z0JBR01YLElBQU4sQ0FBVyxJQUFYLEVBQWlCLGFBQWpCLEVBQWdDQyxTQUFoQyxDQUEwQyxVQUFDUSxTQUFELEVBQVlFLFNBQVosRUFBMEI7bUJBQ3pERixVQUFVSixHQUFWLENBQWNLLHdCQUF3QkMsU0FBeEIsQ0FBZCxFQUFrRCxLQUFsRCxDQUFQO1NBREo7Z0JBR01YLElBQU4sQ0FBVyxJQUFYLEVBQWlCLFVBQWpCLEVBQTZCQyxTQUE3QixDQUF1QyxVQUFDUSxTQUFELEVBQVlFLFNBQVosRUFBMEI7bUJBQ3RERixVQUFVTixHQUFWLENBQWNPLHdCQUF3QkMsU0FBeEIsQ0FBZCxDQUFQO1NBREo7Z0JBR01YLElBQU4sQ0FBVyxJQUFYLEVBQWlCLGFBQWpCLEVBQWdDQyxTQUFoQyxDQUEwQyxVQUFDUSxTQUFELEVBQVlFLFNBQVosRUFBMEI7c0JBQ3RETixHQUFWLENBQWNLLHdCQUF3QkMsU0FBeEIsQ0FBZCxFQUFrRCxDQUFDRixVQUFVTixHQUFWLENBQWNPLHdCQUF3QkMsU0FBeEIsQ0FBZCxDQUFuRDtTQURKO2FBR0tFLE9BQUwsR0FBZSxlQUFPO2dCQUNkQyxRQUFRQyxTQUFSLElBQXFCRCxRQUFRLElBQTdCLElBQXFDQSxRQUFRLEVBQWpELEVBQXFEO3VCQUMxQyxJQUFQOztnQkFFQWpDLE1BQU1DLE9BQU4sQ0FBY2dDLEdBQWQsQ0FBSixFQUF3Qjt1QkFDYkEsSUFBSUUsTUFBSixLQUFlLENBQXRCO2FBREosTUFFTyxJQUFJLFFBQU9GLEdBQVAseUNBQU9BLEdBQVAsT0FBZSxRQUFmLElBQTJCakIsT0FBT29CLFNBQVAsQ0FBaUJDLFFBQWpCLENBQTBCQyxJQUExQixDQUErQkwsR0FBL0IsTUFBd0MsaUJBQXZFLEVBQTBGO3VCQUN0RmpCLE9BQU91QixJQUFQLENBQVlOLEdBQVosRUFBaUJFLE1BQWpCLEtBQTRCLENBQW5DOzttQkFFRyxLQUFQO1NBVEo7YUFXS0ssaUJBQUwsR0FBeUIsZUFBTzttQkFDckJQLFFBQVFDLFNBQVIsSUFBcUJELFFBQVEsSUFBcEM7U0FESjs7Ozs7bUNBSU87OztzQ0FDRzs7O21DQUNIOzs7c0NBQ0c7Ozt3Q0FDRVEsR0FqQ3BCLEVBaUN5Qjs7bUJBRVZBLFFBQVFQLFNBQVIsSUFBcUJPLFFBQVEsSUFBN0IsSUFBcUNBLFFBQVEsS0FBN0MsSUFBc0RBLFFBQVEsQ0FBOUQsSUFBbUVBLFFBQVEsT0FBM0UsSUFBc0ZBLFFBQVEsRUFBOUYsSUFBb0dBLFFBQVEsR0FBbkg7Ozs7Z0NBRUlDLEdBckNaLEVBcUNpQjs7bUJBRUYsQ0FBQyxPQUFPMUMsTUFBTUMsT0FBYixLQUF5QixVQUF6QixHQUFzQ0QsTUFBTUMsT0FBNUMsR0FBc0QsVUFBUzBDLEdBQVQsRUFBYzt1QkFDakUzQixPQUFPb0IsU0FBUCxDQUFpQkMsUUFBakIsQ0FBMEJDLElBQTFCLENBQStCSyxHQUEvQixNQUF3QyxnQkFBL0M7YUFERyxFQUVKRCxHQUZJLENBQVA7Ozs7aUNBSUtULEdBM0NiLEVBMkNrQjs7bUJBRUgsUUFBT0EsR0FBUCx5Q0FBT0EsR0FBUCxPQUFlLFFBQWYsSUFBMkJBLFFBQVEsSUFBbkMsSUFBMkMsQ0FBQ2pDLE1BQU1DLE9BQU4sQ0FBY2dDLEdBQWQsQ0FBbkQ7Ozs7b0NBRVFBLEdBL0NoQixFQStDb0I7O21CQUVMQSxRQUFRQyxTQUFmOzs7Ozs7QUNwRFIsSUFBTXpELFVBQVFDLFFBQVEsT0FBUixDQUFkOztBQUVBLEFBRU8sU0FBU2tFLFdBQVQsR0FBa0M7UUFBYmhFLE1BQWEsdUVBQUosRUFBSTs7V0FDOUIsSUFBSWlFLElBQUosQ0FBU2pFLE1BQVQsQ0FBUDs7O0FBR0osSUFFTWlFO2tCQUNVakUsTUFBWixFQUFvQjs7Ozs7YUFDWEEsTUFBTCxHQUFjQSxNQUFkO2FBQ0trRSxJQUFMLEdBQVksSUFBSWYsUUFBSixFQUFaO2FBQ0tiLE9BQUwsR0FBZXpDLFFBQU0wQyxJQUFOLENBQVcsSUFBWCxFQUFpQixLQUFqQixFQUF3QkMsU0FBeEIsQ0FBa0MsVUFBQzVCLElBQUQ7bUJBQVVaLE9BQU9ZLElBQVAsQ0FBVjtTQUFsQyxDQUFmO2FBQ0srQixPQUFMLEdBQWU5QyxRQUFNMEMsSUFBTixDQUFXLElBQVgsRUFBaUIsS0FBakIsRUFBd0JDLFNBQXhCLENBQWtDLFVBQUM1QixJQUFELEVBQU9GLEtBQVA7bUJBQWlCVixPQUFPWSxJQUFQLElBQWVGLEtBQWhDO1NBQWxDLENBQWY7YUFDS3lELGlCQUFMLEdBQXlCdEUsUUFBTTBDLElBQU4sQ0FBVyxJQUFYLEVBQWlCLGVBQWpCLEVBQWtDQyxTQUFsQyxDQUE0QyxVQUFDNEIsTUFBRDttQkFBWUEsVUFBVUEsT0FBT0MsY0FBakIsSUFBbUNELE9BQU9DLGNBQVAsQ0FBc0IsSUFBdEIsQ0FBL0M7U0FBNUMsQ0FBekI7Z0JBQ005QixJQUFOLENBQVcsSUFBWCxFQUFpQixjQUFqQjtnQkFDTUEsSUFBTixDQUFXLElBQVgsRUFBaUIsU0FBakIsRUFBNEJDLFNBQTVCLENBQXNDLFlBQU07bUJBQ2pDLE1BQUs4QixhQUFMLEtBQXVCLE1BQUtBLGFBQUwsR0FBcUIsSUFBSXBELGdCQUFKLEVBQTVDLENBQVA7U0FESjtnQkFHTXFCLElBQU4sQ0FBVyxJQUFYLEVBQWlCLGFBQWpCOzs7OztrQ0FHTXZDLFFBQVE7bUJBQ1BxQyxNQUFQLENBQWMsS0FBS3JDLE1BQW5CLEVBQTJCQSxNQUEzQjs7OztpQ0FHRTs7O3dDQUdVOzs7d0NBR0FtQixNQUFNb0QsWUFBWUMsVUFBVTtpQkFDbkNDLGVBQUwsQ0FBcUJ0RCxJQUFyQixHQUE0QkEsSUFBNUI7aUJBQ0tzRCxlQUFMLENBQXFCRixVQUFyQixHQUFrQ0EsVUFBbEM7Ozs7Z0JBSU12QixTQU5rQyxHQU1wQixLQUFLeUIsZUFOZSxDQU1sQ3pCLFNBTmtDOztnQkFPcEMsQ0FBQ0EsU0FBTCxFQUFnQjs0QkFDQSxJQUFJOUIsZ0JBQUosQ0FBcUJxRCxVQUFyQixFQUFpQ3BELElBQWpDLENBQVo7YUFESixNQUVPO3FCQUNFc0QsZUFBTCxDQUFxQnpCLFNBQXJCLEdBQWlDLElBQWpDOztnQkFFQXdCLFFBQUosRUFBYzt5QkFDRHhCLFNBQVQsRUFBb0IsU0FBcEIsRUFBK0IsQ0FBQyxTQUFELENBQS9COzttQkFFR0EsU0FBUDs7Ozt5Q0FFYTBCLGVBQWVGLFVBQVU7OztnQkFDaENHLFNBQVNELGNBQ1ZwRCxHQURVLENBQ047dUJBQU8sT0FBS21ELGVBQUwsQ0FBcUJHLElBQUksQ0FBSixDQUFyQixFQUE2QkEsSUFBSSxDQUFKLENBQTdCLENBQVA7YUFETSxDQUFmO2dCQUVJSixRQUFKLEVBQWM7eUJBQ0RHLE1BQVQsRUFBaUIsU0FBakIsRUFBNEJBLE9BQU9yRCxHQUFQLENBQVk7MkJBQU0sU0FBTjtpQkFBWixDQUE1Qjs7bUJBRUdxRCxNQUFQOzs7O29DQUVRSCxVQUFVO21CQUNYLFlBQWtCOzRCQUNUQSxvQ0FBWjthQURKOzs7O3FDQUlTSyxJQUFJO21CQUNOLEtBQUs3RSxNQUFMLENBQVk2RSxFQUFaLENBQVA7Ozs7dUNBRVc7OztrQ0FDTDs7O2lDQUNEakUsTUFBTTttQkFDSixLQUFLWixNQUFMLENBQVksV0FBV1ksSUFBdkIsQ0FBUDs7Ozs0QkFFQUYsT0FBT29FLEtBQUs7O3VCQUVEQyxRQUFRQyxHQUFSLENBQVl0RSxLQUFaLEVBQW1Cb0UsR0FBbkIsQ0FBWDs7OztzQ0FFVTs7Ozs7QUM1RWxCLElBQU1qRixVQUFRQyxRQUFRLE9BQVIsQ0FBZDs7QUFFQSxBQUFPLFNBQVNtRixlQUFULEdBQXNDO1FBQWJqRixNQUFhLHVFQUFKLEVBQUk7O1dBQ2xDLElBQUlrRixRQUFKLENBQWFsRixNQUFiLENBQVA7OztBQUdKLEFBQU8sU0FBU21GLGlCQUFULEdBQTBDO1FBQWZDLFFBQWUsdUVBQUosRUFBSTs7V0FDdEMsSUFBSUMsY0FBSixDQUFtQkQsUUFBbkIsQ0FBUDs7O0FBR0osQUFBTyxTQUFTRSxlQUFULENBQXlCQyxPQUF6QixFQUFrQztXQUM5QixJQUFJRixjQUFKLENBQW1CLElBQW5CLEVBQXlCRSxPQUF6QixDQUFQOzs7SUFHRUw7c0JBQ1VQLE1BQVosRUFBb0Q7WUFBaENhLHVCQUFnQyx1RUFBTixJQUFNOzs7YUFDM0N4RixNQUFMLEdBQWMsSUFBZDthQUNLMkUsTUFBTCxHQUFjQSxNQUFkO2FBQ0thLHVCQUFMLEdBQStCQSx1QkFBL0I7YUFDS0MsWUFBTCxHQUFvQixLQUFwQjthQUNLQyxZQUFMLEdBQW9CLEtBQXBCO2dCQUNNbkQsSUFBTixDQUFXLElBQVgsRUFBaUIsYUFBakI7Z0JBQ01BLElBQU4sQ0FBVyxJQUFYLEVBQWlCLGNBQWpCOzs7OztrQ0FFTXZDLFFBQVE7aUJBQ1RBLE1BQUwsR0FBY0EsTUFBZDs7OztpQ0FFS1MsS0FBS0MsT0FBTztpQkFDWlYsTUFBTCxHQUFjb0MsT0FBT0MsTUFBUCxDQUFjLEtBQUtyQyxNQUFuQixxQkFBNkJTLEdBQTdCLEVBQW9DQyxLQUFwQyxFQUFkOzs7O29DQUVRO21CQUNELEtBQUtWLE1BQVo7Ozs7b0NBRVEyRixLQUFLbkIsVUFBVTtpQkFDbEJtQixHQUFMLEdBQVdBLEdBQVg7aUJBQ0tuQixRQUFMLEdBQWdCQSxRQUFoQjs7Ozt5Q0FFZ0M7Z0JBQXJCb0IsV0FBcUIsdUVBQVAsS0FBTzs7Z0JBQzVCQSxlQUFlLENBQUMsS0FBS0osdUJBQXpCLEVBQWtEOzs7aUJBRzdDaEIsUUFBTCxJQUFpQixLQUFLQSxRQUFMLENBQWNxQixJQUFkLENBQW1CLEtBQUtGLEdBQXhCLEVBQTZCLEtBQUtoQixNQUFsQyxDQUFqQjs7OzttQ0FFTzttQkFDQSxLQUFLQSxNQUFMLENBQVltQixRQUFaLEVBQVA7Ozs7aUNBRUtsRixNQUFNO21CQUNKLEtBQUtaLE1BQUwsR0FBYyxLQUFLQSxNQUFMLENBQVlZLElBQVosQ0FBZCxHQUFrQyxJQUF6Qzs7Ozt5Q0FFYTttQkFDTixLQUFLK0QsTUFBWjs7OzttQ0FFTzttQkFDQSxLQUFLQSxNQUFMLENBQVlvQixRQUFaLEVBQVA7Ozs7dUNBRVc7bUJBQ0osS0FBS04sWUFBWjs7Ozt1Q0FFVzs7O3dDQUVDO2lCQUNQQSxZQUFMLEdBQW9CLElBQXBCOzs7O3NDQUVVOzs7OztJQUlaSjs0QkFDVUQsUUFBWixFQUEyQztZQUFyQlksWUFBcUIsdUVBQU4sSUFBTTs7O2FBQ2xDWixRQUFMLEdBQWdCQSxRQUFoQjthQUNLWSxZQUFMLEdBQW9CQSxZQUFwQjs7Ozs7bUNBRU87bUJBQ0EsS0FBS0EsWUFBTCxHQUFvQixPQUFwQixHQUE4QixTQUFyQzs7OzttQ0FFTzttQkFDQSxLQUFLQSxZQUFMLEdBQW9CLENBQUMsRUFBQ1QsU0FBUyxLQUFLUyxZQUFmLEVBQUQsQ0FBcEIsR0FBcUQsRUFBNUQ7Ozs7eUNBRWE7bUJBQ04sS0FBS1osUUFBWjs7Ozs7O0FDekVSYSxPQUFPQyxPQUFQLEdBQWlCO3NCQUFBOzhCQUFBO3NDQUFBOzhDQUFBOzRCQUFBO29DQUFBO3dDQUFBOztDQUFqQiJ9
