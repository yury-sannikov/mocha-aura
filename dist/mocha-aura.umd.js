(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(factory());
}(this, (function () { 'use strict';

/*global Proxy*/
var sinon = require('sinon');

function stubifyInstance(ctor, instance, params) {
    var propExcluded = function propExcluded(prop) {
        return params && params.doNotMock && (Array.isArray(params.doNotMock) ? params.doNotMock.indexOf(prop) !== -1 : params.doNotMock === prop);
    };

    Object.getOwnPropertyNames(ctor.prototype).forEach(function (prop) {
        if (propExcluded(prop) || typeof ctor.prototype[prop] !== 'function' || prop === 'constructor') {
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
    return instance;
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
            if (target[propKey] === undefined) {
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
        this.destroyed = false;
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
            return !this.destroyed;
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
        value: function destroy() {
            this.destroyed = true;
        }
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
    var stubifyParams = arguments[1];

    return stubifyInstance(Aura, new Aura(params), stubifyParams);
}

var Aura = function () {
    function Aura(params) {
        classCallCheck(this, Aura);

        this.params = params;
        this.util = new AuraUtil();
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9jaGEtYXVyYS51bWQuanMiLCJzb3VyY2VzIjpbIi4uL2xpYi9zaW5vbkhlbHBlcnMuanMiLCIuLi9saWIvZXZlbnRGYWN0b3J5LmpzIiwiLi4vbGliL2NvbXBvbmVudEZhY3RvcnkuanMiLCIuLi9saWIvYXVyYVV0aWwuanMiLCIuLi9saWIvYXVyYUZhY3RvcnkuanMiLCIuLi9saWIvYXBleENhbGxGYWN0b3J5LmpzIiwiLi4vbGliL2F1cmEuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLypnbG9iYWwgUHJveHkqL1xuY29uc3Qgc2lub24gPSByZXF1aXJlKCdzaW5vbicpO1xuXG5leHBvcnQgZnVuY3Rpb24gc3R1YmlmeUluc3RhbmNlKGN0b3IsIGluc3RhbmNlLCBwYXJhbXMpIHtcbiAgICBjb25zdCBwcm9wRXhjbHVkZWQgPSAocHJvcCkgPT4gcGFyYW1zICYmIHBhcmFtcy5kb05vdE1vY2sgJiYgKEFycmF5LmlzQXJyYXkocGFyYW1zLmRvTm90TW9jaykgPyBcbiAgICAgICAgcGFyYW1zLmRvTm90TW9jay5pbmRleE9mKHByb3ApICE9PSAtMSA6IHBhcmFtcy5kb05vdE1vY2sgPT09IHByb3ApO1xuXG4gICAgT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMoY3Rvci5wcm90b3R5cGUpLmZvckVhY2gocHJvcCA9PiB7XG4gICAgICAgIGlmIChwcm9wRXhjbHVkZWQocHJvcCkgfHwgdHlwZW9mIGN0b3IucHJvdG90eXBlW3Byb3BdICE9PSAnZnVuY3Rpb24nIHx8IHByb3AgPT09ICdjb25zdHJ1Y3RvcicpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpbnN0YW5jZVsnc3R1Yl8nICsgcHJvcF0gPSBzaW5vbi5zdHViKGluc3RhbmNlLCBwcm9wKS5jYWxsc0Zha2UoKChwcm9wTmFtZSkgPT4gKC4uLmFyZ3MpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBjdG9yLnByb3RvdHlwZVtwcm9wTmFtZV0uY2FsbChpbnN0YW5jZSwgLi4uYXJncyk7XG4gICAgICAgIH0pKHByb3ApKVxuICAgIH0pXG4gICAgcmV0dXJuIGluc3RhbmNlO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc3R1YmlmeUluc3RhbmNlT25EZW1hbmQoY3RvciwgaW5zdGFuY2UpIHtcbiAgICBjb25zdCBoYW5kbGVyID0ge1xuICAgICAgICBfaW5zdGFuY2VQcm9wczoge30sXG4gICAgICAgIGRlZmluZVByb3BlcnR5KHRhcmdldCwgcHJvcGVydHksIGRlc2NyaXB0b3IpIHtcbiAgICAgICAgICAgIGhhbmRsZXIuX2luc3RhbmNlUHJvcHNbcHJvcGVydHldID0gZGVzY3JpcHRvcjtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9LFxuICAgICAgICBnZXQodGFyZ2V0LCBwcm9wS2V5KSB7XG4gICAgICAgICAgICAvLyBDaGVjayBmb3IgU3ltYm9sIGZvciBpdGVyYXRvcnNcbiAgICAgICAgICAgIGlmICh0eXBlb2YgcHJvcEtleSAhPT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGFyZ2V0W3Byb3BLZXldO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gSWYgd2UgYWRkIHNvbWUgcHJvcHMgdG8gdGhlIGluc3RhbmNlLCByZXR1cm4gaXQgdy9vIG1vY2tpbmdcbiAgICAgICAgICAgIC8vIFVzdWFsbHkgYWRkZWQgc3R1ZmYgaXMgbW9ja2VkIHRocm91Z2ggZGF0YSBhZGFwdGVyc1xuICAgICAgICAgICAgaWYgKGhhbmRsZXIuX2luc3RhbmNlUHJvcHNbcHJvcEtleV0pIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gaGFuZGxlci5faW5zdGFuY2VQcm9wc1twcm9wS2V5XS52YWx1ZVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgICAgICAvL1dhcm4gb24gdW5rbm93biBwcm9wS2V5IGZvciBiZXR0ZXIgZGVidWdnaW5nXG4gICAgICAgICAgICBpZiAodGFyZ2V0W3Byb3BLZXldID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAvKmVzbGludCBuby1jb25zb2xlOiAwKi9cbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oJ1xcblxcbnN0dWJpZnlJbnN0YW5jZU9uRGVtYW5kOiBVbmtub3duIHByb3BlcnR5ICcgKyBwcm9wS2V5LCAnXFxuXFxuJyk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRhcmdldFtwcm9wS2V5XTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gU3R1YiBtZXRob2RzIHRoYXQgZGVmaW5lZCBvbiBwcm90b3R5cGUgb25seSwgZS5nLiBoYXMgcHVibGljIGFwaVxuICAgICAgICAgICAgY29uc3Qgc3R1Yk5hbWUgPSAnc3R1Yl8nICsgcHJvcEtleTtcbiAgICAgICAgICAgIGNvbnN0IGlzU3B5T3JTdHViYmVkID0gISEodGFyZ2V0W3Byb3BLZXldICYmIHRhcmdldFtwcm9wS2V5XS5jYWxsZWRCZWZvcmUpO1xuICAgICAgICAgICAgY29uc3QgaGFzT25Qcm90byA9ICEhY3Rvci5wcm90b3R5cGVbcHJvcEtleV07XG5cbiAgICAgICAgICAgIGlmIChoYXNPblByb3RvICYmICFpc1NweU9yU3R1YmJlZCAmJiB0eXBlb2YgdGFyZ2V0W3Byb3BLZXldID09PSAnZnVuY3Rpb24nICYmIHByb3BLZXkgIT09ICdjb25zdHJ1Y3RvcicpIHtcbiAgICAgICAgICAgICAgICB0YXJnZXRbc3R1Yk5hbWVdID0gc2lub24uc3R1Yih0YXJnZXQsIHByb3BLZXkpLmNhbGxzRmFrZSgoLi4uYXJncykgPT4ge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gY3Rvci5wcm90b3R5cGVbcHJvcEtleV0uY2FsbChpbnN0YW5jZSwgLi4uYXJncyk7XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB0YXJnZXRbcHJvcEtleV07XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zdCBwcm94eSA9IG5ldyBQcm94eShpbnN0YW5jZSwgaGFuZGxlcik7XG4gICAgcmV0dXJuIHByb3h5O1xufSIsImltcG9ydCB7IHN0dWJpZnlJbnN0YW5jZU9uRGVtYW5kIH0gZnJvbSAnLi9zaW5vbkhlbHBlcnMnXG5cbmV4cG9ydCBmdW5jdGlvbiBldmVudEZhY3RvcnkocGFyYW1zID0ge30pIHtcbiAgICByZXR1cm4gc3R1YmlmeUluc3RhbmNlT25EZW1hbmQoRXZlbnQsIG5ldyBFdmVudChwYXJhbXMpKTtcbn1cbmNvbnN0IEZBS0VfRVZFTlRfTkFNRSA9ICdtb2NoYS1hdXJhLWZha2UtZXZlbnQnXG5cbmNsYXNzIEV2ZW50IHtcbiAgICBjb25zdHJ1Y3RvcihwYXJhbXMpIHtcbiAgICAgICAgdGhpcy5wYXJhbXMgPSBwYXJhbXMgfHwge307XG4gICAgfVxuICAgIHNldFBhcmFtcyhwYXJhbXMpIHtcbiAgICAgICAgdGhpcy5wYXJhbXMgPSBwYXJhbXM7XG4gICAgfVxuICAgIHNldFBhcmFtKGtleSwgdmFsdWUpIHtcbiAgICAgICAgdGhpcy5wYXJhbXNba2V5XSA9IHZhbHVlO1xuICAgIH1cbiAgICBnZXRQYXJhbXMoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnBhcmFtcztcbiAgICB9XG4gICAgZ2V0RXZlbnRUeXBlKCkge1xuICAgICAgICByZXR1cm4gJ0FQUExJQ0FUSU9OJ1xuICAgIH1cbiAgICBnZXROYW1lKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wYXJhbXMuZXZlbnROYW1lIHx8IEZBS0VfRVZFTlRfTkFNRVxuICAgIH1cbiAgICBnZXRQYXJhbShuYW1lKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnBhcmFtc1tuYW1lXVxuICAgIH1cbiAgICBnZXRQaGFzZSgpIHtcbiAgICAgICAgcmV0dXJuICdkZWZhdWx0J1xuICAgIH1cbiAgICBnZXRTb3VyY2UoKSB7XG4gICAgICAgIHJldHVybiBudWxsXG4gICAgfVxuICAgIGdldFR5cGUoKSB7XG4gICAgICAgIHJldHVybiBgYzoke0ZBS0VfRVZFTlRfTkFNRX1gXG4gICAgfVxuICAgIGZpcmUoKSB7fVxuICAgIHBhdXNlKCkge31cbiAgICBwcmV2ZW50RGVmYXVsdCgpIHt9XG4gICAgcmVzdW1lKCkge31cbiAgICBzdG9wUHJvcGFnYXRpb24oKSB7fVxuICAgIFxuXG59IiwiY29uc3QgXyA9IHJlcXVpcmUoJ2xvZGFzaCcpO1xuaW1wb3J0IHsgZXZlbnRGYWN0b3J5IH0gZnJvbSAnLi9ldmVudEZhY3RvcnknXG5pbXBvcnQgeyBzdHViaWZ5SW5zdGFuY2VPbkRlbWFuZCB9IGZyb20gJy4vc2lub25IZWxwZXJzJ1xuXG5jb25zdCBEZWZhdWx0Q29tcG9uZW50QWRhcHRlciA9ICdkZWZhdWx0J1xuY29uc3QgV2VsbEtub3duQ29tcG9uZW50cyA9IFsnYXVyYTonLCAnZm9yY2U6JywgJ2ZvcmNlQ2hhdHRlcjonLCAnbGlnaHRuaW5nOicsICd1aTonLCAnYzonXVxuXG5sZXQgQ29tcG9uZW50QWRhcHRlcnMgPSB7XG4gICAgW0RlZmF1bHRDb21wb25lbnRBZGFwdGVyXTogaW5zdGFuY2UgPT4gaW5zdGFuY2Vcbn1cblxuZnVuY3Rpb24gY29tcG9uZW50RmFjdG9yeUZvckFycmF5KHBhcmFtcywgYXJyYXlPZlR5cGVzKSB7XG4gICAgcmV0dXJuIGFycmF5T2ZUeXBlcy5tYXAodHlwZU9yQ29tcG9uZW50ID0+IGNvbXBvbmVudEZhY3RvcnkocGFyYW1zLCB0eXBlT3JDb21wb25lbnQpKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNvbXBvbmVudEZhY3RvcnkocGFyYW1zID0ge30sIHR5cGVPckNvbXBvbmVudCA9IERlZmF1bHRDb21wb25lbnRBZGFwdGVyKSB7XG4gICAgaWYgKEFycmF5LmlzQXJyYXkodHlwZU9yQ29tcG9uZW50KSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1VuZXhwZWN0ZWQgdHlwZSBhcmd1bWVudCcpXG4gICAgfVxuXG4gICAgaWYgKHR5cGVPckNvbXBvbmVudCA9PT0gdHJ1ZSkge1xuICAgICAgICB0eXBlT3JDb21wb25lbnQgPSBEZWZhdWx0Q29tcG9uZW50QWRhcHRlclxuICAgIH0gZWxzZSBpZiAodHlwZU9yQ29tcG9uZW50IGluc3RhbmNlb2YgQ29tcG9uZW50KSB7XG4gICAgICAgIHJldHVybiB0eXBlT3JDb21wb25lbnQ7XG4gICAgfSBlbHNlIGlmICh0eXBlT3JDb21wb25lbnQgPT09IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgbGV0IGluc3RhbmNlID0gc3R1YmlmeUluc3RhbmNlT25EZW1hbmQoQ29tcG9uZW50LCBuZXcgQ29tcG9uZW50KHBhcmFtcywgdHlwZU9yQ29tcG9uZW50KSk7XG4gICAgbGV0IGFkYXB0ZXJOYW1lID0gdHlwZU9yQ29tcG9uZW50LnRvTG93ZXJDYXNlKCkucmVwbGFjZSgnbWFya3VwOi8vJywgJycpXG4gICAgbGV0IGFkYXB0ZXIgPSBDb21wb25lbnRBZGFwdGVyc1thZGFwdGVyTmFtZV07XG4gICAgaWYgKCFhZGFwdGVyKSB7XG4gICAgICAgIGlmICghXy5zb21lKFdlbGxLbm93bkNvbXBvbmVudHMsIG5hbWUgPT4gYWRhcHRlck5hbWUuc3RhcnRzV2l0aChuYW1lKSkpIHtcbiAgICAgICAgICAgIC8qZXNsaW50IG5vLWNvbnNvbGU6IDAqL1xuICAgICAgICAgICAgY29uc29sZS53YXJuKGBVbmFibGUgdG8gZmluZCBjb21wb25lbnQgYWRhcHRlciAke3R5cGVPckNvbXBvbmVudH1gKTtcbiAgICAgICAgfVxuICAgICAgICBhZGFwdGVyID0gQ29tcG9uZW50QWRhcHRlcnNbRGVmYXVsdENvbXBvbmVudEFkYXB0ZXJdO1xuICAgIH1cbiAgICByZXR1cm4gYWRhcHRlcihpbnN0YW5jZSwgcGFyYW1zKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHVzZUNvbXBvbmVudEFkYXB0ZXJzKHJlZ2lzdHJhdG9yKSB7XG4gICAgY29uc3QgcmVnaXN0ZXIgPSAoY29tcG9uZW50VHlwZSwgYWRhcHRlcikgPT4ge1xuICAgICAgICBjb25zdCBhZGFwdGVyTmFtZSA9IGNvbXBvbmVudFR5cGUudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgQ29tcG9uZW50QWRhcHRlcnNbYWRhcHRlck5hbWVdID0gYWRhcHRlclxuICAgIH1cbiAgICByZWdpc3RyYXRvcih7cmVnaXN0ZXJ9KTtcbn1cblxuY2xhc3MgQ29tcG9uZW50IHtcbiAgICBjb25zdHJ1Y3RvcihwYXJhbXMsIHR5cGUpIHtcbiAgICAgICAgdGhpcy5wYXJhbXMgPSBPYmplY3QuYXNzaWduKHt9LCB7XG4gICAgICAgICAgICBmaW5kTWFwOiB7fVxuICAgICAgICB9LCBwYXJhbXMpO1xuICAgICAgICB0aGlzLnR5cGUgPSB0eXBlIHx8ICdkZWZhdWx0JztcbiAgICAgICAgdGhpcy5kZXN0cm95ZWQgPSBmYWxzZTtcbiAgICB9XG4gICAgZ2V0KG5hbWUpIHtcbiAgICAgICAgaWYgKG5hbWUuc3RhcnRzV2l0aCgndi4nKSB8fCBuYW1lLnN0YXJ0c1dpdGgoJ2MuJykgfHwgbmFtZS5zdGFydHNXaXRoKCdlLicpKSB7XG4gICAgICAgICAgICBuYW1lID0gbmFtZS5zdWJzdHJpbmcoMik7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIF8uZ2V0KHRoaXMucGFyYW1zLCBuYW1lKTtcbiAgICB9XG4gICAgc2V0KG5hbWUsIHZhbHVlKSB7XG4gICAgICAgIGlmIChuYW1lLnN0YXJ0c1dpdGgoJ3YuJykgfHwgbmFtZS5zdGFydHNXaXRoKCdjLicpIHx8IG5hbWUuc3RhcnRzV2l0aCgnZS4nKSkge1xuICAgICAgICAgICAgbmFtZSA9IG5hbWUuc3Vic3RyaW5nKDIpO1xuICAgICAgICB9XG4gICAgICAgIF8uc2V0KHRoaXMucGFyYW1zLCBuYW1lLCB2YWx1ZSk7XG4gICAgfVxuICAgIGZpbmQobmFtZSkge1xuICAgICAgICBsZXQgdHlwZU9yQ29tcG9uZW50ID0gdGhpcy5wYXJhbXMuZmluZE1hcFtuYW1lXTtcbiAgICAgICAgaWYgKCF0eXBlT3JDb21wb25lbnQgJiYgdGhpcy5wYXJhbXMuZmluZE1hcC5oYXNPd25Qcm9wZXJ0eShuYW1lKSkge1xuICAgICAgICAgICAgcmV0dXJuIHR5cGVPckNvbXBvbmVudDtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBkZWZhdWx0UGFyYW1zID0ge1xuICAgICAgICAgICAgJ2F1cmE6aWQnOiBuYW1lXG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGNvbnN0IGNvbXBvbmVudCA9IHRoaXMucGFyYW1zLmZpbmRNYXBbbmFtZV0gPSAoQXJyYXkuaXNBcnJheSh0eXBlT3JDb21wb25lbnQpID8gXG4gICAgICAgICAgICBjb21wb25lbnRGYWN0b3J5Rm9yQXJyYXkoZGVmYXVsdFBhcmFtcywgdHlwZU9yQ29tcG9uZW50KSA6IFxuICAgICAgICAgICAgY29tcG9uZW50RmFjdG9yeShkZWZhdWx0UGFyYW1zLCB0eXBlT3JDb21wb25lbnQpKVxuICAgICAgICByZXR1cm4gY29tcG9uZW50O1xuICAgIH1cbiAgICBnZXRMb2NhbElkKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wYXJhbXNbJ2F1cmE6aWQnXTtcbiAgICB9XG4gICAgY2xlYXJSZWZlcmVuY2Uoa2V5KSB7XG4gICAgICAgIGRlbGV0ZSB0aGlzLnBhcmFtc1trZXldO1xuICAgIH1cbiAgICBnZXRDb25jcmV0ZUNvbXBvbmVudCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIGdldEVsZW1lbnQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICBnZXRFbGVtZW50cygpIHtcbiAgICAgICAgcmV0dXJuIFt0aGlzXTtcbiAgICB9XG4gICAgZ2V0RXZlbnQobmFtZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5wYXJhbXNbbmFtZV0gfHwgZXZlbnRGYWN0b3J5KCk7XG4gICAgfVxuICAgIGdldEdsb2JhbElkKCkge1xuICAgICAgICByZXR1cm4gYGdsb2JhbC0ke3RoaXMucGFyYW1zWydhdXJhOmlkJ119YDtcbiAgICB9XG4gICAgZ2V0TmFtZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudHlwZTtcbiAgICB9XG4gICAgZ2V0VHlwZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudHlwZTtcbiAgICB9XG4gICAgZ2V0UmVmZXJlbmNlKGtleSkge1xuICAgICAgICByZXR1cm4gdGhpcy5wYXJhbXNba2V5XTtcbiAgICB9XG4gICAgZ2V0U3VwZXIoKSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBnZXRWZXJzaW9uKCkge1xuICAgICAgICByZXR1cm4gJzEuMCc7XG4gICAgfVxuICAgIGlzQ29uY3JldGUoKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICBpc0luc3RhbmNlT2YobmFtZSkge1xuICAgICAgICByZXR1cm4gdGhpcy50eXBlID09PSBuYW1lO1xuICAgIH1cbiAgICBpc1ZhbGlkKCkge1xuICAgICAgICByZXR1cm4gIXRoaXMuZGVzdHJveWVkO1xuICAgIH1cbiAgICBhZGRFdmVudEhhbmRsZXIoKSB7fVxuICAgIGFkZEhhbmRsZXIoKSB7fVxuICAgIGFkZFZhbHVlSGFuZGxlcigpIHt9XG4gICAgYWRkVmFsdWVQcm92aWRlcigpIHt9XG4gICAgYXV0b0Rlc3Ryb3koKSB7fVxuICAgIGRlc3Ryb3koKSB7XG4gICAgICAgIHRoaXMuZGVzdHJveWVkID0gdHJ1ZTtcbiAgICB9XG4gICAgcmVtb3ZlRXZlbnRIYW5kbGVyKCkge31cblxufSIsImltcG9ydCB7IHN0dWJpZnlJbnN0YW5jZSB9IGZyb20gJy4vc2lub25IZWxwZXJzJ1xuXG5jb25zdCBjbGFzc05hbWVUb0NvbXBvbmVudFZhciA9IGNsYXNzTmFtZSA9PiBgdi5fX2Nsc18ke2NsYXNzTmFtZX1gXG5leHBvcnQgY2xhc3MgQXVyYVV0aWwge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBzdHViaWZ5SW5zdGFuY2UoQXVyYVV0aWwsIHRoaXMpO1xuICAgIH1cbiAgICBcbiAgICBpc0VtcHR5KG9iail7XG4gICAgICAgIGlmIChvYmogPT09IHVuZGVmaW5lZCB8fCBvYmogPT09IG51bGwgfHwgb2JqID09PSAnJykge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkob2JqKSkge1xuICAgICAgICAgICAgcmV0dXJuIG9iai5sZW5ndGggPT09IDA7XG4gICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIG9iaiA9PT0gJ29iamVjdCcgJiYgT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKG9iaikgPT09ICdbb2JqZWN0IE9iamVjdF0nKSB7XG4gICAgICAgICAgICByZXR1cm4gT2JqZWN0LmtleXMob2JqKS5sZW5ndGggPT09IDA7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBpc1VuZGVmaW5lZE9yTnVsbChvYmopIHtcbiAgICAgICAgcmV0dXJuIG9iaiA9PT0gdW5kZWZpbmVkIHx8IG9iaiA9PT0gbnVsbDtcbiAgICB9XG4gICAgYWRkQ2xhc3MoY29tcG9uZW50LCBjbGFzc05hbWUpIHtcbiAgICAgICAgcmV0dXJuIGNvbXBvbmVudC5zZXQoY2xhc3NOYW1lVG9Db21wb25lbnRWYXIoY2xhc3NOYW1lKSwgdHJ1ZSk7XG4gICAgfVxuICAgIHJlbW92ZUNsYXNzKGNvbXBvbmVudCwgY2xhc3NOYW1lKSB7XG4gICAgICAgIHJldHVybiBjb21wb25lbnQuc2V0KGNsYXNzTmFtZVRvQ29tcG9uZW50VmFyKGNsYXNzTmFtZSksIGZhbHNlKTtcbiAgICB9XG4gICAgaGFzQ2xhc3MoY29tcG9uZW50LCBjbGFzc05hbWUpIHtcbiAgICAgICAgcmV0dXJuIGNvbXBvbmVudC5nZXQoY2xhc3NOYW1lVG9Db21wb25lbnRWYXIoY2xhc3NOYW1lKSk7XG4gICAgfVxuICAgIHRvZ2dsZUNsYXNzKGNvbXBvbmVudCwgY2xhc3NOYW1lKSB7XG4gICAgICAgIGNvbXBvbmVudC5zZXQoY2xhc3NOYW1lVG9Db21wb25lbnRWYXIoY2xhc3NOYW1lKSwgIWNvbXBvbmVudC5nZXQoY2xhc3NOYW1lVG9Db21wb25lbnRWYXIoY2xhc3NOYW1lKSkpO1xuICAgIH1cbiAgICBnZXRCb29sZWFuVmFsdWUodmFsKSB7XG4gICAgICAgIC8vIFBvcnRlZDogaHR0cHM6Ly9naXRodWIuY29tL2ZvcmNlZG90Y29tL2F1cmEvYmxvYi9tYXN0ZXIvYXVyYS1pbXBsL3NyYy9tYWluL3Jlc291cmNlcy9hdXJhL3V0aWwvVXRpbC5qcyNMMzY2XG4gICAgICAgIHJldHVybiB2YWwgIT09IHVuZGVmaW5lZCAmJiB2YWwgIT09IG51bGwgJiYgdmFsICE9PSBmYWxzZSAmJiB2YWwgIT09IDAgJiYgdmFsICE9PSAnZmFsc2UnICYmIHZhbCAhPT0gJycgJiYgdmFsICE9PSAnZic7XG4gICAgfVxuICAgIGlzQXJyYXkoYXJyKSB7XG4gICAgICAgIC8vIFBvcnRlZDogaHR0cHM6Ly9naXRodWIuY29tL2ZvcmNlZG90Y29tL2F1cmEvYmxvYi9tYXN0ZXIvYXVyYS1pbXBsL3NyYy9tYWluL3Jlc291cmNlcy9hdXJhL3V0aWwvVXRpbC5qcyNMMTg5XG4gICAgICAgIHJldHVybiAodHlwZW9mIEFycmF5LmlzQXJyYXkgPT09IFwiZnVuY3Rpb25cIiA/IEFycmF5LmlzQXJyYXkgOiBmdW5jdGlvbihhcmcpIHtcbiAgICAgICAgICAgIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoYXJnKSA9PT0gJ1tvYmplY3QgQXJyYXldJztcbiAgICAgICAgfSkoYXJyKTtcbiAgICB9XG4gICAgaXNPYmplY3Qob2JqKSB7XG4gICAgICAgIC8vUG9ydGVkOiBodHRwczovL2dpdGh1Yi5jb20vZm9yY2Vkb3Rjb20vYXVyYS9ibG9iL21hc3Rlci9hdXJhLWltcGwvc3JjL21haW4vcmVzb3VyY2VzL2F1cmEvdXRpbC9VdGlsLmpzI0wyMDRcbiAgICAgICAgcmV0dXJuIHR5cGVvZiBvYmogPT09IFwib2JqZWN0XCIgJiYgb2JqICE9PSBudWxsICYmICFBcnJheS5pc0FycmF5KG9iaik7XG4gICAgfVxuICAgIGlzVW5kZWZpbmVkKG9iail7XG4gICAgICAgIC8vUG9ydGVkOiBodHRwczovL2dpdGh1Yi5jb20vZm9yY2Vkb3Rjb20vYXVyYS9ibG9iL21hc3Rlci9hdXJhLWltcGwvc3JjL21haW4vcmVzb3VyY2VzL2F1cmEvdXRpbC9VdGlsLmpzI0wzMTlcbiAgICAgICAgcmV0dXJuIG9iaiA9PT0gdW5kZWZpbmVkO1xuICAgIH1cbn1cblxuIiwiaW1wb3J0IHsgc3R1YmlmeUluc3RhbmNlIH0gZnJvbSAnLi9zaW5vbkhlbHBlcnMnXG5pbXBvcnQgeyBBdXJhVXRpbCB9IGZyb20gJy4vYXVyYVV0aWwnXG5cbmV4cG9ydCBmdW5jdGlvbiBhdXJhRmFjdG9yeShwYXJhbXMgPSB7fSwgc3R1YmlmeVBhcmFtcykge1xuICAgIHJldHVybiBzdHViaWZ5SW5zdGFuY2UoQXVyYSwgbmV3IEF1cmEocGFyYW1zKSwgc3R1YmlmeVBhcmFtcyk7XG59XG5cbmltcG9ydCB7IGNvbXBvbmVudEZhY3RvcnkgfSBmcm9tICcuL2NvbXBvbmVudEZhY3RvcnknXG5cbmNsYXNzIEF1cmEge1xuICAgIGNvbnN0cnVjdG9yKHBhcmFtcykge1xuICAgICAgICB0aGlzLnBhcmFtcyA9IHBhcmFtcztcbiAgICAgICAgdGhpcy51dGlsID0gbmV3IEF1cmFVdGlsKCk7XG4gICAgfVxuICAgIFxuICAgIHNldFBhcmFtcyhwYXJhbXMpIHtcbiAgICAgICAgT2JqZWN0LmFzc2lnbih0aGlzLnBhcmFtcywgcGFyYW1zKTtcbiAgICB9XG5cbiAgICBnZXQobmFtZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5wYXJhbXNbbmFtZV07XG4gICAgfVxuXG4gICAgc2V0KG5hbWUsIHZhbHVlKSB7XG4gICAgICAgIHRoaXMucGFyYW1zW25hbWVdID0gdmFsdWU7XG4gICAgfVxuICAgIFxuICAgIGVucXVldWVBY3Rpb24oYWN0aW9uKSB7XG4gICAgICAgIGFjdGlvbiAmJiBhY3Rpb24uaW52b2tlQ2FsbGJhY2sgJiYgYWN0aW9uLmludm9rZUNhbGxiYWNrKHRydWUpXG4gICAgfVxuXG4gICAgY3JlYXRlQ29tcG9uZW50KHR5cGUsIGF0dHJpYnV0ZXMsIGNhbGxiYWNrKSB7XG4gICAgICAgIHRoaXMuY3JlYXRlQ29tcG9uZW50LnR5cGUgPSB0eXBlO1xuICAgICAgICB0aGlzLmNyZWF0ZUNvbXBvbmVudC5hdHRyaWJ1dGVzID0gYXR0cmlidXRlcztcbiAgICAgICAgLy8gR2V0IGNvbXBvbmVudCBpbnN0YW5jZS5cbiAgICAgICAgLy8gVXNlIGV4aXN0aW5nIGNvbXBvbmVudCBpbnN0YW5jZSBpZiBzZXRcbiAgICAgICAgLy8gQ3JlYXRlIG5ldyBkZWZhdWx0IGNvbXBvbmVudCBpZiBjb21wb25lbnQgbm90IHNldFxuICAgICAgICBsZXQgeyBjb21wb25lbnQgfSA9IHRoaXMuY3JlYXRlQ29tcG9uZW50O1xuICAgICAgICBpZiAoIWNvbXBvbmVudCkge1xuICAgICAgICAgICAgY29tcG9uZW50ID0gbmV3IGNvbXBvbmVudEZhY3RvcnkoYXR0cmlidXRlcywgdHlwZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmNyZWF0ZUNvbXBvbmVudC5jb21wb25lbnQgPSBudWxsO1xuICAgICAgICB9XG4gICAgICAgIGlmIChjYWxsYmFjaykge1xuICAgICAgICAgICAgY2FsbGJhY2soY29tcG9uZW50LCAnU1VDQ0VTUycsIFsnU1VDQ0VTUyddKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gY29tcG9uZW50O1xuICAgIH1cbiAgICBjcmVhdGVDb21wb25lbnRzKGNvbXBvbmVudERlZnMsIGNhbGxiYWNrKSB7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGNvbXBvbmVudERlZnNcbiAgICAgICAgICAgIC5tYXAoZGVmID0+IHRoaXMuY3JlYXRlQ29tcG9uZW50KGRlZlswXSwgZGVmWzFdKSlcbiAgICAgICAgaWYgKGNhbGxiYWNrKSB7XG4gICAgICAgICAgICBjYWxsYmFjayhyZXN1bHQsICdTVUNDRVNTJywgcmVzdWx0Lm1hcCggKCkgPT4gJ1NVQ0NFU1MnKSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG4gICAgZ2V0Q2FsbGJhY2soY2FsbGJhY2spIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKC4uLmFyZ3MpIHtcbiAgICAgICAgICAgIGNhbGxiYWNrICYmIGNhbGxiYWNrKC4uLmFyZ3MpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGdldENvbXBvbmVudChpZCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wYXJhbXNbaWRdO1xuICAgIH1cbiAgICBnZXRSZWZlcmVuY2UoKSB7fVxuICAgIGdldFJvb3QoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnJvb3RDb21wb25lbnQgfHwgKHRoaXMucm9vdENvbXBvbmVudCA9IG5ldyBjb21wb25lbnRGYWN0b3J5KCkpO1xuICAgIH1cbiAgICBnZXRUb2tlbihuYW1lKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnBhcmFtc1sndG9rZW4uJyArIG5hbWVdXG4gICAgfVxuICAgIGxvZyh2YWx1ZSwgZXJyKSB7XG4gICAgICAgIC8qZXNsaW50IG5vLWNvbnNvbGU6IDAqL1xuICAgICAgICBjb25zb2xlICYmIGNvbnNvbGUubG9nKHZhbHVlLCBlcnIpXG4gICAgfVxuICAgIHJlcG9ydEVycm9yKCkge31cbn0iLCJpbXBvcnQgeyBzdHViaWZ5SW5zdGFuY2VPbkRlbWFuZCB9IGZyb20gJy4vc2lub25IZWxwZXJzJ1xuXG5leHBvcnQgZnVuY3Rpb24gYXBleENhbGxGYWN0b3J5KHBhcmFtcyA9IHt9KSB7XG4gICAgcmV0dXJuIHN0dWJpZnlJbnN0YW5jZU9uRGVtYW5kKEFwZXhDYWxsLCBuZXcgQXBleENhbGwocGFyYW1zKSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBhcGV4U3VjY2Vzc1Jlc3VsdChyZXNwb25zZSA9IHt9KSB7XG4gICAgcmV0dXJuIHN0dWJpZnlJbnN0YW5jZU9uRGVtYW5kKEFwZXhDYWxsUmVzdWx0LCBuZXcgQXBleENhbGxSZXN1bHQocmVzcG9uc2UpKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGFwZXhFcnJvclJlc3VsdChtZXNzYWdlKSB7XG4gICAgcmV0dXJuIHN0dWJpZnlJbnN0YW5jZU9uRGVtYW5kKEFwZXhDYWxsUmVzdWx0LCBuZXcgQXBleENhbGxSZXN1bHQobnVsbCwgbWVzc2FnZSkpO1xufVxuXG5jbGFzcyBBcGV4Q2FsbCB7XG4gICAgY29uc3RydWN0b3IocmVzdWx0LCBpbnZva2VDYWxsYmFja09uRW5xdWV1ZSA9IHRydWUpIHtcbiAgICAgICAgdGhpcy5wYXJhbXMgPSBudWxsO1xuICAgICAgICB0aGlzLnJlc3VsdCA9IHJlc3VsdDtcbiAgICAgICAgdGhpcy5pbnZva2VDYWxsYmFja09uRW5xdWV1ZSA9IGludm9rZUNhbGxiYWNrT25FbnF1ZXVlO1xuICAgICAgICB0aGlzLmlzQmFja2dyb3VuZCA9IGZhbHNlO1xuICAgICAgICB0aGlzLnNldEFib3J0YWJsZSA9IGZhbHNlO1xuICAgIH1cbiAgICBzZXRQYXJhbXMocGFyYW1zKSB7XG4gICAgICAgIHRoaXMucGFyYW1zID0gcGFyYW1zO1xuICAgIH1cbiAgICBzZXRQYXJhbShrZXksIHZhbHVlKSB7XG4gICAgICAgIHRoaXMucGFyYW1zID0gT2JqZWN0LmFzc2lnbih0aGlzLnBhcmFtcywge1trZXldIDogdmFsdWV9KTtcbiAgICB9XG4gICAgZ2V0UGFyYW1zKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wYXJhbXM7XG4gICAgfVxuICAgIHNldENhbGxiYWNrKGN0eCwgY2FsbGJhY2spIHtcbiAgICAgICAgdGhpcy5jdHggPSBjdHg7XG4gICAgICAgIHRoaXMuY2FsbGJhY2sgPSBjYWxsYmFjaztcbiAgICB9XG4gICAgaW52b2tlQ2FsbGJhY2soZnJvbUVucXVldWUgPSBmYWxzZSkge1xuICAgICAgICBpZiAoZnJvbUVucXVldWUgJiYgIXRoaXMuaW52b2tlQ2FsbGJhY2tPbkVucXVldWUpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmNhbGxiYWNrICYmIHRoaXMuY2FsbGJhY2suYmluZCh0aGlzLmN0eCkodGhpcy5yZXN1bHQpO1xuICAgIH1cbiAgICBnZXRFcnJvcigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucmVzdWx0LmdldEVycm9yKCk7XG4gICAgfVxuICAgIGdldFBhcmFtKG5hbWUpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucGFyYW1zID8gdGhpcy5wYXJhbXNbbmFtZV0gOiBudWxsO1xuICAgIH1cbiAgICBnZXRSZXR1cm5WYWx1ZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucmVzdWx0O1xuICAgIH1cbiAgICBnZXRTdGF0ZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucmVzdWx0LmdldFN0YXRlKCk7XG4gICAgfVxuICAgIGlzQmFja2dyb3VuZCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaXNCYWNrZ3JvdW5kO1xuICAgIH1cbiAgICBzZXRBYm9ydGFibGUoKSB7XG4gICAgfVxuICAgIHNldEJhY2tncm91bmQoKSB7XG4gICAgICAgIHRoaXMuaXNCYWNrZ3JvdW5kID0gdHJ1ZTtcbiAgICB9XG4gICAgc2V0U3RvcmFibGUoKSB7XG4gICAgfVxufVxuXG5jbGFzcyBBcGV4Q2FsbFJlc3VsdCB7XG4gICAgY29uc3RydWN0b3IocmVzcG9uc2UsIGVycm9yTWVzc2FnZSA9IG51bGwpIHtcbiAgICAgICAgdGhpcy5yZXNwb25zZSA9IHJlc3BvbnNlO1xuICAgICAgICB0aGlzLmVycm9yTWVzc2FnZSA9IGVycm9yTWVzc2FnZTtcbiAgICB9XG4gICAgZ2V0U3RhdGUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmVycm9yTWVzc2FnZSA/ICdFUlJPUicgOiAnU1VDQ0VTUydcbiAgICB9XG4gICAgZ2V0RXJyb3IoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmVycm9yTWVzc2FnZSA/IFt7bWVzc2FnZTogdGhpcy5lcnJvck1lc3NhZ2V9XSA6IFtdXG4gICAgfVxuICAgIGdldFJldHVyblZhbHVlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5yZXNwb25zZTtcbiAgICB9XG59IiwiaW1wb3J0IHsgZXZlbnRGYWN0b3J5IH0gZnJvbSAnLi9ldmVudEZhY3RvcnknXG5pbXBvcnQgeyBjb21wb25lbnRGYWN0b3J5LCB1c2VDb21wb25lbnRBZGFwdGVycyB9IGZyb20gJy4vY29tcG9uZW50RmFjdG9yeSdcbmltcG9ydCB7IGF1cmFGYWN0b3J5IH0gZnJvbSAnLi9hdXJhRmFjdG9yeSdcbmltcG9ydCB7IEF1cmFVdGlsIH0gZnJvbSAnLi9hdXJhVXRpbCdcbmltcG9ydCB7IGFwZXhDYWxsRmFjdG9yeSwgYXBleFN1Y2Nlc3NSZXN1bHQsIGFwZXhFcnJvclJlc3VsdCB9IGZyb20gJy4vYXBleENhbGxGYWN0b3J5J1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBBdXJhVXRpbCxcbiAgICBldmVudEZhY3RvcnksXG4gICAgY29tcG9uZW50RmFjdG9yeSxcbiAgICB1c2VDb21wb25lbnRBZGFwdGVycyxcbiAgICBhdXJhRmFjdG9yeSxcbiAgICBhcGV4Q2FsbEZhY3RvcnksXG4gICAgYXBleFN1Y2Nlc3NSZXN1bHQsXG4gICAgYXBleEVycm9yUmVzdWx0XG59Il0sIm5hbWVzIjpbInNpbm9uIiwicmVxdWlyZSIsInN0dWJpZnlJbnN0YW5jZSIsImN0b3IiLCJpbnN0YW5jZSIsInBhcmFtcyIsInByb3BFeGNsdWRlZCIsInByb3AiLCJkb05vdE1vY2siLCJBcnJheSIsImlzQXJyYXkiLCJpbmRleE9mIiwiZ2V0T3duUHJvcGVydHlOYW1lcyIsInByb3RvdHlwZSIsImZvckVhY2giLCJzdHViIiwiY2FsbHNGYWtlIiwicHJvcE5hbWUiLCJhcmdzIiwiY2FsbCIsInN0dWJpZnlJbnN0YW5jZU9uRGVtYW5kIiwiaGFuZGxlciIsInRhcmdldCIsInByb3BlcnR5IiwiZGVzY3JpcHRvciIsIl9pbnN0YW5jZVByb3BzIiwicHJvcEtleSIsInZhbHVlIiwidW5kZWZpbmVkIiwid2FybiIsInN0dWJOYW1lIiwiaXNTcHlPclN0dWJiZWQiLCJjYWxsZWRCZWZvcmUiLCJoYXNPblByb3RvIiwicHJveHkiLCJQcm94eSIsImV2ZW50RmFjdG9yeSIsIkV2ZW50IiwiRkFLRV9FVkVOVF9OQU1FIiwia2V5IiwiZXZlbnROYW1lIiwibmFtZSIsIl8iLCJEZWZhdWx0Q29tcG9uZW50QWRhcHRlciIsIldlbGxLbm93bkNvbXBvbmVudHMiLCJDb21wb25lbnRBZGFwdGVycyIsImNvbXBvbmVudEZhY3RvcnlGb3JBcnJheSIsImFycmF5T2ZUeXBlcyIsIm1hcCIsImNvbXBvbmVudEZhY3RvcnkiLCJ0eXBlT3JDb21wb25lbnQiLCJFcnJvciIsIkNvbXBvbmVudCIsImFkYXB0ZXJOYW1lIiwidG9Mb3dlckNhc2UiLCJyZXBsYWNlIiwiYWRhcHRlciIsInNvbWUiLCJzdGFydHNXaXRoIiwidXNlQ29tcG9uZW50QWRhcHRlcnMiLCJyZWdpc3RyYXRvciIsInJlZ2lzdGVyIiwiY29tcG9uZW50VHlwZSIsInR5cGUiLCJPYmplY3QiLCJhc3NpZ24iLCJkZXN0cm95ZWQiLCJzdWJzdHJpbmciLCJnZXQiLCJzZXQiLCJmaW5kTWFwIiwiaGFzT3duUHJvcGVydHkiLCJkZWZhdWx0UGFyYW1zIiwiY29tcG9uZW50IiwiY2xhc3NOYW1lVG9Db21wb25lbnRWYXIiLCJjbGFzc05hbWUiLCJBdXJhVXRpbCIsIm9iaiIsImxlbmd0aCIsInRvU3RyaW5nIiwia2V5cyIsInZhbCIsImFyciIsImFyZyIsImF1cmFGYWN0b3J5Iiwic3R1YmlmeVBhcmFtcyIsIkF1cmEiLCJ1dGlsIiwiYWN0aW9uIiwiaW52b2tlQ2FsbGJhY2siLCJhdHRyaWJ1dGVzIiwiY2FsbGJhY2siLCJjcmVhdGVDb21wb25lbnQiLCJjb21wb25lbnREZWZzIiwicmVzdWx0IiwiZGVmIiwiaWQiLCJyb290Q29tcG9uZW50IiwiZXJyIiwiY29uc29sZSIsImxvZyIsImFwZXhDYWxsRmFjdG9yeSIsIkFwZXhDYWxsIiwiYXBleFN1Y2Nlc3NSZXN1bHQiLCJyZXNwb25zZSIsIkFwZXhDYWxsUmVzdWx0IiwiYXBleEVycm9yUmVzdWx0IiwibWVzc2FnZSIsImludm9rZUNhbGxiYWNrT25FbnF1ZXVlIiwiaXNCYWNrZ3JvdW5kIiwic2V0QWJvcnRhYmxlIiwiY3R4IiwiZnJvbUVucXVldWUiLCJiaW5kIiwiZ2V0RXJyb3IiLCJnZXRTdGF0ZSIsImVycm9yTWVzc2FnZSIsIm1vZHVsZSIsImV4cG9ydHMiXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBO0FBQ0EsSUFBTUEsUUFBUUMsUUFBUSxPQUFSLENBQWQ7O0FBRUEsQUFBTyxTQUFTQyxlQUFULENBQXlCQyxJQUF6QixFQUErQkMsUUFBL0IsRUFBeUNDLE1BQXpDLEVBQWlEO1FBQzlDQyxlQUFlLFNBQWZBLFlBQWUsQ0FBQ0MsSUFBRDtlQUFVRixVQUFVQSxPQUFPRyxTQUFqQixLQUErQkMsTUFBTUMsT0FBTixDQUFjTCxPQUFPRyxTQUFyQixJQUMxREgsT0FBT0csU0FBUCxDQUFpQkcsT0FBakIsQ0FBeUJKLElBQXpCLE1BQW1DLENBQUMsQ0FEc0IsR0FDbEJGLE9BQU9HLFNBQVAsS0FBcUJELElBRGxDLENBQVY7S0FBckI7O1dBR09LLG1CQUFQLENBQTJCVCxLQUFLVSxTQUFoQyxFQUEyQ0MsT0FBM0MsQ0FBbUQsZ0JBQVE7WUFDbkRSLGFBQWFDLElBQWIsS0FBc0IsT0FBT0osS0FBS1UsU0FBTCxDQUFlTixJQUFmLENBQVAsS0FBZ0MsVUFBdEQsSUFBb0VBLFNBQVMsYUFBakYsRUFBZ0c7OztpQkFHdkYsVUFBVUEsSUFBbkIsSUFBMkJQLE1BQU1lLElBQU4sQ0FBV1gsUUFBWCxFQUFxQkcsSUFBckIsRUFBMkJTLFNBQTNCLENBQXNDLFVBQUNDLFFBQUQ7bUJBQWMsWUFBYTs7O2tEQUFUQyxJQUFTO3dCQUFBOzs7dUJBQ2pGLDhCQUFLTCxTQUFMLENBQWVJLFFBQWYsR0FBeUJFLElBQXpCLCtCQUE4QmYsUUFBOUIsU0FBMkNjLElBQTNDLEVBQVA7YUFENkQ7U0FBRCxDQUU3RFgsSUFGNkQsQ0FBckMsQ0FBM0I7S0FKSjtXQVFPSCxRQUFQOzs7QUFHSixBQUFPLFNBQVNnQix1QkFBVCxDQUFpQ2pCLElBQWpDLEVBQXVDQyxRQUF2QyxFQUFpRDtR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
