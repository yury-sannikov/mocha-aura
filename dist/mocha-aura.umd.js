(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(factory());
}(this, (function () { 'use strict';

/*global Proxy*/
var sinon = require('sinon');

function stubifyInstance(ctor, instance) {
    Object.getOwnPropertyNames(ctor.prototype).forEach(function (prop) {
        if (typeof ctor.prototype[prop] !== 'function' || prop === 'constructor') {
            return;
        }
        instance['stub_' + prop] = sinon.stub(instance, prop).callsFake(function (propName) {
            return function () {
                var _ctor$prototype$propN;

                for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
                    args[_key] = arguments[_key];
                }

                return (_ctor$prototype$propN = ctor.prototype[propName]).call.apply(_ctor$prototype$propN, [instance].concat(args));
            };
        }(prop));
    });
}

function stubifyInstanceOnDemand(ctor, instance) {
    var handler = {
        _instanceProps: {},
        defineProperty: function defineProperty(target, property, descriptor) {
            handler._instanceProps[property] = descriptor;
            return true;
        },
        get: function get(target, propKey) {
            // Check for Symbol for iterators
            if (typeof propKey !== 'string') {
                return target[propKey];
            }
            // If we add some props to the instance, return it w/o mocking
            // Usually added stuff is mocked through data adapters
            if (handler._instanceProps[propKey]) {
                return handler._instanceProps[propKey].value;
            }

            //Warn on unknown propKey for better debugging
            if (!target[propKey]) {
                /*eslint no-console: 0*/
                console.warn('\n\nstubifyInstanceOnDemand: Unknown property ' + propKey, '\n\n');
                return target[propKey];
            }

            // Stub methods that defined on prototype only, e.g. has public api
            var stubName = 'stub_' + propKey;
            var isSpyOrStubbed = !!(target[propKey] && target[propKey].calledBefore);
            var hasOnProto = !!ctor.prototype[propKey];

            if (hasOnProto && !isSpyOrStubbed && typeof target[propKey] === 'function' && propKey !== 'constructor') {
                target[stubName] = sinon.stub(target, propKey).callsFake(function () {
                    var _ctor$prototype$propK;

                    for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
                        args[_key2] = arguments[_key2];
                    }

                    return (_ctor$prototype$propK = ctor.prototype[propKey]).call.apply(_ctor$prototype$propK, [instance].concat(args));
                });
            }
            return target[propKey];
        }
    };

    var proxy = new Proxy(instance, handler);
    return proxy;
}

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

function eventFactory() {
    var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    return stubifyInstanceOnDemand(Event, new Event(params));
}
var FAKE_EVENT_NAME = 'mocha-aura-fake-event';

var Event = function () {
    function Event(params) {
        classCallCheck(this, Event);

        this.params = params || {};
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
    }, {
        key: 'fire',
        value: function fire() {}
    }, {
        key: 'pause',
        value: function pause() {}
    }, {
        key: 'preventDefault',
        value: function preventDefault() {}
    }, {
        key: 'resume',
        value: function resume() {}
    }, {
        key: 'stopPropagation',
        value: function stopPropagation() {}
    }]);
    return Event;
}();

var _ = require('lodash');
var DefaultComponentAdapter = 'default';
var WellKnownComponents = ['aura:', 'force:', 'forceChatter:', 'lightning:', 'ui:', 'c:'];

var ComponentAdapters = defineProperty({}, DefaultComponentAdapter, function (instance) {
    return instance;
});

function componentFactoryForArray(params, arrayOfTypes) {
    return arrayOfTypes.map(function (typeOrComponent) {
        return componentFactory(params, typeOrComponent);
    });
}

