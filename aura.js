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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXVyYS5qcyIsInNvdXJjZXMiOlsibGliL3Npbm9uSGVscGVycy5qcyIsImxpYi9ldmVudEZhY3RvcnkuanMiLCJsaWIvY29tcG9uZW50RmFjdG9yeS5qcyIsImxpYi9hdXJhVXRpbC5qcyIsImxpYi9hdXJhRmFjdG9yeS5qcyIsImxpYi9hcGV4Q2FsbEZhY3RvcnkuanMiLCJsaWIvYXVyYS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKmdsb2JhbCBQcm94eSovXG5jb25zdCBzaW5vbiA9IHJlcXVpcmUoJ3Npbm9uJyk7XG5cbmV4cG9ydCBmdW5jdGlvbiBzdHViaWZ5SW5zdGFuY2UoY3RvciwgaW5zdGFuY2UpIHtcbiAgICBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyhjdG9yLnByb3RvdHlwZSkuZm9yRWFjaChwcm9wID0+IHtcbiAgICAgICAgaWYgKHR5cGVvZiBjdG9yLnByb3RvdHlwZVtwcm9wXSAhPT0gJ2Z1bmN0aW9uJyB8fCBwcm9wID09PSAnY29uc3RydWN0b3InKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaW5zdGFuY2VbJ3N0dWJfJyArIHByb3BdID0gc2lub24uc3R1YihpbnN0YW5jZSwgcHJvcCkuY2FsbHNGYWtlKCgocHJvcE5hbWUpID0+ICguLi5hcmdzKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gY3Rvci5wcm90b3R5cGVbcHJvcE5hbWVdLmNhbGwoaW5zdGFuY2UsIC4uLmFyZ3MpO1xuICAgICAgICB9KShwcm9wKSlcbiAgICB9KVxufVxuXG5leHBvcnQgZnVuY3Rpb24gc3R1YmlmeUluc3RhbmNlT25EZW1hbmQoY3RvciwgaW5zdGFuY2UpIHtcbiAgICBjb25zdCBoYW5kbGVyID0ge1xuICAgICAgICBfaW5zdGFuY2VQcm9wczoge30sXG4gICAgICAgIGRlZmluZVByb3BlcnR5KHRhcmdldCwgcHJvcGVydHksIGRlc2NyaXB0b3IpIHtcbiAgICAgICAgICAgIGhhbmRsZXIuX2luc3RhbmNlUHJvcHNbcHJvcGVydHldID0gZGVzY3JpcHRvcjtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9LFxuICAgICAgICBnZXQodGFyZ2V0LCBwcm9wS2V5KSB7XG4gICAgICAgICAgICAvLyBDaGVjayBmb3IgU3ltYm9sIGZvciBpdGVyYXRvcnNcbiAgICAgICAgICAgIGlmICh0eXBlb2YgcHJvcEtleSAhPT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGFyZ2V0W3Byb3BLZXldO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gSWYgd2UgYWRkIHNvbWUgcHJvcHMgdG8gdGhlIGluc3RhbmNlLCByZXR1cm4gaXQgdy9vIG1vY2tpbmdcbiAgICAgICAgICAgIC8vIFVzdWFsbHkgYWRkZWQgc3R1ZmYgaXMgbW9ja2VkIHRocm91Z2ggZGF0YSBhZGFwdGVyc1xuICAgICAgICAgICAgaWYgKGhhbmRsZXIuX2luc3RhbmNlUHJvcHNbcHJvcEtleV0pIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gaGFuZGxlci5faW5zdGFuY2VQcm9wc1twcm9wS2V5XS52YWx1ZVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgICAgICAvL1dhcm4gb24gdW5rbm93biBwcm9wS2V5IGZvciBiZXR0ZXIgZGVidWdnaW5nXG4gICAgICAgICAgICBpZiAoIXRhcmdldFtwcm9wS2V5XSkge1xuICAgICAgICAgICAgICAgIC8qZXNsaW50IG5vLWNvbnNvbGU6IDAqL1xuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybignXFxuXFxuc3R1YmlmeUluc3RhbmNlT25EZW1hbmQ6IFVua25vd24gcHJvcGVydHkgJyArIHByb3BLZXksICdcXG5cXG4nKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGFyZ2V0W3Byb3BLZXldO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBTdHViIG1ldGhvZHMgdGhhdCBkZWZpbmVkIG9uIHByb3RvdHlwZSBvbmx5LCBlLmcuIGhhcyBwdWJsaWMgYXBpXG4gICAgICAgICAgICBjb25zdCBzdHViTmFtZSA9ICdzdHViXycgKyBwcm9wS2V5O1xuICAgICAgICAgICAgY29uc3QgaXNTcHlPclN0dWJiZWQgPSAhISh0YXJnZXRbcHJvcEtleV0gJiYgdGFyZ2V0W3Byb3BLZXldLmNhbGxlZEJlZm9yZSk7XG4gICAgICAgICAgICBjb25zdCBoYXNPblByb3RvID0gISFjdG9yLnByb3RvdHlwZVtwcm9wS2V5XTtcblxuICAgICAgICAgICAgaWYgKGhhc09uUHJvdG8gJiYgIWlzU3B5T3JTdHViYmVkICYmIHR5cGVvZiB0YXJnZXRbcHJvcEtleV0gPT09ICdmdW5jdGlvbicgJiYgcHJvcEtleSAhPT0gJ2NvbnN0cnVjdG9yJykge1xuICAgICAgICAgICAgICAgIHRhcmdldFtzdHViTmFtZV0gPSBzaW5vbi5zdHViKHRhcmdldCwgcHJvcEtleSkuY2FsbHNGYWtlKCguLi5hcmdzKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBjdG9yLnByb3RvdHlwZVtwcm9wS2V5XS5jYWxsKGluc3RhbmNlLCAuLi5hcmdzKTtcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHRhcmdldFtwcm9wS2V5XTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGNvbnN0IHByb3h5ID0gbmV3IFByb3h5KGluc3RhbmNlLCBoYW5kbGVyKTtcbiAgICByZXR1cm4gcHJveHk7XG59IiwiaW1wb3J0IHsgc3R1YmlmeUluc3RhbmNlT25EZW1hbmQgfSBmcm9tICcuL3Npbm9uSGVscGVycydcblxuZXhwb3J0IGZ1bmN0aW9uIGV2ZW50RmFjdG9yeShwYXJhbXMgPSB7fSkge1xuICAgIHJldHVybiBzdHViaWZ5SW5zdGFuY2VPbkRlbWFuZChFdmVudCwgbmV3IEV2ZW50KHBhcmFtcykpO1xufVxuY29uc3QgRkFLRV9FVkVOVF9OQU1FID0gJ21vY2hhLWF1cmEtZmFrZS1ldmVudCdcblxuY2xhc3MgRXZlbnQge1xuICAgIGNvbnN0cnVjdG9yKHBhcmFtcykge1xuICAgICAgICB0aGlzLnBhcmFtcyA9IHBhcmFtcyB8fCB7fTtcbiAgICB9XG4gICAgc2V0UGFyYW1zKHBhcmFtcykge1xuICAgICAgICB0aGlzLnBhcmFtcyA9IHBhcmFtcztcbiAgICB9XG4gICAgc2V0UGFyYW0oa2V5LCB2YWx1ZSkge1xuICAgICAgICB0aGlzLnBhcmFtc1trZXldID0gdmFsdWU7XG4gICAgfVxuICAgIGdldFBhcmFtcygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucGFyYW1zO1xuICAgIH1cbiAgICBnZXRFdmVudFR5cGUoKSB7XG4gICAgICAgIHJldHVybiAnQVBQTElDQVRJT04nXG4gICAgfVxuICAgIGdldE5hbWUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnBhcmFtcy5ldmVudE5hbWUgfHwgRkFLRV9FVkVOVF9OQU1FXG4gICAgfVxuICAgIGdldFBhcmFtKG5hbWUpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucGFyYW1zW25hbWVdXG4gICAgfVxuICAgIGdldFBoYXNlKCkge1xuICAgICAgICByZXR1cm4gJ2RlZmF1bHQnXG4gICAgfVxuICAgIGdldFNvdXJjZSgpIHtcbiAgICAgICAgcmV0dXJuIG51bGxcbiAgICB9XG4gICAgZ2V0VHlwZSgpIHtcbiAgICAgICAgcmV0dXJuIGBjOiR7RkFLRV9FVkVOVF9OQU1FfWBcbiAgICB9XG4gICAgZmlyZSgpIHt9XG4gICAgcGF1c2UoKSB7fVxuICAgIHByZXZlbnREZWZhdWx0KCkge31cbiAgICByZXN1bWUoKSB7fVxuICAgIHN0b3BQcm9wYWdhdGlvbigpIHt9XG4gICAgXG5cbn0iLCJjb25zdCBfID0gcmVxdWlyZSgnbG9kYXNoJyk7XG5pbXBvcnQgeyBldmVudEZhY3RvcnkgfSBmcm9tICcuL2V2ZW50RmFjdG9yeSdcbmltcG9ydCB7IHN0dWJpZnlJbnN0YW5jZU9uRGVtYW5kIH0gZnJvbSAnLi9zaW5vbkhlbHBlcnMnXG5cbmNvbnN0IERlZmF1bHRDb21wb25lbnRBZGFwdGVyID0gJ2RlZmF1bHQnXG5jb25zdCBXZWxsS25vd25Db21wb25lbnRzID0gWydhdXJhOicsICdmb3JjZTonLCAnZm9yY2VDaGF0dGVyOicsICdsaWdodG5pbmc6JywgJ3VpOicsICdjOiddXG5cbmxldCBDb21wb25lbnRBZGFwdGVycyA9IHtcbiAgICBbRGVmYXVsdENvbXBvbmVudEFkYXB0ZXJdOiBpbnN0YW5jZSA9PiBpbnN0YW5jZVxufVxuXG5mdW5jdGlvbiBjb21wb25lbnRGYWN0b3J5Rm9yQXJyYXkocGFyYW1zLCBhcnJheU9mVHlwZXMpIHtcbiAgICByZXR1cm4gYXJyYXlPZlR5cGVzLm1hcCh0eXBlT3JDb21wb25lbnQgPT4gY29tcG9uZW50RmFjdG9yeShwYXJhbXMsIHR5cGVPckNvbXBvbmVudCkpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY29tcG9uZW50RmFjdG9yeShwYXJhbXMgPSB7fSwgdHlwZU9yQ29tcG9uZW50ID0gRGVmYXVsdENvbXBvbmVudEFkYXB0ZXIpIHtcbiAgICBpZiAoQXJyYXkuaXNBcnJheSh0eXBlT3JDb21wb25lbnQpKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignVW5leHBlY3RlZCB0eXBlIGFyZ3VtZW50JylcbiAgICB9XG5cbiAgICBpZiAodHlwZU9yQ29tcG9uZW50ID09PSB0cnVlKSB7XG4gICAgICAgIHR5cGVPckNvbXBvbmVudCA9IERlZmF1bHRDb21wb25lbnRBZGFwdGVyXG4gICAgfSBlbHNlIGlmICh0eXBlT3JDb21wb25lbnQgaW5zdGFuY2VvZiBDb21wb25lbnQpIHtcbiAgICAgICAgcmV0dXJuIHR5cGVPckNvbXBvbmVudDtcbiAgICB9IGVsc2UgaWYgKHR5cGVPckNvbXBvbmVudCA9PT0gbnVsbCkge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBsZXQgaW5zdGFuY2UgPSBzdHViaWZ5SW5zdGFuY2VPbkRlbWFuZChDb21wb25lbnQsIG5ldyBDb21wb25lbnQocGFyYW1zLCB0eXBlT3JDb21wb25lbnQpKTtcbiAgICBsZXQgYWRhcHRlck5hbWUgPSB0eXBlT3JDb21wb25lbnQudG9Mb3dlckNhc2UoKS5yZXBsYWNlKCdtYXJrdXA6Ly8nLCAnJylcbiAgICBsZXQgYWRhcHRlciA9IENvbXBvbmVudEFkYXB0ZXJzW2FkYXB0ZXJOYW1lXTtcbiAgICBpZiAoIWFkYXB0ZXIpIHtcbiAgICAgICAgaWYgKCFfLnNvbWUoV2VsbEtub3duQ29tcG9uZW50cywgbmFtZSA9PiBhZGFwdGVyTmFtZS5zdGFydHNXaXRoKG5hbWUpKSkge1xuICAgICAgICAgICAgLyplc2xpbnQgbm8tY29uc29sZTogMCovXG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYFVuYWJsZSB0byBmaW5kIGNvbXBvbmVudCBhZGFwdGVyICR7dHlwZU9yQ29tcG9uZW50fWApO1xuICAgICAgICB9XG4gICAgICAgIGFkYXB0ZXIgPSBDb21wb25lbnRBZGFwdGVyc1tEZWZhdWx0Q29tcG9uZW50QWRhcHRlcl07XG4gICAgfVxuICAgIHJldHVybiBhZGFwdGVyKGluc3RhbmNlLCBwYXJhbXMpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdXNlQ29tcG9uZW50QWRhcHRlcnMocmVnaXN0cmF0b3IpIHtcbiAgICBjb25zdCByZWdpc3RlciA9IChjb21wb25lbnRUeXBlLCBhZGFwdGVyKSA9PiB7XG4gICAgICAgIGNvbnN0IGFkYXB0ZXJOYW1lID0gY29tcG9uZW50VHlwZS50b0xvd2VyQ2FzZSgpO1xuICAgICAgICBDb21wb25lbnRBZGFwdGVyc1thZGFwdGVyTmFtZV0gPSBhZGFwdGVyXG4gICAgfVxuICAgIHJlZ2lzdHJhdG9yKHtyZWdpc3Rlcn0pO1xufVxuXG5jbGFzcyBDb21wb25lbnQge1xuICAgIGNvbnN0cnVjdG9yKHBhcmFtcywgdHlwZSkge1xuICAgICAgICB0aGlzLnBhcmFtcyA9IE9iamVjdC5hc3NpZ24oe30sIHtcbiAgICAgICAgICAgIGZpbmRNYXA6IHt9XG4gICAgICAgIH0sIHBhcmFtcyk7XG4gICAgICAgIHRoaXMudHlwZSA9IHR5cGUgfHwgJ2RlZmF1bHQnO1xuICAgICAgICAvL3N0dWJpZnlJbnN0YW5jZShDb21wb25lbnQsIHRoaXMpO1xuICAgIH1cbiAgICBnZXQobmFtZSkge1xuICAgICAgICBpZiAobmFtZS5zdGFydHNXaXRoKCd2LicpIHx8IG5hbWUuc3RhcnRzV2l0aCgnYy4nKSB8fCBuYW1lLnN0YXJ0c1dpdGgoJ2UuJykpIHtcbiAgICAgICAgICAgIG5hbWUgPSBuYW1lLnN1YnN0cmluZygyKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gXy5nZXQodGhpcy5wYXJhbXMsIG5hbWUpO1xuICAgIH1cbiAgICBzZXQobmFtZSwgdmFsdWUpIHtcbiAgICAgICAgaWYgKG5hbWUuc3RhcnRzV2l0aCgndi4nKSB8fCBuYW1lLnN0YXJ0c1dpdGgoJ2MuJykgfHwgbmFtZS5zdGFydHNXaXRoKCdlLicpKSB7XG4gICAgICAgICAgICBuYW1lID0gbmFtZS5zdWJzdHJpbmcoMik7XG4gICAgICAgIH1cbiAgICAgICAgXy5zZXQodGhpcy5wYXJhbXMsIG5hbWUsIHZhbHVlKTtcbiAgICB9XG4gICAgZmluZChuYW1lKSB7XG4gICAgICAgIGxldCB0eXBlT3JDb21wb25lbnQgPSB0aGlzLnBhcmFtcy5maW5kTWFwW25hbWVdO1xuICAgICAgICBpZiAoIXR5cGVPckNvbXBvbmVudCAmJiB0aGlzLnBhcmFtcy5maW5kTWFwLmhhc093blByb3BlcnR5KG5hbWUpKSB7XG4gICAgICAgICAgICByZXR1cm4gdHlwZU9yQ29tcG9uZW50O1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgY29tcG9uZW50ID0gdGhpcy5wYXJhbXMuZmluZE1hcFtuYW1lXSA9IChBcnJheS5pc0FycmF5KHR5cGVPckNvbXBvbmVudCkgPyBcbiAgICAgICAgICAgIGNvbXBvbmVudEZhY3RvcnlGb3JBcnJheSh0aGlzLnBhcmFtcywgdHlwZU9yQ29tcG9uZW50KSA6IFxuICAgICAgICAgICAgY29tcG9uZW50RmFjdG9yeSh0aGlzLnBhcmFtcywgdHlwZU9yQ29tcG9uZW50KSlcbiAgICAgICAgcmV0dXJuIGNvbXBvbmVudDtcbiAgICB9XG4gICAgZ2V0TG9jYWxJZCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucGFyYW1zWydhdXJhOmlkJ107XG4gICAgfVxuICAgIGNsZWFyUmVmZXJlbmNlKGtleSkge1xuICAgICAgICBkZWxldGUgdGhpcy5wYXJhbXNba2V5XTtcbiAgICB9XG4gICAgZ2V0Q29uY3JldGVDb21wb25lbnQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICBnZXRFbGVtZW50KCkge1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgZ2V0RWxlbWVudHMoKSB7XG4gICAgICAgIHJldHVybiBbdGhpc107XG4gICAgfVxuICAgIGdldEV2ZW50KG5hbWUpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucGFyYW1zW25hbWVdIHx8IGV2ZW50RmFjdG9yeSgpO1xuICAgIH1cbiAgICBnZXRHbG9iYWxJZCgpIHtcbiAgICAgICAgcmV0dXJuIGBnbG9iYWwtJHt0aGlzLnBhcmFtc1snYXVyYTppZCddfWA7XG4gICAgfVxuICAgIGdldE5hbWUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnR5cGU7XG4gICAgfVxuICAgIGdldFR5cGUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnR5cGU7XG4gICAgfVxuICAgIGdldFJlZmVyZW5jZShrZXkpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucGFyYW1zW2tleV07XG4gICAgfVxuICAgIGdldFN1cGVyKCkge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgZ2V0VmVyc2lvbigpIHtcbiAgICAgICAgcmV0dXJuICcxLjAnO1xuICAgIH1cbiAgICBpc0NvbmNyZXRlKCkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgaXNJbnN0YW5jZU9mKG5hbWUpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudHlwZSA9PT0gbmFtZTtcbiAgICB9XG4gICAgaXNWYWxpZCgpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIGFkZEV2ZW50SGFuZGxlcigpIHt9XG4gICAgYWRkSGFuZGxlcigpIHt9XG4gICAgYWRkVmFsdWVIYW5kbGVyKCkge31cbiAgICBhZGRWYWx1ZVByb3ZpZGVyKCkge31cbiAgICBhdXRvRGVzdHJveSgpIHt9XG4gICAgZGVzdHJveSgpIHt9XG4gICAgcmVtb3ZlRXZlbnRIYW5kbGVyKCkge31cblxufSIsImltcG9ydCB7IHN0dWJpZnlJbnN0YW5jZSB9IGZyb20gJy4vc2lub25IZWxwZXJzJ1xuXG5jb25zdCBjbGFzc05hbWVUb0NvbXBvbmVudFZhciA9IGNsYXNzTmFtZSA9PiBgdi5fX2Nsc18ke2NsYXNzTmFtZX1gXG5leHBvcnQgY2xhc3MgQXVyYVV0aWwge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBzdHViaWZ5SW5zdGFuY2UoQXVyYVV0aWwsIHRoaXMpO1xuICAgIH1cbiAgICBcbiAgICBpc0VtcHR5KG9iail7XG4gICAgICAgIGlmIChvYmogPT09IHVuZGVmaW5lZCB8fCBvYmogPT09IG51bGwgfHwgb2JqID09PSAnJykge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkob2JqKSkge1xuICAgICAgICAgICAgcmV0dXJuIG9iai5sZW5ndGggPT09IDA7XG4gICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIG9iaiA9PT0gJ29iamVjdCcgJiYgT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKG9iaikgPT09ICdbb2JqZWN0IE9iamVjdF0nKSB7XG4gICAgICAgICAgICByZXR1cm4gT2JqZWN0LmtleXMob2JqKS5sZW5ndGggPT09IDA7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBpc1VuZGVmaW5lZE9yTnVsbChvYmopIHtcbiAgICAgICAgcmV0dXJuIG9iaiA9PT0gdW5kZWZpbmVkIHx8IG9iaiA9PT0gbnVsbDtcbiAgICB9XG4gICAgYWRkQ2xhc3MoY29tcG9uZW50LCBjbGFzc05hbWUpIHtcbiAgICAgICAgcmV0dXJuIGNvbXBvbmVudC5zZXQoY2xhc3NOYW1lVG9Db21wb25lbnRWYXIoY2xhc3NOYW1lKSwgdHJ1ZSk7XG4gICAgfVxuICAgIHJlbW92ZUNsYXNzKGNvbXBvbmVudCwgY2xhc3NOYW1lKSB7XG4gICAgICAgIHJldHVybiBjb21wb25lbnQuc2V0KGNsYXNzTmFtZVRvQ29tcG9uZW50VmFyKGNsYXNzTmFtZSksIGZhbHNlKTtcbiAgICB9XG4gICAgaGFzQ2xhc3MoY29tcG9uZW50LCBjbGFzc05hbWUpIHtcbiAgICAgICAgcmV0dXJuIGNvbXBvbmVudC5nZXQoY2xhc3NOYW1lVG9Db21wb25lbnRWYXIoY2xhc3NOYW1lKSk7XG4gICAgfVxuICAgIHRvZ2dsZUNsYXNzKGNvbXBvbmVudCwgY2xhc3NOYW1lKSB7XG4gICAgICAgIGNvbXBvbmVudC5zZXQoY2xhc3NOYW1lVG9Db21wb25lbnRWYXIoY2xhc3NOYW1lKSwgIWNvbXBvbmVudC5nZXQoY2xhc3NOYW1lVG9Db21wb25lbnRWYXIoY2xhc3NOYW1lKSkpO1xuICAgIH1cbiAgICBnZXRCb29sZWFuVmFsdWUodmFsKSB7XG4gICAgICAgIC8vIFBvcnRlZDogaHR0cHM6Ly9naXRodWIuY29tL2ZvcmNlZG90Y29tL2F1cmEvYmxvYi9tYXN0ZXIvYXVyYS1pbXBsL3NyYy9tYWluL3Jlc291cmNlcy9hdXJhL3V0aWwvVXRpbC5qcyNMMzY2XG4gICAgICAgIHJldHVybiB2YWwgIT09IHVuZGVmaW5lZCAmJiB2YWwgIT09IG51bGwgJiYgdmFsICE9PSBmYWxzZSAmJiB2YWwgIT09IDAgJiYgdmFsICE9PSAnZmFsc2UnICYmIHZhbCAhPT0gJycgJiYgdmFsICE9PSAnZic7XG4gICAgfVxuICAgIGlzQXJyYXkoYXJyKSB7XG4gICAgICAgIC8vIFBvcnRlZDogaHR0cHM6Ly9naXRodWIuY29tL2ZvcmNlZG90Y29tL2F1cmEvYmxvYi9tYXN0ZXIvYXVyYS1pbXBsL3NyYy9tYWluL3Jlc291cmNlcy9hdXJhL3V0aWwvVXRpbC5qcyNMMTg5XG4gICAgICAgIHJldHVybiAodHlwZW9mIEFycmF5LmlzQXJyYXkgPT09IFwiZnVuY3Rpb25cIiA/IEFycmF5LmlzQXJyYXkgOiBmdW5jdGlvbihhcmcpIHtcbiAgICAgICAgICAgIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoYXJnKSA9PT0gJ1tvYmplY3QgQXJyYXldJztcbiAgICAgICAgfSkoYXJyKTtcbiAgICB9XG4gICAgaXNPYmplY3Qob2JqKSB7XG4gICAgICAgIC8vUG9ydGVkOiBodHRwczovL2dpdGh1Yi5jb20vZm9yY2Vkb3Rjb20vYXVyYS9ibG9iL21hc3Rlci9hdXJhLWltcGwvc3JjL21haW4vcmVzb3VyY2VzL2F1cmEvdXRpbC9VdGlsLmpzI0wyMDRcbiAgICAgICAgcmV0dXJuIHR5cGVvZiBvYmogPT09IFwib2JqZWN0XCIgJiYgb2JqICE9PSBudWxsICYmICFBcnJheS5pc0FycmF5KG9iaik7XG4gICAgfVxuICAgIGlzVW5kZWZpbmVkKG9iail7XG4gICAgICAgIC8vUG9ydGVkOiBodHRwczovL2dpdGh1Yi5jb20vZm9yY2Vkb3Rjb20vYXVyYS9ibG9iL21hc3Rlci9hdXJhLWltcGwvc3JjL21haW4vcmVzb3VyY2VzL2F1cmEvdXRpbC9VdGlsLmpzI0wzMTlcbiAgICAgICAgcmV0dXJuIG9iaiA9PT0gdW5kZWZpbmVkO1xuICAgIH1cbn1cblxuIiwiaW1wb3J0IHsgc3R1YmlmeUluc3RhbmNlIH0gZnJvbSAnLi9zaW5vbkhlbHBlcnMnXG5pbXBvcnQgeyBBdXJhVXRpbCB9IGZyb20gJy4vYXVyYVV0aWwnXG5cbmV4cG9ydCBmdW5jdGlvbiBhdXJhRmFjdG9yeShwYXJhbXMgPSB7fSkge1xuICAgIHJldHVybiBuZXcgQXVyYShwYXJhbXMpO1xufVxuXG5pbXBvcnQgeyBjb21wb25lbnRGYWN0b3J5IH0gZnJvbSAnLi9jb21wb25lbnRGYWN0b3J5J1xuXG5jbGFzcyBBdXJhIHtcbiAgICBjb25zdHJ1Y3RvcihwYXJhbXMpIHtcbiAgICAgICAgdGhpcy5wYXJhbXMgPSBwYXJhbXM7XG4gICAgICAgIHRoaXMudXRpbCA9IG5ldyBBdXJhVXRpbCgpO1xuICAgICAgICBzdHViaWZ5SW5zdGFuY2UoQXVyYSwgdGhpcyk7XG4gICAgfVxuICAgIFxuICAgIHNldFBhcmFtcyhwYXJhbXMpIHtcbiAgICAgICAgT2JqZWN0LmFzc2lnbih0aGlzLnBhcmFtcywgcGFyYW1zKTtcbiAgICB9XG5cbiAgICBnZXQobmFtZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5wYXJhbXNbbmFtZV07XG4gICAgfVxuXG4gICAgc2V0KG5hbWUsIHZhbHVlKSB7XG4gICAgICAgIHRoaXMucGFyYW1zW25hbWVdID0gdmFsdWU7XG4gICAgfVxuICAgIFxuICAgIGVucXVldWVBY3Rpb24oYWN0aW9uKSB7XG4gICAgICAgIGFjdGlvbiAmJiBhY3Rpb24uaW52b2tlQ2FsbGJhY2sgJiYgYWN0aW9uLmludm9rZUNhbGxiYWNrKHRydWUpXG4gICAgfVxuXG4gICAgY3JlYXRlQ29tcG9uZW50KHR5cGUsIGF0dHJpYnV0ZXMsIGNhbGxiYWNrKSB7XG4gICAgICAgIHRoaXMuY3JlYXRlQ29tcG9uZW50LnR5cGUgPSB0eXBlO1xuICAgICAgICB0aGlzLmNyZWF0ZUNvbXBvbmVudC5hdHRyaWJ1dGVzID0gYXR0cmlidXRlcztcbiAgICAgICAgLy8gR2V0IGNvbXBvbmVudCBpbnN0YW5jZS5cbiAgICAgICAgLy8gVXNlIGV4aXN0aW5nIGNvbXBvbmVudCBpbnN0YW5jZSBpZiBzZXRcbiAgICAgICAgLy8gQ3JlYXRlIG5ldyBkZWZhdWx0IGNvbXBvbmVudCBpZiBjb21wb25lbnQgbm90IHNldFxuICAgICAgICBsZXQgeyBjb21wb25lbnQgfSA9IHRoaXMuY3JlYXRlQ29tcG9uZW50O1xuICAgICAgICBpZiAoIWNvbXBvbmVudCkge1xuICAgICAgICAgICAgY29tcG9uZW50ID0gbmV3IGNvbXBvbmVudEZhY3RvcnkoYXR0cmlidXRlcywgdHlwZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmNyZWF0ZUNvbXBvbmVudC5jb21wb25lbnQgPSBudWxsO1xuICAgICAgICB9XG4gICAgICAgIGlmIChjYWxsYmFjaykge1xuICAgICAgICAgICAgY2FsbGJhY2soY29tcG9uZW50LCAnU1VDQ0VTUycsIFsnU1VDQ0VTUyddKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gY29tcG9uZW50O1xuICAgIH1cbiAgICBjcmVhdGVDb21wb25lbnRzKGNvbXBvbmVudERlZnMsIGNhbGxiYWNrKSB7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGNvbXBvbmVudERlZnNcbiAgICAgICAgICAgIC5tYXAoZGVmID0+IHRoaXMuY3JlYXRlQ29tcG9uZW50KGRlZlswXSwgZGVmWzFdKSlcbiAgICAgICAgaWYgKGNhbGxiYWNrKSB7XG4gICAgICAgICAgICBjYWxsYmFjayhyZXN1bHQsICdTVUNDRVNTJywgcmVzdWx0Lm1hcCggKCkgPT4gJ1NVQ0NFU1MnKSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG4gICAgZ2V0Q2FsbGJhY2soY2FsbGJhY2spIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKC4uLmFyZ3MpIHtcbiAgICAgICAgICAgIGNhbGxiYWNrICYmIGNhbGxiYWNrKC4uLmFyZ3MpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGdldENvbXBvbmVudChpZCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wYXJhbXNbaWRdO1xuICAgIH1cbiAgICBnZXRSZWZlcmVuY2UoKSB7fVxuICAgIGdldFJvb3QoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnJvb3RDb21wb25lbnQgfHwgKHRoaXMucm9vdENvbXBvbmVudCA9IG5ldyBjb21wb25lbnRGYWN0b3J5KCkpO1xuICAgIH1cbiAgICBnZXRUb2tlbihuYW1lKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnBhcmFtc1sndG9rZW4uJyArIG5hbWVdXG4gICAgfVxuICAgIGxvZyh2YWx1ZSwgZXJyKSB7XG4gICAgICAgIC8qZXNsaW50IG5vLWNvbnNvbGU6IDAqL1xuICAgICAgICBjb25zb2xlICYmIGNvbnNvbGUubG9nKHZhbHVlLCBlcnIpXG4gICAgfVxuICAgIHJlcG9ydEVycm9yKCkge31cbn0iLCJpbXBvcnQgeyBzdHViaWZ5SW5zdGFuY2VPbkRlbWFuZCB9IGZyb20gJy4vc2lub25IZWxwZXJzJ1xuXG5leHBvcnQgZnVuY3Rpb24gYXBleENhbGxGYWN0b3J5KHBhcmFtcyA9IHt9KSB7XG4gICAgcmV0dXJuIHN0dWJpZnlJbnN0YW5jZU9uRGVtYW5kKEFwZXhDYWxsLCBuZXcgQXBleENhbGwocGFyYW1zKSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBhcGV4U3VjY2Vzc1Jlc3VsdChyZXNwb25zZSA9IHt9KSB7XG4gICAgcmV0dXJuIHN0dWJpZnlJbnN0YW5jZU9uRGVtYW5kKEFwZXhDYWxsUmVzdWx0LCBuZXcgQXBleENhbGxSZXN1bHQocmVzcG9uc2UpKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGFwZXhFcnJvclJlc3VsdChtZXNzYWdlKSB7XG4gICAgcmV0dXJuIHN0dWJpZnlJbnN0YW5jZU9uRGVtYW5kKEFwZXhDYWxsUmVzdWx0LCBuZXcgQXBleENhbGxSZXN1bHQobnVsbCwgbWVzc2FnZSkpO1xufVxuXG5jbGFzcyBBcGV4Q2FsbCB7XG4gICAgY29uc3RydWN0b3IocmVzdWx0LCBpbnZva2VDYWxsYmFja09uRW5xdWV1ZSA9IHRydWUpIHtcbiAgICAgICAgdGhpcy5wYXJhbXMgPSBudWxsO1xuICAgICAgICB0aGlzLnJlc3VsdCA9IHJlc3VsdDtcbiAgICAgICAgdGhpcy5pbnZva2VDYWxsYmFja09uRW5xdWV1ZSA9IGludm9rZUNhbGxiYWNrT25FbnF1ZXVlO1xuICAgICAgICB0aGlzLmlzQmFja2dyb3VuZCA9IGZhbHNlO1xuICAgICAgICB0aGlzLnNldEFib3J0YWJsZSA9IGZhbHNlO1xuICAgIH1cbiAgICBzZXRQYXJhbXMocGFyYW1zKSB7XG4gICAgICAgIHRoaXMucGFyYW1zID0gcGFyYW1zO1xuICAgIH1cbiAgICBzZXRQYXJhbShrZXksIHZhbHVlKSB7XG4gICAgICAgIHRoaXMucGFyYW1zID0gT2JqZWN0LmFzc2lnbih0aGlzLnBhcmFtcywge1trZXldIDogdmFsdWV9KTtcbiAgICB9XG4gICAgZ2V0UGFyYW1zKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wYXJhbXM7XG4gICAgfVxuICAgIHNldENhbGxiYWNrKGN0eCwgY2FsbGJhY2spIHtcbiAgICAgICAgdGhpcy5jdHggPSBjdHg7XG4gICAgICAgIHRoaXMuY2FsbGJhY2sgPSBjYWxsYmFjaztcbiAgICB9XG4gICAgaW52b2tlQ2FsbGJhY2soZnJvbUVucXVldWUgPSBmYWxzZSkge1xuICAgICAgICBpZiAoZnJvbUVucXVldWUgJiYgIXRoaXMuaW52b2tlQ2FsbGJhY2tPbkVucXVldWUpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmNhbGxiYWNrICYmIHRoaXMuY2FsbGJhY2suYmluZCh0aGlzLmN0eCkodGhpcy5yZXN1bHQpO1xuICAgIH1cbiAgICBnZXRFcnJvcigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucmVzdWx0LmdldEVycm9yKCk7XG4gICAgfVxuICAgIGdldFBhcmFtKG5hbWUpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucGFyYW1zID8gdGhpcy5wYXJhbXNbbmFtZV0gOiBudWxsO1xuICAgIH1cbiAgICBnZXRSZXR1cm5WYWx1ZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucmVzdWx0O1xuICAgIH1cbiAgICBnZXRTdGF0ZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucmVzdWx0LmdldFN0YXRlKCk7XG4gICAgfVxuICAgIGlzQmFja2dyb3VuZCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaXNCYWNrZ3JvdW5kO1xuICAgIH1cbiAgICBzZXRBYm9ydGFibGUoKSB7XG4gICAgfVxuICAgIHNldEJhY2tncm91bmQoKSB7XG4gICAgICAgIHRoaXMuaXNCYWNrZ3JvdW5kID0gdHJ1ZTtcbiAgICB9XG4gICAgc2V0U3RvcmFibGUoKSB7XG4gICAgfVxufVxuXG5jbGFzcyBBcGV4Q2FsbFJlc3VsdCB7XG4gICAgY29uc3RydWN0b3IocmVzcG9uc2UsIGVycm9yTWVzc2FnZSA9IG51bGwpIHtcbiAgICAgICAgdGhpcy5yZXNwb25zZSA9IHJlc3BvbnNlO1xuICAgICAgICB0aGlzLmVycm9yTWVzc2FnZSA9IGVycm9yTWVzc2FnZTtcbiAgICB9XG4gICAgZ2V0U3RhdGUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmVycm9yTWVzc2FnZSA/ICdFUlJPUicgOiAnU1VDQ0VTUydcbiAgICB9XG4gICAgZ2V0RXJyb3IoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmVycm9yTWVzc2FnZSA/IFt7bWVzc2FnZTogdGhpcy5lcnJvck1lc3NhZ2V9XSA6IFtdXG4gICAgfVxuICAgIGdldFJldHVyblZhbHVlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5yZXNwb25zZTtcbiAgICB9XG59IiwiaW1wb3J0IHsgZXZlbnRGYWN0b3J5IH0gZnJvbSAnLi9ldmVudEZhY3RvcnknXG5pbXBvcnQgeyBjb21wb25lbnRGYWN0b3J5LCB1c2VDb21wb25lbnRBZGFwdGVycyB9IGZyb20gJy4vY29tcG9uZW50RmFjdG9yeSdcbmltcG9ydCB7IGF1cmFGYWN0b3J5IH0gZnJvbSAnLi9hdXJhRmFjdG9yeSdcbmltcG9ydCB7IEF1cmFVdGlsIH0gZnJvbSAnLi9hdXJhVXRpbCdcbmltcG9ydCB7IGFwZXhDYWxsRmFjdG9yeSwgYXBleFN1Y2Nlc3NSZXN1bHQsIGFwZXhFcnJvclJlc3VsdCB9IGZyb20gJy4vYXBleENhbGxGYWN0b3J5J1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBBdXJhVXRpbCxcbiAgICBldmVudEZhY3RvcnksXG4gICAgY29tcG9uZW50RmFjdG9yeSxcbiAgICB1c2VDb21wb25lbnRBZGFwdGVycyxcbiAgICBhdXJhRmFjdG9yeSxcbiAgICBhcGV4Q2FsbEZhY3RvcnksXG4gICAgYXBleFN1Y2Nlc3NSZXN1bHQsXG4gICAgYXBleEVycm9yUmVzdWx0XG59Il0sIm5hbWVzIjpbInNpbm9uIiwicmVxdWlyZSIsInN0dWJpZnlJbnN0YW5jZSIsImN0b3IiLCJpbnN0YW5jZSIsImdldE93blByb3BlcnR5TmFtZXMiLCJwcm90b3R5cGUiLCJmb3JFYWNoIiwicHJvcCIsInN0dWIiLCJjYWxsc0Zha2UiLCJwcm9wTmFtZSIsImFyZ3MiLCJjYWxsIiwic3R1YmlmeUluc3RhbmNlT25EZW1hbmQiLCJoYW5kbGVyIiwidGFyZ2V0IiwicHJvcGVydHkiLCJkZXNjcmlwdG9yIiwiX2luc3RhbmNlUHJvcHMiLCJwcm9wS2V5IiwidmFsdWUiLCJ3YXJuIiwic3R1Yk5hbWUiLCJpc1NweU9yU3R1YmJlZCIsImNhbGxlZEJlZm9yZSIsImhhc09uUHJvdG8iLCJwcm94eSIsIlByb3h5IiwiZXZlbnRGYWN0b3J5IiwicGFyYW1zIiwiRXZlbnQiLCJGQUtFX0VWRU5UX05BTUUiLCJrZXkiLCJldmVudE5hbWUiLCJuYW1lIiwiXyIsIkRlZmF1bHRDb21wb25lbnRBZGFwdGVyIiwiV2VsbEtub3duQ29tcG9uZW50cyIsIkNvbXBvbmVudEFkYXB0ZXJzIiwiY29tcG9uZW50RmFjdG9yeUZvckFycmF5IiwiYXJyYXlPZlR5cGVzIiwibWFwIiwiY29tcG9uZW50RmFjdG9yeSIsInR5cGVPckNvbXBvbmVudCIsIkFycmF5IiwiaXNBcnJheSIsIkVycm9yIiwiQ29tcG9uZW50IiwiYWRhcHRlck5hbWUiLCJ0b0xvd2VyQ2FzZSIsInJlcGxhY2UiLCJhZGFwdGVyIiwic29tZSIsInN0YXJ0c1dpdGgiLCJ1c2VDb21wb25lbnRBZGFwdGVycyIsInJlZ2lzdHJhdG9yIiwicmVnaXN0ZXIiLCJjb21wb25lbnRUeXBlIiwidHlwZSIsIk9iamVjdCIsImFzc2lnbiIsInN1YnN0cmluZyIsImdldCIsInNldCIsImZpbmRNYXAiLCJoYXNPd25Qcm9wZXJ0eSIsImNvbXBvbmVudCIsImNsYXNzTmFtZVRvQ29tcG9uZW50VmFyIiwiY2xhc3NOYW1lIiwiQXVyYVV0aWwiLCJvYmoiLCJ1bmRlZmluZWQiLCJsZW5ndGgiLCJ0b1N0cmluZyIsImtleXMiLCJ2YWwiLCJhcnIiLCJhcmciLCJhdXJhRmFjdG9yeSIsIkF1cmEiLCJ1dGlsIiwiYWN0aW9uIiwiaW52b2tlQ2FsbGJhY2siLCJhdHRyaWJ1dGVzIiwiY2FsbGJhY2siLCJjcmVhdGVDb21wb25lbnQiLCJjb21wb25lbnREZWZzIiwicmVzdWx0IiwiZGVmIiwiaWQiLCJyb290Q29tcG9uZW50IiwiZXJyIiwiY29uc29sZSIsImxvZyIsImFwZXhDYWxsRmFjdG9yeSIsIkFwZXhDYWxsIiwiYXBleFN1Y2Nlc3NSZXN1bHQiLCJyZXNwb25zZSIsIkFwZXhDYWxsUmVzdWx0IiwiYXBleEVycm9yUmVzdWx0IiwibWVzc2FnZSIsImludm9rZUNhbGxiYWNrT25FbnF1ZXVlIiwiaXNCYWNrZ3JvdW5kIiwic2V0QWJvcnRhYmxlIiwiY3R4IiwiZnJvbUVucXVldWUiLCJiaW5kIiwiZ2V0RXJyb3IiLCJnZXRTdGF0ZSIsImVycm9yTWVzc2FnZSIsIm1vZHVsZSIsImV4cG9ydHMiXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0EsSUFBTUEsUUFBUUMsUUFBUSxPQUFSLENBQWQ7O0FBRUEsQUFBTyxTQUFTQyxlQUFULENBQXlCQyxJQUF6QixFQUErQkMsUUFBL0IsRUFBeUM7V0FDckNDLG1CQUFQLENBQTJCRixLQUFLRyxTQUFoQyxFQUEyQ0MsT0FBM0MsQ0FBbUQsZ0JBQVE7WUFDbkQsT0FBT0osS0FBS0csU0FBTCxDQUFlRSxJQUFmLENBQVAsS0FBZ0MsVUFBaEMsSUFBOENBLFNBQVMsYUFBM0QsRUFBMEU7OztpQkFHakUsVUFBVUEsSUFBbkIsSUFBMkJSLE1BQU1TLElBQU4sQ0FBV0wsUUFBWCxFQUFxQkksSUFBckIsRUFBMkJFLFNBQTNCLENBQXNDLFVBQUNDLFFBQUQ7bUJBQWMsWUFBYTs7O2tEQUFUQyxJQUFTO3dCQUFBOzs7dUJBQ2pGLDhCQUFLTixT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
