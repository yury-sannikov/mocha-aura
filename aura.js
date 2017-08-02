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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXVyYS5qcyIsInNvdXJjZXMiOlsibGliL3Npbm9uSGVscGVycy5qcyIsImxpYi9ldmVudEZhY3RvcnkuanMiLCJsaWIvY29tcG9uZW50RmFjdG9yeS5qcyIsImxpYi9hdXJhVXRpbC5qcyIsImxpYi9hdXJhRmFjdG9yeS5qcyIsImxpYi9hcGV4Q2FsbEZhY3RvcnkuanMiLCJsaWIvYXVyYS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKmdsb2JhbCBQcm94eSovXG5jb25zdCBzaW5vbiA9IHJlcXVpcmUoJ3Npbm9uJyk7XG5cbmV4cG9ydCBmdW5jdGlvbiBzdHViaWZ5SW5zdGFuY2UoY3RvciwgaW5zdGFuY2UsIHBhcmFtcykge1xuICAgIGNvbnN0IHByb3BFeGNsdWRlZCA9IChwcm9wKSA9PiBwYXJhbXMgJiYgcGFyYW1zLmRvTm90TW9jayAmJiAoQXJyYXkuaXNBcnJheShwYXJhbXMuZG9Ob3RNb2NrKSA/IFxuICAgICAgICBwYXJhbXMuZG9Ob3RNb2NrLmluZGV4T2YocHJvcCkgIT09IC0xIDogcGFyYW1zLmRvTm90TW9jayA9PT0gcHJvcCk7XG5cbiAgICBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyhjdG9yLnByb3RvdHlwZSkuZm9yRWFjaChwcm9wID0+IHtcbiAgICAgICAgaWYgKHByb3BFeGNsdWRlZChwcm9wKSB8fCB0eXBlb2YgY3Rvci5wcm90b3R5cGVbcHJvcF0gIT09ICdmdW5jdGlvbicgfHwgcHJvcCA9PT0gJ2NvbnN0cnVjdG9yJykge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGluc3RhbmNlWydzdHViXycgKyBwcm9wXSA9IHNpbm9uLnN0dWIoaW5zdGFuY2UsIHByb3ApLmNhbGxzRmFrZSgoKHByb3BOYW1lKSA9PiAoLi4uYXJncykgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIGN0b3IucHJvdG90eXBlW3Byb3BOYW1lXS5jYWxsKGluc3RhbmNlLCAuLi5hcmdzKTtcbiAgICAgICAgfSkocHJvcCkpXG4gICAgfSlcbiAgICByZXR1cm4gaW5zdGFuY2U7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzdHViaWZ5SW5zdGFuY2VPbkRlbWFuZChjdG9yLCBpbnN0YW5jZSkge1xuICAgIGNvbnN0IGhhbmRsZXIgPSB7XG4gICAgICAgIF9pbnN0YW5jZVByb3BzOiB7fSxcbiAgICAgICAgZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBwcm9wZXJ0eSwgZGVzY3JpcHRvcikge1xuICAgICAgICAgICAgaGFuZGxlci5faW5zdGFuY2VQcm9wc1twcm9wZXJ0eV0gPSBkZXNjcmlwdG9yO1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH0sXG4gICAgICAgIGdldCh0YXJnZXQsIHByb3BLZXkpIHtcbiAgICAgICAgICAgIC8vIENoZWNrIGZvciBTeW1ib2wgZm9yIGl0ZXJhdG9yc1xuICAgICAgICAgICAgaWYgKHR5cGVvZiBwcm9wS2V5ICE9PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgICAgIHJldHVybiB0YXJnZXRbcHJvcEtleV07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBJZiB3ZSBhZGQgc29tZSBwcm9wcyB0byB0aGUgaW5zdGFuY2UsIHJldHVybiBpdCB3L28gbW9ja2luZ1xuICAgICAgICAgICAgLy8gVXN1YWxseSBhZGRlZCBzdHVmZiBpcyBtb2NrZWQgdGhyb3VnaCBkYXRhIGFkYXB0ZXJzXG4gICAgICAgICAgICBpZiAoaGFuZGxlci5faW5zdGFuY2VQcm9wc1twcm9wS2V5XSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBoYW5kbGVyLl9pbnN0YW5jZVByb3BzW3Byb3BLZXldLnZhbHVlXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vV2FybiBvbiB1bmtub3duIHByb3BLZXkgZm9yIGJldHRlciBkZWJ1Z2dpbmdcbiAgICAgICAgICAgIGlmICghdGFyZ2V0W3Byb3BLZXldKSB7XG4gICAgICAgICAgICAgICAgLyplc2xpbnQgbm8tY29uc29sZTogMCovXG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCdcXG5cXG5zdHViaWZ5SW5zdGFuY2VPbkRlbWFuZDogVW5rbm93biBwcm9wZXJ0eSAnICsgcHJvcEtleSwgJ1xcblxcbicpO1xuICAgICAgICAgICAgICAgIHJldHVybiB0YXJnZXRbcHJvcEtleV07XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIFN0dWIgbWV0aG9kcyB0aGF0IGRlZmluZWQgb24gcHJvdG90eXBlIG9ubHksIGUuZy4gaGFzIHB1YmxpYyBhcGlcbiAgICAgICAgICAgIGNvbnN0IHN0dWJOYW1lID0gJ3N0dWJfJyArIHByb3BLZXk7XG4gICAgICAgICAgICBjb25zdCBpc1NweU9yU3R1YmJlZCA9ICEhKHRhcmdldFtwcm9wS2V5XSAmJiB0YXJnZXRbcHJvcEtleV0uY2FsbGVkQmVmb3JlKTtcbiAgICAgICAgICAgIGNvbnN0IGhhc09uUHJvdG8gPSAhIWN0b3IucHJvdG90eXBlW3Byb3BLZXldO1xuXG4gICAgICAgICAgICBpZiAoaGFzT25Qcm90byAmJiAhaXNTcHlPclN0dWJiZWQgJiYgdHlwZW9mIHRhcmdldFtwcm9wS2V5XSA9PT0gJ2Z1bmN0aW9uJyAmJiBwcm9wS2V5ICE9PSAnY29uc3RydWN0b3InKSB7XG4gICAgICAgICAgICAgICAgdGFyZ2V0W3N0dWJOYW1lXSA9IHNpbm9uLnN0dWIodGFyZ2V0LCBwcm9wS2V5KS5jYWxsc0Zha2UoKC4uLmFyZ3MpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGN0b3IucHJvdG90eXBlW3Byb3BLZXldLmNhbGwoaW5zdGFuY2UsIC4uLmFyZ3MpO1xuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gdGFyZ2V0W3Byb3BLZXldO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgY29uc3QgcHJveHkgPSBuZXcgUHJveHkoaW5zdGFuY2UsIGhhbmRsZXIpO1xuICAgIHJldHVybiBwcm94eTtcbn0iLCJpbXBvcnQgeyBzdHViaWZ5SW5zdGFuY2VPbkRlbWFuZCB9IGZyb20gJy4vc2lub25IZWxwZXJzJ1xuXG5leHBvcnQgZnVuY3Rpb24gZXZlbnRGYWN0b3J5KHBhcmFtcyA9IHt9KSB7XG4gICAgcmV0dXJuIHN0dWJpZnlJbnN0YW5jZU9uRGVtYW5kKEV2ZW50LCBuZXcgRXZlbnQocGFyYW1zKSk7XG59XG5jb25zdCBGQUtFX0VWRU5UX05BTUUgPSAnbW9jaGEtYXVyYS1mYWtlLWV2ZW50J1xuXG5jbGFzcyBFdmVudCB7XG4gICAgY29uc3RydWN0b3IocGFyYW1zKSB7XG4gICAgICAgIHRoaXMucGFyYW1zID0gcGFyYW1zIHx8IHt9O1xuICAgIH1cbiAgICBzZXRQYXJhbXMocGFyYW1zKSB7XG4gICAgICAgIHRoaXMucGFyYW1zID0gcGFyYW1zO1xuICAgIH1cbiAgICBzZXRQYXJhbShrZXksIHZhbHVlKSB7XG4gICAgICAgIHRoaXMucGFyYW1zW2tleV0gPSB2YWx1ZTtcbiAgICB9XG4gICAgZ2V0UGFyYW1zKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wYXJhbXM7XG4gICAgfVxuICAgIGdldEV2ZW50VHlwZSgpIHtcbiAgICAgICAgcmV0dXJuICdBUFBMSUNBVElPTidcbiAgICB9XG4gICAgZ2V0TmFtZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucGFyYW1zLmV2ZW50TmFtZSB8fCBGQUtFX0VWRU5UX05BTUVcbiAgICB9XG4gICAgZ2V0UGFyYW0obmFtZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5wYXJhbXNbbmFtZV1cbiAgICB9XG4gICAgZ2V0UGhhc2UoKSB7XG4gICAgICAgIHJldHVybiAnZGVmYXVsdCdcbiAgICB9XG4gICAgZ2V0U291cmNlKCkge1xuICAgICAgICByZXR1cm4gbnVsbFxuICAgIH1cbiAgICBnZXRUeXBlKCkge1xuICAgICAgICByZXR1cm4gYGM6JHtGQUtFX0VWRU5UX05BTUV9YFxuICAgIH1cbiAgICBmaXJlKCkge31cbiAgICBwYXVzZSgpIHt9XG4gICAgcHJldmVudERlZmF1bHQoKSB7fVxuICAgIHJlc3VtZSgpIHt9XG4gICAgc3RvcFByb3BhZ2F0aW9uKCkge31cbiAgICBcblxufSIsImNvbnN0IF8gPSByZXF1aXJlKCdsb2Rhc2gnKTtcbmltcG9ydCB7IGV2ZW50RmFjdG9yeSB9IGZyb20gJy4vZXZlbnRGYWN0b3J5J1xuaW1wb3J0IHsgc3R1YmlmeUluc3RhbmNlT25EZW1hbmQgfSBmcm9tICcuL3Npbm9uSGVscGVycydcblxuY29uc3QgRGVmYXVsdENvbXBvbmVudEFkYXB0ZXIgPSAnZGVmYXVsdCdcbmNvbnN0IFdlbGxLbm93bkNvbXBvbmVudHMgPSBbJ2F1cmE6JywgJ2ZvcmNlOicsICdmb3JjZUNoYXR0ZXI6JywgJ2xpZ2h0bmluZzonLCAndWk6JywgJ2M6J11cblxubGV0IENvbXBvbmVudEFkYXB0ZXJzID0ge1xuICAgIFtEZWZhdWx0Q29tcG9uZW50QWRhcHRlcl06IGluc3RhbmNlID0+IGluc3RhbmNlXG59XG5cbmZ1bmN0aW9uIGNvbXBvbmVudEZhY3RvcnlGb3JBcnJheShwYXJhbXMsIGFycmF5T2ZUeXBlcykge1xuICAgIHJldHVybiBhcnJheU9mVHlwZXMubWFwKHR5cGVPckNvbXBvbmVudCA9PiBjb21wb25lbnRGYWN0b3J5KHBhcmFtcywgdHlwZU9yQ29tcG9uZW50KSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjb21wb25lbnRGYWN0b3J5KHBhcmFtcyA9IHt9LCB0eXBlT3JDb21wb25lbnQgPSBEZWZhdWx0Q29tcG9uZW50QWRhcHRlcikge1xuICAgIGlmIChBcnJheS5pc0FycmF5KHR5cGVPckNvbXBvbmVudCkpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdVbmV4cGVjdGVkIHR5cGUgYXJndW1lbnQnKVxuICAgIH1cblxuICAgIGlmICh0eXBlT3JDb21wb25lbnQgPT09IHRydWUpIHtcbiAgICAgICAgdHlwZU9yQ29tcG9uZW50ID0gRGVmYXVsdENvbXBvbmVudEFkYXB0ZXJcbiAgICB9IGVsc2UgaWYgKHR5cGVPckNvbXBvbmVudCBpbnN0YW5jZW9mIENvbXBvbmVudCkge1xuICAgICAgICByZXR1cm4gdHlwZU9yQ29tcG9uZW50O1xuICAgIH0gZWxzZSBpZiAodHlwZU9yQ29tcG9uZW50ID09PSBudWxsKSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIGxldCBpbnN0YW5jZSA9IHN0dWJpZnlJbnN0YW5jZU9uRGVtYW5kKENvbXBvbmVudCwgbmV3IENvbXBvbmVudChwYXJhbXMsIHR5cGVPckNvbXBvbmVudCkpO1xuICAgIGxldCBhZGFwdGVyTmFtZSA9IHR5cGVPckNvbXBvbmVudC50b0xvd2VyQ2FzZSgpLnJlcGxhY2UoJ21hcmt1cDovLycsICcnKVxuICAgIGxldCBhZGFwdGVyID0gQ29tcG9uZW50QWRhcHRlcnNbYWRhcHRlck5hbWVdO1xuICAgIGlmICghYWRhcHRlcikge1xuICAgICAgICBpZiAoIV8uc29tZShXZWxsS25vd25Db21wb25lbnRzLCBuYW1lID0+IGFkYXB0ZXJOYW1lLnN0YXJ0c1dpdGgobmFtZSkpKSB7XG4gICAgICAgICAgICAvKmVzbGludCBuby1jb25zb2xlOiAwKi9cbiAgICAgICAgICAgIGNvbnNvbGUud2FybihgVW5hYmxlIHRvIGZpbmQgY29tcG9uZW50IGFkYXB0ZXIgJHt0eXBlT3JDb21wb25lbnR9YCk7XG4gICAgICAgIH1cbiAgICAgICAgYWRhcHRlciA9IENvbXBvbmVudEFkYXB0ZXJzW0RlZmF1bHRDb21wb25lbnRBZGFwdGVyXTtcbiAgICB9XG4gICAgcmV0dXJuIGFkYXB0ZXIoaW5zdGFuY2UsIHBhcmFtcyk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB1c2VDb21wb25lbnRBZGFwdGVycyhyZWdpc3RyYXRvcikge1xuICAgIGNvbnN0IHJlZ2lzdGVyID0gKGNvbXBvbmVudFR5cGUsIGFkYXB0ZXIpID0+IHtcbiAgICAgICAgY29uc3QgYWRhcHRlck5hbWUgPSBjb21wb25lbnRUeXBlLnRvTG93ZXJDYXNlKCk7XG4gICAgICAgIENvbXBvbmVudEFkYXB0ZXJzW2FkYXB0ZXJOYW1lXSA9IGFkYXB0ZXJcbiAgICB9XG4gICAgcmVnaXN0cmF0b3Ioe3JlZ2lzdGVyfSk7XG59XG5cbmNsYXNzIENvbXBvbmVudCB7XG4gICAgY29uc3RydWN0b3IocGFyYW1zLCB0eXBlKSB7XG4gICAgICAgIHRoaXMucGFyYW1zID0gT2JqZWN0LmFzc2lnbih7fSwge1xuICAgICAgICAgICAgZmluZE1hcDoge31cbiAgICAgICAgfSwgcGFyYW1zKTtcbiAgICAgICAgdGhpcy50eXBlID0gdHlwZSB8fCAnZGVmYXVsdCc7XG4gICAgICAgIC8vc3R1YmlmeUluc3RhbmNlKENvbXBvbmVudCwgdGhpcyk7XG4gICAgfVxuICAgIGdldChuYW1lKSB7XG4gICAgICAgIGlmIChuYW1lLnN0YXJ0c1dpdGgoJ3YuJykgfHwgbmFtZS5zdGFydHNXaXRoKCdjLicpIHx8IG5hbWUuc3RhcnRzV2l0aCgnZS4nKSkge1xuICAgICAgICAgICAgbmFtZSA9IG5hbWUuc3Vic3RyaW5nKDIpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBfLmdldCh0aGlzLnBhcmFtcywgbmFtZSk7XG4gICAgfVxuICAgIHNldChuYW1lLCB2YWx1ZSkge1xuICAgICAgICBpZiAobmFtZS5zdGFydHNXaXRoKCd2LicpIHx8IG5hbWUuc3RhcnRzV2l0aCgnYy4nKSB8fCBuYW1lLnN0YXJ0c1dpdGgoJ2UuJykpIHtcbiAgICAgICAgICAgIG5hbWUgPSBuYW1lLnN1YnN0cmluZygyKTtcbiAgICAgICAgfVxuICAgICAgICBfLnNldCh0aGlzLnBhcmFtcywgbmFtZSwgdmFsdWUpO1xuICAgIH1cbiAgICBmaW5kKG5hbWUpIHtcbiAgICAgICAgbGV0IHR5cGVPckNvbXBvbmVudCA9IHRoaXMucGFyYW1zLmZpbmRNYXBbbmFtZV07XG4gICAgICAgIGlmICghdHlwZU9yQ29tcG9uZW50ICYmIHRoaXMucGFyYW1zLmZpbmRNYXAuaGFzT3duUHJvcGVydHkobmFtZSkpIHtcbiAgICAgICAgICAgIHJldHVybiB0eXBlT3JDb21wb25lbnQ7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgZGVmYXVsdFBhcmFtcyA9IHtcbiAgICAgICAgICAgICdhdXJhOmlkJzogbmFtZVxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBjb25zdCBjb21wb25lbnQgPSB0aGlzLnBhcmFtcy5maW5kTWFwW25hbWVdID0gKEFycmF5LmlzQXJyYXkodHlwZU9yQ29tcG9uZW50KSA/IFxuICAgICAgICAgICAgY29tcG9uZW50RmFjdG9yeUZvckFycmF5KGRlZmF1bHRQYXJhbXMsIHR5cGVPckNvbXBvbmVudCkgOiBcbiAgICAgICAgICAgIGNvbXBvbmVudEZhY3RvcnkoZGVmYXVsdFBhcmFtcywgdHlwZU9yQ29tcG9uZW50KSlcbiAgICAgICAgcmV0dXJuIGNvbXBvbmVudDtcbiAgICB9XG4gICAgZ2V0TG9jYWxJZCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucGFyYW1zWydhdXJhOmlkJ107XG4gICAgfVxuICAgIGNsZWFyUmVmZXJlbmNlKGtleSkge1xuICAgICAgICBkZWxldGUgdGhpcy5wYXJhbXNba2V5XTtcbiAgICB9XG4gICAgZ2V0Q29uY3JldGVDb21wb25lbnQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICBnZXRFbGVtZW50KCkge1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgZ2V0RWxlbWVudHMoKSB7XG4gICAgICAgIHJldHVybiBbdGhpc107XG4gICAgfVxuICAgIGdldEV2ZW50KG5hbWUpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucGFyYW1zW25hbWVdIHx8IGV2ZW50RmFjdG9yeSgpO1xuICAgIH1cbiAgICBnZXRHbG9iYWxJZCgpIHtcbiAgICAgICAgcmV0dXJuIGBnbG9iYWwtJHt0aGlzLnBhcmFtc1snYXVyYTppZCddfWA7XG4gICAgfVxuICAgIGdldE5hbWUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnR5cGU7XG4gICAgfVxuICAgIGdldFR5cGUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnR5cGU7XG4gICAgfVxuICAgIGdldFJlZmVyZW5jZShrZXkpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucGFyYW1zW2tleV07XG4gICAgfVxuICAgIGdldFN1cGVyKCkge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgZ2V0VmVyc2lvbigpIHtcbiAgICAgICAgcmV0dXJuICcxLjAnO1xuICAgIH1cbiAgICBpc0NvbmNyZXRlKCkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgaXNJbnN0YW5jZU9mKG5hbWUpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudHlwZSA9PT0gbmFtZTtcbiAgICB9XG4gICAgaXNWYWxpZCgpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIGFkZEV2ZW50SGFuZGxlcigpIHt9XG4gICAgYWRkSGFuZGxlcigpIHt9XG4gICAgYWRkVmFsdWVIYW5kbGVyKCkge31cbiAgICBhZGRWYWx1ZVByb3ZpZGVyKCkge31cbiAgICBhdXRvRGVzdHJveSgpIHt9XG4gICAgZGVzdHJveSgpIHt9XG4gICAgcmVtb3ZlRXZlbnRIYW5kbGVyKCkge31cblxufSIsImltcG9ydCB7IHN0dWJpZnlJbnN0YW5jZSB9IGZyb20gJy4vc2lub25IZWxwZXJzJ1xuXG5jb25zdCBjbGFzc05hbWVUb0NvbXBvbmVudFZhciA9IGNsYXNzTmFtZSA9PiBgdi5fX2Nsc18ke2NsYXNzTmFtZX1gXG5leHBvcnQgY2xhc3MgQXVyYVV0aWwge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBzdHViaWZ5SW5zdGFuY2UoQXVyYVV0aWwsIHRoaXMpO1xuICAgIH1cbiAgICBcbiAgICBpc0VtcHR5KG9iail7XG4gICAgICAgIGlmIChvYmogPT09IHVuZGVmaW5lZCB8fCBvYmogPT09IG51bGwgfHwgb2JqID09PSAnJykge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkob2JqKSkge1xuICAgICAgICAgICAgcmV0dXJuIG9iai5sZW5ndGggPT09IDA7XG4gICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIG9iaiA9PT0gJ29iamVjdCcgJiYgT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKG9iaikgPT09ICdbb2JqZWN0IE9iamVjdF0nKSB7XG4gICAgICAgICAgICByZXR1cm4gT2JqZWN0LmtleXMob2JqKS5sZW5ndGggPT09IDA7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBpc1VuZGVmaW5lZE9yTnVsbChvYmopIHtcbiAgICAgICAgcmV0dXJuIG9iaiA9PT0gdW5kZWZpbmVkIHx8IG9iaiA9PT0gbnVsbDtcbiAgICB9XG4gICAgYWRkQ2xhc3MoY29tcG9uZW50LCBjbGFzc05hbWUpIHtcbiAgICAgICAgcmV0dXJuIGNvbXBvbmVudC5zZXQoY2xhc3NOYW1lVG9Db21wb25lbnRWYXIoY2xhc3NOYW1lKSwgdHJ1ZSk7XG4gICAgfVxuICAgIHJlbW92ZUNsYXNzKGNvbXBvbmVudCwgY2xhc3NOYW1lKSB7XG4gICAgICAgIHJldHVybiBjb21wb25lbnQuc2V0KGNsYXNzTmFtZVRvQ29tcG9uZW50VmFyKGNsYXNzTmFtZSksIGZhbHNlKTtcbiAgICB9XG4gICAgaGFzQ2xhc3MoY29tcG9uZW50LCBjbGFzc05hbWUpIHtcbiAgICAgICAgcmV0dXJuIGNvbXBvbmVudC5nZXQoY2xhc3NOYW1lVG9Db21wb25lbnRWYXIoY2xhc3NOYW1lKSk7XG4gICAgfVxuICAgIHRvZ2dsZUNsYXNzKGNvbXBvbmVudCwgY2xhc3NOYW1lKSB7XG4gICAgICAgIGNvbXBvbmVudC5zZXQoY2xhc3NOYW1lVG9Db21wb25lbnRWYXIoY2xhc3NOYW1lKSwgIWNvbXBvbmVudC5nZXQoY2xhc3NOYW1lVG9Db21wb25lbnRWYXIoY2xhc3NOYW1lKSkpO1xuICAgIH1cbiAgICBnZXRCb29sZWFuVmFsdWUodmFsKSB7XG4gICAgICAgIC8vIFBvcnRlZDogaHR0cHM6Ly9naXRodWIuY29tL2ZvcmNlZG90Y29tL2F1cmEvYmxvYi9tYXN0ZXIvYXVyYS1pbXBsL3NyYy9tYWluL3Jlc291cmNlcy9hdXJhL3V0aWwvVXRpbC5qcyNMMzY2XG4gICAgICAgIHJldHVybiB2YWwgIT09IHVuZGVmaW5lZCAmJiB2YWwgIT09IG51bGwgJiYgdmFsICE9PSBmYWxzZSAmJiB2YWwgIT09IDAgJiYgdmFsICE9PSAnZmFsc2UnICYmIHZhbCAhPT0gJycgJiYgdmFsICE9PSAnZic7XG4gICAgfVxuICAgIGlzQXJyYXkoYXJyKSB7XG4gICAgICAgIC8vIFBvcnRlZDogaHR0cHM6Ly9naXRodWIuY29tL2ZvcmNlZG90Y29tL2F1cmEvYmxvYi9tYXN0ZXIvYXVyYS1pbXBsL3NyYy9tYWluL3Jlc291cmNlcy9hdXJhL3V0aWwvVXRpbC5qcyNMMTg5XG4gICAgICAgIHJldHVybiAodHlwZW9mIEFycmF5LmlzQXJyYXkgPT09IFwiZnVuY3Rpb25cIiA/IEFycmF5LmlzQXJyYXkgOiBmdW5jdGlvbihhcmcpIHtcbiAgICAgICAgICAgIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoYXJnKSA9PT0gJ1tvYmplY3QgQXJyYXldJztcbiAgICAgICAgfSkoYXJyKTtcbiAgICB9XG4gICAgaXNPYmplY3Qob2JqKSB7XG4gICAgICAgIC8vUG9ydGVkOiBodHRwczovL2dpdGh1Yi5jb20vZm9yY2Vkb3Rjb20vYXVyYS9ibG9iL21hc3Rlci9hdXJhLWltcGwvc3JjL21haW4vcmVzb3VyY2VzL2F1cmEvdXRpbC9VdGlsLmpzI0wyMDRcbiAgICAgICAgcmV0dXJuIHR5cGVvZiBvYmogPT09IFwib2JqZWN0XCIgJiYgb2JqICE9PSBudWxsICYmICFBcnJheS5pc0FycmF5KG9iaik7XG4gICAgfVxuICAgIGlzVW5kZWZpbmVkKG9iail7XG4gICAgICAgIC8vUG9ydGVkOiBodHRwczovL2dpdGh1Yi5jb20vZm9yY2Vkb3Rjb20vYXVyYS9ibG9iL21hc3Rlci9hdXJhLWltcGwvc3JjL21haW4vcmVzb3VyY2VzL2F1cmEvdXRpbC9VdGlsLmpzI0wzMTlcbiAgICAgICAgcmV0dXJuIG9iaiA9PT0gdW5kZWZpbmVkO1xuICAgIH1cbn1cblxuIiwiaW1wb3J0IHsgc3R1YmlmeUluc3RhbmNlIH0gZnJvbSAnLi9zaW5vbkhlbHBlcnMnXG5pbXBvcnQgeyBBdXJhVXRpbCB9IGZyb20gJy4vYXVyYVV0aWwnXG5cbmV4cG9ydCBmdW5jdGlvbiBhdXJhRmFjdG9yeShwYXJhbXMgPSB7fSwgc3R1YmlmeVBhcmFtcykge1xuICAgIHJldHVybiBzdHViaWZ5SW5zdGFuY2UoQXVyYSwgbmV3IEF1cmEocGFyYW1zKSwgc3R1YmlmeVBhcmFtcyk7XG59XG5cbmltcG9ydCB7IGNvbXBvbmVudEZhY3RvcnkgfSBmcm9tICcuL2NvbXBvbmVudEZhY3RvcnknXG5cbmNsYXNzIEF1cmEge1xuICAgIGNvbnN0cnVjdG9yKHBhcmFtcykge1xuICAgICAgICB0aGlzLnBhcmFtcyA9IHBhcmFtcztcbiAgICAgICAgdGhpcy51dGlsID0gbmV3IEF1cmFVdGlsKCk7XG4gICAgfVxuICAgIFxuICAgIHNldFBhcmFtcyhwYXJhbXMpIHtcbiAgICAgICAgT2JqZWN0LmFzc2lnbih0aGlzLnBhcmFtcywgcGFyYW1zKTtcbiAgICB9XG5cbiAgICBnZXQobmFtZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5wYXJhbXNbbmFtZV07XG4gICAgfVxuXG4gICAgc2V0KG5hbWUsIHZhbHVlKSB7XG4gICAgICAgIHRoaXMucGFyYW1zW25hbWVdID0gdmFsdWU7XG4gICAgfVxuICAgIFxuICAgIGVucXVldWVBY3Rpb24oYWN0aW9uKSB7XG4gICAgICAgIGFjdGlvbiAmJiBhY3Rpb24uaW52b2tlQ2FsbGJhY2sgJiYgYWN0aW9uLmludm9rZUNhbGxiYWNrKHRydWUpXG4gICAgfVxuXG4gICAgY3JlYXRlQ29tcG9uZW50KHR5cGUsIGF0dHJpYnV0ZXMsIGNhbGxiYWNrKSB7XG4gICAgICAgIHRoaXMuY3JlYXRlQ29tcG9uZW50LnR5cGUgPSB0eXBlO1xuICAgICAgICB0aGlzLmNyZWF0ZUNvbXBvbmVudC5hdHRyaWJ1dGVzID0gYXR0cmlidXRlcztcbiAgICAgICAgLy8gR2V0IGNvbXBvbmVudCBpbnN0YW5jZS5cbiAgICAgICAgLy8gVXNlIGV4aXN0aW5nIGNvbXBvbmVudCBpbnN0YW5jZSBpZiBzZXRcbiAgICAgICAgLy8gQ3JlYXRlIG5ldyBkZWZhdWx0IGNvbXBvbmVudCBpZiBjb21wb25lbnQgbm90IHNldFxuICAgICAgICBsZXQgeyBjb21wb25lbnQgfSA9IHRoaXMuY3JlYXRlQ29tcG9uZW50O1xuICAgICAgICBpZiAoIWNvbXBvbmVudCkge1xuICAgICAgICAgICAgY29tcG9uZW50ID0gbmV3IGNvbXBvbmVudEZhY3RvcnkoYXR0cmlidXRlcywgdHlwZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmNyZWF0ZUNvbXBvbmVudC5jb21wb25lbnQgPSBudWxsO1xuICAgICAgICB9XG4gICAgICAgIGlmIChjYWxsYmFjaykge1xuICAgICAgICAgICAgY2FsbGJhY2soY29tcG9uZW50LCAnU1VDQ0VTUycsIFsnU1VDQ0VTUyddKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gY29tcG9uZW50O1xuICAgIH1cbiAgICBjcmVhdGVDb21wb25lbnRzKGNvbXBvbmVudERlZnMsIGNhbGxiYWNrKSB7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGNvbXBvbmVudERlZnNcbiAgICAgICAgICAgIC5tYXAoZGVmID0+IHRoaXMuY3JlYXRlQ29tcG9uZW50KGRlZlswXSwgZGVmWzFdKSlcbiAgICAgICAgaWYgKGNhbGxiYWNrKSB7XG4gICAgICAgICAgICBjYWxsYmFjayhyZXN1bHQsICdTVUNDRVNTJywgcmVzdWx0Lm1hcCggKCkgPT4gJ1NVQ0NFU1MnKSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG4gICAgZ2V0Q2FsbGJhY2soY2FsbGJhY2spIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKC4uLmFyZ3MpIHtcbiAgICAgICAgICAgIGNhbGxiYWNrICYmIGNhbGxiYWNrKC4uLmFyZ3MpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGdldENvbXBvbmVudChpZCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wYXJhbXNbaWRdO1xuICAgIH1cbiAgICBnZXRSZWZlcmVuY2UoKSB7fVxuICAgIGdldFJvb3QoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnJvb3RDb21wb25lbnQgfHwgKHRoaXMucm9vdENvbXBvbmVudCA9IG5ldyBjb21wb25lbnRGYWN0b3J5KCkpO1xuICAgIH1cbiAgICBnZXRUb2tlbihuYW1lKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnBhcmFtc1sndG9rZW4uJyArIG5hbWVdXG4gICAgfVxuICAgIGxvZyh2YWx1ZSwgZXJyKSB7XG4gICAgICAgIC8qZXNsaW50IG5vLWNvbnNvbGU6IDAqL1xuICAgICAgICBjb25zb2xlICYmIGNvbnNvbGUubG9nKHZhbHVlLCBlcnIpXG4gICAgfVxuICAgIHJlcG9ydEVycm9yKCkge31cbn0iLCJpbXBvcnQgeyBzdHViaWZ5SW5zdGFuY2VPbkRlbWFuZCB9IGZyb20gJy4vc2lub25IZWxwZXJzJ1xuXG5leHBvcnQgZnVuY3Rpb24gYXBleENhbGxGYWN0b3J5KHBhcmFtcyA9IHt9KSB7XG4gICAgcmV0dXJuIHN0dWJpZnlJbnN0YW5jZU9uRGVtYW5kKEFwZXhDYWxsLCBuZXcgQXBleENhbGwocGFyYW1zKSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBhcGV4U3VjY2Vzc1Jlc3VsdChyZXNwb25zZSA9IHt9KSB7XG4gICAgcmV0dXJuIHN0dWJpZnlJbnN0YW5jZU9uRGVtYW5kKEFwZXhDYWxsUmVzdWx0LCBuZXcgQXBleENhbGxSZXN1bHQocmVzcG9uc2UpKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGFwZXhFcnJvclJlc3VsdChtZXNzYWdlKSB7XG4gICAgcmV0dXJuIHN0dWJpZnlJbnN0YW5jZU9uRGVtYW5kKEFwZXhDYWxsUmVzdWx0LCBuZXcgQXBleENhbGxSZXN1bHQobnVsbCwgbWVzc2FnZSkpO1xufVxuXG5jbGFzcyBBcGV4Q2FsbCB7XG4gICAgY29uc3RydWN0b3IocmVzdWx0LCBpbnZva2VDYWxsYmFja09uRW5xdWV1ZSA9IHRydWUpIHtcbiAgICAgICAgdGhpcy5wYXJhbXMgPSBudWxsO1xuICAgICAgICB0aGlzLnJlc3VsdCA9IHJlc3VsdDtcbiAgICAgICAgdGhpcy5pbnZva2VDYWxsYmFja09uRW5xdWV1ZSA9IGludm9rZUNhbGxiYWNrT25FbnF1ZXVlO1xuICAgICAgICB0aGlzLmlzQmFja2dyb3VuZCA9IGZhbHNlO1xuICAgICAgICB0aGlzLnNldEFib3J0YWJsZSA9IGZhbHNlO1xuICAgIH1cbiAgICBzZXRQYXJhbXMocGFyYW1zKSB7XG4gICAgICAgIHRoaXMucGFyYW1zID0gcGFyYW1zO1xuICAgIH1cbiAgICBzZXRQYXJhbShrZXksIHZhbHVlKSB7XG4gICAgICAgIHRoaXMucGFyYW1zID0gT2JqZWN0LmFzc2lnbih0aGlzLnBhcmFtcywge1trZXldIDogdmFsdWV9KTtcbiAgICB9XG4gICAgZ2V0UGFyYW1zKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wYXJhbXM7XG4gICAgfVxuICAgIHNldENhbGxiYWNrKGN0eCwgY2FsbGJhY2spIHtcbiAgICAgICAgdGhpcy5jdHggPSBjdHg7XG4gICAgICAgIHRoaXMuY2FsbGJhY2sgPSBjYWxsYmFjaztcbiAgICB9XG4gICAgaW52b2tlQ2FsbGJhY2soZnJvbUVucXVldWUgPSBmYWxzZSkge1xuICAgICAgICBpZiAoZnJvbUVucXVldWUgJiYgIXRoaXMuaW52b2tlQ2FsbGJhY2tPbkVucXVldWUpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmNhbGxiYWNrICYmIHRoaXMuY2FsbGJhY2suYmluZCh0aGlzLmN0eCkodGhpcy5yZXN1bHQpO1xuICAgIH1cbiAgICBnZXRFcnJvcigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucmVzdWx0LmdldEVycm9yKCk7XG4gICAgfVxuICAgIGdldFBhcmFtKG5hbWUpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucGFyYW1zID8gdGhpcy5wYXJhbXNbbmFtZV0gOiBudWxsO1xuICAgIH1cbiAgICBnZXRSZXR1cm5WYWx1ZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucmVzdWx0O1xuICAgIH1cbiAgICBnZXRTdGF0ZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucmVzdWx0LmdldFN0YXRlKCk7XG4gICAgfVxuICAgIGlzQmFja2dyb3VuZCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaXNCYWNrZ3JvdW5kO1xuICAgIH1cbiAgICBzZXRBYm9ydGFibGUoKSB7XG4gICAgfVxuICAgIHNldEJhY2tncm91bmQoKSB7XG4gICAgICAgIHRoaXMuaXNCYWNrZ3JvdW5kID0gdHJ1ZTtcbiAgICB9XG4gICAgc2V0U3RvcmFibGUoKSB7XG4gICAgfVxufVxuXG5jbGFzcyBBcGV4Q2FsbFJlc3VsdCB7XG4gICAgY29uc3RydWN0b3IocmVzcG9uc2UsIGVycm9yTWVzc2FnZSA9IG51bGwpIHtcbiAgICAgICAgdGhpcy5yZXNwb25zZSA9IHJlc3BvbnNlO1xuICAgICAgICB0aGlzLmVycm9yTWVzc2FnZSA9IGVycm9yTWVzc2FnZTtcbiAgICB9XG4gICAgZ2V0U3RhdGUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmVycm9yTWVzc2FnZSA/ICdFUlJPUicgOiAnU1VDQ0VTUydcbiAgICB9XG4gICAgZ2V0RXJyb3IoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmVycm9yTWVzc2FnZSA/IFt7bWVzc2FnZTogdGhpcy5lcnJvck1lc3NhZ2V9XSA6IFtdXG4gICAgfVxuICAgIGdldFJldHVyblZhbHVlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5yZXNwb25zZTtcbiAgICB9XG59IiwiaW1wb3J0IHsgZXZlbnRGYWN0b3J5IH0gZnJvbSAnLi9ldmVudEZhY3RvcnknXG5pbXBvcnQgeyBjb21wb25lbnRGYWN0b3J5LCB1c2VDb21wb25lbnRBZGFwdGVycyB9IGZyb20gJy4vY29tcG9uZW50RmFjdG9yeSdcbmltcG9ydCB7IGF1cmFGYWN0b3J5IH0gZnJvbSAnLi9hdXJhRmFjdG9yeSdcbmltcG9ydCB7IEF1cmFVdGlsIH0gZnJvbSAnLi9hdXJhVXRpbCdcbmltcG9ydCB7IGFwZXhDYWxsRmFjdG9yeSwgYXBleFN1Y2Nlc3NSZXN1bHQsIGFwZXhFcnJvclJlc3VsdCB9IGZyb20gJy4vYXBleENhbGxGYWN0b3J5J1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBBdXJhVXRpbCxcbiAgICBldmVudEZhY3RvcnksXG4gICAgY29tcG9uZW50RmFjdG9yeSxcbiAgICB1c2VDb21wb25lbnRBZGFwdGVycyxcbiAgICBhdXJhRmFjdG9yeSxcbiAgICBhcGV4Q2FsbEZhY3RvcnksXG4gICAgYXBleFN1Y2Nlc3NSZXN1bHQsXG4gICAgYXBleEVycm9yUmVzdWx0XG59Il0sIm5hbWVzIjpbInNpbm9uIiwicmVxdWlyZSIsInN0dWJpZnlJbnN0YW5jZSIsImN0b3IiLCJpbnN0YW5jZSIsInBhcmFtcyIsInByb3BFeGNsdWRlZCIsInByb3AiLCJkb05vdE1vY2siLCJBcnJheSIsImlzQXJyYXkiLCJpbmRleE9mIiwiZ2V0T3duUHJvcGVydHlOYW1lcyIsInByb3RvdHlwZSIsImZvckVhY2giLCJzdHViIiwiY2FsbHNGYWtlIiwicHJvcE5hbWUiLCJhcmdzIiwiY2FsbCIsInN0dWJpZnlJbnN0YW5jZU9uRGVtYW5kIiwiaGFuZGxlciIsInRhcmdldCIsInByb3BlcnR5IiwiZGVzY3JpcHRvciIsIl9pbnN0YW5jZVByb3BzIiwicHJvcEtleSIsInZhbHVlIiwid2FybiIsInN0dWJOYW1lIiwiaXNTcHlPclN0dWJiZWQiLCJjYWxsZWRCZWZvcmUiLCJoYXNPblByb3RvIiwicHJveHkiLCJQcm94eSIsImV2ZW50RmFjdG9yeSIsIkV2ZW50IiwiRkFLRV9FVkVOVF9OQU1FIiwia2V5IiwiZXZlbnROYW1lIiwibmFtZSIsIl8iLCJEZWZhdWx0Q29tcG9uZW50QWRhcHRlciIsIldlbGxLbm93bkNvbXBvbmVudHMiLCJDb21wb25lbnRBZGFwdGVycyIsImNvbXBvbmVudEZhY3RvcnlGb3JBcnJheSIsImFycmF5T2ZUeXBlcyIsIm1hcCIsImNvbXBvbmVudEZhY3RvcnkiLCJ0eXBlT3JDb21wb25lbnQiLCJFcnJvciIsIkNvbXBvbmVudCIsImFkYXB0ZXJOYW1lIiwidG9Mb3dlckNhc2UiLCJyZXBsYWNlIiwiYWRhcHRlciIsInNvbWUiLCJzdGFydHNXaXRoIiwidXNlQ29tcG9uZW50QWRhcHRlcnMiLCJyZWdpc3RyYXRvciIsInJlZ2lzdGVyIiwiY29tcG9uZW50VHlwZSIsInR5cGUiLCJPYmplY3QiLCJhc3NpZ24iLCJzdWJzdHJpbmciLCJnZXQiLCJzZXQiLCJmaW5kTWFwIiwiaGFzT3duUHJvcGVydHkiLCJkZWZhdWx0UGFyYW1zIiwiY29tcG9uZW50IiwiY2xhc3NOYW1lVG9Db21wb25lbnRWYXIiLCJjbGFzc05hbWUiLCJBdXJhVXRpbCIsIm9iaiIsInVuZGVmaW5lZCIsImxlbmd0aCIsInRvU3RyaW5nIiwia2V5cyIsInZhbCIsImFyciIsImFyZyIsImF1cmFGYWN0b3J5Iiwic3R1YmlmeVBhcmFtcyIsIkF1cmEiLCJ1dGlsIiwiYWN0aW9uIiwiaW52b2tlQ2FsbGJhY2siLCJhdHRyaWJ1dGVzIiwiY2FsbGJhY2siLCJjcmVhdGVDb21wb25lbnQiLCJjb21wb25lbnREZWZzIiwicmVzdWx0IiwiZGVmIiwiaWQiLCJyb290Q29tcG9uZW50IiwiZXJyIiwiY29uc29sZSIsImxvZyIsImFwZXhDYWxsRmFjdG9yeSIsIkFwZXhDYWxsIiwiYXBleFN1Y2Nlc3NSZXN1bHQiLCJyZXNwb25zZSIsIkFwZXhDYWxsUmVzdWx0IiwiYXBleEVycm9yUmVzdWx0IiwibWVzc2FnZSIsImludm9rZUNhbGxiYWNrT25FbnF1ZXVlIiwiaXNCYWNrZ3JvdW5kIiwic2V0QWJvcnRhYmxlIiwiY3R4IiwiZnJvbUVucXVldWUiLCJiaW5kIiwiZ2V0RXJyb3IiLCJnZXRTdGF0ZSIsImVycm9yTWVz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
