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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXVyYS5qcyIsInNvdXJjZXMiOlsibGliL3Npbm9uSGVscGVycy5qcyIsImxpYi9ldmVudEZhY3RvcnkuanMiLCJsaWIvY29tcG9uZW50RmFjdG9yeS5qcyIsImxpYi9hdXJhVXRpbC5qcyIsImxpYi9hdXJhRmFjdG9yeS5qcyIsImxpYi9hcGV4Q2FsbEZhY3RvcnkuanMiLCJsaWIvYXVyYS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKmdsb2JhbCBQcm94eSovXG5jb25zdCBzaW5vbiA9IHJlcXVpcmUoJ3Npbm9uJyk7XG5cbmV4cG9ydCBmdW5jdGlvbiBzdHViaWZ5SW5zdGFuY2UoY3RvciwgaW5zdGFuY2UsIHBhcmFtcykge1xuICAgIGNvbnN0IHByb3BFeGNsdWRlZCA9IChwcm9wKSA9PiBwYXJhbXMgJiYgcGFyYW1zLmRvTm90TW9jayAmJiAoQXJyYXkuaXNBcnJheShwYXJhbXMuZG9Ob3RNb2NrKSA/IFxuICAgICAgICBwYXJhbXMuZG9Ob3RNb2NrLmluZGV4T2YocHJvcCkgIT09IC0xIDogcGFyYW1zLmRvTm90TW9jayA9PT0gcHJvcCk7XG5cbiAgICBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyhjdG9yLnByb3RvdHlwZSkuZm9yRWFjaChwcm9wID0+IHtcbiAgICAgICAgaWYgKHByb3BFeGNsdWRlZChwcm9wKSB8fCB0eXBlb2YgY3Rvci5wcm90b3R5cGVbcHJvcF0gIT09ICdmdW5jdGlvbicgfHwgcHJvcCA9PT0gJ2NvbnN0cnVjdG9yJykge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGluc3RhbmNlWydzdHViXycgKyBwcm9wXSA9IHNpbm9uLnN0dWIoaW5zdGFuY2UsIHByb3ApLmNhbGxzRmFrZSgoKHByb3BOYW1lKSA9PiAoLi4uYXJncykgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIGN0b3IucHJvdG90eXBlW3Byb3BOYW1lXS5jYWxsKGluc3RhbmNlLCAuLi5hcmdzKTtcbiAgICAgICAgfSkocHJvcCkpXG4gICAgfSlcbiAgICByZXR1cm4gaW5zdGFuY2U7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzdHViaWZ5SW5zdGFuY2VPbkRlbWFuZChjdG9yLCBpbnN0YW5jZSkge1xuICAgIGNvbnN0IGhhbmRsZXIgPSB7XG4gICAgICAgIF9pbnN0YW5jZVByb3BzOiB7fSxcbiAgICAgICAgZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBwcm9wZXJ0eSwgZGVzY3JpcHRvcikge1xuICAgICAgICAgICAgaGFuZGxlci5faW5zdGFuY2VQcm9wc1twcm9wZXJ0eV0gPSBkZXNjcmlwdG9yO1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH0sXG4gICAgICAgIGdldCh0YXJnZXQsIHByb3BLZXkpIHtcbiAgICAgICAgICAgIC8vIENoZWNrIGZvciBTeW1ib2wgZm9yIGl0ZXJhdG9yc1xuICAgICAgICAgICAgaWYgKHR5cGVvZiBwcm9wS2V5ICE9PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgICAgIHJldHVybiB0YXJnZXRbcHJvcEtleV07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBJZiB3ZSBhZGQgc29tZSBwcm9wcyB0byB0aGUgaW5zdGFuY2UsIHJldHVybiBpdCB3L28gbW9ja2luZ1xuICAgICAgICAgICAgLy8gVXN1YWxseSBhZGRlZCBzdHVmZiBpcyBtb2NrZWQgdGhyb3VnaCBkYXRhIGFkYXB0ZXJzXG4gICAgICAgICAgICBpZiAoaGFuZGxlci5faW5zdGFuY2VQcm9wc1twcm9wS2V5XSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBoYW5kbGVyLl9pbnN0YW5jZVByb3BzW3Byb3BLZXldLnZhbHVlXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vV2FybiBvbiB1bmtub3duIHByb3BLZXkgZm9yIGJldHRlciBkZWJ1Z2dpbmdcbiAgICAgICAgICAgIGlmICh0YXJnZXRbcHJvcEtleV0gPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIC8qZXNsaW50IG5vLWNvbnNvbGU6IDAqL1xuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybignXFxuXFxuc3R1YmlmeUluc3RhbmNlT25EZW1hbmQ6IFVua25vd24gcHJvcGVydHkgJyArIHByb3BLZXksICdcXG5cXG4nKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGFyZ2V0W3Byb3BLZXldO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBTdHViIG1ldGhvZHMgdGhhdCBkZWZpbmVkIG9uIHByb3RvdHlwZSBvbmx5LCBlLmcuIGhhcyBwdWJsaWMgYXBpXG4gICAgICAgICAgICBjb25zdCBzdHViTmFtZSA9ICdzdHViXycgKyBwcm9wS2V5O1xuICAgICAgICAgICAgY29uc3QgaXNTcHlPclN0dWJiZWQgPSAhISh0YXJnZXRbcHJvcEtleV0gJiYgdGFyZ2V0W3Byb3BLZXldLmNhbGxlZEJlZm9yZSk7XG4gICAgICAgICAgICBjb25zdCBoYXNPblByb3RvID0gISFjdG9yLnByb3RvdHlwZVtwcm9wS2V5XTtcblxuICAgICAgICAgICAgaWYgKGhhc09uUHJvdG8gJiYgIWlzU3B5T3JTdHViYmVkICYmIHR5cGVvZiB0YXJnZXRbcHJvcEtleV0gPT09ICdmdW5jdGlvbicgJiYgcHJvcEtleSAhPT0gJ2NvbnN0cnVjdG9yJykge1xuICAgICAgICAgICAgICAgIHRhcmdldFtzdHViTmFtZV0gPSBzaW5vbi5zdHViKHRhcmdldCwgcHJvcEtleSkuY2FsbHNGYWtlKCguLi5hcmdzKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBjdG9yLnByb3RvdHlwZVtwcm9wS2V5XS5jYWxsKGluc3RhbmNlLCAuLi5hcmdzKTtcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHRhcmdldFtwcm9wS2V5XTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGNvbnN0IHByb3h5ID0gbmV3IFByb3h5KGluc3RhbmNlLCBoYW5kbGVyKTtcbiAgICByZXR1cm4gcHJveHk7XG59IiwiaW1wb3J0IHsgc3R1YmlmeUluc3RhbmNlT25EZW1hbmQgfSBmcm9tICcuL3Npbm9uSGVscGVycydcblxuZXhwb3J0IGZ1bmN0aW9uIGV2ZW50RmFjdG9yeShwYXJhbXMgPSB7fSkge1xuICAgIHJldHVybiBzdHViaWZ5SW5zdGFuY2VPbkRlbWFuZChFdmVudCwgbmV3IEV2ZW50KHBhcmFtcykpO1xufVxuY29uc3QgRkFLRV9FVkVOVF9OQU1FID0gJ21vY2hhLWF1cmEtZmFrZS1ldmVudCdcblxuY2xhc3MgRXZlbnQge1xuICAgIGNvbnN0cnVjdG9yKHBhcmFtcykge1xuICAgICAgICB0aGlzLnBhcmFtcyA9IHBhcmFtcyB8fCB7fTtcbiAgICB9XG4gICAgc2V0UGFyYW1zKHBhcmFtcykge1xuICAgICAgICB0aGlzLnBhcmFtcyA9IHBhcmFtcztcbiAgICB9XG4gICAgc2V0UGFyYW0oa2V5LCB2YWx1ZSkge1xuICAgICAgICB0aGlzLnBhcmFtc1trZXldID0gdmFsdWU7XG4gICAgfVxuICAgIGdldFBhcmFtcygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucGFyYW1zO1xuICAgIH1cbiAgICBnZXRFdmVudFR5cGUoKSB7XG4gICAgICAgIHJldHVybiAnQVBQTElDQVRJT04nXG4gICAgfVxuICAgIGdldE5hbWUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnBhcmFtcy5ldmVudE5hbWUgfHwgRkFLRV9FVkVOVF9OQU1FXG4gICAgfVxuICAgIGdldFBhcmFtKG5hbWUpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucGFyYW1zW25hbWVdXG4gICAgfVxuICAgIGdldFBoYXNlKCkge1xuICAgICAgICByZXR1cm4gJ2RlZmF1bHQnXG4gICAgfVxuICAgIGdldFNvdXJjZSgpIHtcbiAgICAgICAgcmV0dXJuIG51bGxcbiAgICB9XG4gICAgZ2V0VHlwZSgpIHtcbiAgICAgICAgcmV0dXJuIGBjOiR7RkFLRV9FVkVOVF9OQU1FfWBcbiAgICB9XG4gICAgZmlyZSgpIHt9XG4gICAgcGF1c2UoKSB7fVxuICAgIHByZXZlbnREZWZhdWx0KCkge31cbiAgICByZXN1bWUoKSB7fVxuICAgIHN0b3BQcm9wYWdhdGlvbigpIHt9XG4gICAgXG5cbn0iLCJjb25zdCBfID0gcmVxdWlyZSgnbG9kYXNoJyk7XG5pbXBvcnQgeyBldmVudEZhY3RvcnkgfSBmcm9tICcuL2V2ZW50RmFjdG9yeSdcbmltcG9ydCB7IHN0dWJpZnlJbnN0YW5jZU9uRGVtYW5kIH0gZnJvbSAnLi9zaW5vbkhlbHBlcnMnXG5cbmNvbnN0IERlZmF1bHRDb21wb25lbnRBZGFwdGVyID0gJ2RlZmF1bHQnXG5jb25zdCBXZWxsS25vd25Db21wb25lbnRzID0gWydhdXJhOicsICdmb3JjZTonLCAnZm9yY2VDaGF0dGVyOicsICdsaWdodG5pbmc6JywgJ3VpOicsICdjOiddXG5cbmxldCBDb21wb25lbnRBZGFwdGVycyA9IHtcbiAgICBbRGVmYXVsdENvbXBvbmVudEFkYXB0ZXJdOiBpbnN0YW5jZSA9PiBpbnN0YW5jZVxufVxuXG5mdW5jdGlvbiBjb21wb25lbnRGYWN0b3J5Rm9yQXJyYXkocGFyYW1zLCBhcnJheU9mVHlwZXMpIHtcbiAgICByZXR1cm4gYXJyYXlPZlR5cGVzLm1hcCh0eXBlT3JDb21wb25lbnQgPT4gY29tcG9uZW50RmFjdG9yeShwYXJhbXMsIHR5cGVPckNvbXBvbmVudCkpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY29tcG9uZW50RmFjdG9yeShwYXJhbXMgPSB7fSwgdHlwZU9yQ29tcG9uZW50ID0gRGVmYXVsdENvbXBvbmVudEFkYXB0ZXIpIHtcbiAgICBpZiAoQXJyYXkuaXNBcnJheSh0eXBlT3JDb21wb25lbnQpKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignVW5leHBlY3RlZCB0eXBlIGFyZ3VtZW50JylcbiAgICB9XG5cbiAgICBpZiAodHlwZU9yQ29tcG9uZW50ID09PSB0cnVlKSB7XG4gICAgICAgIHR5cGVPckNvbXBvbmVudCA9IERlZmF1bHRDb21wb25lbnRBZGFwdGVyXG4gICAgfSBlbHNlIGlmICh0eXBlT3JDb21wb25lbnQgaW5zdGFuY2VvZiBDb21wb25lbnQpIHtcbiAgICAgICAgcmV0dXJuIHR5cGVPckNvbXBvbmVudDtcbiAgICB9IGVsc2UgaWYgKHR5cGVPckNvbXBvbmVudCA9PT0gbnVsbCkge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBsZXQgaW5zdGFuY2UgPSBzdHViaWZ5SW5zdGFuY2VPbkRlbWFuZChDb21wb25lbnQsIG5ldyBDb21wb25lbnQocGFyYW1zLCB0eXBlT3JDb21wb25lbnQpKTtcbiAgICBsZXQgYWRhcHRlck5hbWUgPSB0eXBlT3JDb21wb25lbnQudG9Mb3dlckNhc2UoKS5yZXBsYWNlKCdtYXJrdXA6Ly8nLCAnJylcbiAgICBsZXQgYWRhcHRlciA9IENvbXBvbmVudEFkYXB0ZXJzW2FkYXB0ZXJOYW1lXTtcbiAgICBpZiAoIWFkYXB0ZXIpIHtcbiAgICAgICAgaWYgKCFfLnNvbWUoV2VsbEtub3duQ29tcG9uZW50cywgbmFtZSA9PiBhZGFwdGVyTmFtZS5zdGFydHNXaXRoKG5hbWUpKSkge1xuICAgICAgICAgICAgLyplc2xpbnQgbm8tY29uc29sZTogMCovXG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYFVuYWJsZSB0byBmaW5kIGNvbXBvbmVudCBhZGFwdGVyICR7dHlwZU9yQ29tcG9uZW50fWApO1xuICAgICAgICB9XG4gICAgICAgIGFkYXB0ZXIgPSBDb21wb25lbnRBZGFwdGVyc1tEZWZhdWx0Q29tcG9uZW50QWRhcHRlcl07XG4gICAgfVxuICAgIHJldHVybiBhZGFwdGVyKGluc3RhbmNlLCBwYXJhbXMpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdXNlQ29tcG9uZW50QWRhcHRlcnMocmVnaXN0cmF0b3IpIHtcbiAgICBjb25zdCByZWdpc3RlciA9IChjb21wb25lbnRUeXBlLCBhZGFwdGVyKSA9PiB7XG4gICAgICAgIGNvbnN0IGFkYXB0ZXJOYW1lID0gY29tcG9uZW50VHlwZS50b0xvd2VyQ2FzZSgpO1xuICAgICAgICBDb21wb25lbnRBZGFwdGVyc1thZGFwdGVyTmFtZV0gPSBhZGFwdGVyXG4gICAgfVxuICAgIHJlZ2lzdHJhdG9yKHtyZWdpc3Rlcn0pO1xufVxuXG5jbGFzcyBDb21wb25lbnQge1xuICAgIGNvbnN0cnVjdG9yKHBhcmFtcywgdHlwZSkge1xuICAgICAgICB0aGlzLnBhcmFtcyA9IE9iamVjdC5hc3NpZ24oe30sIHtcbiAgICAgICAgICAgIGZpbmRNYXA6IHt9XG4gICAgICAgIH0sIHBhcmFtcyk7XG4gICAgICAgIHRoaXMudHlwZSA9IHR5cGUgfHwgJ2RlZmF1bHQnO1xuICAgICAgICB0aGlzLmRlc3Ryb3llZCA9IGZhbHNlO1xuICAgIH1cbiAgICBnZXQobmFtZSkge1xuICAgICAgICBpZiAobmFtZS5zdGFydHNXaXRoKCd2LicpIHx8IG5hbWUuc3RhcnRzV2l0aCgnYy4nKSB8fCBuYW1lLnN0YXJ0c1dpdGgoJ2UuJykpIHtcbiAgICAgICAgICAgIG5hbWUgPSBuYW1lLnN1YnN0cmluZygyKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gXy5nZXQodGhpcy5wYXJhbXMsIG5hbWUpO1xuICAgIH1cbiAgICBzZXQobmFtZSwgdmFsdWUpIHtcbiAgICAgICAgaWYgKG5hbWUuc3RhcnRzV2l0aCgndi4nKSB8fCBuYW1lLnN0YXJ0c1dpdGgoJ2MuJykgfHwgbmFtZS5zdGFydHNXaXRoKCdlLicpKSB7XG4gICAgICAgICAgICBuYW1lID0gbmFtZS5zdWJzdHJpbmcoMik7XG4gICAgICAgIH1cbiAgICAgICAgXy5zZXQodGhpcy5wYXJhbXMsIG5hbWUsIHZhbHVlKTtcbiAgICB9XG4gICAgZmluZChuYW1lKSB7XG4gICAgICAgIGxldCB0eXBlT3JDb21wb25lbnQgPSB0aGlzLnBhcmFtcy5maW5kTWFwW25hbWVdO1xuICAgICAgICBpZiAoIXR5cGVPckNvbXBvbmVudCAmJiB0aGlzLnBhcmFtcy5maW5kTWFwLmhhc093blByb3BlcnR5KG5hbWUpKSB7XG4gICAgICAgICAgICByZXR1cm4gdHlwZU9yQ29tcG9uZW50O1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGRlZmF1bHRQYXJhbXMgPSB7XG4gICAgICAgICAgICAnYXVyYTppZCc6IG5hbWVcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgY29uc3QgY29tcG9uZW50ID0gdGhpcy5wYXJhbXMuZmluZE1hcFtuYW1lXSA9IChBcnJheS5pc0FycmF5KHR5cGVPckNvbXBvbmVudCkgPyBcbiAgICAgICAgICAgIGNvbXBvbmVudEZhY3RvcnlGb3JBcnJheShkZWZhdWx0UGFyYW1zLCB0eXBlT3JDb21wb25lbnQpIDogXG4gICAgICAgICAgICBjb21wb25lbnRGYWN0b3J5KGRlZmF1bHRQYXJhbXMsIHR5cGVPckNvbXBvbmVudCkpXG4gICAgICAgIHJldHVybiBjb21wb25lbnQ7XG4gICAgfVxuICAgIGdldExvY2FsSWQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnBhcmFtc1snYXVyYTppZCddO1xuICAgIH1cbiAgICBjbGVhclJlZmVyZW5jZShrZXkpIHtcbiAgICAgICAgZGVsZXRlIHRoaXMucGFyYW1zW2tleV07XG4gICAgfVxuICAgIGdldENvbmNyZXRlQ29tcG9uZW50KCkge1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgZ2V0RWxlbWVudCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIGdldEVsZW1lbnRzKCkge1xuICAgICAgICByZXR1cm4gW3RoaXNdO1xuICAgIH1cbiAgICBnZXRFdmVudChuYW1lKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnBhcmFtc1tuYW1lXSB8fCBldmVudEZhY3RvcnkoKTtcbiAgICB9XG4gICAgZ2V0R2xvYmFsSWQoKSB7XG4gICAgICAgIHJldHVybiBgZ2xvYmFsLSR7dGhpcy5wYXJhbXNbJ2F1cmE6aWQnXX1gO1xuICAgIH1cbiAgICBnZXROYW1lKCkge1xuICAgICAgICByZXR1cm4gdGhpcy50eXBlO1xuICAgIH1cbiAgICBnZXRUeXBlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy50eXBlO1xuICAgIH1cbiAgICBnZXRSZWZlcmVuY2Uoa2V5KSB7XG4gICAgICAgIHJldHVybiB0aGlzLnBhcmFtc1trZXldO1xuICAgIH1cbiAgICBnZXRTdXBlcigpIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGdldFZlcnNpb24oKSB7XG4gICAgICAgIHJldHVybiAnMS4wJztcbiAgICB9XG4gICAgaXNDb25jcmV0ZSgpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIGlzSW5zdGFuY2VPZihuYW1lKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnR5cGUgPT09IG5hbWU7XG4gICAgfVxuICAgIGlzVmFsaWQoKSB7XG4gICAgICAgIHJldHVybiAhdGhpcy5kZXN0cm95ZWQ7XG4gICAgfVxuICAgIGFkZEV2ZW50SGFuZGxlcigpIHt9XG4gICAgYWRkSGFuZGxlcigpIHt9XG4gICAgYWRkVmFsdWVIYW5kbGVyKCkge31cbiAgICBhZGRWYWx1ZVByb3ZpZGVyKCkge31cbiAgICBhdXRvRGVzdHJveSgpIHt9XG4gICAgZGVzdHJveSgpIHtcbiAgICAgICAgdGhpcy5kZXN0cm95ZWQgPSB0cnVlO1xuICAgIH1cbiAgICByZW1vdmVFdmVudEhhbmRsZXIoKSB7fVxuXG59IiwiaW1wb3J0IHsgc3R1YmlmeUluc3RhbmNlIH0gZnJvbSAnLi9zaW5vbkhlbHBlcnMnXG5cbmNvbnN0IGNsYXNzTmFtZVRvQ29tcG9uZW50VmFyID0gY2xhc3NOYW1lID0+IGB2Ll9fY2xzXyR7Y2xhc3NOYW1lfWBcbmV4cG9ydCBjbGFzcyBBdXJhVXRpbCB7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHN0dWJpZnlJbnN0YW5jZShBdXJhVXRpbCwgdGhpcyk7XG4gICAgfVxuICAgIFxuICAgIGlzRW1wdHkob2JqKXtcbiAgICAgICAgaWYgKG9iaiA9PT0gdW5kZWZpbmVkIHx8IG9iaiA9PT0gbnVsbCB8fCBvYmogPT09ICcnKSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShvYmopKSB7XG4gICAgICAgICAgICByZXR1cm4gb2JqLmxlbmd0aCA9PT0gMDtcbiAgICAgICAgfSBlbHNlIGlmICh0eXBlb2Ygb2JqID09PSAnb2JqZWN0JyAmJiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwob2JqKSA9PT0gJ1tvYmplY3QgT2JqZWN0XScpIHtcbiAgICAgICAgICAgIHJldHVybiBPYmplY3Qua2V5cyhvYmopLmxlbmd0aCA9PT0gMDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIGlzVW5kZWZpbmVkT3JOdWxsKG9iaikge1xuICAgICAgICByZXR1cm4gb2JqID09PSB1bmRlZmluZWQgfHwgb2JqID09PSBudWxsO1xuICAgIH1cbiAgICBhZGRDbGFzcyhjb21wb25lbnQsIGNsYXNzTmFtZSkge1xuICAgICAgICByZXR1cm4gY29tcG9uZW50LnNldChjbGFzc05hbWVUb0NvbXBvbmVudFZhcihjbGFzc05hbWUpLCB0cnVlKTtcbiAgICB9XG4gICAgcmVtb3ZlQ2xhc3MoY29tcG9uZW50LCBjbGFzc05hbWUpIHtcbiAgICAgICAgcmV0dXJuIGNvbXBvbmVudC5zZXQoY2xhc3NOYW1lVG9Db21wb25lbnRWYXIoY2xhc3NOYW1lKSwgZmFsc2UpO1xuICAgIH1cbiAgICBoYXNDbGFzcyhjb21wb25lbnQsIGNsYXNzTmFtZSkge1xuICAgICAgICByZXR1cm4gY29tcG9uZW50LmdldChjbGFzc05hbWVUb0NvbXBvbmVudFZhcihjbGFzc05hbWUpKTtcbiAgICB9XG4gICAgdG9nZ2xlQ2xhc3MoY29tcG9uZW50LCBjbGFzc05hbWUpIHtcbiAgICAgICAgY29tcG9uZW50LnNldChjbGFzc05hbWVUb0NvbXBvbmVudFZhcihjbGFzc05hbWUpLCAhY29tcG9uZW50LmdldChjbGFzc05hbWVUb0NvbXBvbmVudFZhcihjbGFzc05hbWUpKSk7XG4gICAgfVxuICAgIGdldEJvb2xlYW5WYWx1ZSh2YWwpIHtcbiAgICAgICAgLy8gUG9ydGVkOiBodHRwczovL2dpdGh1Yi5jb20vZm9yY2Vkb3Rjb20vYXVyYS9ibG9iL21hc3Rlci9hdXJhLWltcGwvc3JjL21haW4vcmVzb3VyY2VzL2F1cmEvdXRpbC9VdGlsLmpzI0wzNjZcbiAgICAgICAgcmV0dXJuIHZhbCAhPT0gdW5kZWZpbmVkICYmIHZhbCAhPT0gbnVsbCAmJiB2YWwgIT09IGZhbHNlICYmIHZhbCAhPT0gMCAmJiB2YWwgIT09ICdmYWxzZScgJiYgdmFsICE9PSAnJyAmJiB2YWwgIT09ICdmJztcbiAgICB9XG4gICAgaXNBcnJheShhcnIpIHtcbiAgICAgICAgLy8gUG9ydGVkOiBodHRwczovL2dpdGh1Yi5jb20vZm9yY2Vkb3Rjb20vYXVyYS9ibG9iL21hc3Rlci9hdXJhLWltcGwvc3JjL21haW4vcmVzb3VyY2VzL2F1cmEvdXRpbC9VdGlsLmpzI0wxODlcbiAgICAgICAgcmV0dXJuICh0eXBlb2YgQXJyYXkuaXNBcnJheSA9PT0gXCJmdW5jdGlvblwiID8gQXJyYXkuaXNBcnJheSA6IGZ1bmN0aW9uKGFyZykge1xuICAgICAgICAgICAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChhcmcpID09PSAnW29iamVjdCBBcnJheV0nO1xuICAgICAgICB9KShhcnIpO1xuICAgIH1cbiAgICBpc09iamVjdChvYmopIHtcbiAgICAgICAgLy9Qb3J0ZWQ6IGh0dHBzOi8vZ2l0aHViLmNvbS9mb3JjZWRvdGNvbS9hdXJhL2Jsb2IvbWFzdGVyL2F1cmEtaW1wbC9zcmMvbWFpbi9yZXNvdXJjZXMvYXVyYS91dGlsL1V0aWwuanMjTDIwNFxuICAgICAgICByZXR1cm4gdHlwZW9mIG9iaiA9PT0gXCJvYmplY3RcIiAmJiBvYmogIT09IG51bGwgJiYgIUFycmF5LmlzQXJyYXkob2JqKTtcbiAgICB9XG4gICAgaXNVbmRlZmluZWQob2JqKXtcbiAgICAgICAgLy9Qb3J0ZWQ6IGh0dHBzOi8vZ2l0aHViLmNvbS9mb3JjZWRvdGNvbS9hdXJhL2Jsb2IvbWFzdGVyL2F1cmEtaW1wbC9zcmMvbWFpbi9yZXNvdXJjZXMvYXVyYS91dGlsL1V0aWwuanMjTDMxOVxuICAgICAgICByZXR1cm4gb2JqID09PSB1bmRlZmluZWQ7XG4gICAgfVxufVxuXG4iLCJpbXBvcnQgeyBzdHViaWZ5SW5zdGFuY2UgfSBmcm9tICcuL3Npbm9uSGVscGVycydcbmltcG9ydCB7IEF1cmFVdGlsIH0gZnJvbSAnLi9hdXJhVXRpbCdcblxuZXhwb3J0IGZ1bmN0aW9uIGF1cmFGYWN0b3J5KHBhcmFtcyA9IHt9LCBzdHViaWZ5UGFyYW1zKSB7XG4gICAgcmV0dXJuIHN0dWJpZnlJbnN0YW5jZShBdXJhLCBuZXcgQXVyYShwYXJhbXMpLCBzdHViaWZ5UGFyYW1zKTtcbn1cblxuaW1wb3J0IHsgY29tcG9uZW50RmFjdG9yeSB9IGZyb20gJy4vY29tcG9uZW50RmFjdG9yeSdcblxuY2xhc3MgQXVyYSB7XG4gICAgY29uc3RydWN0b3IocGFyYW1zKSB7XG4gICAgICAgIHRoaXMucGFyYW1zID0gcGFyYW1zO1xuICAgICAgICB0aGlzLnV0aWwgPSBuZXcgQXVyYVV0aWwoKTtcbiAgICB9XG4gICAgXG4gICAgc2V0UGFyYW1zKHBhcmFtcykge1xuICAgICAgICBPYmplY3QuYXNzaWduKHRoaXMucGFyYW1zLCBwYXJhbXMpO1xuICAgIH1cblxuICAgIGdldChuYW1lKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnBhcmFtc1tuYW1lXTtcbiAgICB9XG5cbiAgICBzZXQobmFtZSwgdmFsdWUpIHtcbiAgICAgICAgdGhpcy5wYXJhbXNbbmFtZV0gPSB2YWx1ZTtcbiAgICB9XG4gICAgXG4gICAgZW5xdWV1ZUFjdGlvbihhY3Rpb24pIHtcbiAgICAgICAgYWN0aW9uICYmIGFjdGlvbi5pbnZva2VDYWxsYmFjayAmJiBhY3Rpb24uaW52b2tlQ2FsbGJhY2sodHJ1ZSlcbiAgICB9XG5cbiAgICBjcmVhdGVDb21wb25lbnQodHlwZSwgYXR0cmlidXRlcywgY2FsbGJhY2spIHtcbiAgICAgICAgdGhpcy5jcmVhdGVDb21wb25lbnQudHlwZSA9IHR5cGU7XG4gICAgICAgIHRoaXMuY3JlYXRlQ29tcG9uZW50LmF0dHJpYnV0ZXMgPSBhdHRyaWJ1dGVzO1xuICAgICAgICAvLyBHZXQgY29tcG9uZW50IGluc3RhbmNlLlxuICAgICAgICAvLyBVc2UgZXhpc3RpbmcgY29tcG9uZW50IGluc3RhbmNlIGlmIHNldFxuICAgICAgICAvLyBDcmVhdGUgbmV3IGRlZmF1bHQgY29tcG9uZW50IGlmIGNvbXBvbmVudCBub3Qgc2V0XG4gICAgICAgIGxldCB7IGNvbXBvbmVudCB9ID0gdGhpcy5jcmVhdGVDb21wb25lbnQ7XG4gICAgICAgIGlmICghY29tcG9uZW50KSB7XG4gICAgICAgICAgICBjb21wb25lbnQgPSBuZXcgY29tcG9uZW50RmFjdG9yeShhdHRyaWJ1dGVzLCB0eXBlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuY3JlYXRlQ29tcG9uZW50LmNvbXBvbmVudCA9IG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGNhbGxiYWNrKSB7XG4gICAgICAgICAgICBjYWxsYmFjayhjb21wb25lbnQsICdTVUNDRVNTJywgWydTVUNDRVNTJ10pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBjb21wb25lbnQ7XG4gICAgfVxuICAgIGNyZWF0ZUNvbXBvbmVudHMoY29tcG9uZW50RGVmcywgY2FsbGJhY2spIHtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gY29tcG9uZW50RGVmc1xuICAgICAgICAgICAgLm1hcChkZWYgPT4gdGhpcy5jcmVhdGVDb21wb25lbnQoZGVmWzBdLCBkZWZbMV0pKVxuICAgICAgICBpZiAoY2FsbGJhY2spIHtcbiAgICAgICAgICAgIGNhbGxiYWNrKHJlc3VsdCwgJ1NVQ0NFU1MnLCByZXN1bHQubWFwKCAoKSA9PiAnU1VDQ0VTUycpKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cbiAgICBnZXRDYWxsYmFjayhjYWxsYmFjaykge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24oLi4uYXJncykge1xuICAgICAgICAgICAgY2FsbGJhY2sgJiYgY2FsbGJhY2soLi4uYXJncyk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZ2V0Q29tcG9uZW50KGlkKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnBhcmFtc1tpZF07XG4gICAgfVxuICAgIGdldFJlZmVyZW5jZSgpIHt9XG4gICAgZ2V0Um9vdCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucm9vdENvbXBvbmVudCB8fCAodGhpcy5yb290Q29tcG9uZW50ID0gbmV3IGNvbXBvbmVudEZhY3RvcnkoKSk7XG4gICAgfVxuICAgIGdldFRva2VuKG5hbWUpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucGFyYW1zWyd0b2tlbi4nICsgbmFtZV1cbiAgICB9XG4gICAgbG9nKHZhbHVlLCBlcnIpIHtcbiAgICAgICAgLyplc2xpbnQgbm8tY29uc29sZTogMCovXG4gICAgICAgIGNvbnNvbGUgJiYgY29uc29sZS5sb2codmFsdWUsIGVycilcbiAgICB9XG4gICAgcmVwb3J0RXJyb3IoKSB7fVxufSIsImltcG9ydCB7IHN0dWJpZnlJbnN0YW5jZU9uRGVtYW5kIH0gZnJvbSAnLi9zaW5vbkhlbHBlcnMnXG5cbmV4cG9ydCBmdW5jdGlvbiBhcGV4Q2FsbEZhY3RvcnkocGFyYW1zID0ge30pIHtcbiAgICByZXR1cm4gc3R1YmlmeUluc3RhbmNlT25EZW1hbmQoQXBleENhbGwsIG5ldyBBcGV4Q2FsbChwYXJhbXMpKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGFwZXhTdWNjZXNzUmVzdWx0KHJlc3BvbnNlID0ge30pIHtcbiAgICByZXR1cm4gc3R1YmlmeUluc3RhbmNlT25EZW1hbmQoQXBleENhbGxSZXN1bHQsIG5ldyBBcGV4Q2FsbFJlc3VsdChyZXNwb25zZSkpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYXBleEVycm9yUmVzdWx0KG1lc3NhZ2UpIHtcbiAgICByZXR1cm4gc3R1YmlmeUluc3RhbmNlT25EZW1hbmQoQXBleENhbGxSZXN1bHQsIG5ldyBBcGV4Q2FsbFJlc3VsdChudWxsLCBtZXNzYWdlKSk7XG59XG5cbmNsYXNzIEFwZXhDYWxsIHtcbiAgICBjb25zdHJ1Y3RvcihyZXN1bHQsIGludm9rZUNhbGxiYWNrT25FbnF1ZXVlID0gdHJ1ZSkge1xuICAgICAgICB0aGlzLnBhcmFtcyA9IG51bGw7XG4gICAgICAgIHRoaXMucmVzdWx0ID0gcmVzdWx0O1xuICAgICAgICB0aGlzLmludm9rZUNhbGxiYWNrT25FbnF1ZXVlID0gaW52b2tlQ2FsbGJhY2tPbkVucXVldWU7XG4gICAgICAgIHRoaXMuaXNCYWNrZ3JvdW5kID0gZmFsc2U7XG4gICAgICAgIHRoaXMuc2V0QWJvcnRhYmxlID0gZmFsc2U7XG4gICAgfVxuICAgIHNldFBhcmFtcyhwYXJhbXMpIHtcbiAgICAgICAgdGhpcy5wYXJhbXMgPSBwYXJhbXM7XG4gICAgfVxuICAgIHNldFBhcmFtKGtleSwgdmFsdWUpIHtcbiAgICAgICAgdGhpcy5wYXJhbXMgPSBPYmplY3QuYXNzaWduKHRoaXMucGFyYW1zLCB7W2tleV0gOiB2YWx1ZX0pO1xuICAgIH1cbiAgICBnZXRQYXJhbXMoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnBhcmFtcztcbiAgICB9XG4gICAgc2V0Q2FsbGJhY2soY3R4LCBjYWxsYmFjaykge1xuICAgICAgICB0aGlzLmN0eCA9IGN0eDtcbiAgICAgICAgdGhpcy5jYWxsYmFjayA9IGNhbGxiYWNrO1xuICAgIH1cbiAgICBpbnZva2VDYWxsYmFjayhmcm9tRW5xdWV1ZSA9IGZhbHNlKSB7XG4gICAgICAgIGlmIChmcm9tRW5xdWV1ZSAmJiAhdGhpcy5pbnZva2VDYWxsYmFja09uRW5xdWV1ZSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuY2FsbGJhY2sgJiYgdGhpcy5jYWxsYmFjay5iaW5kKHRoaXMuY3R4KSh0aGlzLnJlc3VsdCk7XG4gICAgfVxuICAgIGdldEVycm9yKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5yZXN1bHQuZ2V0RXJyb3IoKTtcbiAgICB9XG4gICAgZ2V0UGFyYW0obmFtZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5wYXJhbXMgPyB0aGlzLnBhcmFtc1tuYW1lXSA6IG51bGw7XG4gICAgfVxuICAgIGdldFJldHVyblZhbHVlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5yZXN1bHQ7XG4gICAgfVxuICAgIGdldFN0YXRlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5yZXN1bHQuZ2V0U3RhdGUoKTtcbiAgICB9XG4gICAgaXNCYWNrZ3JvdW5kKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5pc0JhY2tncm91bmQ7XG4gICAgfVxuICAgIHNldEFib3J0YWJsZSgpIHtcbiAgICB9XG4gICAgc2V0QmFja2dyb3VuZCgpIHtcbiAgICAgICAgdGhpcy5pc0JhY2tncm91bmQgPSB0cnVlO1xuICAgIH1cbiAgICBzZXRTdG9yYWJsZSgpIHtcbiAgICB9XG59XG5cbmNsYXNzIEFwZXhDYWxsUmVzdWx0IHtcbiAgICBjb25zdHJ1Y3RvcihyZXNwb25zZSwgZXJyb3JNZXNzYWdlID0gbnVsbCkge1xuICAgICAgICB0aGlzLnJlc3BvbnNlID0gcmVzcG9uc2U7XG4gICAgICAgIHRoaXMuZXJyb3JNZXNzYWdlID0gZXJyb3JNZXNzYWdlO1xuICAgIH1cbiAgICBnZXRTdGF0ZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZXJyb3JNZXNzYWdlID8gJ0VSUk9SJyA6ICdTVUNDRVNTJ1xuICAgIH1cbiAgICBnZXRFcnJvcigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZXJyb3JNZXNzYWdlID8gW3ttZXNzYWdlOiB0aGlzLmVycm9yTWVzc2FnZX1dIDogW11cbiAgICB9XG4gICAgZ2V0UmV0dXJuVmFsdWUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnJlc3BvbnNlO1xuICAgIH1cbn0iLCJpbXBvcnQgeyBldmVudEZhY3RvcnkgfSBmcm9tICcuL2V2ZW50RmFjdG9yeSdcbmltcG9ydCB7IGNvbXBvbmVudEZhY3RvcnksIHVzZUNvbXBvbmVudEFkYXB0ZXJzIH0gZnJvbSAnLi9jb21wb25lbnRGYWN0b3J5J1xuaW1wb3J0IHsgYXVyYUZhY3RvcnkgfSBmcm9tICcuL2F1cmFGYWN0b3J5J1xuaW1wb3J0IHsgQXVyYVV0aWwgfSBmcm9tICcuL2F1cmFVdGlsJ1xuaW1wb3J0IHsgYXBleENhbGxGYWN0b3J5LCBhcGV4U3VjY2Vzc1Jlc3VsdCwgYXBleEVycm9yUmVzdWx0IH0gZnJvbSAnLi9hcGV4Q2FsbEZhY3RvcnknXG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIEF1cmFVdGlsLFxuICAgIGV2ZW50RmFjdG9yeSxcbiAgICBjb21wb25lbnRGYWN0b3J5LFxuICAgIHVzZUNvbXBvbmVudEFkYXB0ZXJzLFxuICAgIGF1cmFGYWN0b3J5LFxuICAgIGFwZXhDYWxsRmFjdG9yeSxcbiAgICBhcGV4U3VjY2Vzc1Jlc3VsdCxcbiAgICBhcGV4RXJyb3JSZXN1bHRcbn0iXSwibmFtZXMiOlsic2lub24iLCJyZXF1aXJlIiwic3R1YmlmeUluc3RhbmNlIiwiY3RvciIsImluc3RhbmNlIiwicGFyYW1zIiwicHJvcEV4Y2x1ZGVkIiwicHJvcCIsImRvTm90TW9jayIsIkFycmF5IiwiaXNBcnJheSIsImluZGV4T2YiLCJnZXRPd25Qcm9wZXJ0eU5hbWVzIiwicHJvdG90eXBlIiwiZm9yRWFjaCIsInN0dWIiLCJjYWxsc0Zha2UiLCJwcm9wTmFtZSIsImFyZ3MiLCJjYWxsIiwic3R1YmlmeUluc3RhbmNlT25EZW1hbmQiLCJoYW5kbGVyIiwidGFyZ2V0IiwicHJvcGVydHkiLCJkZXNjcmlwdG9yIiwiX2luc3RhbmNlUHJvcHMiLCJwcm9wS2V5IiwidmFsdWUiLCJ1bmRlZmluZWQiLCJ3YXJuIiwic3R1Yk5hbWUiLCJpc1NweU9yU3R1YmJlZCIsImNhbGxlZEJlZm9yZSIsImhhc09uUHJvdG8iLCJwcm94eSIsIlByb3h5IiwiZXZlbnRGYWN0b3J5IiwiRXZlbnQiLCJGQUtFX0VWRU5UX05BTUUiLCJrZXkiLCJldmVudE5hbWUiLCJuYW1lIiwiXyIsIkRlZmF1bHRDb21wb25lbnRBZGFwdGVyIiwiV2VsbEtub3duQ29tcG9uZW50cyIsIkNvbXBvbmVudEFkYXB0ZXJzIiwiY29tcG9uZW50RmFjdG9yeUZvckFycmF5IiwiYXJyYXlPZlR5cGVzIiwibWFwIiwiY29tcG9uZW50RmFjdG9yeSIsInR5cGVPckNvbXBvbmVudCIsIkVycm9yIiwiQ29tcG9uZW50IiwiYWRhcHRlck5hbWUiLCJ0b0xvd2VyQ2FzZSIsInJlcGxhY2UiLCJhZGFwdGVyIiwic29tZSIsInN0YXJ0c1dpdGgiLCJ1c2VDb21wb25lbnRBZGFwdGVycyIsInJlZ2lzdHJhdG9yIiwicmVnaXN0ZXIiLCJjb21wb25lbnRUeXBlIiwidHlwZSIsIk9iamVjdCIsImFzc2lnbiIsImRlc3Ryb3llZCIsInN1YnN0cmluZyIsImdldCIsInNldCIsImZpbmRNYXAiLCJoYXNPd25Qcm9wZXJ0eSIsImRlZmF1bHRQYXJhbXMiLCJjb21wb25lbnQiLCJjbGFzc05hbWVUb0NvbXBvbmVudFZhciIsImNsYXNzTmFtZSIsIkF1cmFVdGlsIiwib2JqIiwibGVuZ3RoIiwidG9TdHJpbmciLCJrZXlzIiwidmFsIiwiYXJyIiwiYXJnIiwiYXVyYUZhY3RvcnkiLCJzdHViaWZ5UGFyYW1zIiwiQXVyYSIsInV0aWwiLCJhY3Rpb24iLCJpbnZva2VDYWxsYmFjayIsImF0dHJpYnV0ZXMiLCJjYWxsYmFjayIsImNyZWF0ZUNvbXBvbmVudCIsImNvbXBvbmVudERlZnMiLCJyZXN1bHQiLCJkZWYiLCJpZCIsInJvb3RDb21wb25lbnQiLCJlcnIiLCJjb25zb2xlIiwibG9nIiwiYXBleENhbGxGYWN0b3J5IiwiQXBleENhbGwiLCJhcGV4U3VjY2Vzc1Jlc3VsdCIsInJlc3BvbnNlIiwiQXBleENhbGxSZXN1bHQiLCJhcGV4RXJyb3JSZXN1bHQiLCJtZXNzYWdlIiwiaW52b2tlQ2FsbGJhY2tPbkVucXVldWUiLCJpc0JhY2tncm91bmQiLCJzZXRBYm9ydGFibGUiLCJjdHgiLCJmcm9tRW5xdWV1ZSIsImJpbmQiLCJnZXRFcnJvciIsImdldFN0YXRlIiwiZXJyb3JNZXNzYWdlIiwibW9kdWxlIiwiZXhwb3J0cyJdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQSxJQUFNQSxRQUFRQyxRQUFRLE9BQVIsQ0FBZDs7QUFFQSxBQUFPLFNBQVNDLGVBQVQsQ0FBeUJDLElBQXpCLEVBQStCQyxRQUEvQixFQUF5Q0MsTUFBekMsRUFBaUQ7UUFDOUNDLGVBQWUsU0FBZkEsWUFBZSxDQUFDQyxJQUFEO2VBQVVGLFVBQVVBLE9BQU9HLFNBQWpCLEtBQStCQyxNQUFNQyxPQUFOLENBQWNMLE9BQU9HLFNBQXJCLElBQzFESCxPQUFPRyxTQUFQLENBQWlCRyxPQUFqQixDQUF5QkosSUFBekIsTUFBbUMsQ0FBQyxDQURzQixHQUNsQkYsT0FBT0csU0FBUCxLQUFxQkQsSUFEbEMsQ0FBVjtLQUFyQjs7V0FHT0ssbUJBQVAsQ0FBMkJULEtBQUtVLFNBQWhDLEVBQTJDQyxPQUEzQyxDQUFtRCxnQkFBUTtZQUNuRFIsYUFBYUMsSUFBYixLQUFzQixPQUFPSixLQUFLVSxTQUFMLENBQWVOLElBQWYsQ0FBUCxLQUFnQyxVQUF0RCxJQUFvRUEsU0FBUyxhQUFqRixFQUFnRzs7O2lCQUd2RixVQUFVQSxJQUFuQixJQUEyQlAsTUFBTWUsSUFBTixDQUFXWCxRQUFYLEVBQXFCRyxJQUFyQixFQUEyQlMsU0FBM0IsQ0FBc0MsVUFBQ0MsUUFBRDttQkFBYyxZQUFhOzs7a0RBQVRDLElBQVM7d0JBQUE7Ozt1QkFDakYsOEJBQUtMLFNBQUwsQ0FBZUksUUFBZixHQUF5QkUsSUFBekIsK0JBQThCZixRQUE5QixTQUEyQ2MsSUFBM0MsRUFBUDthQUQ2RDtTQUFELENBRTdEWCxJQUY2RCxDQUFyQyxDQUEzQjtLQUpKO1dBUU9ILFFBQVA7OztBQUdKLEFBQU8sU0FBU2dCLHVCQUFULENBQWlDakIsSUFBakMsRUFBdUNDLFFBQXZDLEVBQWlEO1FBQzlDaUIsVUFBVTt3QkFDSSxFQURKO3NCQUFBLDBCQUVHQyxN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
