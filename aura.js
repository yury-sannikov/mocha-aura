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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXVyYS5qcyIsInNvdXJjZXMiOlsibGliL3Npbm9uSGVscGVycy5qcyIsImxpYi9ldmVudEZhY3RvcnkuanMiLCJsaWIvY29tcG9uZW50RmFjdG9yeS5qcyIsImxpYi9hdXJhVXRpbC5qcyIsImxpYi9hdXJhRmFjdG9yeS5qcyIsImxpYi9hcGV4Q2FsbEZhY3RvcnkuanMiLCJsaWIvYXVyYS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKmdsb2JhbCBQcm94eSovXG5jb25zdCBzaW5vbiA9IHJlcXVpcmUoJ3Npbm9uJyk7XG5cbmV4cG9ydCBmdW5jdGlvbiBzdHViaWZ5SW5zdGFuY2UoY3RvciwgaW5zdGFuY2UpIHtcbiAgICBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyhjdG9yLnByb3RvdHlwZSkuZm9yRWFjaChwcm9wID0+IHtcbiAgICAgICAgaWYgKHR5cGVvZiBjdG9yLnByb3RvdHlwZVtwcm9wXSAhPT0gJ2Z1bmN0aW9uJyB8fCBwcm9wID09PSAnY29uc3RydWN0b3InKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaW5zdGFuY2VbJ3N0dWJfJyArIHByb3BdID0gc2lub24uc3R1YihpbnN0YW5jZSwgcHJvcCkuY2FsbHNGYWtlKCgocHJvcE5hbWUpID0+ICguLi5hcmdzKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gY3Rvci5wcm90b3R5cGVbcHJvcE5hbWVdLmNhbGwoaW5zdGFuY2UsIC4uLmFyZ3MpO1xuICAgICAgICB9KShwcm9wKSlcbiAgICB9KVxufVxuXG5leHBvcnQgZnVuY3Rpb24gc3R1YmlmeUluc3RhbmNlT25EZW1hbmQoY3RvciwgaW5zdGFuY2UpIHtcbiAgICBjb25zdCBoYW5kbGVyID0ge1xuICAgICAgICBfaW5zdGFuY2VQcm9wczoge30sXG4gICAgICAgIGRlZmluZVByb3BlcnR5KHRhcmdldCwgcHJvcGVydHksIGRlc2NyaXB0b3IpIHtcbiAgICAgICAgICAgIGhhbmRsZXIuX2luc3RhbmNlUHJvcHNbcHJvcGVydHldID0gZGVzY3JpcHRvcjtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9LFxuICAgICAgICBnZXQodGFyZ2V0LCBwcm9wS2V5KSB7XG4gICAgICAgICAgICAvLyBDaGVjayBmb3IgU3ltYm9sIGZvciBpdGVyYXRvcnNcbiAgICAgICAgICAgIGlmICh0eXBlb2YgcHJvcEtleSAhPT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGFyZ2V0W3Byb3BLZXldO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gSWYgd2UgYWRkIHNvbWUgcHJvcHMgdG8gdGhlIGluc3RhbmNlLCByZXR1cm4gaXQgdy9vIG1vY2tpbmdcbiAgICAgICAgICAgIC8vIFVzdWFsbHkgYWRkZWQgc3R1ZmYgaXMgbW9ja2VkIHRocm91Z2ggZGF0YSBhZGFwdGVyc1xuICAgICAgICAgICAgaWYgKGhhbmRsZXIuX2luc3RhbmNlUHJvcHNbcHJvcEtleV0pIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gaGFuZGxlci5faW5zdGFuY2VQcm9wc1twcm9wS2V5XS52YWx1ZVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgICAgICAvL1dhcm4gb24gdW5rbm93biBwcm9wS2V5IGZvciBiZXR0ZXIgZGVidWdnaW5nXG4gICAgICAgICAgICBpZiAoIXRhcmdldFtwcm9wS2V5XSkge1xuICAgICAgICAgICAgICAgIC8qZXNsaW50IG5vLWNvbnNvbGU6IDAqL1xuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybignXFxuXFxuc3R1YmlmeUluc3RhbmNlT25EZW1hbmQ6IFVua25vd24gcHJvcGVydHkgJyArIHByb3BLZXksICdcXG5cXG4nKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGFyZ2V0W3Byb3BLZXldO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBTdHViIG1ldGhvZHMgdGhhdCBkZWZpbmVkIG9uIHByb3RvdHlwZSBvbmx5LCBlLmcuIGhhcyBwdWJsaWMgYXBpXG4gICAgICAgICAgICBjb25zdCBzdHViTmFtZSA9ICdzdHViXycgKyBwcm9wS2V5O1xuICAgICAgICAgICAgY29uc3QgaXNTcHlPclN0dWJiZWQgPSAhISh0YXJnZXRbcHJvcEtleV0gJiYgdGFyZ2V0W3Byb3BLZXldLmNhbGxlZEJlZm9yZSk7XG4gICAgICAgICAgICBjb25zdCBoYXNPblByb3RvID0gISFjdG9yLnByb3RvdHlwZVtwcm9wS2V5XTtcblxuICAgICAgICAgICAgaWYgKGhhc09uUHJvdG8gJiYgIWlzU3B5T3JTdHViYmVkICYmIHR5cGVvZiB0YXJnZXRbcHJvcEtleV0gPT09ICdmdW5jdGlvbicgJiYgcHJvcEtleSAhPT0gJ2NvbnN0cnVjdG9yJykge1xuICAgICAgICAgICAgICAgIHRhcmdldFtzdHViTmFtZV0gPSBzaW5vbi5zdHViKHRhcmdldCwgcHJvcEtleSkuY2FsbHNGYWtlKCguLi5hcmdzKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBjdG9yLnByb3RvdHlwZVtwcm9wS2V5XS5jYWxsKGluc3RhbmNlLCAuLi5hcmdzKTtcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHRhcmdldFtwcm9wS2V5XTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGNvbnN0IHByb3h5ID0gbmV3IFByb3h5KGluc3RhbmNlLCBoYW5kbGVyKTtcbiAgICByZXR1cm4gcHJveHk7XG59IiwiaW1wb3J0IHsgc3R1YmlmeUluc3RhbmNlT25EZW1hbmQgfSBmcm9tICcuL3Npbm9uSGVscGVycydcblxuZXhwb3J0IGZ1bmN0aW9uIGV2ZW50RmFjdG9yeShwYXJhbXMgPSB7fSkge1xuICAgIHJldHVybiBzdHViaWZ5SW5zdGFuY2VPbkRlbWFuZChFdmVudCwgbmV3IEV2ZW50KHBhcmFtcykpO1xufVxuY29uc3QgRkFLRV9FVkVOVF9OQU1FID0gJ21vY2hhLWF1cmEtZmFrZS1ldmVudCdcblxuY2xhc3MgRXZlbnQge1xuICAgIGNvbnN0cnVjdG9yKHBhcmFtcykge1xuICAgICAgICB0aGlzLnBhcmFtcyA9IHBhcmFtcyB8fCB7fTtcbiAgICB9XG4gICAgc2V0UGFyYW1zKHBhcmFtcykge1xuICAgICAgICB0aGlzLnBhcmFtcyA9IHBhcmFtcztcbiAgICB9XG4gICAgc2V0UGFyYW0oa2V5LCB2YWx1ZSkge1xuICAgICAgICB0aGlzLnBhcmFtc1trZXldID0gdmFsdWU7XG4gICAgfVxuICAgIGdldFBhcmFtcygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucGFyYW1zO1xuICAgIH1cbiAgICBnZXRFdmVudFR5cGUoKSB7XG4gICAgICAgIHJldHVybiAnQVBQTElDQVRJT04nXG4gICAgfVxuICAgIGdldE5hbWUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnBhcmFtcy5ldmVudE5hbWUgfHwgRkFLRV9FVkVOVF9OQU1FXG4gICAgfVxuICAgIGdldFBhcmFtKG5hbWUpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucGFyYW1zW25hbWVdXG4gICAgfVxuICAgIGdldFBoYXNlKCkge1xuICAgICAgICByZXR1cm4gJ2RlZmF1bHQnXG4gICAgfVxuICAgIGdldFNvdXJjZSgpIHtcbiAgICAgICAgcmV0dXJuIG51bGxcbiAgICB9XG4gICAgZ2V0VHlwZSgpIHtcbiAgICAgICAgcmV0dXJuIGBjOiR7RkFLRV9FVkVOVF9OQU1FfWBcbiAgICB9XG4gICAgZmlyZSgpIHt9XG4gICAgcGF1c2UoKSB7fVxuICAgIHByZXZlbnREZWZhdWx0KCkge31cbiAgICByZXN1bWUoKSB7fVxuICAgIHN0b3BQcm9wYWdhdGlvbigpIHt9XG4gICAgXG5cbn0iLCJjb25zdCBfID0gcmVxdWlyZSgnbG9kYXNoJyk7XG5pbXBvcnQgeyBldmVudEZhY3RvcnkgfSBmcm9tICcuL2V2ZW50RmFjdG9yeSdcbmltcG9ydCB7IHN0dWJpZnlJbnN0YW5jZU9uRGVtYW5kIH0gZnJvbSAnLi9zaW5vbkhlbHBlcnMnXG5cbmNvbnN0IERlZmF1bHRDb21wb25lbnRBZGFwdGVyID0gJ2RlZmF1bHQnXG5jb25zdCBXZWxsS25vd25Db21wb25lbnRzID0gWydhdXJhOicsICdmb3JjZTonLCAnZm9yY2VDaGF0dGVyOicsICdsaWdodG5pbmc6JywgJ3VpOicsICdjOiddXG5cbmxldCBDb21wb25lbnRBZGFwdGVycyA9IHtcbiAgICBbRGVmYXVsdENvbXBvbmVudEFkYXB0ZXJdOiBpbnN0YW5jZSA9PiBpbnN0YW5jZVxufVxuXG5mdW5jdGlvbiBjb21wb25lbnRGYWN0b3J5Rm9yQXJyYXkocGFyYW1zLCBhcnJheU9mVHlwZXMpIHtcbiAgICByZXR1cm4gYXJyYXlPZlR5cGVzLm1hcCh0eXBlT3JDb21wb25lbnQgPT4gY29tcG9uZW50RmFjdG9yeShwYXJhbXMsIHR5cGVPckNvbXBvbmVudCkpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY29tcG9uZW50RmFjdG9yeShwYXJhbXMgPSB7fSwgdHlwZU9yQ29tcG9uZW50ID0gRGVmYXVsdENvbXBvbmVudEFkYXB0ZXIpIHtcbiAgICBpZiAoQXJyYXkuaXNBcnJheSh0eXBlT3JDb21wb25lbnQpKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignVW5leHBlY3RlZCB0eXBlIGFyZ3VtZW50JylcbiAgICB9XG5cbiAgICBpZiAodHlwZU9yQ29tcG9uZW50ID09PSB0cnVlKSB7XG4gICAgICAgIHR5cGVPckNvbXBvbmVudCA9IERlZmF1bHRDb21wb25lbnRBZGFwdGVyXG4gICAgfSBlbHNlIGlmICh0eXBlT3JDb21wb25lbnQgaW5zdGFuY2VvZiBDb21wb25lbnQpIHtcbiAgICAgICAgcmV0dXJuIHR5cGVPckNvbXBvbmVudDtcbiAgICB9IGVsc2UgaWYgKHR5cGVPckNvbXBvbmVudCA9PT0gbnVsbCkge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBsZXQgaW5zdGFuY2UgPSBzdHViaWZ5SW5zdGFuY2VPbkRlbWFuZChDb21wb25lbnQsIG5ldyBDb21wb25lbnQocGFyYW1zLCB0eXBlT3JDb21wb25lbnQpKTtcbiAgICBsZXQgYWRhcHRlck5hbWUgPSB0eXBlT3JDb21wb25lbnQudG9Mb3dlckNhc2UoKS5yZXBsYWNlKCdtYXJrdXA6Ly8nLCAnJylcbiAgICBsZXQgYWRhcHRlciA9IENvbXBvbmVudEFkYXB0ZXJzW2FkYXB0ZXJOYW1lXTtcbiAgICBpZiAoIWFkYXB0ZXIpIHtcbiAgICAgICAgaWYgKCFfLnNvbWUoV2VsbEtub3duQ29tcG9uZW50cywgbmFtZSA9PiBhZGFwdGVyTmFtZS5zdGFydHNXaXRoKG5hbWUpKSkge1xuICAgICAgICAgICAgLyplc2xpbnQgbm8tY29uc29sZTogMCovXG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYFVuYWJsZSB0byBmaW5kIGNvbXBvbmVudCBhZGFwdGVyICR7dHlwZU9yQ29tcG9uZW50fWApO1xuICAgICAgICB9XG4gICAgICAgIGFkYXB0ZXIgPSBDb21wb25lbnRBZGFwdGVyc1tEZWZhdWx0Q29tcG9uZW50QWRhcHRlcl07XG4gICAgfVxuICAgIHJldHVybiBhZGFwdGVyKGluc3RhbmNlLCBwYXJhbXMpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdXNlQ29tcG9uZW50QWRhcHRlcnMocmVnaXN0cmF0b3IpIHtcbiAgICBjb25zdCByZWdpc3RlciA9IChjb21wb25lbnRUeXBlLCBhZGFwdGVyKSA9PiB7XG4gICAgICAgIGNvbnN0IGFkYXB0ZXJOYW1lID0gY29tcG9uZW50VHlwZS50b0xvd2VyQ2FzZSgpO1xuICAgICAgICBDb21wb25lbnRBZGFwdGVyc1thZGFwdGVyTmFtZV0gPSBhZGFwdGVyXG4gICAgfVxuICAgIHJlZ2lzdHJhdG9yKHtyZWdpc3Rlcn0pO1xufVxuXG5jbGFzcyBDb21wb25lbnQge1xuICAgIGNvbnN0cnVjdG9yKHBhcmFtcywgdHlwZSkge1xuICAgICAgICB0aGlzLnBhcmFtcyA9IE9iamVjdC5hc3NpZ24oe30sIHtcbiAgICAgICAgICAgIGZpbmRNYXA6IHt9XG4gICAgICAgIH0sIHBhcmFtcyk7XG4gICAgICAgIHRoaXMudHlwZSA9IHR5cGUgfHwgJ2RlZmF1bHQnO1xuICAgICAgICAvL3N0dWJpZnlJbnN0YW5jZShDb21wb25lbnQsIHRoaXMpO1xuICAgIH1cbiAgICBnZXQobmFtZSkge1xuICAgICAgICBpZiAobmFtZS5zdGFydHNXaXRoKCd2LicpIHx8IG5hbWUuc3RhcnRzV2l0aCgnYy4nKSB8fCBuYW1lLnN0YXJ0c1dpdGgoJ2UuJykpIHtcbiAgICAgICAgICAgIG5hbWUgPSBuYW1lLnN1YnN0cmluZygyKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gXy5nZXQodGhpcy5wYXJhbXMsIG5hbWUpO1xuICAgIH1cbiAgICBzZXQobmFtZSwgdmFsdWUpIHtcbiAgICAgICAgaWYgKG5hbWUuc3RhcnRzV2l0aCgndi4nKSB8fCBuYW1lLnN0YXJ0c1dpdGgoJ2MuJykgfHwgbmFtZS5zdGFydHNXaXRoKCdlLicpKSB7XG4gICAgICAgICAgICBuYW1lID0gbmFtZS5zdWJzdHJpbmcoMik7XG4gICAgICAgIH1cbiAgICAgICAgXy5zZXQodGhpcy5wYXJhbXMsIG5hbWUsIHZhbHVlKTtcbiAgICB9XG4gICAgZmluZChuYW1lKSB7XG4gICAgICAgIGxldCB0eXBlT3JDb21wb25lbnQgPSB0aGlzLnBhcmFtcy5maW5kTWFwW25hbWVdO1xuICAgICAgICBpZiAoIXR5cGVPckNvbXBvbmVudCAmJiB0aGlzLnBhcmFtcy5maW5kTWFwLmhhc093blByb3BlcnR5KG5hbWUpKSB7XG4gICAgICAgICAgICByZXR1cm4gdHlwZU9yQ29tcG9uZW50O1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGRlZmF1bHRQYXJhbXMgPSB7XG4gICAgICAgICAgICAnYXVyYTppZCc6IG5hbWVcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgY29uc3QgY29tcG9uZW50ID0gdGhpcy5wYXJhbXMuZmluZE1hcFtuYW1lXSA9IChBcnJheS5pc0FycmF5KHR5cGVPckNvbXBvbmVudCkgPyBcbiAgICAgICAgICAgIGNvbXBvbmVudEZhY3RvcnlGb3JBcnJheShkZWZhdWx0UGFyYW1zLCB0eXBlT3JDb21wb25lbnQpIDogXG4gICAgICAgICAgICBjb21wb25lbnRGYWN0b3J5KGRlZmF1bHRQYXJhbXMsIHR5cGVPckNvbXBvbmVudCkpXG4gICAgICAgIHJldHVybiBjb21wb25lbnQ7XG4gICAgfVxuICAgIGdldExvY2FsSWQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnBhcmFtc1snYXVyYTppZCddO1xuICAgIH1cbiAgICBjbGVhclJlZmVyZW5jZShrZXkpIHtcbiAgICAgICAgZGVsZXRlIHRoaXMucGFyYW1zW2tleV07XG4gICAgfVxuICAgIGdldENvbmNyZXRlQ29tcG9uZW50KCkge1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgZ2V0RWxlbWVudCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIGdldEVsZW1lbnRzKCkge1xuICAgICAgICByZXR1cm4gW3RoaXNdO1xuICAgIH1cbiAgICBnZXRFdmVudChuYW1lKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnBhcmFtc1tuYW1lXSB8fCBldmVudEZhY3RvcnkoKTtcbiAgICB9XG4gICAgZ2V0R2xvYmFsSWQoKSB7XG4gICAgICAgIHJldHVybiBgZ2xvYmFsLSR7dGhpcy5wYXJhbXNbJ2F1cmE6aWQnXX1gO1xuICAgIH1cbiAgICBnZXROYW1lKCkge1xuICAgICAgICByZXR1cm4gdGhpcy50eXBlO1xuICAgIH1cbiAgICBnZXRUeXBlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy50eXBlO1xuICAgIH1cbiAgICBnZXRSZWZlcmVuY2Uoa2V5KSB7XG4gICAgICAgIHJldHVybiB0aGlzLnBhcmFtc1trZXldO1xuICAgIH1cbiAgICBnZXRTdXBlcigpIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGdldFZlcnNpb24oKSB7XG4gICAgICAgIHJldHVybiAnMS4wJztcbiAgICB9XG4gICAgaXNDb25jcmV0ZSgpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIGlzSW5zdGFuY2VPZihuYW1lKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnR5cGUgPT09IG5hbWU7XG4gICAgfVxuICAgIGlzVmFsaWQoKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICBhZGRFdmVudEhhbmRsZXIoKSB7fVxuICAgIGFkZEhhbmRsZXIoKSB7fVxuICAgIGFkZFZhbHVlSGFuZGxlcigpIHt9XG4gICAgYWRkVmFsdWVQcm92aWRlcigpIHt9XG4gICAgYXV0b0Rlc3Ryb3koKSB7fVxuICAgIGRlc3Ryb3koKSB7fVxuICAgIHJlbW92ZUV2ZW50SGFuZGxlcigpIHt9XG5cbn0iLCJpbXBvcnQgeyBzdHViaWZ5SW5zdGFuY2UgfSBmcm9tICcuL3Npbm9uSGVscGVycydcblxuY29uc3QgY2xhc3NOYW1lVG9Db21wb25lbnRWYXIgPSBjbGFzc05hbWUgPT4gYHYuX19jbHNfJHtjbGFzc05hbWV9YFxuZXhwb3J0IGNsYXNzIEF1cmFVdGlsIHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgc3R1YmlmeUluc3RhbmNlKEF1cmFVdGlsLCB0aGlzKTtcbiAgICB9XG4gICAgXG4gICAgaXNFbXB0eShvYmope1xuICAgICAgICBpZiAob2JqID09PSB1bmRlZmluZWQgfHwgb2JqID09PSBudWxsIHx8IG9iaiA9PT0gJycpIHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIGlmIChBcnJheS5pc0FycmF5KG9iaikpIHtcbiAgICAgICAgICAgIHJldHVybiBvYmoubGVuZ3RoID09PSAwO1xuICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiBvYmogPT09ICdvYmplY3QnICYmIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChvYmopID09PSAnW29iamVjdCBPYmplY3RdJykge1xuICAgICAgICAgICAgcmV0dXJuIE9iamVjdC5rZXlzKG9iaikubGVuZ3RoID09PSAwO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgaXNVbmRlZmluZWRPck51bGwob2JqKSB7XG4gICAgICAgIHJldHVybiBvYmogPT09IHVuZGVmaW5lZCB8fCBvYmogPT09IG51bGw7XG4gICAgfVxuICAgIGFkZENsYXNzKGNvbXBvbmVudCwgY2xhc3NOYW1lKSB7XG4gICAgICAgIHJldHVybiBjb21wb25lbnQuc2V0KGNsYXNzTmFtZVRvQ29tcG9uZW50VmFyKGNsYXNzTmFtZSksIHRydWUpO1xuICAgIH1cbiAgICByZW1vdmVDbGFzcyhjb21wb25lbnQsIGNsYXNzTmFtZSkge1xuICAgICAgICByZXR1cm4gY29tcG9uZW50LnNldChjbGFzc05hbWVUb0NvbXBvbmVudFZhcihjbGFzc05hbWUpLCBmYWxzZSk7XG4gICAgfVxuICAgIGhhc0NsYXNzKGNvbXBvbmVudCwgY2xhc3NOYW1lKSB7XG4gICAgICAgIHJldHVybiBjb21wb25lbnQuZ2V0KGNsYXNzTmFtZVRvQ29tcG9uZW50VmFyKGNsYXNzTmFtZSkpO1xuICAgIH1cbiAgICB0b2dnbGVDbGFzcyhjb21wb25lbnQsIGNsYXNzTmFtZSkge1xuICAgICAgICBjb21wb25lbnQuc2V0KGNsYXNzTmFtZVRvQ29tcG9uZW50VmFyKGNsYXNzTmFtZSksICFjb21wb25lbnQuZ2V0KGNsYXNzTmFtZVRvQ29tcG9uZW50VmFyKGNsYXNzTmFtZSkpKTtcbiAgICB9XG4gICAgZ2V0Qm9vbGVhblZhbHVlKHZhbCkge1xuICAgICAgICAvLyBQb3J0ZWQ6IGh0dHBzOi8vZ2l0aHViLmNvbS9mb3JjZWRvdGNvbS9hdXJhL2Jsb2IvbWFzdGVyL2F1cmEtaW1wbC9zcmMvbWFpbi9yZXNvdXJjZXMvYXVyYS91dGlsL1V0aWwuanMjTDM2NlxuICAgICAgICByZXR1cm4gdmFsICE9PSB1bmRlZmluZWQgJiYgdmFsICE9PSBudWxsICYmIHZhbCAhPT0gZmFsc2UgJiYgdmFsICE9PSAwICYmIHZhbCAhPT0gJ2ZhbHNlJyAmJiB2YWwgIT09ICcnICYmIHZhbCAhPT0gJ2YnO1xuICAgIH1cbiAgICBpc0FycmF5KGFycikge1xuICAgICAgICAvLyBQb3J0ZWQ6IGh0dHBzOi8vZ2l0aHViLmNvbS9mb3JjZWRvdGNvbS9hdXJhL2Jsb2IvbWFzdGVyL2F1cmEtaW1wbC9zcmMvbWFpbi9yZXNvdXJjZXMvYXVyYS91dGlsL1V0aWwuanMjTDE4OVxuICAgICAgICByZXR1cm4gKHR5cGVvZiBBcnJheS5pc0FycmF5ID09PSBcImZ1bmN0aW9uXCIgPyBBcnJheS5pc0FycmF5IDogZnVuY3Rpb24oYXJnKSB7XG4gICAgICAgICAgICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKGFyZykgPT09ICdbb2JqZWN0IEFycmF5XSc7XG4gICAgICAgIH0pKGFycik7XG4gICAgfVxuICAgIGlzT2JqZWN0KG9iaikge1xuICAgICAgICAvL1BvcnRlZDogaHR0cHM6Ly9naXRodWIuY29tL2ZvcmNlZG90Y29tL2F1cmEvYmxvYi9tYXN0ZXIvYXVyYS1pbXBsL3NyYy9tYWluL3Jlc291cmNlcy9hdXJhL3V0aWwvVXRpbC5qcyNMMjA0XG4gICAgICAgIHJldHVybiB0eXBlb2Ygb2JqID09PSBcIm9iamVjdFwiICYmIG9iaiAhPT0gbnVsbCAmJiAhQXJyYXkuaXNBcnJheShvYmopO1xuICAgIH1cbiAgICBpc1VuZGVmaW5lZChvYmope1xuICAgICAgICAvL1BvcnRlZDogaHR0cHM6Ly9naXRodWIuY29tL2ZvcmNlZG90Y29tL2F1cmEvYmxvYi9tYXN0ZXIvYXVyYS1pbXBsL3NyYy9tYWluL3Jlc291cmNlcy9hdXJhL3V0aWwvVXRpbC5qcyNMMzE5XG4gICAgICAgIHJldHVybiBvYmogPT09IHVuZGVmaW5lZDtcbiAgICB9XG59XG5cbiIsImltcG9ydCB7IHN0dWJpZnlJbnN0YW5jZSB9IGZyb20gJy4vc2lub25IZWxwZXJzJ1xuaW1wb3J0IHsgQXVyYVV0aWwgfSBmcm9tICcuL2F1cmFVdGlsJ1xuXG5leHBvcnQgZnVuY3Rpb24gYXVyYUZhY3RvcnkocGFyYW1zID0ge30pIHtcbiAgICByZXR1cm4gbmV3IEF1cmEocGFyYW1zKTtcbn1cblxuaW1wb3J0IHsgY29tcG9uZW50RmFjdG9yeSB9IGZyb20gJy4vY29tcG9uZW50RmFjdG9yeSdcblxuY2xhc3MgQXVyYSB7XG4gICAgY29uc3RydWN0b3IocGFyYW1zKSB7XG4gICAgICAgIHRoaXMucGFyYW1zID0gcGFyYW1zO1xuICAgICAgICB0aGlzLnV0aWwgPSBuZXcgQXVyYVV0aWwoKTtcbiAgICAgICAgc3R1YmlmeUluc3RhbmNlKEF1cmEsIHRoaXMpO1xuICAgIH1cbiAgICBcbiAgICBzZXRQYXJhbXMocGFyYW1zKSB7XG4gICAgICAgIE9iamVjdC5hc3NpZ24odGhpcy5wYXJhbXMsIHBhcmFtcyk7XG4gICAgfVxuXG4gICAgZ2V0KG5hbWUpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucGFyYW1zW25hbWVdO1xuICAgIH1cblxuICAgIHNldChuYW1lLCB2YWx1ZSkge1xuICAgICAgICB0aGlzLnBhcmFtc1tuYW1lXSA9IHZhbHVlO1xuICAgIH1cbiAgICBcbiAgICBlbnF1ZXVlQWN0aW9uKGFjdGlvbikge1xuICAgICAgICBhY3Rpb24gJiYgYWN0aW9uLmludm9rZUNhbGxiYWNrICYmIGFjdGlvbi5pbnZva2VDYWxsYmFjayh0cnVlKVxuICAgIH1cblxuICAgIGNyZWF0ZUNvbXBvbmVudCh0eXBlLCBhdHRyaWJ1dGVzLCBjYWxsYmFjaykge1xuICAgICAgICB0aGlzLmNyZWF0ZUNvbXBvbmVudC50eXBlID0gdHlwZTtcbiAgICAgICAgdGhpcy5jcmVhdGVDb21wb25lbnQuYXR0cmlidXRlcyA9IGF0dHJpYnV0ZXM7XG4gICAgICAgIC8vIEdldCBjb21wb25lbnQgaW5zdGFuY2UuXG4gICAgICAgIC8vIFVzZSBleGlzdGluZyBjb21wb25lbnQgaW5zdGFuY2UgaWYgc2V0XG4gICAgICAgIC8vIENyZWF0ZSBuZXcgZGVmYXVsdCBjb21wb25lbnQgaWYgY29tcG9uZW50IG5vdCBzZXRcbiAgICAgICAgbGV0IHsgY29tcG9uZW50IH0gPSB0aGlzLmNyZWF0ZUNvbXBvbmVudDtcbiAgICAgICAgaWYgKCFjb21wb25lbnQpIHtcbiAgICAgICAgICAgIGNvbXBvbmVudCA9IG5ldyBjb21wb25lbnRGYWN0b3J5KGF0dHJpYnV0ZXMsIHR5cGUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5jcmVhdGVDb21wb25lbnQuY29tcG9uZW50ID0gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBpZiAoY2FsbGJhY2spIHtcbiAgICAgICAgICAgIGNhbGxiYWNrKGNvbXBvbmVudCwgJ1NVQ0NFU1MnLCBbJ1NVQ0NFU1MnXSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGNvbXBvbmVudDtcbiAgICB9XG4gICAgY3JlYXRlQ29tcG9uZW50cyhjb21wb25lbnREZWZzLCBjYWxsYmFjaykge1xuICAgICAgICBjb25zdCByZXN1bHQgPSBjb21wb25lbnREZWZzXG4gICAgICAgICAgICAubWFwKGRlZiA9PiB0aGlzLmNyZWF0ZUNvbXBvbmVudChkZWZbMF0sIGRlZlsxXSkpXG4gICAgICAgIGlmIChjYWxsYmFjaykge1xuICAgICAgICAgICAgY2FsbGJhY2socmVzdWx0LCAnU1VDQ0VTUycsIHJlc3VsdC5tYXAoICgpID0+ICdTVUNDRVNTJykpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuICAgIGdldENhbGxiYWNrKGNhbGxiYWNrKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiguLi5hcmdzKSB7XG4gICAgICAgICAgICBjYWxsYmFjayAmJiBjYWxsYmFjayguLi5hcmdzKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBnZXRDb21wb25lbnQoaWQpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucGFyYW1zW2lkXTtcbiAgICB9XG4gICAgZ2V0UmVmZXJlbmNlKCkge31cbiAgICBnZXRSb290KCkge1xuICAgICAgICByZXR1cm4gdGhpcy5yb290Q29tcG9uZW50IHx8ICh0aGlzLnJvb3RDb21wb25lbnQgPSBuZXcgY29tcG9uZW50RmFjdG9yeSgpKTtcbiAgICB9XG4gICAgZ2V0VG9rZW4obmFtZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5wYXJhbXNbJ3Rva2VuLicgKyBuYW1lXVxuICAgIH1cbiAgICBsb2codmFsdWUsIGVycikge1xuICAgICAgICAvKmVzbGludCBuby1jb25zb2xlOiAwKi9cbiAgICAgICAgY29uc29sZSAmJiBjb25zb2xlLmxvZyh2YWx1ZSwgZXJyKVxuICAgIH1cbiAgICByZXBvcnRFcnJvcigpIHt9XG59IiwiaW1wb3J0IHsgc3R1YmlmeUluc3RhbmNlT25EZW1hbmQgfSBmcm9tICcuL3Npbm9uSGVscGVycydcblxuZXhwb3J0IGZ1bmN0aW9uIGFwZXhDYWxsRmFjdG9yeShwYXJhbXMgPSB7fSkge1xuICAgIHJldHVybiBzdHViaWZ5SW5zdGFuY2VPbkRlbWFuZChBcGV4Q2FsbCwgbmV3IEFwZXhDYWxsKHBhcmFtcykpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYXBleFN1Y2Nlc3NSZXN1bHQocmVzcG9uc2UgPSB7fSkge1xuICAgIHJldHVybiBzdHViaWZ5SW5zdGFuY2VPbkRlbWFuZChBcGV4Q2FsbFJlc3VsdCwgbmV3IEFwZXhDYWxsUmVzdWx0KHJlc3BvbnNlKSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBhcGV4RXJyb3JSZXN1bHQobWVzc2FnZSkge1xuICAgIHJldHVybiBzdHViaWZ5SW5zdGFuY2VPbkRlbWFuZChBcGV4Q2FsbFJlc3VsdCwgbmV3IEFwZXhDYWxsUmVzdWx0KG51bGwsIG1lc3NhZ2UpKTtcbn1cblxuY2xhc3MgQXBleENhbGwge1xuICAgIGNvbnN0cnVjdG9yKHJlc3VsdCwgaW52b2tlQ2FsbGJhY2tPbkVucXVldWUgPSB0cnVlKSB7XG4gICAgICAgIHRoaXMucGFyYW1zID0gbnVsbDtcbiAgICAgICAgdGhpcy5yZXN1bHQgPSByZXN1bHQ7XG4gICAgICAgIHRoaXMuaW52b2tlQ2FsbGJhY2tPbkVucXVldWUgPSBpbnZva2VDYWxsYmFja09uRW5xdWV1ZTtcbiAgICAgICAgdGhpcy5pc0JhY2tncm91bmQgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5zZXRBYm9ydGFibGUgPSBmYWxzZTtcbiAgICB9XG4gICAgc2V0UGFyYW1zKHBhcmFtcykge1xuICAgICAgICB0aGlzLnBhcmFtcyA9IHBhcmFtcztcbiAgICB9XG4gICAgc2V0UGFyYW0oa2V5LCB2YWx1ZSkge1xuICAgICAgICB0aGlzLnBhcmFtcyA9IE9iamVjdC5hc3NpZ24odGhpcy5wYXJhbXMsIHtba2V5XSA6IHZhbHVlfSk7XG4gICAgfVxuICAgIGdldFBhcmFtcygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucGFyYW1zO1xuICAgIH1cbiAgICBzZXRDYWxsYmFjayhjdHgsIGNhbGxiYWNrKSB7XG4gICAgICAgIHRoaXMuY3R4ID0gY3R4O1xuICAgICAgICB0aGlzLmNhbGxiYWNrID0gY2FsbGJhY2s7XG4gICAgfVxuICAgIGludm9rZUNhbGxiYWNrKGZyb21FbnF1ZXVlID0gZmFsc2UpIHtcbiAgICAgICAgaWYgKGZyb21FbnF1ZXVlICYmICF0aGlzLmludm9rZUNhbGxiYWNrT25FbnF1ZXVlKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5jYWxsYmFjayAmJiB0aGlzLmNhbGxiYWNrLmJpbmQodGhpcy5jdHgpKHRoaXMucmVzdWx0KTtcbiAgICB9XG4gICAgZ2V0RXJyb3IoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnJlc3VsdC5nZXRFcnJvcigpO1xuICAgIH1cbiAgICBnZXRQYXJhbShuYW1lKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnBhcmFtcyA/IHRoaXMucGFyYW1zW25hbWVdIDogbnVsbDtcbiAgICB9XG4gICAgZ2V0UmV0dXJuVmFsdWUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnJlc3VsdDtcbiAgICB9XG4gICAgZ2V0U3RhdGUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnJlc3VsdC5nZXRTdGF0ZSgpO1xuICAgIH1cbiAgICBpc0JhY2tncm91bmQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmlzQmFja2dyb3VuZDtcbiAgICB9XG4gICAgc2V0QWJvcnRhYmxlKCkge1xuICAgIH1cbiAgICBzZXRCYWNrZ3JvdW5kKCkge1xuICAgICAgICB0aGlzLmlzQmFja2dyb3VuZCA9IHRydWU7XG4gICAgfVxuICAgIHNldFN0b3JhYmxlKCkge1xuICAgIH1cbn1cblxuY2xhc3MgQXBleENhbGxSZXN1bHQge1xuICAgIGNvbnN0cnVjdG9yKHJlc3BvbnNlLCBlcnJvck1lc3NhZ2UgPSBudWxsKSB7XG4gICAgICAgIHRoaXMucmVzcG9uc2UgPSByZXNwb25zZTtcbiAgICAgICAgdGhpcy5lcnJvck1lc3NhZ2UgPSBlcnJvck1lc3NhZ2U7XG4gICAgfVxuICAgIGdldFN0YXRlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5lcnJvck1lc3NhZ2UgPyAnRVJST1InIDogJ1NVQ0NFU1MnXG4gICAgfVxuICAgIGdldEVycm9yKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5lcnJvck1lc3NhZ2UgPyBbe21lc3NhZ2U6IHRoaXMuZXJyb3JNZXNzYWdlfV0gOiBbXVxuICAgIH1cbiAgICBnZXRSZXR1cm5WYWx1ZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucmVzcG9uc2U7XG4gICAgfVxufSIsImltcG9ydCB7IGV2ZW50RmFjdG9yeSB9IGZyb20gJy4vZXZlbnRGYWN0b3J5J1xuaW1wb3J0IHsgY29tcG9uZW50RmFjdG9yeSwgdXNlQ29tcG9uZW50QWRhcHRlcnMgfSBmcm9tICcuL2NvbXBvbmVudEZhY3RvcnknXG5pbXBvcnQgeyBhdXJhRmFjdG9yeSB9IGZyb20gJy4vYXVyYUZhY3RvcnknXG5pbXBvcnQgeyBBdXJhVXRpbCB9IGZyb20gJy4vYXVyYVV0aWwnXG5pbXBvcnQgeyBhcGV4Q2FsbEZhY3RvcnksIGFwZXhTdWNjZXNzUmVzdWx0LCBhcGV4RXJyb3JSZXN1bHQgfSBmcm9tICcuL2FwZXhDYWxsRmFjdG9yeSdcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgQXVyYVV0aWwsXG4gICAgZXZlbnRGYWN0b3J5LFxuICAgIGNvbXBvbmVudEZhY3RvcnksXG4gICAgdXNlQ29tcG9uZW50QWRhcHRlcnMsXG4gICAgYXVyYUZhY3RvcnksXG4gICAgYXBleENhbGxGYWN0b3J5LFxuICAgIGFwZXhTdWNjZXNzUmVzdWx0LFxuICAgIGFwZXhFcnJvclJlc3VsdFxufSJdLCJuYW1lcyI6WyJzaW5vbiIsInJlcXVpcmUiLCJzdHViaWZ5SW5zdGFuY2UiLCJjdG9yIiwiaW5zdGFuY2UiLCJnZXRPd25Qcm9wZXJ0eU5hbWVzIiwicHJvdG90eXBlIiwiZm9yRWFjaCIsInByb3AiLCJzdHViIiwiY2FsbHNGYWtlIiwicHJvcE5hbWUiLCJhcmdzIiwiY2FsbCIsInN0dWJpZnlJbnN0YW5jZU9uRGVtYW5kIiwiaGFuZGxlciIsInRhcmdldCIsInByb3BlcnR5IiwiZGVzY3JpcHRvciIsIl9pbnN0YW5jZVByb3BzIiwicHJvcEtleSIsInZhbHVlIiwid2FybiIsInN0dWJOYW1lIiwiaXNTcHlPclN0dWJiZWQiLCJjYWxsZWRCZWZvcmUiLCJoYXNPblByb3RvIiwicHJveHkiLCJQcm94eSIsImV2ZW50RmFjdG9yeSIsInBhcmFtcyIsIkV2ZW50IiwiRkFLRV9FVkVOVF9OQU1FIiwia2V5IiwiZXZlbnROYW1lIiwibmFtZSIsIl8iLCJEZWZhdWx0Q29tcG9uZW50QWRhcHRlciIsIldlbGxLbm93bkNvbXBvbmVudHMiLCJDb21wb25lbnRBZGFwdGVycyIsImNvbXBvbmVudEZhY3RvcnlGb3JBcnJheSIsImFycmF5T2ZUeXBlcyIsIm1hcCIsImNvbXBvbmVudEZhY3RvcnkiLCJ0eXBlT3JDb21wb25lbnQiLCJBcnJheSIsImlzQXJyYXkiLCJFcnJvciIsIkNvbXBvbmVudCIsImFkYXB0ZXJOYW1lIiwidG9Mb3dlckNhc2UiLCJyZXBsYWNlIiwiYWRhcHRlciIsInNvbWUiLCJzdGFydHNXaXRoIiwidXNlQ29tcG9uZW50QWRhcHRlcnMiLCJyZWdpc3RyYXRvciIsInJlZ2lzdGVyIiwiY29tcG9uZW50VHlwZSIsInR5cGUiLCJPYmplY3QiLCJhc3NpZ24iLCJzdWJzdHJpbmciLCJnZXQiLCJzZXQiLCJmaW5kTWFwIiwiaGFzT3duUHJvcGVydHkiLCJkZWZhdWx0UGFyYW1zIiwiY29tcG9uZW50IiwiY2xhc3NOYW1lVG9Db21wb25lbnRWYXIiLCJjbGFzc05hbWUiLCJBdXJhVXRpbCIsIm9iaiIsInVuZGVmaW5lZCIsImxlbmd0aCIsInRvU3RyaW5nIiwia2V5cyIsInZhbCIsImFyciIsImFyZyIsImF1cmFGYWN0b3J5IiwiQXVyYSIsInV0aWwiLCJhY3Rpb24iLCJpbnZva2VDYWxsYmFjayIsImF0dHJpYnV0ZXMiLCJjYWxsYmFjayIsImNyZWF0ZUNvbXBvbmVudCIsImNvbXBvbmVudERlZnMiLCJyZXN1bHQiLCJkZWYiLCJpZCIsInJvb3RDb21wb25lbnQiLCJlcnIiLCJjb25zb2xlIiwibG9nIiwiYXBleENhbGxGYWN0b3J5IiwiQXBleENhbGwiLCJhcGV4U3VjY2Vzc1Jlc3VsdCIsInJlc3BvbnNlIiwiQXBleENhbGxSZXN1bHQiLCJhcGV4RXJyb3JSZXN1bHQiLCJtZXNzYWdlIiwiaW52b2tlQ2FsbGJhY2tPbkVucXVldWUiLCJpc0JhY2tncm91bmQiLCJzZXRBYm9ydGFibGUiLCJjdHgiLCJmcm9tRW5xdWV1ZSIsImJpbmQiLCJnZXRFcnJvciIsImdldFN0YXRlIiwiZXJyb3JNZXNzYWdlIiwibW9kdWxlIiwiZXhwb3J0cyJdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQSxJQUFNQSxRQUFRQyxRQUFRLE9BQVIsQ0FBZDs7QUFFQSxBQUFPLFNBQVNDLGVBQVQsQ0FBeUJDLElBQXpCLEVBQStCQyxRQUEvQixFQUF5QztXQUNyQ0MsbUJBQVAsQ0FBMkJGLEtBQUtHLFNBQWhDLEVBQTJDQyxPQUEzQyxDQUFtRCxnQkFBUTtZQUNuRCxPQUFPSixLQUFLRyxTQUFMLENBQWVFLElBQWYsQ0FBUCxLQUFnQyxVQUFoQyxJQUE4Q0EsU0FBUyxhQUEzRCxFQUEwRTs7O2lCQUdqRSxVQUFVQSxJQUFuQixJQUEyQlIsTUFBTVMsSUFBTixD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