function componentFactory() {
    var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var typeOrComponent = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : DefaultComponentAdapter;

    if (Array.isArray(typeOrComponent)) {
        throw new Error('Unexpected type argument');
    }

    if (typeOrComponent === true) {
        typeOrComponent = DefaultComponentAdapter;
    } else if (typeOrComponent instanceof Component) {
        return typeOrComponent;
    } else if (typeOrComponent === null) {
        return null;
    }

    var instance = stubifyInstanceOnDemand(Component, new Component(params, typeOrComponent));
    var adapterName = typeOrComponent.toLowerCase().replace('markup://', '');
    var adapter = ComponentAdapters[adapterName];
    if (!adapter) {
        if (!_.some(WellKnownComponents, function (name) {
            return adapterName.startsWith(name);
        })) {
            /*eslint no-console: 0*/
            console.warn('Unable to find component adapter ' + typeOrComponent);
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
        classCallCheck(this, Component);

        this.params = Object.assign({}, {
            findMap: {}
        }, params);
        this.type = type || 'default';
        //stubifyInstance(Component, this);
    }

    createClass(Component, [{
        key: 'get',
        value: function get$$1(name) {
            if (name.startsWith('v.') || name.startsWith('c.') || name.startsWith('e.')) {
                name = name.substring(2);
            }
            return _.get(this.params, name);
        }
    }, {
        key: 'set',
        value: function set$$1(name, value) {
            if (name.startsWith('v.') || name.startsWith('c.') || name.startsWith('e.')) {
                name = name.substring(2);
            }
            _.set(this.params, name, value);
        }
    }, {
        key: 'find',
        value: function find(name) {
            var typeOrComponent = this.params.findMap[name];
            if (!typeOrComponent && this.params.findMap.hasOwnProperty(name)) {
                return typeOrComponent;
            }

            var component = this.params.findMap[name] = Array.isArray(typeOrComponent) ? componentFactoryForArray(this.params, typeOrComponent) : componentFactory(this.params, typeOrComponent);
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
    }, {
        key: 'addEventHandler',
        value: function addEventHandler() {}
    }, {
        key: 'addHandler',
        value: function addHandler() {}
    }, {
        key: 'addValueHandler',
        value: function addValueHandler() {}
    }, {
        key: 'addValueProvider',
        value: function addValueProvider() {}
    }, {
        key: 'autoDestroy',
        value: function autoDestroy() {}
    }, {
        key: 'destroy',
        value: function destroy() {}
    }, {
        key: 'removeEventHandler',
        value: function removeEventHandler() {}
    }]);
    return Component;
}();

var classNameToComponentVar = function classNameToComponentVar(className) {
    return 'v.__cls_' + className;
};
var AuraUtil = function () {
    function AuraUtil() {
        classCallCheck(this, AuraUtil);

        stubifyInstance(AuraUtil, this);
    }

    createClass(AuraUtil, [{
        key: 'isEmpty',
        value: function isEmpty(obj) {
            if (obj === undefined || obj === null || obj === '') {
                return true;
            }
            if (Array.isArray(obj)) {
                return obj.length === 0;
            } else if ((typeof obj === 'undefined' ? 'undefined' : _typeof(obj)) === 'object' && Object.prototype.toString.call(obj) === '[object Object]') {
                return Object.keys(obj).length === 0;
            }
            return false;
        }
    }, {
        key: 'isUndefinedOrNull',
        value: function isUndefinedOrNull(obj) {
            return obj === undefined || obj === null;
        }
    }, {
        key: 'addClass',
        value: function addClass(component, className) {
            return component.set(classNameToComponentVar(className), true);
        }
    }, {
        key: 'removeClass',
        value: function removeClass(component, className) {
            return component.set(classNameToComponentVar(className), false);
        }
    }, {
        key: 'hasClass',
        value: function hasClass(component, className) {
            return component.get(classNameToComponentVar(className));
        }
    }, {
        key: 'toggleClass',
        value: function toggleClass(component, className) {
            component.set(classNameToComponentVar(className), !component.get(classNameToComponentVar(className)));
        }
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

function auraFactory() {
    var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    return new Aura(params);
}

var Aura = function () {
    function Aura(params) {
        classCallCheck(this, Aura);

        this.params = params;
        this.util = new AuraUtil();
        stubifyInstance(Aura, this);
    }

    createClass(Aura, [{
        key: 'setParams',
        value: function setParams(params) {
            Object.assign(this.params, params);
        }
    }, {
        key: 'get',
        value: function get$$1(name) {
            return this.params[name];
        }
    }, {
        key: 'set',
        value: function set$$1(name, value) {
            this.params[name] = value;
        }
    }, {
        key: 'enqueueAction',
        value: function enqueueAction(action) {
            action && action.invokeCallback && action.invokeCallback(true);
        }
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
            var _this = this;

            var result = componentDefs.map(function (def) {
                return _this.createComponent(def[0], def[1]);
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
        value: function getRoot() {
            return this.rootComponent || (this.rootComponent = new componentFactory());
        }
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

function apexCallFactory() {
    var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    return stubifyInstanceOnDemand(ApexCall, new ApexCall(params));
}

function apexSuccessResult() {
    var response = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    return stubifyInstanceOnDemand(ApexCallResult, new ApexCallResult(response));
}

function apexErrorResult(message) {
    return stubifyInstanceOnDemand(ApexCallResult, new ApexCallResult(null, message));
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

})));
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9jaGEtYXVyYS51bWQuanMiLCJzb3VyY2VzIjpbIi4uL2xpYi9zaW5vbkhlbHBlcnMuanMiLCIuLi9saWIvZXZlbnRGYWN0b3J5LmpzIiwiLi4vbGliL2NvbXBvbmVudEZhY3RvcnkuanMiLCIuLi9saWIvYXVyYVV0aWwuanMiLCIuLi9saWIvYXVyYUZhY3RvcnkuanMiLCIuLi9saWIvYXBleENhbGxGYWN0b3J5LmpzIiwiLi4vbGliL2F1cmEuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLypnbG9iYWwgUHJveHkqL1xuY29uc3Qgc2lub24gPSByZXF1aXJlKCdzaW5vbicpO1xuXG5leHBvcnQgZnVuY3Rpb24gc3R1YmlmeUluc3RhbmNlKGN0b3IsIGluc3RhbmNlKSB7XG4gICAgT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMoY3Rvci5wcm90b3R5cGUpLmZvckVhY2gocHJvcCA9PiB7XG4gICAgICAgIGlmICh0eXBlb2YgY3Rvci5wcm90b3R5cGVbcHJvcF0gIT09ICdmdW5jdGlvbicgfHwgcHJvcCA9PT0gJ2NvbnN0cnVjdG9yJykge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGluc3RhbmNlWydzdHViXycgKyBwcm9wXSA9IHNpbm9uLnN0dWIoaW5zdGFuY2UsIHByb3ApLmNhbGxzRmFrZSgoKHByb3BOYW1lKSA9PiAoLi4uYXJncykgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIGN0b3IucHJvdG90eXBlW3Byb3BOYW1lXS5jYWxsKGluc3RhbmNlLCAuLi5hcmdzKTtcbiAgICAgICAgfSkocHJvcCkpXG4gICAgfSlcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHN0dWJpZnlJbnN0YW5jZU9uRGVtYW5kKGN0b3IsIGluc3RhbmNlKSB7XG4gICAgY29uc3QgaGFuZGxlciA9IHtcbiAgICAgICAgX2luc3RhbmNlUHJvcHM6IHt9LFxuICAgICAgICBkZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIHByb3BlcnR5LCBkZXNjcmlwdG9yKSB7XG4gICAgICAgICAgICBoYW5kbGVyLl9pbnN0YW5jZVByb3BzW3Byb3BlcnR5XSA9IGRlc2NyaXB0b3I7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfSxcbiAgICAgICAgZ2V0KHRhcmdldCwgcHJvcEtleSkge1xuICAgICAgICAgICAgLy8gQ2hlY2sgZm9yIFN5bWJvbCBmb3IgaXRlcmF0b3JzXG4gICAgICAgICAgICBpZiAodHlwZW9mIHByb3BLZXkgIT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRhcmdldFtwcm9wS2V5XTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIElmIHdlIGFkZCBzb21lIHByb3BzIHRvIHRoZSBpbnN0YW5jZSwgcmV0dXJuIGl0IHcvbyBtb2NraW5nXG4gICAgICAgICAgICAvLyBVc3VhbGx5IGFkZGVkIHN0dWZmIGlzIG1vY2tlZCB0aHJvdWdoIGRhdGEgYWRhcHRlcnNcbiAgICAgICAgICAgIGlmIChoYW5kbGVyLl9pbnN0YW5jZVByb3BzW3Byb3BLZXldKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGhhbmRsZXIuX2luc3RhbmNlUHJvcHNbcHJvcEtleV0udmFsdWVcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy9XYXJuIG9uIHVua25vd24gcHJvcEtleSBmb3IgYmV0dGVyIGRlYnVnZ2luZ1xuICAgICAgICAgICAgaWYgKCF0YXJnZXRbcHJvcEtleV0pIHtcbiAgICAgICAgICAgICAgICAvKmVzbGludCBuby1jb25zb2xlOiAwKi9cbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oJ1xcblxcbnN0dWJpZnlJbnN0YW5jZU9uRGVtYW5kOiBVbmtub3duIHByb3BlcnR5ICcgKyBwcm9wS2V5LCAnXFxuXFxuJyk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRhcmdldFtwcm9wS2V5XTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gU3R1YiBtZXRob2RzIHRoYXQgZGVmaW5lZCBvbiBwcm90b3R5cGUgb25seSwgZS5nLiBoYXMgcHVibGljIGFwaVxuICAgICAgICAgICAgY29uc3Qgc3R1Yk5hbWUgPSAnc3R1Yl8nICsgcHJvcEtleTtcbiAgICAgICAgICAgIGNvbnN0IGlzU3B5T3JTdHViYmVkID0gISEodGFyZ2V0W3Byb3BLZXldICYmIHRhcmdldFtwcm9wS2V5XS5jYWxsZWRCZWZvcmUpO1xuICAgICAgICAgICAgY29uc3QgaGFzT25Qcm90byA9ICEhY3Rvci5wcm90b3R5cGVbcHJvcEtleV07XG5cbiAgICAgICAgICAgIGlmIChoYXNPblByb3RvICYmICFpc1NweU9yU3R1YmJlZCAmJiB0eXBlb2YgdGFyZ2V0W3Byb3BLZXldID09PSAnZnVuY3Rpb24nICYmIHByb3BLZXkgIT09ICdjb25zdHJ1Y3RvcicpIHtcbiAgICAgICAgICAgICAgICB0YXJnZXRbc3R1Yk5hbWVdID0gc2lub24uc3R1Yih0YXJnZXQsIHByb3BLZXkpLmNhbGxzRmFrZSgoLi4uYXJncykgPT4ge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gY3Rvci5wcm90b3R5cGVbcHJvcEtleV0uY2FsbChpbnN0YW5jZSwgLi4uYXJncyk7XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB0YXJnZXRbcHJvcEtleV07XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zdCBwcm94eSA9IG5ldyBQcm94eShpbnN0YW5jZSwgaGFuZGxlcik7XG4gICAgcmV0dXJuIHByb3h5O1xufSIsImltcG9ydCB7IHN0dWJpZnlJbnN0YW5jZU9uRGVtYW5kIH0gZnJvbSAnLi9zaW5vbkhlbHBlcnMnXG5cbmV4cG9ydCBmdW5jdGlvbiBldmVudEZhY3RvcnkocGFyYW1zID0ge30pIHtcbiAgICByZXR1cm4gc3R1YmlmeUluc3RhbmNlT25EZW1hbmQoRXZlbnQsIG5ldyBFdmVudChwYXJhbXMpKTtcbn1cbmNvbnN0IEZBS0VfRVZFTlRfTkFNRSA9ICdtb2NoYS1hdXJhLWZha2UtZXZlbnQnXG5cbmNsYXNzIEV2ZW50IHtcbiAgICBjb25zdHJ1Y3RvcihwYXJhbXMpIHtcbiAgICAgICAgdGhpcy5wYXJhbXMgPSBwYXJhbXMgfHwge307XG4gICAgfVxuICAgIHNldFBhcmFtcyhwYXJhbXMpIHtcbiAgICAgICAgdGhpcy5wYXJhbXMgPSBwYXJhbXM7XG4gICAgfVxuICAgIHNldFBhcmFtKGtleSwgdmFsdWUpIHtcbiAgICAgICAgdGhpcy5wYXJhbXNba2V5XSA9IHZhbHVlO1xuICAgIH1cbiAgICBnZXRQYXJhbXMoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnBhcmFtcztcbiAgICB9XG4gICAgZ2V0RXZlbnRUeXBlKCkge1xuICAgICAgICByZXR1cm4gJ0FQUExJQ0FUSU9OJ1xuICAgIH1cbiAgICBnZXROYW1lKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wYXJhbXMuZXZlbnROYW1lIHx8IEZBS0VfRVZFTlRfTkFNRVxuICAgIH1cbiAgICBnZXRQYXJhbShuYW1lKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnBhcmFtc1tuYW1lXVxuICAgIH1cbiAgICBnZXRQaGFzZSgpIHtcbiAgICAgICAgcmV0dXJuICdkZWZhdWx0J1xuICAgIH1cbiAgICBnZXRTb3VyY2UoKSB7XG4gICAgICAgIHJldHVybiBudWxsXG4gICAgfVxuICAgIGdldFR5cGUoKSB7XG4gICAgICAgIHJldHVybiBgYzoke0ZBS0VfRVZFTlRfTkFNRX1gXG4gICAgfVxuICAgIGZpcmUoKSB7fVxuICAgIHBhdXNlKCkge31cbiAgICBwcmV2ZW50RGVmYXVsdCgpIHt9XG4gICAgcmVzdW1lKCkge31cbiAgICBzdG9wUHJvcGFnYXRpb24oKSB7fVxuICAgIFxuXG59IiwiY29uc3QgXyA9IHJlcXVpcmUoJ2xvZGFzaCcpO1xuaW1wb3J0IHsgZXZlbnRGYWN0b3J5IH0gZnJvbSAnLi9ldmVudEZhY3RvcnknXG5pbXBvcnQgeyBzdHViaWZ5SW5zdGFuY2VPbkRlbWFuZCB9IGZyb20gJy4vc2lub25IZWxwZXJzJ1xuXG5jb25zdCBEZWZhdWx0Q29tcG9uZW50QWRhcHRlciA9ICdkZWZhdWx0J1xuY29uc3QgV2VsbEtub3duQ29tcG9uZW50cyA9IFsnYXVyYTonLCAnZm9yY2U6JywgJ2ZvcmNlQ2hhdHRlcjonLCAnbGlnaHRuaW5nOicsICd1aTonLCAnYzonXVxuXG5sZXQgQ29tcG9uZW50QWRhcHRlcnMgPSB7XG4gICAgW0RlZmF1bHRDb21wb25lbnRBZGFwdGVyXTogaW5zdGFuY2UgPT4gaW5zdGFuY2Vcbn1cblxuZnVuY3Rpb24gY29tcG9uZW50RmFjdG9yeUZvckFycmF5KHBhcmFtcywgYXJyYXlPZlR5cGVzKSB7XG4gICAgcmV0dXJuIGFycmF5T2ZUeXBlcy5tYXAodHlwZU9yQ29tcG9uZW50ID0+IGNvbXBvbmVudEZhY3RvcnkocGFyYW1zLCB0eXBlT3JDb21wb25lbnQpKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNvbXBvbmVudEZhY3RvcnkocGFyYW1zID0ge30sIHR5cGVPckNvbXBvbmVudCA9IERlZmF1bHRDb21wb25lbnRBZGFwdGVyKSB7XG4gICAgaWYgKEFycmF5LmlzQXJyYXkodHlwZU9yQ29tcG9uZW50KSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1VuZXhwZWN0ZWQgdHlwZSBhcmd1bWVudCcpXG4gICAgfVxuXG4gICAgaWYgKHR5cGVPckNvbXBvbmVudCA9PT0gdHJ1ZSkge1xuICAgICAgICB0eXBlT3JDb21wb25lbnQgPSBEZWZhdWx0Q29tcG9uZW50QWRhcHRlclxuICAgIH0gZWxzZSBpZiAodHlwZU9yQ29tcG9uZW50IGluc3RhbmNlb2YgQ29tcG9uZW50KSB7XG4gICAgICAgIHJldHVybiB0eXBlT3JDb21wb25lbnQ7XG4gICAgfSBlbHNlIGlmICh0eXBlT3JDb21wb25lbnQgPT09IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgbGV0IGluc3RhbmNlID0gc3R1YmlmeUluc3RhbmNlT25EZW1hbmQoQ29tcG9uZW50LCBuZXcgQ29tcG9uZW50KHBhcmFtcywgdHlwZU9yQ29tcG9uZW50KSk7XG4gICAgbGV0IGFkYXB0ZXJOYW1lID0gdHlwZU9yQ29tcG9uZW50LnRvTG93ZXJDYXNlKCkucmVwbGFjZSgnbWFya3VwOi8vJywgJycpXG4gICAgbGV0IGFkYXB0ZXIgPSBDb21wb25lbnRBZGFwdGVyc1thZGFwdGVyTmFtZV07XG4gICAgaWYgKCFhZGFwdGVyKSB7XG4gICAgICAgIGlmICghXy5zb21lKFdlbGxLbm93bkNvbXBvbmVudHMsIG5hbWUgPT4gYWRhcHRlck5hbWUuc3RhcnRzV2l0aChuYW1lKSkpIHtcbiAgICAgICAgICAgIC8qZXNsaW50IG5vLWNvbnNvbGU6IDAqL1xuICAgICAgICAgICAgY29uc29sZS53YXJuKGBVbmFibGUgdG8gZmluZCBjb21wb25lbnQgYWRhcHRlciAke3R5cGVPckNvbXBvbmVudH1gKTtcbiAgICAgICAgfVxuICAgICAgICBhZGFwdGVyID0gQ29tcG9uZW50QWRhcHRlcnNbRGVmYXVsdENvbXBvbmVudEFkYXB0ZXJdO1xuICAgIH1cbiAgICByZXR1cm4gYWRhcHRlcihpbnN0YW5jZSwgcGFyYW1zKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHVzZUNvbXBvbmVudEFkYXB0ZXJzKHJlZ2lzdHJhdG9yKSB7XG4gICAgY29uc3QgcmVnaXN0ZXIgPSAoY29tcG9uZW50VHlwZSwgYWRhcHRlcikgPT4ge1xuICAgICAgICBjb25zdCBhZGFwdGVyTmFtZSA9IGNvbXBvbmVudFR5cGUudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgQ29tcG9uZW50QWRhcHRlcnNbYWRhcHRlck5hbWVdID0gYWRhcHRlclxuICAgIH1cbiAgICByZWdpc3RyYXRvcih7cmVnaXN0ZXJ9KTtcbn1cblxuY2xhc3MgQ29tcG9uZW50IHtcbiAgICBjb25zdHJ1Y3RvcihwYXJhbXMsIHR5cGUpIHtcbiAgICAgICAgdGhpcy5wYXJhbXMgPSBPYmplY3QuYXNzaWduKHt9LCB7XG4gICAgICAgICAgICBmaW5kTWFwOiB7fVxuICAgICAgICB9LCBwYXJhbXMpO1xuICAgICAgICB0aGlzLnR5cGUgPSB0eXBlIHx8ICdkZWZhdWx0JztcbiAgICAgICAgLy9zdHViaWZ5SW5zdGFuY2UoQ29tcG9uZW50LCB0aGlzKTtcbiAgICB9XG4gICAgZ2V0KG5hbWUpIHtcbiAgICAgICAgaWYgKG5hbWUuc3RhcnRzV2l0aCgndi4nKSB8fCBuYW1lLnN0YXJ0c1dpdGgoJ2MuJykgfHwgbmFtZS5zdGFydHNXaXRoKCdlLicpKSB7XG4gICAgICAgICAgICBuYW1lID0gbmFtZS5zdWJzdHJpbmcoMik7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIF8uZ2V0KHRoaXMucGFyYW1zLCBuYW1lKTtcbiAgICB9XG4gICAgc2V0KG5hbWUsIHZhbHVlKSB7XG4gICAgICAgIGlmIChuYW1lLnN0YXJ0c1dpdGgoJ3YuJykgfHwgbmFtZS5zdGFydHNXaXRoKCdjLicpIHx8IG5hbWUuc3RhcnRzV2l0aCgnZS4nKSkge1xuICAgICAgICAgICAgbmFtZSA9IG5hbWUuc3Vic3RyaW5nKDIpO1xuICAgICAgICB9XG4gICAgICAgIF8uc2V0KHRoaXMucGFyYW1zLCBuYW1lLCB2YWx1ZSk7XG4gICAgfVxuICAgIGZpbmQobmFtZSkge1xuICAgICAgICBsZXQgdHlwZU9yQ29tcG9uZW50ID0gdGhpcy5wYXJhbXMuZmluZE1hcFtuYW1lXTtcbiAgICAgICAgaWYgKCF0eXBlT3JDb21wb25lbnQgJiYgdGhpcy5wYXJhbXMuZmluZE1hcC5oYXNPd25Qcm9wZXJ0eShuYW1lKSkge1xuICAgICAgICAgICAgcmV0dXJuIHR5cGVPckNvbXBvbmVudDtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGNvbXBvbmVudCA9IHRoaXMucGFyYW1zLmZpbmRNYXBbbmFtZV0gPSAoQXJyYXkuaXNBcnJheSh0eXBlT3JDb21wb25lbnQpID8gXG4gICAgICAgICAgICBjb21wb25lbnRGYWN0b3J5Rm9yQXJyYXkodGhpcy5wYXJhbXMsIHR5cGVPckNvbXBvbmVudCkgOiBcbiAgICAgICAgICAgIGNvbXBvbmVudEZhY3RvcnkodGhpcy5wYXJhbXMsIHR5cGVPckNvbXBvbmVudCkpXG4gICAgICAgIHJldHVybiBjb21wb25lbnQ7XG4gICAgfVxuICAgIGdldExvY2FsSWQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnBhcmFtc1snYXVyYTppZCddO1xuICAgIH1cbiAgICBjbGVhclJlZmVyZW5jZShrZXkpIHtcbiAgICAgICAgZGVsZXRlIHRoaXMucGFyYW1zW2tleV07XG4gICAgfVxuICAgIGdldENvbmNyZXRlQ29tcG9uZW50KCkge1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgZ2V0RWxlbWVudCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIGdldEVsZW1lbnRzKCkge1xuICAgICAgICByZXR1cm4gW3RoaXNdO1xuICAgIH1cbiAgICBnZXRFdmVudChuYW1lKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnBhcmFtc1tuYW1lXSB8fCBldmVudEZhY3RvcnkoKTtcbiAgICB9XG4gICAgZ2V0R2xvYmFsSWQoKSB7XG4gICAgICAgIHJldHVybiBgZ2xvYmFsLSR7dGhpcy5wYXJhbXNbJ2F1cmE6aWQnXX1gO1xuICAgIH1cbiAgICBnZXROYW1lKCkge1xuICAgICAgICByZXR1cm4gdGhpcy50eXBlO1xuICAgIH1cbiAgICBnZXRUeXBlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy50eXBlO1xuICAgIH1cbiAgICBnZXRSZWZlcmVuY2Uoa2V5KSB7XG4gICAgICAgIHJldHVybiB0aGlzLnBhcmFtc1trZXldO1xuICAgIH1cbiAgICBnZXRTdXBlcigpIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGdldFZlcnNpb24oKSB7XG4gICAgICAgIHJldHVybiAnMS4wJztcbiAgICB9XG4gICAgaXNDb25jcmV0ZSgpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIGlzSW5zdGFuY2VPZihuYW1lKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnR5cGUgPT09IG5hbWU7XG4gICAgfVxuICAgIGlzVmFsaWQoKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICBhZGRFdmVudEhhbmRsZXIoKSB7fVxuICAgIGFkZEhhbmRsZXIoKSB7fVxuICAgIGFkZFZhbHVlSGFuZGxlcigpIHt9XG4gICAgYWRkVmFsdWVQcm92aWRlcigpIHt9XG4gICAgYXV0b0Rlc3Ryb3koKSB7fVxuICAgIGRlc3Ryb3koKSB7fVxuICAgIHJlbW92ZUV2ZW50SGFuZGxlcigpIHt9XG5cbn0iLCJpbXBvcnQgeyBzdHViaWZ5SW5zdGFuY2UgfSBmcm9tICcuL3Npbm9uSGVscGVycydcblxuY29uc3QgY2xhc3NOYW1lVG9Db21wb25lbnRWYXIgPSBjbGFzc05hbWUgPT4gYHYuX19jbHNfJHtjbGFzc05hbWV9YFxuZXhwb3J0IGNsYXNzIEF1cmFVdGlsIHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgc3R1YmlmeUluc3RhbmNlKEF1cmFVdGlsLCB0aGlzKTtcbiAgICB9XG4gICAgXG4gICAgaXNFbXB0eShvYmope1xuICAgICAgICBpZiAob2JqID09PSB1bmRlZmluZWQgfHwgb2JqID09PSBudWxsIHx8IG9iaiA9PT0gJycpIHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIGlmIChBcnJheS5pc0FycmF5KG9iaikpIHtcbiAgICAgICAgICAgIHJldHVybiBvYmoubGVuZ3RoID09PSAwO1xuICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiBvYmogPT09ICdvYmplY3QnICYmIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChvYmopID09PSAnW29iamVjdCBPYmplY3RdJykge1xuICAgICAgICAgICAgcmV0dXJuIE9iamVjdC5rZXlzKG9iaikubGVuZ3RoID09PSAwO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgaXNVbmRlZmluZWRPck51bGwob2JqKSB7XG4gICAgICAgIHJldHVybiBvYmogPT09IHVuZGVmaW5lZCB8fCBvYmogPT09IG51bGw7XG4gICAgfVxuICAgIGFkZENsYXNzKGNvbXBvbmVudCwgY2xhc3NOYW1lKSB7XG4gICAgICAgIHJldHVybiBjb21wb25lbnQuc2V0KGNsYXNzTmFtZVRvQ29tcG9uZW50VmFyKGNsYXNzTmFtZSksIHRydWUpO1xuICAgIH1cbiAgICByZW1vdmVDbGFzcyhjb21wb25lbnQsIGNsYXNzTmFtZSkge1xuICAgICAgICByZXR1cm4gY29tcG9uZW50LnNldChjbGFzc05hbWVUb0NvbXBvbmVudFZhcihjbGFzc05hbWUpLCBmYWxzZSk7XG4gICAgfVxuICAgIGhhc0NsYXNzKGNvbXBvbmVudCwgY2xhc3NOYW1lKSB7XG4gICAgICAgIHJldHVybiBjb21wb25lbnQuZ2V0KGNsYXNzTmFtZVRvQ29tcG9uZW50VmFyKGNsYXNzTmFtZSkpO1xuICAgIH1cbiAgICB0b2dnbGVDbGFzcyhjb21wb25lbnQsIGNsYXNzTmFtZSkge1xuICAgICAgICBjb21wb25lbnQuc2V0KGNsYXNzTmFtZVRvQ29tcG9uZW50VmFyKGNsYXNzTmFtZSksICFjb21wb25lbnQuZ2V0KGNsYXNzTmFtZVRvQ29tcG9uZW50VmFyKGNsYXNzTmFtZSkpKTtcbiAgICB9XG4gICAgZ2V0Qm9vbGVhblZhbHVlKHZhbCkge1xuICAgICAgICAvLyBQb3J0ZWQ6IGh0dHBzOi8vZ2l0aHViLmNvbS9mb3JjZWRvdGNvbS9hdXJhL2Jsb2IvbWFzdGVyL2F1cmEtaW1wbC9zcmMvbWFpbi9yZXNvdXJjZXMvYXVyYS91dGlsL1V0aWwuanMjTDM2NlxuICAgICAgICByZXR1cm4gdmFsICE9PSB1bmRlZmluZWQgJiYgdmFsICE9PSBudWxsICYmIHZhbCAhPT0gZmFsc2UgJiYgdmFsICE9PSAwICYmIHZhbCAhPT0gJ2ZhbHNlJyAmJiB2YWwgIT09ICcnICYmIHZhbCAhPT0gJ2YnO1xuICAgIH1cbiAgICBpc0FycmF5KGFycikge1xuICAgICAgICAvLyBQb3J0ZWQ6IGh0dHBzOi8vZ2l0aHViLmNvbS9mb3JjZWRvdGNvbS9hdXJhL2Jsb2IvbWFzdGVyL2F1cmEtaW1wbC9zcmMvbWFpbi9yZXNvdXJjZXMvYXVyYS91dGlsL1V0aWwuanMjTDE4OVxuICAgICAgICByZXR1cm4gKHR5cGVvZiBBcnJheS5pc0FycmF5ID09PSBcImZ1bmN0aW9uXCIgPyBBcnJheS5pc0FycmF5IDogZnVuY3Rpb24oYXJnKSB7XG4gICAgICAgICAgICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKGFyZykgPT09ICdbb2JqZWN0IEFycmF5XSc7XG4gICAgICAgIH0pKGFycik7XG4gICAgfVxuICAgIGlzT2JqZWN0KG9iaikge1xuICAgICAgICAvL1BvcnRlZDogaHR0cHM6Ly9naXRodWIuY29tL2ZvcmNlZG90Y29tL2F1cmEvYmxvYi9tYXN0ZXIvYXVyYS1pbXBsL3NyYy9tYWluL3Jlc291cmNlcy9hdXJhL3V0aWwvVXRpbC5qcyNMMjA0XG4gICAgICAgIHJldHVybiB0eXBlb2Ygb2JqID09PSBcIm9iamVjdFwiICYmIG9iaiAhPT0gbnVsbCAmJiAhQXJyYXkuaXNBcnJheShvYmopO1xuICAgIH1cbiAgICBpc1VuZGVmaW5lZChvYmope1xuICAgICAgICAvL1BvcnRlZDogaHR0cHM6Ly9naXRodWIuY29tL2ZvcmNlZG90Y29tL2F1cmEvYmxvYi9tYXN0ZXIvYXVyYS1pbXBsL3NyYy9tYWluL3Jlc291cmNlcy9hdXJhL3V0aWwvVXRpbC5qcyNMMzE5XG4gICAgICAgIHJldHVybiBvYmogPT09IHVuZGVmaW5lZDtcbiAgICB9XG59XG5cbiIsImltcG9ydCB7IHN0dWJpZnlJbnN0YW5jZSB9IGZyb20gJy4vc2lub25IZWxwZXJzJ1xuaW1wb3J0IHsgQXVyYVV0aWwgfSBmcm9tICcuL2F1cmFVdGlsJ1xuXG5leHBvcnQgZnVuY3Rpb24gYXVyYUZhY3RvcnkocGFyYW1zID0ge30pIHtcbiAgICByZXR1cm4gbmV3IEF1cmEocGFyYW1zKTtcbn1cblxuaW1wb3J0IHsgY29tcG9uZW50RmFjdG9yeSB9IGZyb20gJy4vY29tcG9uZW50RmFjdG9yeSdcblxuY2xhc3MgQXVyYSB7XG4gICAgY29uc3RydWN0b3IocGFyYW1zKSB7XG4gICAgICAgIHRoaXMucGFyYW1zID0gcGFyYW1zO1xuICAgICAgICB0aGlzLnV0aWwgPSBuZXcgQXVyYVV0aWwoKTtcbiAgICAgICAgc3R1YmlmeUluc3RhbmNlKEF1cmEsIHRoaXMpO1xuICAgIH1cbiAgICBcbiAgICBzZXRQYXJhbXMocGFyYW1zKSB7XG4gICAgICAgIE9iamVjdC5hc3NpZ24odGhpcy5wYXJhbXMsIHBhcmFtcyk7XG4gICAgfVxuXG4gICAgZ2V0KG5hbWUpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucGFyYW1zW25hbWVdO1xuICAgIH1cblxuICAgIHNldChuYW1lLCB2YWx1ZSkge1xuICAgICAgICB0aGlzLnBhcmFtc1tuYW1lXSA9IHZhbHVlO1xuICAgIH1cbiAgICBcbiAgICBlbnF1ZXVlQWN0aW9uKGFjdGlvbikge1xuICAgICAgICBhY3Rpb24gJiYgYWN0aW9uLmludm9rZUNhbGxiYWNrICYmIGFjdGlvbi5pbnZva2VDYWxsYmFjayh0cnVlKVxuICAgIH1cblxuICAgIGNyZWF0ZUNvbXBvbmVudCh0eXBlLCBhdHRyaWJ1dGVzLCBjYWxsYmFjaykge1xuICAgICAgICB0aGlzLmNyZWF0ZUNvbXBvbmVudC50eXBlID0gdHlwZTtcbiAgICAgICAgdGhpcy5jcmVhdGVDb21wb25lbnQuYXR0cmlidXRlcyA9IGF0dHJpYnV0ZXM7XG4gICAgICAgIC8vIEdldCBjb21wb25lbnQgaW5zdGFuY2UuXG4gICAgICAgIC8vIFVzZSBleGlzdGluZyBjb21wb25lbnQgaW5zdGFuY2UgaWYgc2V0XG4gICAgICAgIC8vIENyZWF0ZSBuZXcgZGVmYXVsdCBjb21wb25lbnQgaWYgY29tcG9uZW50IG5vdCBzZXRcbiAgICAgICAgbGV0IHsgY29tcG9uZW50IH0gPSB0aGlzLmNyZWF0ZUNvbXBvbmVudDtcbiAgICAgICAgaWYgKCFjb21wb25lbnQpIHtcbiAgICAgICAgICAgIGNvbXBvbmVudCA9IG5ldyBjb21wb25lbnRGYWN0b3J5KGF0dHJpYnV0ZXMsIHR5cGUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5jcmVhdGVDb21wb25lbnQuY29tcG9uZW50ID0gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBpZiAoY2FsbGJhY2spIHtcbiAgICAgICAgICAgIGNhbGxiYWNrKGNvbXBvbmVudCwgJ1NVQ0NFU1MnLCBbJ1NVQ0NFU1MnXSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGNvbXBvbmVudDtcbiAgICB9XG4gICAgY3JlYXRlQ29tcG9uZW50cyhjb21wb25lbnREZWZzLCBjYWxsYmFjaykge1xuICAgICAgICBjb25zdCByZXN1bHQgPSBjb21wb25lbnREZWZzXG4gICAgICAgICAgICAubWFwKGRlZiA9PiB0aGlzLmNyZWF0ZUNvbXBvbmVudChkZWZbMF0sIGRlZlsxXSkpXG4gICAgICAgIGlmIChjYWxsYmFjaykge1xuICAgICAgICAgICAgY2FsbGJhY2socmVzdWx0LCAnU1VDQ0VTUycsIHJlc3VsdC5tYXAoICgpID0+ICdTVUNDRVNTJykpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuICAgIGdldENhbGxiYWNrKGNhbGxiYWNrKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiguLi5hcmdzKSB7XG4gICAgICAgICAgICBjYWxsYmFjayAmJiBjYWxsYmFjayguLi5hcmdzKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBnZXRDb21wb25lbnQoaWQpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucGFyYW1zW2lkXTtcbiAgICB9XG4gICAgZ2V0UmVmZXJlbmNlKCkge31cbiAgICBnZXRSb290KCkge1xuICAgICAgICByZXR1cm4gdGhpcy5yb290Q29tcG9uZW50IHx8ICh0aGlzLnJvb3RDb21wb25lbnQgPSBuZXcgY29tcG9uZW50RmFjdG9yeSgpKTtcbiAgICB9XG4gICAgZ2V0VG9rZW4obmFtZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5wYXJhbXNbJ3Rva2VuLicgKyBuYW1lXVxuICAgIH1cbiAgICBsb2codmFsdWUsIGVycikge1xuICAgICAgICAvKmVzbGludCBuby1jb25zb2xlOiAwKi9cbiAgICAgICAgY29uc29sZSAmJiBjb25zb2xlLmxvZyh2YWx1ZSwgZXJyKVxuICAgIH1cbiAgICByZXBvcnRFcnJvcigpIHt9XG59IiwiaW1wb3J0IHsgc3R1YmlmeUluc3RhbmNlT25EZW1hbmQgfSBmcm9tICcuL3Npbm9uSGVscGVycydcblxuZXhwb3J0IGZ1bmN0aW9uIGFwZXhDYWxsRmFjdG9yeShwYXJhbXMgPSB7fSkge1xuICAgIHJldHVybiBzdHViaWZ5SW5zdGFuY2VPbkRlbWFuZChBcGV4Q2FsbCwgbmV3IEFwZXhDYWxsKHBhcmFtcykpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYXBleFN1Y2Nlc3NSZXN1bHQocmVzcG9uc2UgPSB7fSkge1xuICAgIHJldHVybiBzdHViaWZ5SW5zdGFuY2VPbkRlbWFuZChBcGV4Q2FsbFJlc3VsdCwgbmV3IEFwZXhDYWxsUmVzdWx0KHJlc3BvbnNlKSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBhcGV4RXJyb3JSZXN1bHQobWVzc2FnZSkge1xuICAgIHJldHVybiBzdHViaWZ5SW5zdGFuY2VPbkRlbWFuZChBcGV4Q2FsbFJlc3VsdCwgbmV3IEFwZXhDYWxsUmVzdWx0KG51bGwsIG1lc3NhZ2UpKTtcbn1cblxuY2xhc3MgQXBleENhbGwge1xuICAgIGNvbnN0cnVjdG9yKHJlc3VsdCwgaW52b2tlQ2FsbGJhY2tPbkVucXVldWUgPSB0cnVlKSB7XG4gICAgICAgIHRoaXMucGFyYW1zID0gbnVsbDtcbiAgICAgICAgdGhpcy5yZXN1bHQgPSByZXN1bHQ7XG4gICAgICAgIHRoaXMuaW52b2tlQ2FsbGJhY2tPbkVucXVldWUgPSBpbnZva2VDYWxsYmFja09uRW5xdWV1ZTtcbiAgICAgICAgdGhpcy5pc0JhY2tncm91bmQgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5zZXRBYm9ydGFibGUgPSBmYWxzZTtcbiAgICB9XG4gICAgc2V0UGFyYW1zKHBhcmFtcykge1xuICAgICAgICB0aGlzLnBhcmFtcyA9IHBhcmFtcztcbiAgICB9XG4gICAgc2V0UGFyYW0oa2V5LCB2YWx1ZSkge1xuICAgICAgICB0aGlzLnBhcmFtcyA9IE9iamVjdC5hc3NpZ24odGhpcy5wYXJhbXMsIHtba2V5XSA6IHZhbHVlfSk7XG4gICAgfVxuICAgIGdldFBhcmFtcygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucGFyYW1zO1xuICAgIH1cbiAgICBzZXRDYWxsYmFjayhjdHgsIGNhbGxiYWNrKSB7XG4gICAgICAgIHRoaXMuY3R4ID0gY3R4O1xuICAgICAgICB0aGlzLmNhbGxiYWNrID0gY2FsbGJhY2s7XG4gICAgfVxuICAgIGludm9rZUNhbGxiYWNrKGZyb21FbnF1ZXVlID0gZmFsc2UpIHtcbiAgICAgICAgaWYgKGZyb21FbnF1ZXVlICYmICF0aGlzLmludm9rZUNhbGxiYWNrT25FbnF1ZXVlKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5jYWxsYmFjayAmJiB0aGlzLmNhbGxiYWNrLmJpbmQodGhpcy5jdHgpKHRoaXMucmVzdWx0KTtcbiAgICB9XG4gICAgZ2V0RXJyb3IoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnJlc3VsdC5nZXRFcnJvcigpO1xuICAgIH1cbiAgICBnZXRQYXJhbShuYW1lKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnBhcmFtcyA/IHRoaXMucGFyYW1zW25hbWVdIDogbnVsbDtcbiAgICB9XG4gICAgZ2V0UmV0dXJuVmFsdWUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnJlc3VsdDtcbiAgICB9XG4gICAgZ2V0U3RhdGUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnJlc3VsdC5nZXRTdGF0ZSgpO1xuICAgIH1cbiAgICBpc0JhY2tncm91bmQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmlzQmFja2dyb3VuZDtcbiAgICB9XG4gICAgc2V0QWJvcnRhYmxlKCkge1xuICAgIH1cbiAgICBzZXRCYWNrZ3JvdW5kKCkge1xuICAgICAgICB0aGlzLmlzQmFja2dyb3VuZCA9IHRydWU7XG4gICAgfVxuICAgIHNldFN0b3JhYmxlKCkge1xuICAgIH1cbn1cblxuY2xhc3MgQXBleENhbGxSZXN1bHQge1xuICAgIGNvbnN0cnVjdG9yKHJlc3BvbnNlLCBlcnJvck1lc3NhZ2UgPSBudWxsKSB7XG4gICAgICAgIHRoaXMucmVzcG9uc2UgPSByZXNwb25zZTtcbiAgICAgICAgdGhpcy5lcnJvck1lc3NhZ2UgPSBlcnJvck1lc3NhZ2U7XG4gICAgfVxuICAgIGdldFN0YXRlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5lcnJvck1lc3NhZ2UgPyAnRVJST1InIDogJ1NVQ0NFU1MnXG4gICAgfVxuICAgIGdldEVycm9yKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5lcnJvck1lc3NhZ2UgPyBbe21lc3NhZ2U6IHRoaXMuZXJyb3JNZXNzYWdlfV0gOiBbXVxuICAgIH1cbiAgICBnZXRSZXR1cm5WYWx1ZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucmVzcG9uc2U7XG4gICAgfVxufSIsImltcG9ydCB7IGV2ZW50RmFjdG9yeSB9IGZyb20gJy4vZXZlbnRGYWN0b3J5J1xuaW1wb3J0IHsgY29tcG9uZW50RmFjdG9yeSwgdXNlQ29tcG9uZW50QWRhcHRlcnMgfSBmcm9tICcuL2NvbXBvbmVudEZhY3RvcnknXG5pbXBvcnQgeyBhdXJhRmFjdG9yeSB9IGZyb20gJy4vYXVyYUZhY3RvcnknXG5pbXBvcnQgeyBBdXJhVXRpbCB9IGZyb20gJy4vYXVyYVV0aWwnXG5pbXBvcnQgeyBhcGV4Q2FsbEZhY3RvcnksIGFwZXhTdWNjZXNzUmVzdWx0LCBhcGV4RXJyb3JSZXN1bHQgfSBmcm9tICcuL2FwZXhDYWxsRmFjdG9yeSdcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgQXVyYVV0aWwsXG4gICAgZXZlbnRGYWN0b3J5LFxuICAgIGNvbXBvbmVudEZhY3RvcnksXG4gICAgdXNlQ29tcG9uZW50QWRhcHRlcnMsXG4gICAgYXVyYUZhY3RvcnksXG4gICAgYXBleENhbGxGYWN0b3J5LFxuICAgIGFwZXhTdWNjZXNzUmVzdWx0LFxuICAgIGFwZXhFcnJvclJlc3VsdFxufSJdLCJuYW1lcyI6WyJzaW5vbiIsInJlcXVpcmUiLCJzdHViaWZ5SW5zdGFuY2UiLCJjdG9yIiwiaW5zdGFuY2UiLCJnZXRPd25Qcm9wZXJ0eU5hbWVzIiwicHJvdG90eXBlIiwiZm9yRWFjaCIsInByb3AiLCJzdHViIiwiY2FsbHNGYWtlIiwicHJvcE5hbWUiLCJhcmdzIiwiY2FsbCIsInN0dWJpZnlJbnN0YW5jZU9uRGVtYW5kIiwiaGFuZGxlciIsInRhcmdldCIsInByb3BlcnR5IiwiZGVzY3JpcHRvciIsIl9pbnN0YW5jZVByb3BzIiwicHJvcEtleSIsInZhbHVlIiwid2FybiIsInN0dWJOYW1lIiwiaXNTcHlPclN0dWJiZWQiLCJjYWxsZWRCZWZvcmUiLCJoYXNPblByb3RvIiwicHJveHkiLCJQcm94eSIsImV2ZW50RmFjdG9yeSIsInBhcmFtcyIsIkV2ZW50IiwiRkFLRV9FVkVOVF9OQU1FIiwia2V5IiwiZXZlbnROYW1lIiwibmFtZSIsIl8iLCJEZWZhdWx0Q29tcG9uZW50QWRhcHRlciIsIldlbGxLbm93bkNvbXBvbmVudHMiLCJDb21wb25lbnRBZGFwdGVycyIsImNvbXBvbmVudEZhY3RvcnlGb3JBcnJheSIsImFycmF5T2ZUeXBlcyIsIm1hcCIsImNvbXBvbmVudEZhY3RvcnkiLCJ0eXBlT3JDb21wb25lbnQiLCJBcnJheSIsImlzQXJyYXkiLCJFcnJvciIsIkNvbXBvbmVudCIsImFkYXB0ZXJOYW1lIiwidG9Mb3dlckNhc2UiLCJyZXBsYWNlIiwiYWRhcHRlciIsInNvbWUiLCJzdGFydHNXaXRoIiwidXNlQ29tcG9uZW50QWRhcHRlcnMiLCJyZWdpc3RyYXRvciIsInJlZ2lzdGVyIiwiY29tcG9uZW50VHlwZSIsInR5cGUiLCJPYmplY3QiLCJhc3NpZ24iLCJzdWJzdHJpbmciLCJnZXQiLCJzZXQiLCJmaW5kTWFwIiwiaGFzT3duUHJvcGVydHkiLCJjb21wb25lbnQiLCJjbGFzc05hbWVUb0NvbXBvbmVudFZhciIsImNsYXNzTmFtZSIsIkF1cmFVdGlsIiwib2JqIiwidW5kZWZpbmVkIiwibGVuZ3RoIiwidG9TdHJpbmciLCJrZXlzIiwidmFsIiwiYXJyIiwiYXJnIiwiYXVyYUZhY3RvcnkiLCJBdXJhIiwidXRpbCIsImFjdGlvbiIsImludm9rZUNhbGxiYWNrIiwiYXR0cmlidXRlcyIsImNhbGxiYWNrIiwiY3JlYXRlQ29tcG9uZW50IiwiY29tcG9uZW50RGVmcyIsInJlc3VsdCIsImRlZiIsImlkIiwicm9vdENvbXBvbmVudCIsImVyciIsImNvbnNvbGUiLCJsb2ciLCJhcGV4Q2FsbEZhY3RvcnkiLCJBcGV4Q2FsbCIsImFwZXhTdWNjZXNzUmVzdWx0IiwicmVzcG9uc2UiLCJBcGV4Q2FsbFJlc3VsdCIsImFwZXhFcnJvclJlc3VsdCIsIm1lc3NhZ2UiLCJpbnZva2VDYWxsYmFja09uRW5xdWV1ZSIsImlzQmFja2dyb3VuZCIsInNldEFib3J0YWJsZSIsImN0eCIsImZyb21FbnF1ZXVlIiwiYmluZCIsImdldEVycm9yIiwiZ2V0U3RhdGUiLCJlcnJvck1lc3NhZ2UiLCJtb2R1bGUiLCJleHBvcnRzIl0sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQTtBQUNBLElBQU1BLFFBQVFDLFFBQVEsT0FBUixDQUFkOztBQUVBLEFBQU8sU0FBU0MsZUFBVCxDQUF5QkMsSUFBekIsRUFBK0JDLFFBQS9CLEVBQXlDO1dBQ3JDQyxtQkFBUCxDQUEyQkYsS0FBS0csU0FBaEMsRUFBMkNDLE9BQTNDLENBQW1ELGdCQUFRO1lBQ25ELE9BQU9KLEtBQUtHLFNBQUwsQ0FBZUUsSUFBZixDQUFQLEtBQWdDLFVBQWhDLElBQThDQSxTQUFTLGFBQTNELEVBQTBFOzs7aUJBR2pFLFVBQVVBLElBQW5CLElBQTJCUixNQUFNUyxJQUFOLENBQVdMLFFBQVgsRUFBcUJJLElBQXJCLEVBQTJCRSxTQUEzQixDQUFzQyxVQUFDQyxRQUFEO21CQUFjLFlBQWE7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
