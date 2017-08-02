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
            var defaultParams = {
                'aura:id': name
            };

            var component = this.params.findMap[name] = Array.isArray(typeOrComponent) ? componentFactoryForArray(defaultParams, typeOrComponent) : componentFactory(defaultParams, typeOrComponent);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9jaGEtYXVyYS51bWQuanMiLCJzb3VyY2VzIjpbIi4uL2xpYi9zaW5vbkhlbHBlcnMuanMiLCIuLi9saWIvZXZlbnRGYWN0b3J5LmpzIiwiLi4vbGliL2NvbXBvbmVudEZhY3RvcnkuanMiLCIuLi9saWIvYXVyYVV0aWwuanMiLCIuLi9saWIvYXVyYUZhY3RvcnkuanMiLCIuLi9saWIvYXBleENhbGxGYWN0b3J5LmpzIiwiLi4vbGliL2F1cmEuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLypnbG9iYWwgUHJveHkqL1xuY29uc3Qgc2lub24gPSByZXF1aXJlKCdzaW5vbicpO1xuXG5leHBvcnQgZnVuY3Rpb24gc3R1YmlmeUluc3RhbmNlKGN0b3IsIGluc3RhbmNlKSB7XG4gICAgT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMoY3Rvci5wcm90b3R5cGUpLmZvckVhY2gocHJvcCA9PiB7XG4gICAgICAgIGlmICh0eXBlb2YgY3Rvci5wcm90b3R5cGVbcHJvcF0gIT09ICdmdW5jdGlvbicgfHwgcHJvcCA9PT0gJ2NvbnN0cnVjdG9yJykge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGluc3RhbmNlWydzdHViXycgKyBwcm9wXSA9IHNpbm9uLnN0dWIoaW5zdGFuY2UsIHByb3ApLmNhbGxzRmFrZSgoKHByb3BOYW1lKSA9PiAoLi4uYXJncykgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIGN0b3IucHJvdG90eXBlW3Byb3BOYW1lXS5jYWxsKGluc3RhbmNlLCAuLi5hcmdzKTtcbiAgICAgICAgfSkocHJvcCkpXG4gICAgfSlcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHN0dWJpZnlJbnN0YW5jZU9uRGVtYW5kKGN0b3IsIGluc3RhbmNlKSB7XG4gICAgY29uc3QgaGFuZGxlciA9IHtcbiAgICAgICAgX2luc3RhbmNlUHJvcHM6IHt9LFxuICAgICAgICBkZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIHByb3BlcnR5LCBkZXNjcmlwdG9yKSB7XG4gICAgICAgICAgICBoYW5kbGVyLl9pbnN0YW5jZVByb3BzW3Byb3BlcnR5XSA9IGRlc2NyaXB0b3I7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfSxcbiAgICAgICAgZ2V0KHRhcmdldCwgcHJvcEtleSkge1xuICAgICAgICAgICAgLy8gQ2hlY2sgZm9yIFN5bWJvbCBmb3IgaXRlcmF0b3JzXG4gICAgICAgICAgICBpZiAodHlwZW9mIHByb3BLZXkgIT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRhcmdldFtwcm9wS2V5XTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIElmIHdlIGFkZCBzb21lIHByb3BzIHRvIHRoZSBpbnN0YW5jZSwgcmV0dXJuIGl0IHcvbyBtb2NraW5nXG4gICAgICAgICAgICAvLyBVc3VhbGx5IGFkZGVkIHN0dWZmIGlzIG1vY2tlZCB0aHJvdWdoIGRhdGEgYWRhcHRlcnNcbiAgICAgICAgICAgIGlmIChoYW5kbGVyLl9pbnN0YW5jZVByb3BzW3Byb3BLZXldKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGhhbmRsZXIuX2luc3RhbmNlUHJvcHNbcHJvcEtleV0udmFsdWVcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy9XYXJuIG9uIHVua25vd24gcHJvcEtleSBmb3IgYmV0dGVyIGRlYnVnZ2luZ1xuICAgICAgICAgICAgaWYgKCF0YXJnZXRbcHJvcEtleV0pIHtcbiAgICAgICAgICAgICAgICAvKmVzbGludCBuby1jb25zb2xlOiAwKi9cbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oJ1xcblxcbnN0dWJpZnlJbnN0YW5jZU9uRGVtYW5kOiBVbmtub3duIHByb3BlcnR5ICcgKyBwcm9wS2V5LCAnXFxuXFxuJyk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRhcmdldFtwcm9wS2V5XTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gU3R1YiBtZXRob2RzIHRoYXQgZGVmaW5lZCBvbiBwcm90b3R5cGUgb25seSwgZS5nLiBoYXMgcHVibGljIGFwaVxuICAgICAgICAgICAgY29uc3Qgc3R1Yk5hbWUgPSAnc3R1Yl8nICsgcHJvcEtleTtcbiAgICAgICAgICAgIGNvbnN0IGlzU3B5T3JTdHViYmVkID0gISEodGFyZ2V0W3Byb3BLZXldICYmIHRhcmdldFtwcm9wS2V5XS5jYWxsZWRCZWZvcmUpO1xuICAgICAgICAgICAgY29uc3QgaGFzT25Qcm90byA9ICEhY3Rvci5wcm90b3R5cGVbcHJvcEtleV07XG5cbiAgICAgICAgICAgIGlmIChoYXNPblByb3RvICYmICFpc1NweU9yU3R1YmJlZCAmJiB0eXBlb2YgdGFyZ2V0W3Byb3BLZXldID09PSAnZnVuY3Rpb24nICYmIHByb3BLZXkgIT09ICdjb25zdHJ1Y3RvcicpIHtcbiAgICAgICAgICAgICAgICB0YXJnZXRbc3R1Yk5hbWVdID0gc2lub24uc3R1Yih0YXJnZXQsIHByb3BLZXkpLmNhbGxzRmFrZSgoLi4uYXJncykgPT4ge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gY3Rvci5wcm90b3R5cGVbcHJvcEtleV0uY2FsbChpbnN0YW5jZSwgLi4uYXJncyk7XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB0YXJnZXRbcHJvcEtleV07XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zdCBwcm94eSA9IG5ldyBQcm94eShpbnN0YW5jZSwgaGFuZGxlcik7XG4gICAgcmV0dXJuIHByb3h5O1xufSIsImltcG9ydCB7IHN0dWJpZnlJbnN0YW5jZU9uRGVtYW5kIH0gZnJvbSAnLi9zaW5vbkhlbHBlcnMnXG5cbmV4cG9ydCBmdW5jdGlvbiBldmVudEZhY3RvcnkocGFyYW1zID0ge30pIHtcbiAgICByZXR1cm4gc3R1YmlmeUluc3RhbmNlT25EZW1hbmQoRXZlbnQsIG5ldyBFdmVudChwYXJhbXMpKTtcbn1cbmNvbnN0IEZBS0VfRVZFTlRfTkFNRSA9ICdtb2NoYS1hdXJhLWZha2UtZXZlbnQnXG5cbmNsYXNzIEV2ZW50IHtcbiAgICBjb25zdHJ1Y3RvcihwYXJhbXMpIHtcbiAgICAgICAgdGhpcy5wYXJhbXMgPSBwYXJhbXMgfHwge307XG4gICAgfVxuICAgIHNldFBhcmFtcyhwYXJhbXMpIHtcbiAgICAgICAgdGhpcy5wYXJhbXMgPSBwYXJhbXM7XG4gICAgfVxuICAgIHNldFBhcmFtKGtleSwgdmFsdWUpIHtcbiAgICAgICAgdGhpcy5wYXJhbXNba2V5XSA9IHZhbHVlO1xuICAgIH1cbiAgICBnZXRQYXJhbXMoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnBhcmFtcztcbiAgICB9XG4gICAgZ2V0RXZlbnRUeXBlKCkge1xuICAgICAgICByZXR1cm4gJ0FQUExJQ0FUSU9OJ1xuICAgIH1cbiAgICBnZXROYW1lKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wYXJhbXMuZXZlbnROYW1lIHx8IEZBS0VfRVZFTlRfTkFNRVxuICAgIH1cbiAgICBnZXRQYXJhbShuYW1lKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnBhcmFtc1tuYW1lXVxuICAgIH1cbiAgICBnZXRQaGFzZSgpIHtcbiAgICAgICAgcmV0dXJuICdkZWZhdWx0J1xuICAgIH1cbiAgICBnZXRTb3VyY2UoKSB7XG4gICAgICAgIHJldHVybiBudWxsXG4gICAgfVxuICAgIGdldFR5cGUoKSB7XG4gICAgICAgIHJldHVybiBgYzoke0ZBS0VfRVZFTlRfTkFNRX1gXG4gICAgfVxuICAgIGZpcmUoKSB7fVxuICAgIHBhdXNlKCkge31cbiAgICBwcmV2ZW50RGVmYXVsdCgpIHt9XG4gICAgcmVzdW1lKCkge31cbiAgICBzdG9wUHJvcGFnYXRpb24oKSB7fVxuICAgIFxuXG59IiwiY29uc3QgXyA9IHJlcXVpcmUoJ2xvZGFzaCcpO1xuaW1wb3J0IHsgZXZlbnRGYWN0b3J5IH0gZnJvbSAnLi9ldmVudEZhY3RvcnknXG5pbXBvcnQgeyBzdHViaWZ5SW5zdGFuY2VPbkRlbWFuZCB9IGZyb20gJy4vc2lub25IZWxwZXJzJ1xuXG5jb25zdCBEZWZhdWx0Q29tcG9uZW50QWRhcHRlciA9ICdkZWZhdWx0J1xuY29uc3QgV2VsbEtub3duQ29tcG9uZW50cyA9IFsnYXVyYTonLCAnZm9yY2U6JywgJ2ZvcmNlQ2hhdHRlcjonLCAnbGlnaHRuaW5nOicsICd1aTonLCAnYzonXVxuXG5sZXQgQ29tcG9uZW50QWRhcHRlcnMgPSB7XG4gICAgW0RlZmF1bHRDb21wb25lbnRBZGFwdGVyXTogaW5zdGFuY2UgPT4gaW5zdGFuY2Vcbn1cblxuZnVuY3Rpb24gY29tcG9uZW50RmFjdG9yeUZvckFycmF5KHBhcmFtcywgYXJyYXlPZlR5cGVzKSB7XG4gICAgcmV0dXJuIGFycmF5T2ZUeXBlcy5tYXAodHlwZU9yQ29tcG9uZW50ID0+IGNvbXBvbmVudEZhY3RvcnkocGFyYW1zLCB0eXBlT3JDb21wb25lbnQpKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNvbXBvbmVudEZhY3RvcnkocGFyYW1zID0ge30sIHR5cGVPckNvbXBvbmVudCA9IERlZmF1bHRDb21wb25lbnRBZGFwdGVyKSB7XG4gICAgaWYgKEFycmF5LmlzQXJyYXkodHlwZU9yQ29tcG9uZW50KSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1VuZXhwZWN0ZWQgdHlwZSBhcmd1bWVudCcpXG4gICAgfVxuXG4gICAgaWYgKHR5cGVPckNvbXBvbmVudCA9PT0gdHJ1ZSkge1xuICAgICAgICB0eXBlT3JDb21wb25lbnQgPSBEZWZhdWx0Q29tcG9uZW50QWRhcHRlclxuICAgIH0gZWxzZSBpZiAodHlwZU9yQ29tcG9uZW50IGluc3RhbmNlb2YgQ29tcG9uZW50KSB7XG4gICAgICAgIHJldHVybiB0eXBlT3JDb21wb25lbnQ7XG4gICAgfSBlbHNlIGlmICh0eXBlT3JDb21wb25lbnQgPT09IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgbGV0IGluc3RhbmNlID0gc3R1YmlmeUluc3RhbmNlT25EZW1hbmQoQ29tcG9uZW50LCBuZXcgQ29tcG9uZW50KHBhcmFtcywgdHlwZU9yQ29tcG9uZW50KSk7XG4gICAgbGV0IGFkYXB0ZXJOYW1lID0gdHlwZU9yQ29tcG9uZW50LnRvTG93ZXJDYXNlKCkucmVwbGFjZSgnbWFya3VwOi8vJywgJycpXG4gICAgbGV0IGFkYXB0ZXIgPSBDb21wb25lbnRBZGFwdGVyc1thZGFwdGVyTmFtZV07XG4gICAgaWYgKCFhZGFwdGVyKSB7XG4gICAgICAgIGlmICghXy5zb21lKFdlbGxLbm93bkNvbXBvbmVudHMsIG5hbWUgPT4gYWRhcHRlck5hbWUuc3RhcnRzV2l0aChuYW1lKSkpIHtcbiAgICAgICAgICAgIC8qZXNsaW50IG5vLWNvbnNvbGU6IDAqL1xuICAgICAgICAgICAgY29uc29sZS53YXJuKGBVbmFibGUgdG8gZmluZCBjb21wb25lbnQgYWRhcHRlciAke3R5cGVPckNvbXBvbmVudH1gKTtcbiAgICAgICAgfVxuICAgICAgICBhZGFwdGVyID0gQ29tcG9uZW50QWRhcHRlcnNbRGVmYXVsdENvbXBvbmVudEFkYXB0ZXJdO1xuICAgIH1cbiAgICByZXR1cm4gYWRhcHRlcihpbnN0YW5jZSwgcGFyYW1zKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHVzZUNvbXBvbmVudEFkYXB0ZXJzKHJlZ2lzdHJhdG9yKSB7XG4gICAgY29uc3QgcmVnaXN0ZXIgPSAoY29tcG9uZW50VHlwZSwgYWRhcHRlcikgPT4ge1xuICAgICAgICBjb25zdCBhZGFwdGVyTmFtZSA9IGNvbXBvbmVudFR5cGUudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgQ29tcG9uZW50QWRhcHRlcnNbYWRhcHRlck5hbWVdID0gYWRhcHRlclxuICAgIH1cbiAgICByZWdpc3RyYXRvcih7cmVnaXN0ZXJ9KTtcbn1cblxuY2xhc3MgQ29tcG9uZW50IHtcbiAgICBjb25zdHJ1Y3RvcihwYXJhbXMsIHR5cGUpIHtcbiAgICAgICAgdGhpcy5wYXJhbXMgPSBPYmplY3QuYXNzaWduKHt9LCB7XG4gICAgICAgICAgICBmaW5kTWFwOiB7fVxuICAgICAgICB9LCBwYXJhbXMpO1xuICAgICAgICB0aGlzLnR5cGUgPSB0eXBlIHx8ICdkZWZhdWx0JztcbiAgICAgICAgLy9zdHViaWZ5SW5zdGFuY2UoQ29tcG9uZW50LCB0aGlzKTtcbiAgICB9XG4gICAgZ2V0KG5hbWUpIHtcbiAgICAgICAgaWYgKG5hbWUuc3RhcnRzV2l0aCgndi4nKSB8fCBuYW1lLnN0YXJ0c1dpdGgoJ2MuJykgfHwgbmFtZS5zdGFydHNXaXRoKCdlLicpKSB7XG4gICAgICAgICAgICBuYW1lID0gbmFtZS5zdWJzdHJpbmcoMik7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIF8uZ2V0KHRoaXMucGFyYW1zLCBuYW1lKTtcbiAgICB9XG4gICAgc2V0KG5hbWUsIHZhbHVlKSB7XG4gICAgICAgIGlmIChuYW1lLnN0YXJ0c1dpdGgoJ3YuJykgfHwgbmFtZS5zdGFydHNXaXRoKCdjLicpIHx8IG5hbWUuc3RhcnRzV2l0aCgnZS4nKSkge1xuICAgICAgICAgICAgbmFtZSA9IG5hbWUuc3Vic3RyaW5nKDIpO1xuICAgICAgICB9XG4gICAgICAgIF8uc2V0KHRoaXMucGFyYW1zLCBuYW1lLCB2YWx1ZSk7XG4gICAgfVxuICAgIGZpbmQobmFtZSkge1xuICAgICAgICBsZXQgdHlwZU9yQ29tcG9uZW50ID0gdGhpcy5wYXJhbXMuZmluZE1hcFtuYW1lXTtcbiAgICAgICAgaWYgKCF0eXBlT3JDb21wb25lbnQgJiYgdGhpcy5wYXJhbXMuZmluZE1hcC5oYXNPd25Qcm9wZXJ0eShuYW1lKSkge1xuICAgICAgICAgICAgcmV0dXJuIHR5cGVPckNvbXBvbmVudDtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBkZWZhdWx0UGFyYW1zID0ge1xuICAgICAgICAgICAgJ2F1cmE6aWQnOiBuYW1lXG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGNvbnN0IGNvbXBvbmVudCA9IHRoaXMucGFyYW1zLmZpbmRNYXBbbmFtZV0gPSAoQXJyYXkuaXNBcnJheSh0eXBlT3JDb21wb25lbnQpID8gXG4gICAgICAgICAgICBjb21wb25lbnRGYWN0b3J5Rm9yQXJyYXkoZGVmYXVsdFBhcmFtcywgdHlwZU9yQ29tcG9uZW50KSA6IFxuICAgICAgICAgICAgY29tcG9uZW50RmFjdG9yeShkZWZhdWx0UGFyYW1zLCB0eXBlT3JDb21wb25lbnQpKVxuICAgICAgICByZXR1cm4gY29tcG9uZW50O1xuICAgIH1cbiAgICBnZXRMb2NhbElkKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wYXJhbXNbJ2F1cmE6aWQnXTtcbiAgICB9XG4gICAgY2xlYXJSZWZlcmVuY2Uoa2V5KSB7XG4gICAgICAgIGRlbGV0ZSB0aGlzLnBhcmFtc1trZXldO1xuICAgIH1cbiAgICBnZXRDb25jcmV0ZUNvbXBvbmVudCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIGdldEVsZW1lbnQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICBnZXRFbGVtZW50cygpIHtcbiAgICAgICAgcmV0dXJuIFt0aGlzXTtcbiAgICB9XG4gICAgZ2V0RXZlbnQobmFtZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5wYXJhbXNbbmFtZV0gfHwgZXZlbnRGYWN0b3J5KCk7XG4gICAgfVxuICAgIGdldEdsb2JhbElkKCkge1xuICAgICAgICByZXR1cm4gYGdsb2JhbC0ke3RoaXMucGFyYW1zWydhdXJhOmlkJ119YDtcbiAgICB9XG4gICAgZ2V0TmFtZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudHlwZTtcbiAgICB9XG4gICAgZ2V0VHlwZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudHlwZTtcbiAgICB9XG4gICAgZ2V0UmVmZXJlbmNlKGtleSkge1xuICAgICAgICByZXR1cm4gdGhpcy5wYXJhbXNba2V5XTtcbiAgICB9XG4gICAgZ2V0U3VwZXIoKSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBnZXRWZXJzaW9uKCkge1xuICAgICAgICByZXR1cm4gJzEuMCc7XG4gICAgfVxuICAgIGlzQ29uY3JldGUoKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICBpc0luc3RhbmNlT2YobmFtZSkge1xuICAgICAgICByZXR1cm4gdGhpcy50eXBlID09PSBuYW1lO1xuICAgIH1cbiAgICBpc1ZhbGlkKCkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgYWRkRXZlbnRIYW5kbGVyKCkge31cbiAgICBhZGRIYW5kbGVyKCkge31cbiAgICBhZGRWYWx1ZUhhbmRsZXIoKSB7fVxuICAgIGFkZFZhbHVlUHJvdmlkZXIoKSB7fVxuICAgIGF1dG9EZXN0cm95KCkge31cbiAgICBkZXN0cm95KCkge31cbiAgICByZW1vdmVFdmVudEhhbmRsZXIoKSB7fVxuXG59IiwiaW1wb3J0IHsgc3R1YmlmeUluc3RhbmNlIH0gZnJvbSAnLi9zaW5vbkhlbHBlcnMnXG5cbmNvbnN0IGNsYXNzTmFtZVRvQ29tcG9uZW50VmFyID0gY2xhc3NOYW1lID0+IGB2Ll9fY2xzXyR7Y2xhc3NOYW1lfWBcbmV4cG9ydCBjbGFzcyBBdXJhVXRpbCB7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHN0dWJpZnlJbnN0YW5jZShBdXJhVXRpbCwgdGhpcyk7XG4gICAgfVxuICAgIFxuICAgIGlzRW1wdHkob2JqKXtcbiAgICAgICAgaWYgKG9iaiA9PT0gdW5kZWZpbmVkIHx8IG9iaiA9PT0gbnVsbCB8fCBvYmogPT09ICcnKSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShvYmopKSB7XG4gICAgICAgICAgICByZXR1cm4gb2JqLmxlbmd0aCA9PT0gMDtcbiAgICAgICAgfSBlbHNlIGlmICh0eXBlb2Ygb2JqID09PSAnb2JqZWN0JyAmJiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwob2JqKSA9PT0gJ1tvYmplY3QgT2JqZWN0XScpIHtcbiAgICAgICAgICAgIHJldHVybiBPYmplY3Qua2V5cyhvYmopLmxlbmd0aCA9PT0gMDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIGlzVW5kZWZpbmVkT3JOdWxsKG9iaikge1xuICAgICAgICByZXR1cm4gb2JqID09PSB1bmRlZmluZWQgfHwgb2JqID09PSBudWxsO1xuICAgIH1cbiAgICBhZGRDbGFzcyhjb21wb25lbnQsIGNsYXNzTmFtZSkge1xuICAgICAgICByZXR1cm4gY29tcG9uZW50LnNldChjbGFzc05hbWVUb0NvbXBvbmVudFZhcihjbGFzc05hbWUpLCB0cnVlKTtcbiAgICB9XG4gICAgcmVtb3ZlQ2xhc3MoY29tcG9uZW50LCBjbGFzc05hbWUpIHtcbiAgICAgICAgcmV0dXJuIGNvbXBvbmVudC5zZXQoY2xhc3NOYW1lVG9Db21wb25lbnRWYXIoY2xhc3NOYW1lKSwgZmFsc2UpO1xuICAgIH1cbiAgICBoYXNDbGFzcyhjb21wb25lbnQsIGNsYXNzTmFtZSkge1xuICAgICAgICByZXR1cm4gY29tcG9uZW50LmdldChjbGFzc05hbWVUb0NvbXBvbmVudFZhcihjbGFzc05hbWUpKTtcbiAgICB9XG4gICAgdG9nZ2xlQ2xhc3MoY29tcG9uZW50LCBjbGFzc05hbWUpIHtcbiAgICAgICAgY29tcG9uZW50LnNldChjbGFzc05hbWVUb0NvbXBvbmVudFZhcihjbGFzc05hbWUpLCAhY29tcG9uZW50LmdldChjbGFzc05hbWVUb0NvbXBvbmVudFZhcihjbGFzc05hbWUpKSk7XG4gICAgfVxuICAgIGdldEJvb2xlYW5WYWx1ZSh2YWwpIHtcbiAgICAgICAgLy8gUG9ydGVkOiBodHRwczovL2dpdGh1Yi5jb20vZm9yY2Vkb3Rjb20vYXVyYS9ibG9iL21hc3Rlci9hdXJhLWltcGwvc3JjL21haW4vcmVzb3VyY2VzL2F1cmEvdXRpbC9VdGlsLmpzI0wzNjZcbiAgICAgICAgcmV0dXJuIHZhbCAhPT0gdW5kZWZpbmVkICYmIHZhbCAhPT0gbnVsbCAmJiB2YWwgIT09IGZhbHNlICYmIHZhbCAhPT0gMCAmJiB2YWwgIT09ICdmYWxzZScgJiYgdmFsICE9PSAnJyAmJiB2YWwgIT09ICdmJztcbiAgICB9XG4gICAgaXNBcnJheShhcnIpIHtcbiAgICAgICAgLy8gUG9ydGVkOiBodHRwczovL2dpdGh1Yi5jb20vZm9yY2Vkb3Rjb20vYXVyYS9ibG9iL21hc3Rlci9hdXJhLWltcGwvc3JjL21haW4vcmVzb3VyY2VzL2F1cmEvdXRpbC9VdGlsLmpzI0wxODlcbiAgICAgICAgcmV0dXJuICh0eXBlb2YgQXJyYXkuaXNBcnJheSA9PT0gXCJmdW5jdGlvblwiID8gQXJyYXkuaXNBcnJheSA6IGZ1bmN0aW9uKGFyZykge1xuICAgICAgICAgICAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChhcmcpID09PSAnW29iamVjdCBBcnJheV0nO1xuICAgICAgICB9KShhcnIpO1xuICAgIH1cbiAgICBpc09iamVjdChvYmopIHtcbiAgICAgICAgLy9Qb3J0ZWQ6IGh0dHBzOi8vZ2l0aHViLmNvbS9mb3JjZWRvdGNvbS9hdXJhL2Jsb2IvbWFzdGVyL2F1cmEtaW1wbC9zcmMvbWFpbi9yZXNvdXJjZXMvYXVyYS91dGlsL1V0aWwuanMjTDIwNFxuICAgICAgICByZXR1cm4gdHlwZW9mIG9iaiA9PT0gXCJvYmplY3RcIiAmJiBvYmogIT09IG51bGwgJiYgIUFycmF5LmlzQXJyYXkob2JqKTtcbiAgICB9XG4gICAgaXNVbmRlZmluZWQob2JqKXtcbiAgICAgICAgLy9Qb3J0ZWQ6IGh0dHBzOi8vZ2l0aHViLmNvbS9mb3JjZWRvdGNvbS9hdXJhL2Jsb2IvbWFzdGVyL2F1cmEtaW1wbC9zcmMvbWFpbi9yZXNvdXJjZXMvYXVyYS91dGlsL1V0aWwuanMjTDMxOVxuICAgICAgICByZXR1cm4gb2JqID09PSB1bmRlZmluZWQ7XG4gICAgfVxufVxuXG4iLCJpbXBvcnQgeyBzdHViaWZ5SW5zdGFuY2UgfSBmcm9tICcuL3Npbm9uSGVscGVycydcbmltcG9ydCB7IEF1cmFVdGlsIH0gZnJvbSAnLi9hdXJhVXRpbCdcblxuZXhwb3J0IGZ1bmN0aW9uIGF1cmFGYWN0b3J5KHBhcmFtcyA9IHt9KSB7XG4gICAgcmV0dXJuIG5ldyBBdXJhKHBhcmFtcyk7XG59XG5cbmltcG9ydCB7IGNvbXBvbmVudEZhY3RvcnkgfSBmcm9tICcuL2NvbXBvbmVudEZhY3RvcnknXG5cbmNsYXNzIEF1cmEge1xuICAgIGNvbnN0cnVjdG9yKHBhcmFtcykge1xuICAgICAgICB0aGlzLnBhcmFtcyA9IHBhcmFtcztcbiAgICAgICAgdGhpcy51dGlsID0gbmV3IEF1cmFVdGlsKCk7XG4gICAgICAgIHN0dWJpZnlJbnN0YW5jZShBdXJhLCB0aGlzKTtcbiAgICB9XG4gICAgXG4gICAgc2V0UGFyYW1zKHBhcmFtcykge1xuICAgICAgICBPYmplY3QuYXNzaWduKHRoaXMucGFyYW1zLCBwYXJhbXMpO1xuICAgIH1cblxuICAgIGdldChuYW1lKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnBhcmFtc1tuYW1lXTtcbiAgICB9XG5cbiAgICBzZXQobmFtZSwgdmFsdWUpIHtcbiAgICAgICAgdGhpcy5wYXJhbXNbbmFtZV0gPSB2YWx1ZTtcbiAgICB9XG4gICAgXG4gICAgZW5xdWV1ZUFjdGlvbihhY3Rpb24pIHtcbiAgICAgICAgYWN0aW9uICYmIGFjdGlvbi5pbnZva2VDYWxsYmFjayAmJiBhY3Rpb24uaW52b2tlQ2FsbGJhY2sodHJ1ZSlcbiAgICB9XG5cbiAgICBjcmVhdGVDb21wb25lbnQodHlwZSwgYXR0cmlidXRlcywgY2FsbGJhY2spIHtcbiAgICAgICAgdGhpcy5jcmVhdGVDb21wb25lbnQudHlwZSA9IHR5cGU7XG4gICAgICAgIHRoaXMuY3JlYXRlQ29tcG9uZW50LmF0dHJpYnV0ZXMgPSBhdHRyaWJ1dGVzO1xuICAgICAgICAvLyBHZXQgY29tcG9uZW50IGluc3RhbmNlLlxuICAgICAgICAvLyBVc2UgZXhpc3RpbmcgY29tcG9uZW50IGluc3RhbmNlIGlmIHNldFxuICAgICAgICAvLyBDcmVhdGUgbmV3IGRlZmF1bHQgY29tcG9uZW50IGlmIGNvbXBvbmVudCBub3Qgc2V0XG4gICAgICAgIGxldCB7IGNvbXBvbmVudCB9ID0gdGhpcy5jcmVhdGVDb21wb25lbnQ7XG4gICAgICAgIGlmICghY29tcG9uZW50KSB7XG4gICAgICAgICAgICBjb21wb25lbnQgPSBuZXcgY29tcG9uZW50RmFjdG9yeShhdHRyaWJ1dGVzLCB0eXBlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuY3JlYXRlQ29tcG9uZW50LmNvbXBvbmVudCA9IG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGNhbGxiYWNrKSB7XG4gICAgICAgICAgICBjYWxsYmFjayhjb21wb25lbnQsICdTVUNDRVNTJywgWydTVUNDRVNTJ10pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBjb21wb25lbnQ7XG4gICAgfVxuICAgIGNyZWF0ZUNvbXBvbmVudHMoY29tcG9uZW50RGVmcywgY2FsbGJhY2spIHtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gY29tcG9uZW50RGVmc1xuICAgICAgICAgICAgLm1hcChkZWYgPT4gdGhpcy5jcmVhdGVDb21wb25lbnQoZGVmWzBdLCBkZWZbMV0pKVxuICAgICAgICBpZiAoY2FsbGJhY2spIHtcbiAgICAgICAgICAgIGNhbGxiYWNrKHJlc3VsdCwgJ1NVQ0NFU1MnLCByZXN1bHQubWFwKCAoKSA9PiAnU1VDQ0VTUycpKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cbiAgICBnZXRDYWxsYmFjayhjYWxsYmFjaykge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24oLi4uYXJncykge1xuICAgICAgICAgICAgY2FsbGJhY2sgJiYgY2FsbGJhY2soLi4uYXJncyk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZ2V0Q29tcG9uZW50KGlkKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnBhcmFtc1tpZF07XG4gICAgfVxuICAgIGdldFJlZmVyZW5jZSgpIHt9XG4gICAgZ2V0Um9vdCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucm9vdENvbXBvbmVudCB8fCAodGhpcy5yb290Q29tcG9uZW50ID0gbmV3IGNvbXBvbmVudEZhY3RvcnkoKSk7XG4gICAgfVxuICAgIGdldFRva2VuKG5hbWUpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucGFyYW1zWyd0b2tlbi4nICsgbmFtZV1cbiAgICB9XG4gICAgbG9nKHZhbHVlLCBlcnIpIHtcbiAgICAgICAgLyplc2xpbnQgbm8tY29uc29sZTogMCovXG4gICAgICAgIGNvbnNvbGUgJiYgY29uc29sZS5sb2codmFsdWUsIGVycilcbiAgICB9XG4gICAgcmVwb3J0RXJyb3IoKSB7fVxufSIsImltcG9ydCB7IHN0dWJpZnlJbnN0YW5jZU9uRGVtYW5kIH0gZnJvbSAnLi9zaW5vbkhlbHBlcnMnXG5cbmV4cG9ydCBmdW5jdGlvbiBhcGV4Q2FsbEZhY3RvcnkocGFyYW1zID0ge30pIHtcbiAgICByZXR1cm4gc3R1YmlmeUluc3RhbmNlT25EZW1hbmQoQXBleENhbGwsIG5ldyBBcGV4Q2FsbChwYXJhbXMpKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGFwZXhTdWNjZXNzUmVzdWx0KHJlc3BvbnNlID0ge30pIHtcbiAgICByZXR1cm4gc3R1YmlmeUluc3RhbmNlT25EZW1hbmQoQXBleENhbGxSZXN1bHQsIG5ldyBBcGV4Q2FsbFJlc3VsdChyZXNwb25zZSkpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYXBleEVycm9yUmVzdWx0KG1lc3NhZ2UpIHtcbiAgICByZXR1cm4gc3R1YmlmeUluc3RhbmNlT25EZW1hbmQoQXBleENhbGxSZXN1bHQsIG5ldyBBcGV4Q2FsbFJlc3VsdChudWxsLCBtZXNzYWdlKSk7XG59XG5cbmNsYXNzIEFwZXhDYWxsIHtcbiAgICBjb25zdHJ1Y3RvcihyZXN1bHQsIGludm9rZUNhbGxiYWNrT25FbnF1ZXVlID0gdHJ1ZSkge1xuICAgICAgICB0aGlzLnBhcmFtcyA9IG51bGw7XG4gICAgICAgIHRoaXMucmVzdWx0ID0gcmVzdWx0O1xuICAgICAgICB0aGlzLmludm9rZUNhbGxiYWNrT25FbnF1ZXVlID0gaW52b2tlQ2FsbGJhY2tPbkVucXVldWU7XG4gICAgICAgIHRoaXMuaXNCYWNrZ3JvdW5kID0gZmFsc2U7XG4gICAgICAgIHRoaXMuc2V0QWJvcnRhYmxlID0gZmFsc2U7XG4gICAgfVxuICAgIHNldFBhcmFtcyhwYXJhbXMpIHtcbiAgICAgICAgdGhpcy5wYXJhbXMgPSBwYXJhbXM7XG4gICAgfVxuICAgIHNldFBhcmFtKGtleSwgdmFsdWUpIHtcbiAgICAgICAgdGhpcy5wYXJhbXMgPSBPYmplY3QuYXNzaWduKHRoaXMucGFyYW1zLCB7W2tleV0gOiB2YWx1ZX0pO1xuICAgIH1cbiAgICBnZXRQYXJhbXMoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnBhcmFtcztcbiAgICB9XG4gICAgc2V0Q2FsbGJhY2soY3R4LCBjYWxsYmFjaykge1xuICAgICAgICB0aGlzLmN0eCA9IGN0eDtcbiAgICAgICAgdGhpcy5jYWxsYmFjayA9IGNhbGxiYWNrO1xuICAgIH1cbiAgICBpbnZva2VDYWxsYmFjayhmcm9tRW5xdWV1ZSA9IGZhbHNlKSB7XG4gICAgICAgIGlmIChmcm9tRW5xdWV1ZSAmJiAhdGhpcy5pbnZva2VDYWxsYmFja09uRW5xdWV1ZSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuY2FsbGJhY2sgJiYgdGhpcy5jYWxsYmFjay5iaW5kKHRoaXMuY3R4KSh0aGlzLnJlc3VsdCk7XG4gICAgfVxuICAgIGdldEVycm9yKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5yZXN1bHQuZ2V0RXJyb3IoKTtcbiAgICB9XG4gICAgZ2V0UGFyYW0obmFtZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5wYXJhbXMgPyB0aGlzLnBhcmFtc1tuYW1lXSA6IG51bGw7XG4gICAgfVxuICAgIGdldFJldHVyblZhbHVlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5yZXN1bHQ7XG4gICAgfVxuICAgIGdldFN0YXRlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5yZXN1bHQuZ2V0U3RhdGUoKTtcbiAgICB9XG4gICAgaXNCYWNrZ3JvdW5kKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5pc0JhY2tncm91bmQ7XG4gICAgfVxuICAgIHNldEFib3J0YWJsZSgpIHtcbiAgICB9XG4gICAgc2V0QmFja2dyb3VuZCgpIHtcbiAgICAgICAgdGhpcy5pc0JhY2tncm91bmQgPSB0cnVlO1xuICAgIH1cbiAgICBzZXRTdG9yYWJsZSgpIHtcbiAgICB9XG59XG5cbmNsYXNzIEFwZXhDYWxsUmVzdWx0IHtcbiAgICBjb25zdHJ1Y3RvcihyZXNwb25zZSwgZXJyb3JNZXNzYWdlID0gbnVsbCkge1xuICAgICAgICB0aGlzLnJlc3BvbnNlID0gcmVzcG9uc2U7XG4gICAgICAgIHRoaXMuZXJyb3JNZXNzYWdlID0gZXJyb3JNZXNzYWdlO1xuICAgIH1cbiAgICBnZXRTdGF0ZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZXJyb3JNZXNzYWdlID8gJ0VSUk9SJyA6ICdTVUNDRVNTJ1xuICAgIH1cbiAgICBnZXRFcnJvcigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZXJyb3JNZXNzYWdlID8gW3ttZXNzYWdlOiB0aGlzLmVycm9yTWVzc2FnZX1dIDogW11cbiAgICB9XG4gICAgZ2V0UmV0dXJuVmFsdWUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnJlc3BvbnNlO1xuICAgIH1cbn0iLCJpbXBvcnQgeyBldmVudEZhY3RvcnkgfSBmcm9tICcuL2V2ZW50RmFjdG9yeSdcbmltcG9ydCB7IGNvbXBvbmVudEZhY3RvcnksIHVzZUNvbXBvbmVudEFkYXB0ZXJzIH0gZnJvbSAnLi9jb21wb25lbnRGYWN0b3J5J1xuaW1wb3J0IHsgYXVyYUZhY3RvcnkgfSBmcm9tICcuL2F1cmFGYWN0b3J5J1xuaW1wb3J0IHsgQXVyYVV0aWwgfSBmcm9tICcuL2F1cmFVdGlsJ1xuaW1wb3J0IHsgYXBleENhbGxGYWN0b3J5LCBhcGV4U3VjY2Vzc1Jlc3VsdCwgYXBleEVycm9yUmVzdWx0IH0gZnJvbSAnLi9hcGV4Q2FsbEZhY3RvcnknXG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIEF1cmFVdGlsLFxuICAgIGV2ZW50RmFjdG9yeSxcbiAgICBjb21wb25lbnRGYWN0b3J5LFxuICAgIHVzZUNvbXBvbmVudEFkYXB0ZXJzLFxuICAgIGF1cmFGYWN0b3J5LFxuICAgIGFwZXhDYWxsRmFjdG9yeSxcbiAgICBhcGV4U3VjY2Vzc1Jlc3VsdCxcbiAgICBhcGV4RXJyb3JSZXN1bHRcbn0iXSwibmFtZXMiOlsic2lub24iLCJyZXF1aXJlIiwic3R1YmlmeUluc3RhbmNlIiwiY3RvciIsImluc3RhbmNlIiwiZ2V0T3duUHJvcGVydHlOYW1lcyIsInByb3RvdHlwZSIsImZvckVhY2giLCJwcm9wIiwic3R1YiIsImNhbGxzRmFrZSIsInByb3BOYW1lIiwiYXJncyIsImNhbGwiLCJzdHViaWZ5SW5zdGFuY2VPbkRlbWFuZCIsImhhbmRsZXIiLCJ0YXJnZXQiLCJwcm9wZXJ0eSIsImRlc2NyaXB0b3IiLCJfaW5zdGFuY2VQcm9wcyIsInByb3BLZXkiLCJ2YWx1ZSIsIndhcm4iLCJzdHViTmFtZSIsImlzU3B5T3JTdHViYmVkIiwiY2FsbGVkQmVmb3JlIiwiaGFzT25Qcm90byIsInByb3h5IiwiUHJveHkiLCJldmVudEZhY3RvcnkiLCJwYXJhbXMiLCJFdmVudCIsIkZBS0VfRVZFTlRfTkFNRSIsImtleSIsImV2ZW50TmFtZSIsIm5hbWUiLCJfIiwiRGVmYXVsdENvbXBvbmVudEFkYXB0ZXIiLCJXZWxsS25vd25Db21wb25lbnRzIiwiQ29tcG9uZW50QWRhcHRlcnMiLCJjb21wb25lbnRGYWN0b3J5Rm9yQXJyYXkiLCJhcnJheU9mVHlwZXMiLCJtYXAiLCJjb21wb25lbnRGYWN0b3J5IiwidHlwZU9yQ29tcG9uZW50IiwiQXJyYXkiLCJpc0FycmF5IiwiRXJyb3IiLCJDb21wb25lbnQiLCJhZGFwdGVyTmFtZSIsInRvTG93ZXJDYXNlIiwicmVwbGFjZSIsImFkYXB0ZXIiLCJzb21lIiwic3RhcnRzV2l0aCIsInVzZUNvbXBvbmVudEFkYXB0ZXJzIiwicmVnaXN0cmF0b3IiLCJyZWdpc3RlciIsImNvbXBvbmVudFR5cGUiLCJ0eXBlIiwiT2JqZWN0IiwiYXNzaWduIiwic3Vic3RyaW5nIiwiZ2V0Iiwic2V0IiwiZmluZE1hcCIsImhhc093blByb3BlcnR5IiwiZGVmYXVsdFBhcmFtcyIsImNvbXBvbmVudCIsImNsYXNzTmFtZVRvQ29tcG9uZW50VmFyIiwiY2xhc3NOYW1lIiwiQXVyYVV0aWwiLCJvYmoiLCJ1bmRlZmluZWQiLCJsZW5ndGgiLCJ0b1N0cmluZyIsImtleXMiLCJ2YWwiLCJhcnIiLCJhcmciLCJhdXJhRmFjdG9yeSIsIkF1cmEiLCJ1dGlsIiwiYWN0aW9uIiwiaW52b2tlQ2FsbGJhY2siLCJhdHRyaWJ1dGVzIiwiY2FsbGJhY2siLCJjcmVhdGVDb21wb25lbnQiLCJjb21wb25lbnREZWZzIiwicmVzdWx0IiwiZGVmIiwiaWQiLCJyb290Q29tcG9uZW50IiwiZXJyIiwiY29uc29sZSIsImxvZyIsImFwZXhDYWxsRmFjdG9yeSIsIkFwZXhDYWxsIiwiYXBleFN1Y2Nlc3NSZXN1bHQiLCJyZXNwb25zZSIsIkFwZXhDYWxsUmVzdWx0IiwiYXBleEVycm9yUmVzdWx0IiwibWVzc2FnZSIsImludm9rZUNhbGxiYWNrT25FbnF1ZXVlIiwiaXNCYWNrZ3JvdW5kIiwic2V0QWJvcnRhYmxlIiwiY3R4IiwiZnJvbUVucXVldWUiLCJiaW5kIiwiZ2V0RXJyb3IiLCJnZXRTdGF0ZSIsImVycm9yTWVzc2FnZSIsIm1vZHVsZSIsImV4cG9ydHMiXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBO0FBQ0EsSUFBTUEsUUFBUUMsUUFBUSxPQUFSLENBQWQ7O0FBRUEsQUFBTyxTQUFTQyxlQUFULENBQXlCQyxJQUF6QixFQUErQkMsUUFBL0IsRUFBeUM7V0FDckNDLG1CQUFQLENBQTJCRixLQUFLRyxTQUFoQyxFQUEyQ0MsT0FBM0MsQ0FBbUQsZ0JBQVE7WUFDbkQsT0FBT0osS0FBS0csU0FBTCxDQUFlRSxJQUFmLENBQVAsS0FBZ0MsVUFBaEMsSUFBOENBLFNBQVMsYUFBM0QsRUFBMEU7Oztp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
