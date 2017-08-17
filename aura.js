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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXVyYS5qcyIsInNvdXJjZXMiOlsibGliL3Npbm9uSGVscGVycy5qcyIsImxpYi9ldmVudEZhY3RvcnkuanMiLCJsaWIvY29tcG9uZW50RmFjdG9yeS5qcyIsImxpYi9hdXJhVXRpbC5qcyIsImxpYi9hdXJhRmFjdG9yeS5qcyIsImxpYi9hcGV4Q2FsbEZhY3RvcnkuanMiLCJsaWIvYXVyYS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKmdsb2JhbCBQcm94eSovXG5jb25zdCBzaW5vbiA9IHJlcXVpcmUoJ3Npbm9uJyk7XG5cbmV4cG9ydCBmdW5jdGlvbiBzdHViaWZ5SW5zdGFuY2UoY3RvciwgaW5zdGFuY2UsIHBhcmFtcykge1xuICAgIGNvbnN0IHByb3BFeGNsdWRlZCA9IChwcm9wKSA9PiBwYXJhbXMgJiYgcGFyYW1zLmRvTm90TW9jayAmJiAoQXJyYXkuaXNBcnJheShwYXJhbXMuZG9Ob3RNb2NrKSA/IFxuICAgICAgICBwYXJhbXMuZG9Ob3RNb2NrLmluZGV4T2YocHJvcCkgIT09IC0xIDogcGFyYW1zLmRvTm90TW9jayA9PT0gcHJvcCk7XG5cbiAgICBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyhjdG9yLnByb3RvdHlwZSkuZm9yRWFjaChwcm9wID0+IHtcbiAgICAgICAgaWYgKHByb3BFeGNsdWRlZChwcm9wKSB8fCB0eXBlb2YgY3Rvci5wcm90b3R5cGVbcHJvcF0gIT09ICdmdW5jdGlvbicgfHwgcHJvcCA9PT0gJ2NvbnN0cnVjdG9yJykge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGluc3RhbmNlWydzdHViXycgKyBwcm9wXSA9IHNpbm9uLnN0dWIoaW5zdGFuY2UsIHByb3ApLmNhbGxzRmFrZSgoKHByb3BOYW1lKSA9PiAoLi4uYXJncykgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIGN0b3IucHJvdG90eXBlW3Byb3BOYW1lXS5jYWxsKGluc3RhbmNlLCAuLi5hcmdzKTtcbiAgICAgICAgfSkocHJvcCkpXG4gICAgfSlcbiAgICByZXR1cm4gaW5zdGFuY2U7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzdHViaWZ5SW5zdGFuY2VPbkRlbWFuZChjdG9yLCBpbnN0YW5jZSkge1xuICAgIGNvbnN0IGhhbmRsZXIgPSB7XG4gICAgICAgIF9pbnN0YW5jZVByb3BzOiB7fSxcbiAgICAgICAgZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBwcm9wZXJ0eSwgZGVzY3JpcHRvcikge1xuICAgICAgICAgICAgaGFuZGxlci5faW5zdGFuY2VQcm9wc1twcm9wZXJ0eV0gPSBkZXNjcmlwdG9yO1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH0sXG4gICAgICAgIGdldCh0YXJnZXQsIHByb3BLZXkpIHtcbiAgICAgICAgICAgIC8vIENoZWNrIGZvciBTeW1ib2wgZm9yIGl0ZXJhdG9yc1xuICAgICAgICAgICAgaWYgKHR5cGVvZiBwcm9wS2V5ICE9PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgICAgIHJldHVybiB0YXJnZXRbcHJvcEtleV07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBJZiB3ZSBhZGQgc29tZSBwcm9wcyB0byB0aGUgaW5zdGFuY2UsIHJldHVybiBpdCB3L28gbW9ja2luZ1xuICAgICAgICAgICAgLy8gVXN1YWxseSBhZGRlZCBzdHVmZiBpcyBtb2NrZWQgdGhyb3VnaCBkYXRhIGFkYXB0ZXJzXG4gICAgICAgICAgICBpZiAoaGFuZGxlci5faW5zdGFuY2VQcm9wc1twcm9wS2V5XSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBoYW5kbGVyLl9pbnN0YW5jZVByb3BzW3Byb3BLZXldLnZhbHVlXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vV2FybiBvbiB1bmtub3duIHByb3BLZXkgZm9yIGJldHRlciBkZWJ1Z2dpbmdcbiAgICAgICAgICAgIGlmICghdGFyZ2V0W3Byb3BLZXldKSB7XG4gICAgICAgICAgICAgICAgLyplc2xpbnQgbm8tY29uc29sZTogMCovXG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCdcXG5cXG5zdHViaWZ5SW5zdGFuY2VPbkRlbWFuZDogVW5rbm93biBwcm9wZXJ0eSAnICsgcHJvcEtleSwgJ1xcblxcbicpO1xuICAgICAgICAgICAgICAgIHJldHVybiB0YXJnZXRbcHJvcEtleV07XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIFN0dWIgbWV0aG9kcyB0aGF0IGRlZmluZWQgb24gcHJvdG90eXBlIG9ubHksIGUuZy4gaGFzIHB1YmxpYyBhcGlcbiAgICAgICAgICAgIGNvbnN0IHN0dWJOYW1lID0gJ3N0dWJfJyArIHByb3BLZXk7XG4gICAgICAgICAgICBjb25zdCBpc1NweU9yU3R1YmJlZCA9ICEhKHRhcmdldFtwcm9wS2V5XSAmJiB0YXJnZXRbcHJvcEtleV0uY2FsbGVkQmVmb3JlKTtcbiAgICAgICAgICAgIGNvbnN0IGhhc09uUHJvdG8gPSAhIWN0b3IucHJvdG90eXBlW3Byb3BLZXldO1xuXG4gICAgICAgICAgICBpZiAoaGFzT25Qcm90byAmJiAhaXNTcHlPclN0dWJiZWQgJiYgdHlwZW9mIHRhcmdldFtwcm9wS2V5XSA9PT0gJ2Z1bmN0aW9uJyAmJiBwcm9wS2V5ICE9PSAnY29uc3RydWN0b3InKSB7XG4gICAgICAgICAgICAgICAgdGFyZ2V0W3N0dWJOYW1lXSA9IHNpbm9uLnN0dWIodGFyZ2V0LCBwcm9wS2V5KS5jYWxsc0Zha2UoKC4uLmFyZ3MpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGN0b3IucHJvdG90eXBlW3Byb3BLZXldLmNhbGwoaW5zdGFuY2UsIC4uLmFyZ3MpO1xuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gdGFyZ2V0W3Byb3BLZXldO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgY29uc3QgcHJveHkgPSBuZXcgUHJveHkoaW5zdGFuY2UsIGhhbmRsZXIpO1xuICAgIHJldHVybiBwcm94eTtcbn0iLCJpbXBvcnQgeyBzdHViaWZ5SW5zdGFuY2VPbkRlbWFuZCB9IGZyb20gJy4vc2lub25IZWxwZXJzJ1xuXG5leHBvcnQgZnVuY3Rpb24gZXZlbnRGYWN0b3J5KHBhcmFtcyA9IHt9KSB7XG4gICAgcmV0dXJuIHN0dWJpZnlJbnN0YW5jZU9uRGVtYW5kKEV2ZW50LCBuZXcgRXZlbnQocGFyYW1zKSk7XG59XG5jb25zdCBGQUtFX0VWRU5UX05BTUUgPSAnbW9jaGEtYXVyYS1mYWtlLWV2ZW50J1xuXG5jbGFzcyBFdmVudCB7XG4gICAgY29uc3RydWN0b3IocGFyYW1zKSB7XG4gICAgICAgIHRoaXMucGFyYW1zID0gcGFyYW1zIHx8IHt9O1xuICAgIH1cbiAgICBzZXRQYXJhbXMocGFyYW1zKSB7XG4gICAgICAgIHRoaXMucGFyYW1zID0gcGFyYW1zO1xuICAgIH1cbiAgICBzZXRQYXJhbShrZXksIHZhbHVlKSB7XG4gICAgICAgIHRoaXMucGFyYW1zW2tleV0gPSB2YWx1ZTtcbiAgICB9XG4gICAgZ2V0UGFyYW1zKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wYXJhbXM7XG4gICAgfVxuICAgIGdldEV2ZW50VHlwZSgpIHtcbiAgICAgICAgcmV0dXJuICdBUFBMSUNBVElPTidcbiAgICB9XG4gICAgZ2V0TmFtZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucGFyYW1zLmV2ZW50TmFtZSB8fCBGQUtFX0VWRU5UX05BTUVcbiAgICB9XG4gICAgZ2V0UGFyYW0obmFtZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5wYXJhbXNbbmFtZV1cbiAgICB9XG4gICAgZ2V0UGhhc2UoKSB7XG4gICAgICAgIHJldHVybiAnZGVmYXVsdCdcbiAgICB9XG4gICAgZ2V0U291cmNlKCkge1xuICAgICAgICByZXR1cm4gbnVsbFxuICAgIH1cbiAgICBnZXRUeXBlKCkge1xuICAgICAgICByZXR1cm4gYGM6JHtGQUtFX0VWRU5UX05BTUV9YFxuICAgIH1cbiAgICBmaXJlKCkge31cbiAgICBwYXVzZSgpIHt9XG4gICAgcHJldmVudERlZmF1bHQoKSB7fVxuICAgIHJlc3VtZSgpIHt9XG4gICAgc3RvcFByb3BhZ2F0aW9uKCkge31cbiAgICBcblxufSIsImNvbnN0IF8gPSByZXF1aXJlKCdsb2Rhc2gnKTtcbmltcG9ydCB7IGV2ZW50RmFjdG9yeSB9IGZyb20gJy4vZXZlbnRGYWN0b3J5J1xuaW1wb3J0IHsgc3R1YmlmeUluc3RhbmNlT25EZW1hbmQgfSBmcm9tICcuL3Npbm9uSGVscGVycydcblxuY29uc3QgRGVmYXVsdENvbXBvbmVudEFkYXB0ZXIgPSAnZGVmYXVsdCdcbmNvbnN0IFdlbGxLbm93bkNvbXBvbmVudHMgPSBbJ2F1cmE6JywgJ2ZvcmNlOicsICdmb3JjZUNoYXR0ZXI6JywgJ2xpZ2h0bmluZzonLCAndWk6JywgJ2M6J11cblxubGV0IENvbXBvbmVudEFkYXB0ZXJzID0ge1xuICAgIFtEZWZhdWx0Q29tcG9uZW50QWRhcHRlcl06IGluc3RhbmNlID0+IGluc3RhbmNlXG59XG5cbmZ1bmN0aW9uIGNvbXBvbmVudEZhY3RvcnlGb3JBcnJheShwYXJhbXMsIGFycmF5T2ZUeXBlcykge1xuICAgIHJldHVybiBhcnJheU9mVHlwZXMubWFwKHR5cGVPckNvbXBvbmVudCA9PiBjb21wb25lbnRGYWN0b3J5KHBhcmFtcywgdHlwZU9yQ29tcG9uZW50KSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjb21wb25lbnRGYWN0b3J5KHBhcmFtcyA9IHt9LCB0eXBlT3JDb21wb25lbnQgPSBEZWZhdWx0Q29tcG9uZW50QWRhcHRlcikge1xuICAgIGlmIChBcnJheS5pc0FycmF5KHR5cGVPckNvbXBvbmVudCkpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdVbmV4cGVjdGVkIHR5cGUgYXJndW1lbnQnKVxuICAgIH1cblxuICAgIGlmICh0eXBlT3JDb21wb25lbnQgPT09IHRydWUpIHtcbiAgICAgICAgdHlwZU9yQ29tcG9uZW50ID0gRGVmYXVsdENvbXBvbmVudEFkYXB0ZXJcbiAgICB9IGVsc2UgaWYgKHR5cGVPckNvbXBvbmVudCBpbnN0YW5jZW9mIENvbXBvbmVudCkge1xuICAgICAgICByZXR1cm4gdHlwZU9yQ29tcG9uZW50O1xuICAgIH0gZWxzZSBpZiAodHlwZU9yQ29tcG9uZW50ID09PSBudWxsKSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIGxldCBpbnN0YW5jZSA9IHN0dWJpZnlJbnN0YW5jZU9uRGVtYW5kKENvbXBvbmVudCwgbmV3IENvbXBvbmVudChwYXJhbXMsIHR5cGVPckNvbXBvbmVudCkpO1xuICAgIGxldCBhZGFwdGVyTmFtZSA9IHR5cGVPckNvbXBvbmVudC50b0xvd2VyQ2FzZSgpLnJlcGxhY2UoJ21hcmt1cDovLycsICcnKVxuICAgIGxldCBhZGFwdGVyID0gQ29tcG9uZW50QWRhcHRlcnNbYWRhcHRlck5hbWVdO1xuICAgIGlmICghYWRhcHRlcikge1xuICAgICAgICBpZiAoIV8uc29tZShXZWxsS25vd25Db21wb25lbnRzLCBuYW1lID0+IGFkYXB0ZXJOYW1lLnN0YXJ0c1dpdGgobmFtZSkpKSB7XG4gICAgICAgICAgICAvKmVzbGludCBuby1jb25zb2xlOiAwKi9cbiAgICAgICAgICAgIGNvbnNvbGUud2FybihgVW5hYmxlIHRvIGZpbmQgY29tcG9uZW50IGFkYXB0ZXIgJHt0eXBlT3JDb21wb25lbnR9YCk7XG4gICAgICAgIH1cbiAgICAgICAgYWRhcHRlciA9IENvbXBvbmVudEFkYXB0ZXJzW0RlZmF1bHRDb21wb25lbnRBZGFwdGVyXTtcbiAgICB9XG4gICAgcmV0dXJuIGFkYXB0ZXIoaW5zdGFuY2UsIHBhcmFtcyk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB1c2VDb21wb25lbnRBZGFwdGVycyhyZWdpc3RyYXRvcikge1xuICAgIGNvbnN0IHJlZ2lzdGVyID0gKGNvbXBvbmVudFR5cGUsIGFkYXB0ZXIpID0+IHtcbiAgICAgICAgY29uc3QgYWRhcHRlck5hbWUgPSBjb21wb25lbnRUeXBlLnRvTG93ZXJDYXNlKCk7XG4gICAgICAgIENvbXBvbmVudEFkYXB0ZXJzW2FkYXB0ZXJOYW1lXSA9IGFkYXB0ZXJcbiAgICB9XG4gICAgcmVnaXN0cmF0b3Ioe3JlZ2lzdGVyfSk7XG59XG5cbmNsYXNzIENvbXBvbmVudCB7XG4gICAgY29uc3RydWN0b3IocGFyYW1zLCB0eXBlKSB7XG4gICAgICAgIHRoaXMucGFyYW1zID0gT2JqZWN0LmFzc2lnbih7fSwge1xuICAgICAgICAgICAgZmluZE1hcDoge31cbiAgICAgICAgfSwgcGFyYW1zKTtcbiAgICAgICAgdGhpcy50eXBlID0gdHlwZSB8fCAnZGVmYXVsdCc7XG4gICAgICAgIHRoaXMuZGVzdHJveWVkID0gZmFsc2U7XG4gICAgfVxuICAgIGdldChuYW1lKSB7XG4gICAgICAgIGlmIChuYW1lLnN0YXJ0c1dpdGgoJ3YuJykgfHwgbmFtZS5zdGFydHNXaXRoKCdjLicpIHx8IG5hbWUuc3RhcnRzV2l0aCgnZS4nKSkge1xuICAgICAgICAgICAgbmFtZSA9IG5hbWUuc3Vic3RyaW5nKDIpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBfLmdldCh0aGlzLnBhcmFtcywgbmFtZSk7XG4gICAgfVxuICAgIHNldChuYW1lLCB2YWx1ZSkge1xuICAgICAgICBpZiAobmFtZS5zdGFydHNXaXRoKCd2LicpIHx8IG5hbWUuc3RhcnRzV2l0aCgnYy4nKSB8fCBuYW1lLnN0YXJ0c1dpdGgoJ2UuJykpIHtcbiAgICAgICAgICAgIG5hbWUgPSBuYW1lLnN1YnN0cmluZygyKTtcbiAgICAgICAgfVxuICAgICAgICBfLnNldCh0aGlzLnBhcmFtcywgbmFtZSwgdmFsdWUpO1xuICAgIH1cbiAgICBmaW5kKG5hbWUpIHtcbiAgICAgICAgbGV0IHR5cGVPckNvbXBvbmVudCA9IHRoaXMucGFyYW1zLmZpbmRNYXBbbmFtZV07XG4gICAgICAgIGlmICghdHlwZU9yQ29tcG9uZW50ICYmIHRoaXMucGFyYW1zLmZpbmRNYXAuaGFzT3duUHJvcGVydHkobmFtZSkpIHtcbiAgICAgICAgICAgIHJldHVybiB0eXBlT3JDb21wb25lbnQ7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgZGVmYXVsdFBhcmFtcyA9IHtcbiAgICAgICAgICAgICdhdXJhOmlkJzogbmFtZVxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBjb25zdCBjb21wb25lbnQgPSB0aGlzLnBhcmFtcy5maW5kTWFwW25hbWVdID0gKEFycmF5LmlzQXJyYXkodHlwZU9yQ29tcG9uZW50KSA/IFxuICAgICAgICAgICAgY29tcG9uZW50RmFjdG9yeUZvckFycmF5KGRlZmF1bHRQYXJhbXMsIHR5cGVPckNvbXBvbmVudCkgOiBcbiAgICAgICAgICAgIGNvbXBvbmVudEZhY3RvcnkoZGVmYXVsdFBhcmFtcywgdHlwZU9yQ29tcG9uZW50KSlcbiAgICAgICAgcmV0dXJuIGNvbXBvbmVudDtcbiAgICB9XG4gICAgZ2V0TG9jYWxJZCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucGFyYW1zWydhdXJhOmlkJ107XG4gICAgfVxuICAgIGNsZWFyUmVmZXJlbmNlKGtleSkge1xuICAgICAgICBkZWxldGUgdGhpcy5wYXJhbXNba2V5XTtcbiAgICB9XG4gICAgZ2V0Q29uY3JldGVDb21wb25lbnQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICBnZXRFbGVtZW50KCkge1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgZ2V0RWxlbWVudHMoKSB7XG4gICAgICAgIHJldHVybiBbdGhpc107XG4gICAgfVxuICAgIGdldEV2ZW50KG5hbWUpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucGFyYW1zW25hbWVdIHx8IGV2ZW50RmFjdG9yeSgpO1xuICAgIH1cbiAgICBnZXRHbG9iYWxJZCgpIHtcbiAgICAgICAgcmV0dXJuIGBnbG9iYWwtJHt0aGlzLnBhcmFtc1snYXVyYTppZCddfWA7XG4gICAgfVxuICAgIGdldE5hbWUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnR5cGU7XG4gICAgfVxuICAgIGdldFR5cGUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnR5cGU7XG4gICAgfVxuICAgIGdldFJlZmVyZW5jZShrZXkpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucGFyYW1zW2tleV07XG4gICAgfVxuICAgIGdldFN1cGVyKCkge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgZ2V0VmVyc2lvbigpIHtcbiAgICAgICAgcmV0dXJuICcxLjAnO1xuICAgIH1cbiAgICBpc0NvbmNyZXRlKCkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgaXNJbnN0YW5jZU9mKG5hbWUpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudHlwZSA9PT0gbmFtZTtcbiAgICB9XG4gICAgaXNWYWxpZCgpIHtcbiAgICAgICAgcmV0dXJuICF0aGlzLmRlc3Ryb3llZDtcbiAgICB9XG4gICAgYWRkRXZlbnRIYW5kbGVyKCkge31cbiAgICBhZGRIYW5kbGVyKCkge31cbiAgICBhZGRWYWx1ZUhhbmRsZXIoKSB7fVxuICAgIGFkZFZhbHVlUHJvdmlkZXIoKSB7fVxuICAgIGF1dG9EZXN0cm95KCkge31cbiAgICBkZXN0cm95KCkge1xuICAgICAgICB0aGlzLmRlc3Ryb3llZCA9IHRydWU7XG4gICAgfVxuICAgIHJlbW92ZUV2ZW50SGFuZGxlcigpIHt9XG5cbn0iLCJpbXBvcnQgeyBzdHViaWZ5SW5zdGFuY2UgfSBmcm9tICcuL3Npbm9uSGVscGVycydcblxuY29uc3QgY2xhc3NOYW1lVG9Db21wb25lbnRWYXIgPSBjbGFzc05hbWUgPT4gYHYuX19jbHNfJHtjbGFzc05hbWV9YFxuZXhwb3J0IGNsYXNzIEF1cmFVdGlsIHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgc3R1YmlmeUluc3RhbmNlKEF1cmFVdGlsLCB0aGlzKTtcbiAgICB9XG4gICAgXG4gICAgaXNFbXB0eShvYmope1xuICAgICAgICBpZiAob2JqID09PSB1bmRlZmluZWQgfHwgb2JqID09PSBudWxsIHx8IG9iaiA9PT0gJycpIHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIGlmIChBcnJheS5pc0FycmF5KG9iaikpIHtcbiAgICAgICAgICAgIHJldHVybiBvYmoubGVuZ3RoID09PSAwO1xuICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiBvYmogPT09ICdvYmplY3QnICYmIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChvYmopID09PSAnW29iamVjdCBPYmplY3RdJykge1xuICAgICAgICAgICAgcmV0dXJuIE9iamVjdC5rZXlzKG9iaikubGVuZ3RoID09PSAwO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgaXNVbmRlZmluZWRPck51bGwob2JqKSB7XG4gICAgICAgIHJldHVybiBvYmogPT09IHVuZGVmaW5lZCB8fCBvYmogPT09IG51bGw7XG4gICAgfVxuICAgIGFkZENsYXNzKGNvbXBvbmVudCwgY2xhc3NOYW1lKSB7XG4gICAgICAgIHJldHVybiBjb21wb25lbnQuc2V0KGNsYXNzTmFtZVRvQ29tcG9uZW50VmFyKGNsYXNzTmFtZSksIHRydWUpO1xuICAgIH1cbiAgICByZW1vdmVDbGFzcyhjb21wb25lbnQsIGNsYXNzTmFtZSkge1xuICAgICAgICByZXR1cm4gY29tcG9uZW50LnNldChjbGFzc05hbWVUb0NvbXBvbmVudFZhcihjbGFzc05hbWUpLCBmYWxzZSk7XG4gICAgfVxuICAgIGhhc0NsYXNzKGNvbXBvbmVudCwgY2xhc3NOYW1lKSB7XG4gICAgICAgIHJldHVybiBjb21wb25lbnQuZ2V0KGNsYXNzTmFtZVRvQ29tcG9uZW50VmFyKGNsYXNzTmFtZSkpO1xuICAgIH1cbiAgICB0b2dnbGVDbGFzcyhjb21wb25lbnQsIGNsYXNzTmFtZSkge1xuICAgICAgICBjb21wb25lbnQuc2V0KGNsYXNzTmFtZVRvQ29tcG9uZW50VmFyKGNsYXNzTmFtZSksICFjb21wb25lbnQuZ2V0KGNsYXNzTmFtZVRvQ29tcG9uZW50VmFyKGNsYXNzTmFtZSkpKTtcbiAgICB9XG4gICAgZ2V0Qm9vbGVhblZhbHVlKHZhbCkge1xuICAgICAgICAvLyBQb3J0ZWQ6IGh0dHBzOi8vZ2l0aHViLmNvbS9mb3JjZWRvdGNvbS9hdXJhL2Jsb2IvbWFzdGVyL2F1cmEtaW1wbC9zcmMvbWFpbi9yZXNvdXJjZXMvYXVyYS91dGlsL1V0aWwuanMjTDM2NlxuICAgICAgICByZXR1cm4gdmFsICE9PSB1bmRlZmluZWQgJiYgdmFsICE9PSBudWxsICYmIHZhbCAhPT0gZmFsc2UgJiYgdmFsICE9PSAwICYmIHZhbCAhPT0gJ2ZhbHNlJyAmJiB2YWwgIT09ICcnICYmIHZhbCAhPT0gJ2YnO1xuICAgIH1cbiAgICBpc0FycmF5KGFycikge1xuICAgICAgICAvLyBQb3J0ZWQ6IGh0dHBzOi8vZ2l0aHViLmNvbS9mb3JjZWRvdGNvbS9hdXJhL2Jsb2IvbWFzdGVyL2F1cmEtaW1wbC9zcmMvbWFpbi9yZXNvdXJjZXMvYXVyYS91dGlsL1V0aWwuanMjTDE4OVxuICAgICAgICByZXR1cm4gKHR5cGVvZiBBcnJheS5pc0FycmF5ID09PSBcImZ1bmN0aW9uXCIgPyBBcnJheS5pc0FycmF5IDogZnVuY3Rpb24oYXJnKSB7XG4gICAgICAgICAgICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKGFyZykgPT09ICdbb2JqZWN0IEFycmF5XSc7XG4gICAgICAgIH0pKGFycik7XG4gICAgfVxuICAgIGlzT2JqZWN0KG9iaikge1xuICAgICAgICAvL1BvcnRlZDogaHR0cHM6Ly9naXRodWIuY29tL2ZvcmNlZG90Y29tL2F1cmEvYmxvYi9tYXN0ZXIvYXVyYS1pbXBsL3NyYy9tYWluL3Jlc291cmNlcy9hdXJhL3V0aWwvVXRpbC5qcyNMMjA0XG4gICAgICAgIHJldHVybiB0eXBlb2Ygb2JqID09PSBcIm9iamVjdFwiICYmIG9iaiAhPT0gbnVsbCAmJiAhQXJyYXkuaXNBcnJheShvYmopO1xuICAgIH1cbiAgICBpc1VuZGVmaW5lZChvYmope1xuICAgICAgICAvL1BvcnRlZDogaHR0cHM6Ly9naXRodWIuY29tL2ZvcmNlZG90Y29tL2F1cmEvYmxvYi9tYXN0ZXIvYXVyYS1pbXBsL3NyYy9tYWluL3Jlc291cmNlcy9hdXJhL3V0aWwvVXRpbC5qcyNMMzE5XG4gICAgICAgIHJldHVybiBvYmogPT09IHVuZGVmaW5lZDtcbiAgICB9XG59XG5cbiIsImltcG9ydCB7IHN0dWJpZnlJbnN0YW5jZSB9IGZyb20gJy4vc2lub25IZWxwZXJzJ1xuaW1wb3J0IHsgQXVyYVV0aWwgfSBmcm9tICcuL2F1cmFVdGlsJ1xuXG5leHBvcnQgZnVuY3Rpb24gYXVyYUZhY3RvcnkocGFyYW1zID0ge30sIHN0dWJpZnlQYXJhbXMpIHtcbiAgICByZXR1cm4gc3R1YmlmeUluc3RhbmNlKEF1cmEsIG5ldyBBdXJhKHBhcmFtcyksIHN0dWJpZnlQYXJhbXMpO1xufVxuXG5pbXBvcnQgeyBjb21wb25lbnRGYWN0b3J5IH0gZnJvbSAnLi9jb21wb25lbnRGYWN0b3J5J1xuXG5jbGFzcyBBdXJhIHtcbiAgICBjb25zdHJ1Y3RvcihwYXJhbXMpIHtcbiAgICAgICAgdGhpcy5wYXJhbXMgPSBwYXJhbXM7XG4gICAgICAgIHRoaXMudXRpbCA9IG5ldyBBdXJhVXRpbCgpO1xuICAgIH1cbiAgICBcbiAgICBzZXRQYXJhbXMocGFyYW1zKSB7XG4gICAgICAgIE9iamVjdC5hc3NpZ24odGhpcy5wYXJhbXMsIHBhcmFtcyk7XG4gICAgfVxuXG4gICAgZ2V0KG5hbWUpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucGFyYW1zW25hbWVdO1xuICAgIH1cblxuICAgIHNldChuYW1lLCB2YWx1ZSkge1xuICAgICAgICB0aGlzLnBhcmFtc1tuYW1lXSA9IHZhbHVlO1xuICAgIH1cbiAgICBcbiAgICBlbnF1ZXVlQWN0aW9uKGFjdGlvbikge1xuICAgICAgICBhY3Rpb24gJiYgYWN0aW9uLmludm9rZUNhbGxiYWNrICYmIGFjdGlvbi5pbnZva2VDYWxsYmFjayh0cnVlKVxuICAgIH1cblxuICAgIGNyZWF0ZUNvbXBvbmVudCh0eXBlLCBhdHRyaWJ1dGVzLCBjYWxsYmFjaykge1xuICAgICAgICB0aGlzLmNyZWF0ZUNvbXBvbmVudC50eXBlID0gdHlwZTtcbiAgICAgICAgdGhpcy5jcmVhdGVDb21wb25lbnQuYXR0cmlidXRlcyA9IGF0dHJpYnV0ZXM7XG4gICAgICAgIC8vIEdldCBjb21wb25lbnQgaW5zdGFuY2UuXG4gICAgICAgIC8vIFVzZSBleGlzdGluZyBjb21wb25lbnQgaW5zdGFuY2UgaWYgc2V0XG4gICAgICAgIC8vIENyZWF0ZSBuZXcgZGVmYXVsdCBjb21wb25lbnQgaWYgY29tcG9uZW50IG5vdCBzZXRcbiAgICAgICAgbGV0IHsgY29tcG9uZW50IH0gPSB0aGlzLmNyZWF0ZUNvbXBvbmVudDtcbiAgICAgICAgaWYgKCFjb21wb25lbnQpIHtcbiAgICAgICAgICAgIGNvbXBvbmVudCA9IG5ldyBjb21wb25lbnRGYWN0b3J5KGF0dHJpYnV0ZXMsIHR5cGUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5jcmVhdGVDb21wb25lbnQuY29tcG9uZW50ID0gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBpZiAoY2FsbGJhY2spIHtcbiAgICAgICAgICAgIGNhbGxiYWNrKGNvbXBvbmVudCwgJ1NVQ0NFU1MnLCBbJ1NVQ0NFU1MnXSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGNvbXBvbmVudDtcbiAgICB9XG4gICAgY3JlYXRlQ29tcG9uZW50cyhjb21wb25lbnREZWZzLCBjYWxsYmFjaykge1xuICAgICAgICBjb25zdCByZXN1bHQgPSBjb21wb25lbnREZWZzXG4gICAgICAgICAgICAubWFwKGRlZiA9PiB0aGlzLmNyZWF0ZUNvbXBvbmVudChkZWZbMF0sIGRlZlsxXSkpXG4gICAgICAgIGlmIChjYWxsYmFjaykge1xuICAgICAgICAgICAgY2FsbGJhY2socmVzdWx0LCAnU1VDQ0VTUycsIHJlc3VsdC5tYXAoICgpID0+ICdTVUNDRVNTJykpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuICAgIGdldENhbGxiYWNrKGNhbGxiYWNrKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiguLi5hcmdzKSB7XG4gICAgICAgICAgICBjYWxsYmFjayAmJiBjYWxsYmFjayguLi5hcmdzKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBnZXRDb21wb25lbnQoaWQpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucGFyYW1zW2lkXTtcbiAgICB9XG4gICAgZ2V0UmVmZXJlbmNlKCkge31cbiAgICBnZXRSb290KCkge1xuICAgICAgICByZXR1cm4gdGhpcy5yb290Q29tcG9uZW50IHx8ICh0aGlzLnJvb3RDb21wb25lbnQgPSBuZXcgY29tcG9uZW50RmFjdG9yeSgpKTtcbiAgICB9XG4gICAgZ2V0VG9rZW4obmFtZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5wYXJhbXNbJ3Rva2VuLicgKyBuYW1lXVxuICAgIH1cbiAgICBsb2codmFsdWUsIGVycikge1xuICAgICAgICAvKmVzbGludCBuby1jb25zb2xlOiAwKi9cbiAgICAgICAgY29uc29sZSAmJiBjb25zb2xlLmxvZyh2YWx1ZSwgZXJyKVxuICAgIH1cbiAgICByZXBvcnRFcnJvcigpIHt9XG59IiwiaW1wb3J0IHsgc3R1YmlmeUluc3RhbmNlT25EZW1hbmQgfSBmcm9tICcuL3Npbm9uSGVscGVycydcblxuZXhwb3J0IGZ1bmN0aW9uIGFwZXhDYWxsRmFjdG9yeShwYXJhbXMgPSB7fSkge1xuICAgIHJldHVybiBzdHViaWZ5SW5zdGFuY2VPbkRlbWFuZChBcGV4Q2FsbCwgbmV3IEFwZXhDYWxsKHBhcmFtcykpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYXBleFN1Y2Nlc3NSZXN1bHQocmVzcG9uc2UgPSB7fSkge1xuICAgIHJldHVybiBzdHViaWZ5SW5zdGFuY2VPbkRlbWFuZChBcGV4Q2FsbFJlc3VsdCwgbmV3IEFwZXhDYWxsUmVzdWx0KHJlc3BvbnNlKSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBhcGV4RXJyb3JSZXN1bHQobWVzc2FnZSkge1xuICAgIHJldHVybiBzdHViaWZ5SW5zdGFuY2VPbkRlbWFuZChBcGV4Q2FsbFJlc3VsdCwgbmV3IEFwZXhDYWxsUmVzdWx0KG51bGwsIG1lc3NhZ2UpKTtcbn1cblxuY2xhc3MgQXBleENhbGwge1xuICAgIGNvbnN0cnVjdG9yKHJlc3VsdCwgaW52b2tlQ2FsbGJhY2tPbkVucXVldWUgPSB0cnVlKSB7XG4gICAgICAgIHRoaXMucGFyYW1zID0gbnVsbDtcbiAgICAgICAgdGhpcy5yZXN1bHQgPSByZXN1bHQ7XG4gICAgICAgIHRoaXMuaW52b2tlQ2FsbGJhY2tPbkVucXVldWUgPSBpbnZva2VDYWxsYmFja09uRW5xdWV1ZTtcbiAgICAgICAgdGhpcy5pc0JhY2tncm91bmQgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5zZXRBYm9ydGFibGUgPSBmYWxzZTtcbiAgICB9XG4gICAgc2V0UGFyYW1zKHBhcmFtcykge1xuICAgICAgICB0aGlzLnBhcmFtcyA9IHBhcmFtcztcbiAgICB9XG4gICAgc2V0UGFyYW0oa2V5LCB2YWx1ZSkge1xuICAgICAgICB0aGlzLnBhcmFtcyA9IE9iamVjdC5hc3NpZ24odGhpcy5wYXJhbXMsIHtba2V5XSA6IHZhbHVlfSk7XG4gICAgfVxuICAgIGdldFBhcmFtcygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucGFyYW1zO1xuICAgIH1cbiAgICBzZXRDYWxsYmFjayhjdHgsIGNhbGxiYWNrKSB7XG4gICAgICAgIHRoaXMuY3R4ID0gY3R4O1xuICAgICAgICB0aGlzLmNhbGxiYWNrID0gY2FsbGJhY2s7XG4gICAgfVxuICAgIGludm9rZUNhbGxiYWNrKGZyb21FbnF1ZXVlID0gZmFsc2UpIHtcbiAgICAgICAgaWYgKGZyb21FbnF1ZXVlICYmICF0aGlzLmludm9rZUNhbGxiYWNrT25FbnF1ZXVlKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5jYWxsYmFjayAmJiB0aGlzLmNhbGxiYWNrLmJpbmQodGhpcy5jdHgpKHRoaXMucmVzdWx0KTtcbiAgICB9XG4gICAgZ2V0RXJyb3IoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnJlc3VsdC5nZXRFcnJvcigpO1xuICAgIH1cbiAgICBnZXRQYXJhbShuYW1lKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnBhcmFtcyA/IHRoaXMucGFyYW1zW25hbWVdIDogbnVsbDtcbiAgICB9XG4gICAgZ2V0UmV0dXJuVmFsdWUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnJlc3VsdDtcbiAgICB9XG4gICAgZ2V0U3RhdGUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnJlc3VsdC5nZXRTdGF0ZSgpO1xuICAgIH1cbiAgICBpc0JhY2tncm91bmQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmlzQmFja2dyb3VuZDtcbiAgICB9XG4gICAgc2V0QWJvcnRhYmxlKCkge1xuICAgIH1cbiAgICBzZXRCYWNrZ3JvdW5kKCkge1xuICAgICAgICB0aGlzLmlzQmFja2dyb3VuZCA9IHRydWU7XG4gICAgfVxuICAgIHNldFN0b3JhYmxlKCkge1xuICAgIH1cbn1cblxuY2xhc3MgQXBleENhbGxSZXN1bHQge1xuICAgIGNvbnN0cnVjdG9yKHJlc3BvbnNlLCBlcnJvck1lc3NhZ2UgPSBudWxsKSB7XG4gICAgICAgIHRoaXMucmVzcG9uc2UgPSByZXNwb25zZTtcbiAgICAgICAgdGhpcy5lcnJvck1lc3NhZ2UgPSBlcnJvck1lc3NhZ2U7XG4gICAgfVxuICAgIGdldFN0YXRlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5lcnJvck1lc3NhZ2UgPyAnRVJST1InIDogJ1NVQ0NFU1MnXG4gICAgfVxuICAgIGdldEVycm9yKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5lcnJvck1lc3NhZ2UgPyBbe21lc3NhZ2U6IHRoaXMuZXJyb3JNZXNzYWdlfV0gOiBbXVxuICAgIH1cbiAgICBnZXRSZXR1cm5WYWx1ZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucmVzcG9uc2U7XG4gICAgfVxufSIsImltcG9ydCB7IGV2ZW50RmFjdG9yeSB9IGZyb20gJy4vZXZlbnRGYWN0b3J5J1xuaW1wb3J0IHsgY29tcG9uZW50RmFjdG9yeSwgdXNlQ29tcG9uZW50QWRhcHRlcnMgfSBmcm9tICcuL2NvbXBvbmVudEZhY3RvcnknXG5pbXBvcnQgeyBhdXJhRmFjdG9yeSB9IGZyb20gJy4vYXVyYUZhY3RvcnknXG5pbXBvcnQgeyBBdXJhVXRpbCB9IGZyb20gJy4vYXVyYVV0aWwnXG5pbXBvcnQgeyBhcGV4Q2FsbEZhY3RvcnksIGFwZXhTdWNjZXNzUmVzdWx0LCBhcGV4RXJyb3JSZXN1bHQgfSBmcm9tICcuL2FwZXhDYWxsRmFjdG9yeSdcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgQXVyYVV0aWwsXG4gICAgZXZlbnRGYWN0b3J5LFxuICAgIGNvbXBvbmVudEZhY3RvcnksXG4gICAgdXNlQ29tcG9uZW50QWRhcHRlcnMsXG4gICAgYXVyYUZhY3RvcnksXG4gICAgYXBleENhbGxGYWN0b3J5LFxuICAgIGFwZXhTdWNjZXNzUmVzdWx0LFxuICAgIGFwZXhFcnJvclJlc3VsdFxufSJdLCJuYW1lcyI6WyJzaW5vbiIsInJlcXVpcmUiLCJzdHViaWZ5SW5zdGFuY2UiLCJjdG9yIiwiaW5zdGFuY2UiLCJwYXJhbXMiLCJwcm9wRXhjbHVkZWQiLCJwcm9wIiwiZG9Ob3RNb2NrIiwiQXJyYXkiLCJpc0FycmF5IiwiaW5kZXhPZiIsImdldE93blByb3BlcnR5TmFtZXMiLCJwcm90b3R5cGUiLCJmb3JFYWNoIiwic3R1YiIsImNhbGxzRmFrZSIsInByb3BOYW1lIiwiYXJncyIsImNhbGwiLCJzdHViaWZ5SW5zdGFuY2VPbkRlbWFuZCIsImhhbmRsZXIiLCJ0YXJnZXQiLCJwcm9wZXJ0eSIsImRlc2NyaXB0b3IiLCJfaW5zdGFuY2VQcm9wcyIsInByb3BLZXkiLCJ2YWx1ZSIsIndhcm4iLCJzdHViTmFtZSIsImlzU3B5T3JTdHViYmVkIiwiY2FsbGVkQmVmb3JlIiwiaGFzT25Qcm90byIsInByb3h5IiwiUHJveHkiLCJldmVudEZhY3RvcnkiLCJFdmVudCIsIkZBS0VfRVZFTlRfTkFNRSIsImtleSIsImV2ZW50TmFtZSIsIm5hbWUiLCJfIiwiRGVmYXVsdENvbXBvbmVudEFkYXB0ZXIiLCJXZWxsS25vd25Db21wb25lbnRzIiwiQ29tcG9uZW50QWRhcHRlcnMiLCJjb21wb25lbnRGYWN0b3J5Rm9yQXJyYXkiLCJhcnJheU9mVHlwZXMiLCJtYXAiLCJjb21wb25lbnRGYWN0b3J5IiwidHlwZU9yQ29tcG9uZW50IiwiRXJyb3IiLCJDb21wb25lbnQiLCJhZGFwdGVyTmFtZSIsInRvTG93ZXJDYXNlIiwicmVwbGFjZSIsImFkYXB0ZXIiLCJzb21lIiwic3RhcnRzV2l0aCIsInVzZUNvbXBvbmVudEFkYXB0ZXJzIiwicmVnaXN0cmF0b3IiLCJyZWdpc3RlciIsImNvbXBvbmVudFR5cGUiLCJ0eXBlIiwiT2JqZWN0IiwiYXNzaWduIiwiZGVzdHJveWVkIiwic3Vic3RyaW5nIiwiZ2V0Iiwic2V0IiwiZmluZE1hcCIsImhhc093blByb3BlcnR5IiwiZGVmYXVsdFBhcmFtcyIsImNvbXBvbmVudCIsImNsYXNzTmFtZVRvQ29tcG9uZW50VmFyIiwiY2xhc3NOYW1lIiwiQXVyYVV0aWwiLCJvYmoiLCJ1bmRlZmluZWQiLCJsZW5ndGgiLCJ0b1N0cmluZyIsImtleXMiLCJ2YWwiLCJhcnIiLCJhcmciLCJhdXJhRmFjdG9yeSIsInN0dWJpZnlQYXJhbXMiLCJBdXJhIiwidXRpbCIsImFjdGlvbiIsImludm9rZUNhbGxiYWNrIiwiYXR0cmlidXRlcyIsImNhbGxiYWNrIiwiY3JlYXRlQ29tcG9uZW50IiwiY29tcG9uZW50RGVmcyIsInJlc3VsdCIsImRlZiIsImlkIiwicm9vdENvbXBvbmVudCIsImVyciIsImNvbnNvbGUiLCJsb2ciLCJhcGV4Q2FsbEZhY3RvcnkiLCJBcGV4Q2FsbCIsImFwZXhTdWNjZXNzUmVzdWx0IiwicmVzcG9uc2UiLCJBcGV4Q2FsbFJlc3VsdCIsImFwZXhFcnJvclJlc3VsdCIsIm1lc3NhZ2UiLCJpbnZva2VDYWxsYmFja09uRW5xdWV1ZSIsImlzQmFja2dyb3VuZCIsInNldEFib3J0YWJsZSIsImN0eCIsImZyb21FbnF1ZXVlIiwiYmluZCIsImdldEVycm9yIiwiZ2V0U3RhdGUiLCJlcnJvck1lc3NhZ2UiLCJtb2R1bGUiLCJleHBvcnRzIl0sIm1hcHBpbmdzIjoiQUFBQTtBQUNBLElBQU1BLFFBQVFDLFFBQVEsT0FBUixDQUFkOztBQUVBLEFBQU8sU0FBU0MsZUFBVCxDQUF5QkMsSUFBekIsRUFBK0JDLFFBQS9CLEVBQXlDQyxNQUF6QyxFQUFpRDtRQUM5Q0MsZUFBZSxTQUFmQSxZQUFlLENBQUNDLElBQUQ7ZUFBVUYsVUFBVUEsT0FBT0csU0FBakIsS0FBK0JDLE1BQU1DLE9BQU4sQ0FBY0wsT0FBT0csU0FBckIsSUFDMURILE9BQU9HLFNBQVAsQ0FBaUJHLE9BQWpCLENBQXlCSixJQUF6QixNQUFtQyxDQUFDLENBRHNCLEdBQ2xCRixPQUFPRyxTQUFQLEtBQXFCRCxJQURsQyxDQUFWO0tBQXJCOztXQUdPSyxtQkFBUCxDQUEyQlQsS0FBS1UsU0FBaEMsRUFBMkNDLE9BQTNDLENBQW1ELGdCQUFRO1lBQ25EUixhQUFhQyxJQUFiLEtBQXNCLE9BQU9KLEtBQUtVLFNBQUwsQ0FBZU4sSUFBZixDQUFQLEtBQWdDLFVBQXRELElBQW9FQSxTQUFTLGFBQWpGLEVBQWdHOzs7aUJBR3ZGLFVBQVVBLElBQW5CLElBQTJCUCxNQUFNZSxJQUFOLENBQVdYLFFBQVgsRUFBcUJHLElBQXJCLEVBQTJCUyxTQUEzQixDQUFzQyxVQUFDQyxRQUFEO21CQUFjLFlBQWE7OztrREFBVEMsSUFBUzt3QkFBQTs7O3VCQUNqRiw4QkFBS0wsU0FBTCxDQUFlSSxRQUFmLEdBQXlCRSxJQUF6QiwrQkFBOEJmLFFBQTlCLFNBQTJDYyxJQUEzQyxFQUFQO2FBRDZEO1NBQUQsQ0FFN0RYLElBRjZELENBQXJDLENBQTNCO0tBSko7V0FRT0gsUUFBUDs7O0FBR0osQUFBTyxTQUFTZ0IsdUJBQVQsQ0FBaUNqQixJQUFqQyxFQUF1Q0MsUUFBdkMsRUFBaUQ7UUFDOUNpQixVQUFVO3dCQUNJLEVBREo7c0JBQUEsMEJBRUdDLE1BRkgsRUFFV0MsUUFG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
