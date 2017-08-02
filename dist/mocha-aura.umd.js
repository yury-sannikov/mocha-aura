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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9jaGEtYXVyYS51bWQuanMiLCJzb3VyY2VzIjpbIi4uL2xpYi9zaW5vbkhlbHBlcnMuanMiLCIuLi9saWIvZXZlbnRGYWN0b3J5LmpzIiwiLi4vbGliL2NvbXBvbmVudEZhY3RvcnkuanMiLCIuLi9saWIvYXVyYVV0aWwuanMiLCIuLi9saWIvYXVyYUZhY3RvcnkuanMiLCIuLi9saWIvYXBleENhbGxGYWN0b3J5LmpzIiwiLi4vbGliL2F1cmEuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLypnbG9iYWwgUHJveHkqL1xuY29uc3Qgc2lub24gPSByZXF1aXJlKCdzaW5vbicpO1xuXG5leHBvcnQgZnVuY3Rpb24gc3R1YmlmeUluc3RhbmNlKGN0b3IsIGluc3RhbmNlLCBwYXJhbXMpIHtcbiAgICBjb25zdCBwcm9wRXhjbHVkZWQgPSAocHJvcCkgPT4gcGFyYW1zICYmIHBhcmFtcy5kb05vdE1vY2sgJiYgKEFycmF5LmlzQXJyYXkocGFyYW1zLmRvTm90TW9jaykgPyBcbiAgICAgICAgcGFyYW1zLmRvTm90TW9jay5pbmRleE9mKHByb3ApICE9PSAtMSA6IHBhcmFtcy5kb05vdE1vY2sgPT09IHByb3ApO1xuXG4gICAgT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMoY3Rvci5wcm90b3R5cGUpLmZvckVhY2gocHJvcCA9PiB7XG4gICAgICAgIGlmIChwcm9wRXhjbHVkZWQocHJvcCkgfHwgdHlwZW9mIGN0b3IucHJvdG90eXBlW3Byb3BdICE9PSAnZnVuY3Rpb24nIHx8IHByb3AgPT09ICdjb25zdHJ1Y3RvcicpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpbnN0YW5jZVsnc3R1Yl8nICsgcHJvcF0gPSBzaW5vbi5zdHViKGluc3RhbmNlLCBwcm9wKS5jYWxsc0Zha2UoKChwcm9wTmFtZSkgPT4gKC4uLmFyZ3MpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBjdG9yLnByb3RvdHlwZVtwcm9wTmFtZV0uY2FsbChpbnN0YW5jZSwgLi4uYXJncyk7XG4gICAgICAgIH0pKHByb3ApKVxuICAgIH0pXG4gICAgcmV0dXJuIGluc3RhbmNlO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc3R1YmlmeUluc3RhbmNlT25EZW1hbmQoY3RvciwgaW5zdGFuY2UpIHtcbiAgICBjb25zdCBoYW5kbGVyID0ge1xuICAgICAgICBfaW5zdGFuY2VQcm9wczoge30sXG4gICAgICAgIGRlZmluZVByb3BlcnR5KHRhcmdldCwgcHJvcGVydHksIGRlc2NyaXB0b3IpIHtcbiAgICAgICAgICAgIGhhbmRsZXIuX2luc3RhbmNlUHJvcHNbcHJvcGVydHldID0gZGVzY3JpcHRvcjtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9LFxuICAgICAgICBnZXQodGFyZ2V0LCBwcm9wS2V5KSB7XG4gICAgICAgICAgICAvLyBDaGVjayBmb3IgU3ltYm9sIGZvciBpdGVyYXRvcnNcbiAgICAgICAgICAgIGlmICh0eXBlb2YgcHJvcEtleSAhPT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGFyZ2V0W3Byb3BLZXldO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gSWYgd2UgYWRkIHNvbWUgcHJvcHMgdG8gdGhlIGluc3RhbmNlLCByZXR1cm4gaXQgdy9vIG1vY2tpbmdcbiAgICAgICAgICAgIC8vIFVzdWFsbHkgYWRkZWQgc3R1ZmYgaXMgbW9ja2VkIHRocm91Z2ggZGF0YSBhZGFwdGVyc1xuICAgICAgICAgICAgaWYgKGhhbmRsZXIuX2luc3RhbmNlUHJvcHNbcHJvcEtleV0pIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gaGFuZGxlci5faW5zdGFuY2VQcm9wc1twcm9wS2V5XS52YWx1ZVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgICAgICAvL1dhcm4gb24gdW5rbm93biBwcm9wS2V5IGZvciBiZXR0ZXIgZGVidWdnaW5nXG4gICAgICAgICAgICBpZiAoIXRhcmdldFtwcm9wS2V5XSkge1xuICAgICAgICAgICAgICAgIC8qZXNsaW50IG5vLWNvbnNvbGU6IDAqL1xuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybignXFxuXFxuc3R1YmlmeUluc3RhbmNlT25EZW1hbmQ6IFVua25vd24gcHJvcGVydHkgJyArIHByb3BLZXksICdcXG5cXG4nKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGFyZ2V0W3Byb3BLZXldO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBTdHViIG1ldGhvZHMgdGhhdCBkZWZpbmVkIG9uIHByb3RvdHlwZSBvbmx5LCBlLmcuIGhhcyBwdWJsaWMgYXBpXG4gICAgICAgICAgICBjb25zdCBzdHViTmFtZSA9ICdzdHViXycgKyBwcm9wS2V5O1xuICAgICAgICAgICAgY29uc3QgaXNTcHlPclN0dWJiZWQgPSAhISh0YXJnZXRbcHJvcEtleV0gJiYgdGFyZ2V0W3Byb3BLZXldLmNhbGxlZEJlZm9yZSk7XG4gICAgICAgICAgICBjb25zdCBoYXNPblByb3RvID0gISFjdG9yLnByb3RvdHlwZVtwcm9wS2V5XTtcblxuICAgICAgICAgICAgaWYgKGhhc09uUHJvdG8gJiYgIWlzU3B5T3JTdHViYmVkICYmIHR5cGVvZiB0YXJnZXRbcHJvcEtleV0gPT09ICdmdW5jdGlvbicgJiYgcHJvcEtleSAhPT0gJ2NvbnN0cnVjdG9yJykge1xuICAgICAgICAgICAgICAgIHRhcmdldFtzdHViTmFtZV0gPSBzaW5vbi5zdHViKHRhcmdldCwgcHJvcEtleSkuY2FsbHNGYWtlKCguLi5hcmdzKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBjdG9yLnByb3RvdHlwZVtwcm9wS2V5XS5jYWxsKGluc3RhbmNlLCAuLi5hcmdzKTtcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHRhcmdldFtwcm9wS2V5XTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGNvbnN0IHByb3h5ID0gbmV3IFByb3h5KGluc3RhbmNlLCBoYW5kbGVyKTtcbiAgICByZXR1cm4gcHJveHk7XG59IiwiaW1wb3J0IHsgc3R1YmlmeUluc3RhbmNlT25EZW1hbmQgfSBmcm9tICcuL3Npbm9uSGVscGVycydcblxuZXhwb3J0IGZ1bmN0aW9uIGV2ZW50RmFjdG9yeShwYXJhbXMgPSB7fSkge1xuICAgIHJldHVybiBzdHViaWZ5SW5zdGFuY2VPbkRlbWFuZChFdmVudCwgbmV3IEV2ZW50KHBhcmFtcykpO1xufVxuY29uc3QgRkFLRV9FVkVOVF9OQU1FID0gJ21vY2hhLWF1cmEtZmFrZS1ldmVudCdcblxuY2xhc3MgRXZlbnQge1xuICAgIGNvbnN0cnVjdG9yKHBhcmFtcykge1xuICAgICAgICB0aGlzLnBhcmFtcyA9IHBhcmFtcyB8fCB7fTtcbiAgICB9XG4gICAgc2V0UGFyYW1zKHBhcmFtcykge1xuICAgICAgICB0aGlzLnBhcmFtcyA9IHBhcmFtcztcbiAgICB9XG4gICAgc2V0UGFyYW0oa2V5LCB2YWx1ZSkge1xuICAgICAgICB0aGlzLnBhcmFtc1trZXldID0gdmFsdWU7XG4gICAgfVxuICAgIGdldFBhcmFtcygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucGFyYW1zO1xuICAgIH1cbiAgICBnZXRFdmVudFR5cGUoKSB7XG4gICAgICAgIHJldHVybiAnQVBQTElDQVRJT04nXG4gICAgfVxuICAgIGdldE5hbWUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnBhcmFtcy5ldmVudE5hbWUgfHwgRkFLRV9FVkVOVF9OQU1FXG4gICAgfVxuICAgIGdldFBhcmFtKG5hbWUpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucGFyYW1zW25hbWVdXG4gICAgfVxuICAgIGdldFBoYXNlKCkge1xuICAgICAgICByZXR1cm4gJ2RlZmF1bHQnXG4gICAgfVxuICAgIGdldFNvdXJjZSgpIHtcbiAgICAgICAgcmV0dXJuIG51bGxcbiAgICB9XG4gICAgZ2V0VHlwZSgpIHtcbiAgICAgICAgcmV0dXJuIGBjOiR7RkFLRV9FVkVOVF9OQU1FfWBcbiAgICB9XG4gICAgZmlyZSgpIHt9XG4gICAgcGF1c2UoKSB7fVxuICAgIHByZXZlbnREZWZhdWx0KCkge31cbiAgICByZXN1bWUoKSB7fVxuICAgIHN0b3BQcm9wYWdhdGlvbigpIHt9XG4gICAgXG5cbn0iLCJjb25zdCBfID0gcmVxdWlyZSgnbG9kYXNoJyk7XG5pbXBvcnQgeyBldmVudEZhY3RvcnkgfSBmcm9tICcuL2V2ZW50RmFjdG9yeSdcbmltcG9ydCB7IHN0dWJpZnlJbnN0YW5jZU9uRGVtYW5kIH0gZnJvbSAnLi9zaW5vbkhlbHBlcnMnXG5cbmNvbnN0IERlZmF1bHRDb21wb25lbnRBZGFwdGVyID0gJ2RlZmF1bHQnXG5jb25zdCBXZWxsS25vd25Db21wb25lbnRzID0gWydhdXJhOicsICdmb3JjZTonLCAnZm9yY2VDaGF0dGVyOicsICdsaWdodG5pbmc6JywgJ3VpOicsICdjOiddXG5cbmxldCBDb21wb25lbnRBZGFwdGVycyA9IHtcbiAgICBbRGVmYXVsdENvbXBvbmVudEFkYXB0ZXJdOiBpbnN0YW5jZSA9PiBpbnN0YW5jZVxufVxuXG5mdW5jdGlvbiBjb21wb25lbnRGYWN0b3J5Rm9yQXJyYXkocGFyYW1zLCBhcnJheU9mVHlwZXMpIHtcbiAgICByZXR1cm4gYXJyYXlPZlR5cGVzLm1hcCh0eXBlT3JDb21wb25lbnQgPT4gY29tcG9uZW50RmFjdG9yeShwYXJhbXMsIHR5cGVPckNvbXBvbmVudCkpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY29tcG9uZW50RmFjdG9yeShwYXJhbXMgPSB7fSwgdHlwZU9yQ29tcG9uZW50ID0gRGVmYXVsdENvbXBvbmVudEFkYXB0ZXIpIHtcbiAgICBpZiAoQXJyYXkuaXNBcnJheSh0eXBlT3JDb21wb25lbnQpKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignVW5leHBlY3RlZCB0eXBlIGFyZ3VtZW50JylcbiAgICB9XG5cbiAgICBpZiAodHlwZU9yQ29tcG9uZW50ID09PSB0cnVlKSB7XG4gICAgICAgIHR5cGVPckNvbXBvbmVudCA9IERlZmF1bHRDb21wb25lbnRBZGFwdGVyXG4gICAgfSBlbHNlIGlmICh0eXBlT3JDb21wb25lbnQgaW5zdGFuY2VvZiBDb21wb25lbnQpIHtcbiAgICAgICAgcmV0dXJuIHR5cGVPckNvbXBvbmVudDtcbiAgICB9IGVsc2UgaWYgKHR5cGVPckNvbXBvbmVudCA9PT0gbnVsbCkge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBsZXQgaW5zdGFuY2UgPSBzdHViaWZ5SW5zdGFuY2VPbkRlbWFuZChDb21wb25lbnQsIG5ldyBDb21wb25lbnQocGFyYW1zLCB0eXBlT3JDb21wb25lbnQpKTtcbiAgICBsZXQgYWRhcHRlck5hbWUgPSB0eXBlT3JDb21wb25lbnQudG9Mb3dlckNhc2UoKS5yZXBsYWNlKCdtYXJrdXA6Ly8nLCAnJylcbiAgICBsZXQgYWRhcHRlciA9IENvbXBvbmVudEFkYXB0ZXJzW2FkYXB0ZXJOYW1lXTtcbiAgICBpZiAoIWFkYXB0ZXIpIHtcbiAgICAgICAgaWYgKCFfLnNvbWUoV2VsbEtub3duQ29tcG9uZW50cywgbmFtZSA9PiBhZGFwdGVyTmFtZS5zdGFydHNXaXRoKG5hbWUpKSkge1xuICAgICAgICAgICAgLyplc2xpbnQgbm8tY29uc29sZTogMCovXG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYFVuYWJsZSB0byBmaW5kIGNvbXBvbmVudCBhZGFwdGVyICR7dHlwZU9yQ29tcG9uZW50fWApO1xuICAgICAgICB9XG4gICAgICAgIGFkYXB0ZXIgPSBDb21wb25lbnRBZGFwdGVyc1tEZWZhdWx0Q29tcG9uZW50QWRhcHRlcl07XG4gICAgfVxuICAgIHJldHVybiBhZGFwdGVyKGluc3RhbmNlLCBwYXJhbXMpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdXNlQ29tcG9uZW50QWRhcHRlcnMocmVnaXN0cmF0b3IpIHtcbiAgICBjb25zdCByZWdpc3RlciA9IChjb21wb25lbnRUeXBlLCBhZGFwdGVyKSA9PiB7XG4gICAgICAgIGNvbnN0IGFkYXB0ZXJOYW1lID0gY29tcG9uZW50VHlwZS50b0xvd2VyQ2FzZSgpO1xuICAgICAgICBDb21wb25lbnRBZGFwdGVyc1thZGFwdGVyTmFtZV0gPSBhZGFwdGVyXG4gICAgfVxuICAgIHJlZ2lzdHJhdG9yKHtyZWdpc3Rlcn0pO1xufVxuXG5jbGFzcyBDb21wb25lbnQge1xuICAgIGNvbnN0cnVjdG9yKHBhcmFtcywgdHlwZSkge1xuICAgICAgICB0aGlzLnBhcmFtcyA9IE9iamVjdC5hc3NpZ24oe30sIHtcbiAgICAgICAgICAgIGZpbmRNYXA6IHt9XG4gICAgICAgIH0sIHBhcmFtcyk7XG4gICAgICAgIHRoaXMudHlwZSA9IHR5cGUgfHwgJ2RlZmF1bHQnO1xuICAgICAgICAvL3N0dWJpZnlJbnN0YW5jZShDb21wb25lbnQsIHRoaXMpO1xuICAgIH1cbiAgICBnZXQobmFtZSkge1xuICAgICAgICBpZiAobmFtZS5zdGFydHNXaXRoKCd2LicpIHx8IG5hbWUuc3RhcnRzV2l0aCgnYy4nKSB8fCBuYW1lLnN0YXJ0c1dpdGgoJ2UuJykpIHtcbiAgICAgICAgICAgIG5hbWUgPSBuYW1lLnN1YnN0cmluZygyKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gXy5nZXQodGhpcy5wYXJhbXMsIG5hbWUpO1xuICAgIH1cbiAgICBzZXQobmFtZSwgdmFsdWUpIHtcbiAgICAgICAgaWYgKG5hbWUuc3RhcnRzV2l0aCgndi4nKSB8fCBuYW1lLnN0YXJ0c1dpdGgoJ2MuJykgfHwgbmFtZS5zdGFydHNXaXRoKCdlLicpKSB7XG4gICAgICAgICAgICBuYW1lID0gbmFtZS5zdWJzdHJpbmcoMik7XG4gICAgICAgIH1cbiAgICAgICAgXy5zZXQodGhpcy5wYXJhbXMsIG5hbWUsIHZhbHVlKTtcbiAgICB9XG4gICAgZmluZChuYW1lKSB7XG4gICAgICAgIGxldCB0eXBlT3JDb21wb25lbnQgPSB0aGlzLnBhcmFtcy5maW5kTWFwW25hbWVdO1xuICAgICAgICBpZiAoIXR5cGVPckNvbXBvbmVudCAmJiB0aGlzLnBhcmFtcy5maW5kTWFwLmhhc093blByb3BlcnR5KG5hbWUpKSB7XG4gICAgICAgICAgICByZXR1cm4gdHlwZU9yQ29tcG9uZW50O1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGRlZmF1bHRQYXJhbXMgPSB7XG4gICAgICAgICAgICAnYXVyYTppZCc6IG5hbWVcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgY29uc3QgY29tcG9uZW50ID0gdGhpcy5wYXJhbXMuZmluZE1hcFtuYW1lXSA9IChBcnJheS5pc0FycmF5KHR5cGVPckNvbXBvbmVudCkgPyBcbiAgICAgICAgICAgIGNvbXBvbmVudEZhY3RvcnlGb3JBcnJheShkZWZhdWx0UGFyYW1zLCB0eXBlT3JDb21wb25lbnQpIDogXG4gICAgICAgICAgICBjb21wb25lbnRGYWN0b3J5KGRlZmF1bHRQYXJhbXMsIHR5cGVPckNvbXBvbmVudCkpXG4gICAgICAgIHJldHVybiBjb21wb25lbnQ7XG4gICAgfVxuICAgIGdldExvY2FsSWQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnBhcmFtc1snYXVyYTppZCddO1xuICAgIH1cbiAgICBjbGVhclJlZmVyZW5jZShrZXkpIHtcbiAgICAgICAgZGVsZXRlIHRoaXMucGFyYW1zW2tleV07XG4gICAgfVxuICAgIGdldENvbmNyZXRlQ29tcG9uZW50KCkge1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgZ2V0RWxlbWVudCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIGdldEVsZW1lbnRzKCkge1xuICAgICAgICByZXR1cm4gW3RoaXNdO1xuICAgIH1cbiAgICBnZXRFdmVudChuYW1lKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnBhcmFtc1tuYW1lXSB8fCBldmVudEZhY3RvcnkoKTtcbiAgICB9XG4gICAgZ2V0R2xvYmFsSWQoKSB7XG4gICAgICAgIHJldHVybiBgZ2xvYmFsLSR7dGhpcy5wYXJhbXNbJ2F1cmE6aWQnXX1gO1xuICAgIH1cbiAgICBnZXROYW1lKCkge1xuICAgICAgICByZXR1cm4gdGhpcy50eXBlO1xuICAgIH1cbiAgICBnZXRUeXBlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy50eXBlO1xuICAgIH1cbiAgICBnZXRSZWZlcmVuY2Uoa2V5KSB7XG4gICAgICAgIHJldHVybiB0aGlzLnBhcmFtc1trZXldO1xuICAgIH1cbiAgICBnZXRTdXBlcigpIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGdldFZlcnNpb24oKSB7XG4gICAgICAgIHJldHVybiAnMS4wJztcbiAgICB9XG4gICAgaXNDb25jcmV0ZSgpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIGlzSW5zdGFuY2VPZihuYW1lKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnR5cGUgPT09IG5hbWU7XG4gICAgfVxuICAgIGlzVmFsaWQoKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICBhZGRFdmVudEhhbmRsZXIoKSB7fVxuICAgIGFkZEhhbmRsZXIoKSB7fVxuICAgIGFkZFZhbHVlSGFuZGxlcigpIHt9XG4gICAgYWRkVmFsdWVQcm92aWRlcigpIHt9XG4gICAgYXV0b0Rlc3Ryb3koKSB7fVxuICAgIGRlc3Ryb3koKSB7fVxuICAgIHJlbW92ZUV2ZW50SGFuZGxlcigpIHt9XG5cbn0iLCJpbXBvcnQgeyBzdHViaWZ5SW5zdGFuY2UgfSBmcm9tICcuL3Npbm9uSGVscGVycydcblxuY29uc3QgY2xhc3NOYW1lVG9Db21wb25lbnRWYXIgPSBjbGFzc05hbWUgPT4gYHYuX19jbHNfJHtjbGFzc05hbWV9YFxuZXhwb3J0IGNsYXNzIEF1cmFVdGlsIHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgc3R1YmlmeUluc3RhbmNlKEF1cmFVdGlsLCB0aGlzKTtcbiAgICB9XG4gICAgXG4gICAgaXNFbXB0eShvYmope1xuICAgICAgICBpZiAob2JqID09PSB1bmRlZmluZWQgfHwgb2JqID09PSBudWxsIHx8IG9iaiA9PT0gJycpIHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIGlmIChBcnJheS5pc0FycmF5KG9iaikpIHtcbiAgICAgICAgICAgIHJldHVybiBvYmoubGVuZ3RoID09PSAwO1xuICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiBvYmogPT09ICdvYmplY3QnICYmIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChvYmopID09PSAnW29iamVjdCBPYmplY3RdJykge1xuICAgICAgICAgICAgcmV0dXJuIE9iamVjdC5rZXlzKG9iaikubGVuZ3RoID09PSAwO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgaXNVbmRlZmluZWRPck51bGwob2JqKSB7XG4gICAgICAgIHJldHVybiBvYmogPT09IHVuZGVmaW5lZCB8fCBvYmogPT09IG51bGw7XG4gICAgfVxuICAgIGFkZENsYXNzKGNvbXBvbmVudCwgY2xhc3NOYW1lKSB7XG4gICAgICAgIHJldHVybiBjb21wb25lbnQuc2V0KGNsYXNzTmFtZVRvQ29tcG9uZW50VmFyKGNsYXNzTmFtZSksIHRydWUpO1xuICAgIH1cbiAgICByZW1vdmVDbGFzcyhjb21wb25lbnQsIGNsYXNzTmFtZSkge1xuICAgICAgICByZXR1cm4gY29tcG9uZW50LnNldChjbGFzc05hbWVUb0NvbXBvbmVudFZhcihjbGFzc05hbWUpLCBmYWxzZSk7XG4gICAgfVxuICAgIGhhc0NsYXNzKGNvbXBvbmVudCwgY2xhc3NOYW1lKSB7XG4gICAgICAgIHJldHVybiBjb21wb25lbnQuZ2V0KGNsYXNzTmFtZVRvQ29tcG9uZW50VmFyKGNsYXNzTmFtZSkpO1xuICAgIH1cbiAgICB0b2dnbGVDbGFzcyhjb21wb25lbnQsIGNsYXNzTmFtZSkge1xuICAgICAgICBjb21wb25lbnQuc2V0KGNsYXNzTmFtZVRvQ29tcG9uZW50VmFyKGNsYXNzTmFtZSksICFjb21wb25lbnQuZ2V0KGNsYXNzTmFtZVRvQ29tcG9uZW50VmFyKGNsYXNzTmFtZSkpKTtcbiAgICB9XG4gICAgZ2V0Qm9vbGVhblZhbHVlKHZhbCkge1xuICAgICAgICAvLyBQb3J0ZWQ6IGh0dHBzOi8vZ2l0aHViLmNvbS9mb3JjZWRvdGNvbS9hdXJhL2Jsb2IvbWFzdGVyL2F1cmEtaW1wbC9zcmMvbWFpbi9yZXNvdXJjZXMvYXVyYS91dGlsL1V0aWwuanMjTDM2NlxuICAgICAgICByZXR1cm4gdmFsICE9PSB1bmRlZmluZWQgJiYgdmFsICE9PSBudWxsICYmIHZhbCAhPT0gZmFsc2UgJiYgdmFsICE9PSAwICYmIHZhbCAhPT0gJ2ZhbHNlJyAmJiB2YWwgIT09ICcnICYmIHZhbCAhPT0gJ2YnO1xuICAgIH1cbiAgICBpc0FycmF5KGFycikge1xuICAgICAgICAvLyBQb3J0ZWQ6IGh0dHBzOi8vZ2l0aHViLmNvbS9mb3JjZWRvdGNvbS9hdXJhL2Jsb2IvbWFzdGVyL2F1cmEtaW1wbC9zcmMvbWFpbi9yZXNvdXJjZXMvYXVyYS91dGlsL1V0aWwuanMjTDE4OVxuICAgICAgICByZXR1cm4gKHR5cGVvZiBBcnJheS5pc0FycmF5ID09PSBcImZ1bmN0aW9uXCIgPyBBcnJheS5pc0FycmF5IDogZnVuY3Rpb24oYXJnKSB7XG4gICAgICAgICAgICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKGFyZykgPT09ICdbb2JqZWN0IEFycmF5XSc7XG4gICAgICAgIH0pKGFycik7XG4gICAgfVxuICAgIGlzT2JqZWN0KG9iaikge1xuICAgICAgICAvL1BvcnRlZDogaHR0cHM6Ly9naXRodWIuY29tL2ZvcmNlZG90Y29tL2F1cmEvYmxvYi9tYXN0ZXIvYXVyYS1pbXBsL3NyYy9tYWluL3Jlc291cmNlcy9hdXJhL3V0aWwvVXRpbC5qcyNMMjA0XG4gICAgICAgIHJldHVybiB0eXBlb2Ygb2JqID09PSBcIm9iamVjdFwiICYmIG9iaiAhPT0gbnVsbCAmJiAhQXJyYXkuaXNBcnJheShvYmopO1xuICAgIH1cbiAgICBpc1VuZGVmaW5lZChvYmope1xuICAgICAgICAvL1BvcnRlZDogaHR0cHM6Ly9naXRodWIuY29tL2ZvcmNlZG90Y29tL2F1cmEvYmxvYi9tYXN0ZXIvYXVyYS1pbXBsL3NyYy9tYWluL3Jlc291cmNlcy9hdXJhL3V0aWwvVXRpbC5qcyNMMzE5XG4gICAgICAgIHJldHVybiBvYmogPT09IHVuZGVmaW5lZDtcbiAgICB9XG59XG5cbiIsImltcG9ydCB7IHN0dWJpZnlJbnN0YW5jZSB9IGZyb20gJy4vc2lub25IZWxwZXJzJ1xuaW1wb3J0IHsgQXVyYVV0aWwgfSBmcm9tICcuL2F1cmFVdGlsJ1xuXG5leHBvcnQgZnVuY3Rpb24gYXVyYUZhY3RvcnkocGFyYW1zID0ge30sIHN0dWJpZnlQYXJhbXMpIHtcbiAgICByZXR1cm4gc3R1YmlmeUluc3RhbmNlKEF1cmEsIG5ldyBBdXJhKHBhcmFtcyksIHN0dWJpZnlQYXJhbXMpO1xufVxuXG5pbXBvcnQgeyBjb21wb25lbnRGYWN0b3J5IH0gZnJvbSAnLi9jb21wb25lbnRGYWN0b3J5J1xuXG5jbGFzcyBBdXJhIHtcbiAgICBjb25zdHJ1Y3RvcihwYXJhbXMpIHtcbiAgICAgICAgdGhpcy5wYXJhbXMgPSBwYXJhbXM7XG4gICAgICAgIHRoaXMudXRpbCA9IG5ldyBBdXJhVXRpbCgpO1xuICAgIH1cbiAgICBcbiAgICBzZXRQYXJhbXMocGFyYW1zKSB7XG4gICAgICAgIE9iamVjdC5hc3NpZ24odGhpcy5wYXJhbXMsIHBhcmFtcyk7XG4gICAgfVxuXG4gICAgZ2V0KG5hbWUpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucGFyYW1zW25hbWVdO1xuICAgIH1cblxuICAgIHNldChuYW1lLCB2YWx1ZSkge1xuICAgICAgICB0aGlzLnBhcmFtc1tuYW1lXSA9IHZhbHVlO1xuICAgIH1cbiAgICBcbiAgICBlbnF1ZXVlQWN0aW9uKGFjdGlvbikge1xuICAgICAgICBhY3Rpb24gJiYgYWN0aW9uLmludm9rZUNhbGxiYWNrICYmIGFjdGlvbi5pbnZva2VDYWxsYmFjayh0cnVlKVxuICAgIH1cblxuICAgIGNyZWF0ZUNvbXBvbmVudCh0eXBlLCBhdHRyaWJ1dGVzLCBjYWxsYmFjaykge1xuICAgICAgICB0aGlzLmNyZWF0ZUNvbXBvbmVudC50eXBlID0gdHlwZTtcbiAgICAgICAgdGhpcy5jcmVhdGVDb21wb25lbnQuYXR0cmlidXRlcyA9IGF0dHJpYnV0ZXM7XG4gICAgICAgIC8vIEdldCBjb21wb25lbnQgaW5zdGFuY2UuXG4gICAgICAgIC8vIFVzZSBleGlzdGluZyBjb21wb25lbnQgaW5zdGFuY2UgaWYgc2V0XG4gICAgICAgIC8vIENyZWF0ZSBuZXcgZGVmYXVsdCBjb21wb25lbnQgaWYgY29tcG9uZW50IG5vdCBzZXRcbiAgICAgICAgbGV0IHsgY29tcG9uZW50IH0gPSB0aGlzLmNyZWF0ZUNvbXBvbmVudDtcbiAgICAgICAgaWYgKCFjb21wb25lbnQpIHtcbiAgICAgICAgICAgIGNvbXBvbmVudCA9IG5ldyBjb21wb25lbnRGYWN0b3J5KGF0dHJpYnV0ZXMsIHR5cGUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5jcmVhdGVDb21wb25lbnQuY29tcG9uZW50ID0gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBpZiAoY2FsbGJhY2spIHtcbiAgICAgICAgICAgIGNhbGxiYWNrKGNvbXBvbmVudCwgJ1NVQ0NFU1MnLCBbJ1NVQ0NFU1MnXSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGNvbXBvbmVudDtcbiAgICB9XG4gICAgY3JlYXRlQ29tcG9uZW50cyhjb21wb25lbnREZWZzLCBjYWxsYmFjaykge1xuICAgICAgICBjb25zdCByZXN1bHQgPSBjb21wb25lbnREZWZzXG4gICAgICAgICAgICAubWFwKGRlZiA9PiB0aGlzLmNyZWF0ZUNvbXBvbmVudChkZWZbMF0sIGRlZlsxXSkpXG4gICAgICAgIGlmIChjYWxsYmFjaykge1xuICAgICAgICAgICAgY2FsbGJhY2socmVzdWx0LCAnU1VDQ0VTUycsIHJlc3VsdC5tYXAoICgpID0+ICdTVUNDRVNTJykpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuICAgIGdldENhbGxiYWNrKGNhbGxiYWNrKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiguLi5hcmdzKSB7XG4gICAgICAgICAgICBjYWxsYmFjayAmJiBjYWxsYmFjayguLi5hcmdzKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBnZXRDb21wb25lbnQoaWQpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucGFyYW1zW2lkXTtcbiAgICB9XG4gICAgZ2V0UmVmZXJlbmNlKCkge31cbiAgICBnZXRSb290KCkge1xuICAgICAgICByZXR1cm4gdGhpcy5yb290Q29tcG9uZW50IHx8ICh0aGlzLnJvb3RDb21wb25lbnQgPSBuZXcgY29tcG9uZW50RmFjdG9yeSgpKTtcbiAgICB9XG4gICAgZ2V0VG9rZW4obmFtZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5wYXJhbXNbJ3Rva2VuLicgKyBuYW1lXVxuICAgIH1cbiAgICBsb2codmFsdWUsIGVycikge1xuICAgICAgICAvKmVzbGludCBuby1jb25zb2xlOiAwKi9cbiAgICAgICAgY29uc29sZSAmJiBjb25zb2xlLmxvZyh2YWx1ZSwgZXJyKVxuICAgIH1cbiAgICByZXBvcnRFcnJvcigpIHt9XG59IiwiaW1wb3J0IHsgc3R1YmlmeUluc3RhbmNlT25EZW1hbmQgfSBmcm9tICcuL3Npbm9uSGVscGVycydcblxuZXhwb3J0IGZ1bmN0aW9uIGFwZXhDYWxsRmFjdG9yeShwYXJhbXMgPSB7fSkge1xuICAgIHJldHVybiBzdHViaWZ5SW5zdGFuY2VPbkRlbWFuZChBcGV4Q2FsbCwgbmV3IEFwZXhDYWxsKHBhcmFtcykpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYXBleFN1Y2Nlc3NSZXN1bHQocmVzcG9uc2UgPSB7fSkge1xuICAgIHJldHVybiBzdHViaWZ5SW5zdGFuY2VPbkRlbWFuZChBcGV4Q2FsbFJlc3VsdCwgbmV3IEFwZXhDYWxsUmVzdWx0KHJlc3BvbnNlKSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBhcGV4RXJyb3JSZXN1bHQobWVzc2FnZSkge1xuICAgIHJldHVybiBzdHViaWZ5SW5zdGFuY2VPbkRlbWFuZChBcGV4Q2FsbFJlc3VsdCwgbmV3IEFwZXhDYWxsUmVzdWx0KG51bGwsIG1lc3NhZ2UpKTtcbn1cblxuY2xhc3MgQXBleENhbGwge1xuICAgIGNvbnN0cnVjdG9yKHJlc3VsdCwgaW52b2tlQ2FsbGJhY2tPbkVucXVldWUgPSB0cnVlKSB7XG4gICAgICAgIHRoaXMucGFyYW1zID0gbnVsbDtcbiAgICAgICAgdGhpcy5yZXN1bHQgPSByZXN1bHQ7XG4gICAgICAgIHRoaXMuaW52b2tlQ2FsbGJhY2tPbkVucXVldWUgPSBpbnZva2VDYWxsYmFja09uRW5xdWV1ZTtcbiAgICAgICAgdGhpcy5pc0JhY2tncm91bmQgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5zZXRBYm9ydGFibGUgPSBmYWxzZTtcbiAgICB9XG4gICAgc2V0UGFyYW1zKHBhcmFtcykge1xuICAgICAgICB0aGlzLnBhcmFtcyA9IHBhcmFtcztcbiAgICB9XG4gICAgc2V0UGFyYW0oa2V5LCB2YWx1ZSkge1xuICAgICAgICB0aGlzLnBhcmFtcyA9IE9iamVjdC5hc3NpZ24odGhpcy5wYXJhbXMsIHtba2V5XSA6IHZhbHVlfSk7XG4gICAgfVxuICAgIGdldFBhcmFtcygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucGFyYW1zO1xuICAgIH1cbiAgICBzZXRDYWxsYmFjayhjdHgsIGNhbGxiYWNrKSB7XG4gICAgICAgIHRoaXMuY3R4ID0gY3R4O1xuICAgICAgICB0aGlzLmNhbGxiYWNrID0gY2FsbGJhY2s7XG4gICAgfVxuICAgIGludm9rZUNhbGxiYWNrKGZyb21FbnF1ZXVlID0gZmFsc2UpIHtcbiAgICAgICAgaWYgKGZyb21FbnF1ZXVlICYmICF0aGlzLmludm9rZUNhbGxiYWNrT25FbnF1ZXVlKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5jYWxsYmFjayAmJiB0aGlzLmNhbGxiYWNrLmJpbmQodGhpcy5jdHgpKHRoaXMucmVzdWx0KTtcbiAgICB9XG4gICAgZ2V0RXJyb3IoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnJlc3VsdC5nZXRFcnJvcigpO1xuICAgIH1cbiAgICBnZXRQYXJhbShuYW1lKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnBhcmFtcyA/IHRoaXMucGFyYW1zW25hbWVdIDogbnVsbDtcbiAgICB9XG4gICAgZ2V0UmV0dXJuVmFsdWUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnJlc3VsdDtcbiAgICB9XG4gICAgZ2V0U3RhdGUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnJlc3VsdC5nZXRTdGF0ZSgpO1xuICAgIH1cbiAgICBpc0JhY2tncm91bmQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmlzQmFja2dyb3VuZDtcbiAgICB9XG4gICAgc2V0QWJvcnRhYmxlKCkge1xuICAgIH1cbiAgICBzZXRCYWNrZ3JvdW5kKCkge1xuICAgICAgICB0aGlzLmlzQmFja2dyb3VuZCA9IHRydWU7XG4gICAgfVxuICAgIHNldFN0b3JhYmxlKCkge1xuICAgIH1cbn1cblxuY2xhc3MgQXBleENhbGxSZXN1bHQge1xuICAgIGNvbnN0cnVjdG9yKHJlc3BvbnNlLCBlcnJvck1lc3NhZ2UgPSBudWxsKSB7XG4gICAgICAgIHRoaXMucmVzcG9uc2UgPSByZXNwb25zZTtcbiAgICAgICAgdGhpcy5lcnJvck1lc3NhZ2UgPSBlcnJvck1lc3NhZ2U7XG4gICAgfVxuICAgIGdldFN0YXRlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5lcnJvck1lc3NhZ2UgPyAnRVJST1InIDogJ1NVQ0NFU1MnXG4gICAgfVxuICAgIGdldEVycm9yKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5lcnJvck1lc3NhZ2UgPyBbe21lc3NhZ2U6IHRoaXMuZXJyb3JNZXNzYWdlfV0gOiBbXVxuICAgIH1cbiAgICBnZXRSZXR1cm5WYWx1ZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucmVzcG9uc2U7XG4gICAgfVxufSIsImltcG9ydCB7IGV2ZW50RmFjdG9yeSB9IGZyb20gJy4vZXZlbnRGYWN0b3J5J1xuaW1wb3J0IHsgY29tcG9uZW50RmFjdG9yeSwgdXNlQ29tcG9uZW50QWRhcHRlcnMgfSBmcm9tICcuL2NvbXBvbmVudEZhY3RvcnknXG5pbXBvcnQgeyBhdXJhRmFjdG9yeSB9IGZyb20gJy4vYXVyYUZhY3RvcnknXG5pbXBvcnQgeyBBdXJhVXRpbCB9IGZyb20gJy4vYXVyYVV0aWwnXG5pbXBvcnQgeyBhcGV4Q2FsbEZhY3RvcnksIGFwZXhTdWNjZXNzUmVzdWx0LCBhcGV4RXJyb3JSZXN1bHQgfSBmcm9tICcuL2FwZXhDYWxsRmFjdG9yeSdcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgQXVyYVV0aWwsXG4gICAgZXZlbnRGYWN0b3J5LFxuICAgIGNvbXBvbmVudEZhY3RvcnksXG4gICAgdXNlQ29tcG9uZW50QWRhcHRlcnMsXG4gICAgYXVyYUZhY3RvcnksXG4gICAgYXBleENhbGxGYWN0b3J5LFxuICAgIGFwZXhTdWNjZXNzUmVzdWx0LFxuICAgIGFwZXhFcnJvclJlc3VsdFxufSJdLCJuYW1lcyI6WyJzaW5vbiIsInJlcXVpcmUiLCJzdHViaWZ5SW5zdGFuY2UiLCJjdG9yIiwiaW5zdGFuY2UiLCJwYXJhbXMiLCJwcm9wRXhjbHVkZWQiLCJwcm9wIiwiZG9Ob3RNb2NrIiwiQXJyYXkiLCJpc0FycmF5IiwiaW5kZXhPZiIsImdldE93blByb3BlcnR5TmFtZXMiLCJwcm90b3R5cGUiLCJmb3JFYWNoIiwic3R1YiIsImNhbGxzRmFrZSIsInByb3BOYW1lIiwiYXJncyIsImNhbGwiLCJzdHViaWZ5SW5zdGFuY2VPbkRlbWFuZCIsImhhbmRsZXIiLCJ0YXJnZXQiLCJwcm9wZXJ0eSIsImRlc2NyaXB0b3IiLCJfaW5zdGFuY2VQcm9wcyIsInByb3BLZXkiLCJ2YWx1ZSIsIndhcm4iLCJzdHViTmFtZSIsImlzU3B5T3JTdHViYmVkIiwiY2FsbGVkQmVmb3JlIiwiaGFzT25Qcm90byIsInByb3h5IiwiUHJveHkiLCJldmVudEZhY3RvcnkiLCJFdmVudCIsIkZBS0VfRVZFTlRfTkFNRSIsImtleSIsImV2ZW50TmFtZSIsIm5hbWUiLCJfIiwiRGVmYXVsdENvbXBvbmVudEFkYXB0ZXIiLCJXZWxsS25vd25Db21wb25lbnRzIiwiQ29tcG9uZW50QWRhcHRlcnMiLCJjb21wb25lbnRGYWN0b3J5Rm9yQXJyYXkiLCJhcnJheU9mVHlwZXMiLCJtYXAiLCJjb21wb25lbnRGYWN0b3J5IiwidHlwZU9yQ29tcG9uZW50IiwiRXJyb3IiLCJDb21wb25lbnQiLCJhZGFwdGVyTmFtZSIsInRvTG93ZXJDYXNlIiwicmVwbGFjZSIsImFkYXB0ZXIiLCJzb21lIiwic3RhcnRzV2l0aCIsInVzZUNvbXBvbmVudEFkYXB0ZXJzIiwicmVnaXN0cmF0b3IiLCJyZWdpc3RlciIsImNvbXBvbmVudFR5cGUiLCJ0eXBlIiwiT2JqZWN0IiwiYXNzaWduIiwic3Vic3RyaW5nIiwiZ2V0Iiwic2V0IiwiZmluZE1hcCIsImhhc093blByb3BlcnR5IiwiZGVmYXVsdFBhcmFtcyIsImNvbXBvbmVudCIsImNsYXNzTmFtZVRvQ29tcG9uZW50VmFyIiwiY2xhc3NOYW1lIiwiQXVyYVV0aWwiLCJvYmoiLCJ1bmRlZmluZWQiLCJsZW5ndGgiLCJ0b1N0cmluZyIsImtleXMiLCJ2YWwiLCJhcnIiLCJhcmciLCJhdXJhRmFjdG9yeSIsInN0dWJpZnlQYXJhbXMiLCJBdXJhIiwidXRpbCIsImFjdGlvbiIsImludm9rZUNhbGxiYWNrIiwiYXR0cmlidXRlcyIsImNhbGxiYWNrIiwiY3JlYXRlQ29tcG9uZW50IiwiY29tcG9uZW50RGVmcyIsInJlc3VsdCIsImRlZiIsImlkIiwicm9vdENvbXBvbmVudCIsImVyciIsImNvbnNvbGUiLCJsb2ciLCJhcGV4Q2FsbEZhY3RvcnkiLCJBcGV4Q2FsbCIsImFwZXhTdWNjZXNzUmVzdWx0IiwicmVzcG9uc2UiLCJBcGV4Q2FsbFJlc3VsdCIsImFwZXhFcnJvclJlc3VsdCIsIm1lc3NhZ2UiLCJpbnZva2VDYWxsYmFja09uRW5xdWV1ZSIsImlzQmFja2dyb3VuZCIsInNldEFib3J0YWJsZSIsImN0eCIsImZyb21FbnF1ZXVlIiwiYmluZCIs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
