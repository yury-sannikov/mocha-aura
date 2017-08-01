(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(factory());
}(this, (function () { 'use strict';

var sinon = require('sinon');

function stubifyInstance(ctor, instance) {
    Object.getOwnPropertyNames(ctor.prototype).forEach(function (prop) {
        if (typeof ctor.prototype[prop] !== 'function' || prop === 'constructor') {
            return;
        }
        sinon.stub(instance, prop).callsFake(function (propName) {
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

    return new Event(params);
}
var FAKE_EVENT_NAME = 'mocha-aura-fake-event';

var Event = function () {
    function Event(params) {
        classCallCheck(this, Event);

        this.params = params || {};
        stubifyInstance(Event, this);
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

    var instance = new Component(params, typeOrComponent);
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
        stubifyInstance(Component, this);
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
        stubifyInstance(ApexCall, this);
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
        stubifyInstance(ApexCallResult, this);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9jaGEtYXVyYS51bWQuanMiLCJzb3VyY2VzIjpbIi4uL2xpYi9zaW5vbkhlbHBlcnMuanMiLCIuLi9saWIvZXZlbnRGYWN0b3J5LmpzIiwiLi4vbGliL2NvbXBvbmVudEZhY3RvcnkuanMiLCIuLi9saWIvYXVyYVV0aWwuanMiLCIuLi9saWIvYXVyYUZhY3RvcnkuanMiLCIuLi9saWIvYXBleENhbGxGYWN0b3J5LmpzIiwiLi4vbGliL2F1cmEuanMiXSwic291cmNlc0NvbnRlbnQiOlsiY29uc3Qgc2lub24gPSByZXF1aXJlKCdzaW5vbicpO1xuXG5leHBvcnQgZnVuY3Rpb24gc3R1YmlmeUluc3RhbmNlKGN0b3IsIGluc3RhbmNlKSB7XG4gICAgT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMoY3Rvci5wcm90b3R5cGUpLmZvckVhY2gocHJvcCA9PiB7XG4gICAgICAgIGlmICh0eXBlb2YgY3Rvci5wcm90b3R5cGVbcHJvcF0gIT09ICdmdW5jdGlvbicgfHwgcHJvcCA9PT0gJ2NvbnN0cnVjdG9yJykge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHNpbm9uLnN0dWIoaW5zdGFuY2UsIHByb3ApLmNhbGxzRmFrZSgoKHByb3BOYW1lKSA9PiAoLi4uYXJncykgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIGN0b3IucHJvdG90eXBlW3Byb3BOYW1lXS5jYWxsKGluc3RhbmNlLCAuLi5hcmdzKTtcbiAgICAgICAgfSkocHJvcCkpXG4gICAgfSlcbn1cbiIsImltcG9ydCB7IHN0dWJpZnlJbnN0YW5jZSB9IGZyb20gJy4vc2lub25IZWxwZXJzJ1xuXG5leHBvcnQgZnVuY3Rpb24gZXZlbnRGYWN0b3J5KHBhcmFtcyA9IHt9KSB7XG4gICAgcmV0dXJuIG5ldyBFdmVudChwYXJhbXMpO1xufVxuY29uc3QgRkFLRV9FVkVOVF9OQU1FID0gJ21vY2hhLWF1cmEtZmFrZS1ldmVudCdcblxuY2xhc3MgRXZlbnQge1xuICAgIGNvbnN0cnVjdG9yKHBhcmFtcykge1xuICAgICAgICB0aGlzLnBhcmFtcyA9IHBhcmFtcyB8fCB7fTtcbiAgICAgICAgc3R1YmlmeUluc3RhbmNlKEV2ZW50LCB0aGlzKTtcbiAgICB9XG4gICAgc2V0UGFyYW1zKHBhcmFtcykge1xuICAgICAgICB0aGlzLnBhcmFtcyA9IHBhcmFtcztcbiAgICB9XG4gICAgc2V0UGFyYW0oa2V5LCB2YWx1ZSkge1xuICAgICAgICB0aGlzLnBhcmFtc1trZXldID0gdmFsdWU7XG4gICAgfVxuICAgIGdldFBhcmFtcygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucGFyYW1zO1xuICAgIH1cbiAgICBnZXRFdmVudFR5cGUoKSB7XG4gICAgICAgIHJldHVybiAnQVBQTElDQVRJT04nXG4gICAgfVxuICAgIGdldE5hbWUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnBhcmFtcy5ldmVudE5hbWUgfHwgRkFLRV9FVkVOVF9OQU1FXG4gICAgfVxuICAgIGdldFBhcmFtKG5hbWUpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucGFyYW1zW25hbWVdXG4gICAgfVxuICAgIGdldFBoYXNlKCkge1xuICAgICAgICByZXR1cm4gJ2RlZmF1bHQnXG4gICAgfVxuICAgIGdldFNvdXJjZSgpIHtcbiAgICAgICAgcmV0dXJuIG51bGxcbiAgICB9XG4gICAgZ2V0VHlwZSgpIHtcbiAgICAgICAgcmV0dXJuIGBjOiR7RkFLRV9FVkVOVF9OQU1FfWBcbiAgICB9XG4gICAgZmlyZSgpIHt9XG4gICAgcGF1c2UoKSB7fVxuICAgIHByZXZlbnREZWZhdWx0KCkge31cbiAgICByZXN1bWUoKSB7fVxuICAgIHN0b3BQcm9wYWdhdGlvbigpIHt9XG4gICAgXG5cbn0iLCJjb25zdCBfID0gcmVxdWlyZSgnbG9kYXNoJyk7XG5pbXBvcnQgeyBldmVudEZhY3RvcnkgfSBmcm9tICcuL2V2ZW50RmFjdG9yeSdcbmltcG9ydCB7IHN0dWJpZnlJbnN0YW5jZSB9IGZyb20gJy4vc2lub25IZWxwZXJzJ1xuXG5jb25zdCBEZWZhdWx0Q29tcG9uZW50QWRhcHRlciA9ICdkZWZhdWx0J1xuY29uc3QgV2VsbEtub3duQ29tcG9uZW50cyA9IFsnYXVyYTonLCAnZm9yY2U6JywgJ2ZvcmNlQ2hhdHRlcjonLCAnbGlnaHRuaW5nOicsICd1aTonLCAnYzonXVxuXG5sZXQgQ29tcG9uZW50QWRhcHRlcnMgPSB7XG4gICAgW0RlZmF1bHRDb21wb25lbnRBZGFwdGVyXTogaW5zdGFuY2UgPT4gaW5zdGFuY2Vcbn1cblxuZnVuY3Rpb24gY29tcG9uZW50RmFjdG9yeUZvckFycmF5KHBhcmFtcywgYXJyYXlPZlR5cGVzKSB7XG4gICAgcmV0dXJuIGFycmF5T2ZUeXBlcy5tYXAodHlwZU9yQ29tcG9uZW50ID0+IGNvbXBvbmVudEZhY3RvcnkocGFyYW1zLCB0eXBlT3JDb21wb25lbnQpKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNvbXBvbmVudEZhY3RvcnkocGFyYW1zID0ge30sIHR5cGVPckNvbXBvbmVudCA9IERlZmF1bHRDb21wb25lbnRBZGFwdGVyKSB7XG4gICAgaWYgKEFycmF5LmlzQXJyYXkodHlwZU9yQ29tcG9uZW50KSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1VuZXhwZWN0ZWQgdHlwZSBhcmd1bWVudCcpXG4gICAgfVxuXG4gICAgaWYgKHR5cGVPckNvbXBvbmVudCA9PT0gdHJ1ZSkge1xuICAgICAgICB0eXBlT3JDb21wb25lbnQgPSBEZWZhdWx0Q29tcG9uZW50QWRhcHRlclxuICAgIH0gZWxzZSBpZiAodHlwZU9yQ29tcG9uZW50IGluc3RhbmNlb2YgQ29tcG9uZW50KSB7XG4gICAgICAgIHJldHVybiB0eXBlT3JDb21wb25lbnQ7XG4gICAgfSBlbHNlIGlmICh0eXBlT3JDb21wb25lbnQgPT09IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgbGV0IGluc3RhbmNlID0gbmV3IENvbXBvbmVudChwYXJhbXMsIHR5cGVPckNvbXBvbmVudCk7XG4gICAgbGV0IGFkYXB0ZXJOYW1lID0gdHlwZU9yQ29tcG9uZW50LnRvTG93ZXJDYXNlKCkucmVwbGFjZSgnbWFya3VwOi8vJywgJycpXG4gICAgbGV0IGFkYXB0ZXIgPSBDb21wb25lbnRBZGFwdGVyc1thZGFwdGVyTmFtZV07XG4gICAgaWYgKCFhZGFwdGVyKSB7XG4gICAgICAgIGlmICghXy5zb21lKFdlbGxLbm93bkNvbXBvbmVudHMsIG5hbWUgPT4gYWRhcHRlck5hbWUuc3RhcnRzV2l0aChuYW1lKSkpIHtcbiAgICAgICAgICAgIC8qZXNsaW50IG5vLWNvbnNvbGU6IDAqL1xuICAgICAgICAgICAgY29uc29sZS53YXJuKGBVbmFibGUgdG8gZmluZCBjb21wb25lbnQgYWRhcHRlciAke3R5cGVPckNvbXBvbmVudH1gKTtcbiAgICAgICAgfVxuICAgICAgICBhZGFwdGVyID0gQ29tcG9uZW50QWRhcHRlcnNbRGVmYXVsdENvbXBvbmVudEFkYXB0ZXJdO1xuICAgIH1cbiAgICByZXR1cm4gYWRhcHRlcihpbnN0YW5jZSwgcGFyYW1zKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHVzZUNvbXBvbmVudEFkYXB0ZXJzKHJlZ2lzdHJhdG9yKSB7XG4gICAgY29uc3QgcmVnaXN0ZXIgPSAoY29tcG9uZW50VHlwZSwgYWRhcHRlcikgPT4ge1xuICAgICAgICBjb25zdCBhZGFwdGVyTmFtZSA9IGNvbXBvbmVudFR5cGUudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgQ29tcG9uZW50QWRhcHRlcnNbYWRhcHRlck5hbWVdID0gYWRhcHRlclxuICAgIH1cbiAgICByZWdpc3RyYXRvcih7cmVnaXN0ZXJ9KTtcbn1cblxuY2xhc3MgQ29tcG9uZW50IHtcbiAgICBjb25zdHJ1Y3RvcihwYXJhbXMsIHR5cGUpIHtcbiAgICAgICAgdGhpcy5wYXJhbXMgPSBPYmplY3QuYXNzaWduKHt9LCB7XG4gICAgICAgICAgICBmaW5kTWFwOiB7fVxuICAgICAgICB9LCBwYXJhbXMpO1xuICAgICAgICB0aGlzLnR5cGUgPSB0eXBlIHx8ICdkZWZhdWx0JztcbiAgICAgICAgc3R1YmlmeUluc3RhbmNlKENvbXBvbmVudCwgdGhpcyk7XG4gICAgfVxuICAgIGdldChuYW1lKSB7XG4gICAgICAgIGlmIChuYW1lLnN0YXJ0c1dpdGgoJ3YuJykgfHwgbmFtZS5zdGFydHNXaXRoKCdjLicpIHx8IG5hbWUuc3RhcnRzV2l0aCgnZS4nKSkge1xuICAgICAgICAgICAgbmFtZSA9IG5hbWUuc3Vic3RyaW5nKDIpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBfLmdldCh0aGlzLnBhcmFtcywgbmFtZSk7XG4gICAgfVxuICAgIHNldChuYW1lLCB2YWx1ZSkge1xuICAgICAgICBpZiAobmFtZS5zdGFydHNXaXRoKCd2LicpIHx8IG5hbWUuc3RhcnRzV2l0aCgnYy4nKSB8fCBuYW1lLnN0YXJ0c1dpdGgoJ2UuJykpIHtcbiAgICAgICAgICAgIG5hbWUgPSBuYW1lLnN1YnN0cmluZygyKTtcbiAgICAgICAgfVxuICAgICAgICBfLnNldCh0aGlzLnBhcmFtcywgbmFtZSwgdmFsdWUpO1xuICAgIH1cbiAgICBmaW5kKG5hbWUpIHtcbiAgICAgICAgbGV0IHR5cGVPckNvbXBvbmVudCA9IHRoaXMucGFyYW1zLmZpbmRNYXBbbmFtZV07XG4gICAgICAgIGlmICghdHlwZU9yQ29tcG9uZW50ICYmIHRoaXMucGFyYW1zLmZpbmRNYXAuaGFzT3duUHJvcGVydHkobmFtZSkpIHtcbiAgICAgICAgICAgIHJldHVybiB0eXBlT3JDb21wb25lbnQ7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBjb21wb25lbnQgPSB0aGlzLnBhcmFtcy5maW5kTWFwW25hbWVdID0gKEFycmF5LmlzQXJyYXkodHlwZU9yQ29tcG9uZW50KSA/IFxuICAgICAgICAgICAgY29tcG9uZW50RmFjdG9yeUZvckFycmF5KHRoaXMucGFyYW1zLCB0eXBlT3JDb21wb25lbnQpIDogXG4gICAgICAgICAgICBjb21wb25lbnRGYWN0b3J5KHRoaXMucGFyYW1zLCB0eXBlT3JDb21wb25lbnQpKVxuICAgICAgICByZXR1cm4gY29tcG9uZW50O1xuICAgIH1cbiAgICBnZXRMb2NhbElkKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wYXJhbXNbJ2F1cmE6aWQnXTtcbiAgICB9XG4gICAgY2xlYXJSZWZlcmVuY2Uoa2V5KSB7XG4gICAgICAgIGRlbGV0ZSB0aGlzLnBhcmFtc1trZXldO1xuICAgIH1cbiAgICBnZXRDb25jcmV0ZUNvbXBvbmVudCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIGdldEVsZW1lbnQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICBnZXRFbGVtZW50cygpIHtcbiAgICAgICAgcmV0dXJuIFt0aGlzXTtcbiAgICB9XG4gICAgZ2V0RXZlbnQobmFtZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5wYXJhbXNbbmFtZV0gfHwgZXZlbnRGYWN0b3J5KCk7XG4gICAgfVxuICAgIGdldEdsb2JhbElkKCkge1xuICAgICAgICByZXR1cm4gYGdsb2JhbC0ke3RoaXMucGFyYW1zWydhdXJhOmlkJ119YDtcbiAgICB9XG4gICAgZ2V0TmFtZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudHlwZTtcbiAgICB9XG4gICAgZ2V0VHlwZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudHlwZTtcbiAgICB9XG4gICAgZ2V0UmVmZXJlbmNlKGtleSkge1xuICAgICAgICByZXR1cm4gdGhpcy5wYXJhbXNba2V5XTtcbiAgICB9XG4gICAgZ2V0U3VwZXIoKSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBnZXRWZXJzaW9uKCkge1xuICAgICAgICByZXR1cm4gJzEuMCc7XG4gICAgfVxuICAgIGlzQ29uY3JldGUoKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICBpc0luc3RhbmNlT2YobmFtZSkge1xuICAgICAgICByZXR1cm4gdGhpcy50eXBlID09PSBuYW1lO1xuICAgIH1cbiAgICBpc1ZhbGlkKCkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgYWRkRXZlbnRIYW5kbGVyKCkge31cbiAgICBhZGRIYW5kbGVyKCkge31cbiAgICBhZGRWYWx1ZUhhbmRsZXIoKSB7fVxuICAgIGFkZFZhbHVlUHJvdmlkZXIoKSB7fVxuICAgIGF1dG9EZXN0cm95KCkge31cbiAgICBkZXN0cm95KCkge31cbiAgICByZW1vdmVFdmVudEhhbmRsZXIoKSB7fVxuXG59IiwiaW1wb3J0IHsgc3R1YmlmeUluc3RhbmNlIH0gZnJvbSAnLi9zaW5vbkhlbHBlcnMnXG5cbmNvbnN0IGNsYXNzTmFtZVRvQ29tcG9uZW50VmFyID0gY2xhc3NOYW1lID0+IGB2Ll9fY2xzXyR7Y2xhc3NOYW1lfWBcbmV4cG9ydCBjbGFzcyBBdXJhVXRpbCB7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHN0dWJpZnlJbnN0YW5jZShBdXJhVXRpbCwgdGhpcyk7XG4gICAgfVxuICAgIFxuICAgIGlzRW1wdHkob2JqKXtcbiAgICAgICAgaWYgKG9iaiA9PT0gdW5kZWZpbmVkIHx8IG9iaiA9PT0gbnVsbCB8fCBvYmogPT09ICcnKSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShvYmopKSB7XG4gICAgICAgICAgICByZXR1cm4gb2JqLmxlbmd0aCA9PT0gMDtcbiAgICAgICAgfSBlbHNlIGlmICh0eXBlb2Ygb2JqID09PSAnb2JqZWN0JyAmJiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwob2JqKSA9PT0gJ1tvYmplY3QgT2JqZWN0XScpIHtcbiAgICAgICAgICAgIHJldHVybiBPYmplY3Qua2V5cyhvYmopLmxlbmd0aCA9PT0gMDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIGlzVW5kZWZpbmVkT3JOdWxsKG9iaikge1xuICAgICAgICByZXR1cm4gb2JqID09PSB1bmRlZmluZWQgfHwgb2JqID09PSBudWxsO1xuICAgIH1cbiAgICBhZGRDbGFzcyhjb21wb25lbnQsIGNsYXNzTmFtZSkge1xuICAgICAgICByZXR1cm4gY29tcG9uZW50LnNldChjbGFzc05hbWVUb0NvbXBvbmVudFZhcihjbGFzc05hbWUpLCB0cnVlKTtcbiAgICB9XG4gICAgcmVtb3ZlQ2xhc3MoY29tcG9uZW50LCBjbGFzc05hbWUpIHtcbiAgICAgICAgcmV0dXJuIGNvbXBvbmVudC5zZXQoY2xhc3NOYW1lVG9Db21wb25lbnRWYXIoY2xhc3NOYW1lKSwgZmFsc2UpO1xuICAgIH1cbiAgICBoYXNDbGFzcyhjb21wb25lbnQsIGNsYXNzTmFtZSkge1xuICAgICAgICByZXR1cm4gY29tcG9uZW50LmdldChjbGFzc05hbWVUb0NvbXBvbmVudFZhcihjbGFzc05hbWUpKTtcbiAgICB9XG4gICAgdG9nZ2xlQ2xhc3MoY29tcG9uZW50LCBjbGFzc05hbWUpIHtcbiAgICAgICAgY29tcG9uZW50LnNldChjbGFzc05hbWVUb0NvbXBvbmVudFZhcihjbGFzc05hbWUpLCAhY29tcG9uZW50LmdldChjbGFzc05hbWVUb0NvbXBvbmVudFZhcihjbGFzc05hbWUpKSk7XG4gICAgfVxuICAgIGdldEJvb2xlYW5WYWx1ZSh2YWwpIHtcbiAgICAgICAgLy8gUG9ydGVkOiBodHRwczovL2dpdGh1Yi5jb20vZm9yY2Vkb3Rjb20vYXVyYS9ibG9iL21hc3Rlci9hdXJhLWltcGwvc3JjL21haW4vcmVzb3VyY2VzL2F1cmEvdXRpbC9VdGlsLmpzI0wzNjZcbiAgICAgICAgcmV0dXJuIHZhbCAhPT0gdW5kZWZpbmVkICYmIHZhbCAhPT0gbnVsbCAmJiB2YWwgIT09IGZhbHNlICYmIHZhbCAhPT0gMCAmJiB2YWwgIT09ICdmYWxzZScgJiYgdmFsICE9PSAnJyAmJiB2YWwgIT09ICdmJztcbiAgICB9XG4gICAgaXNBcnJheShhcnIpIHtcbiAgICAgICAgLy8gUG9ydGVkOiBodHRwczovL2dpdGh1Yi5jb20vZm9yY2Vkb3Rjb20vYXVyYS9ibG9iL21hc3Rlci9hdXJhLWltcGwvc3JjL21haW4vcmVzb3VyY2VzL2F1cmEvdXRpbC9VdGlsLmpzI0wxODlcbiAgICAgICAgcmV0dXJuICh0eXBlb2YgQXJyYXkuaXNBcnJheSA9PT0gXCJmdW5jdGlvblwiID8gQXJyYXkuaXNBcnJheSA6IGZ1bmN0aW9uKGFyZykge1xuICAgICAgICAgICAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChhcmcpID09PSAnW29iamVjdCBBcnJheV0nO1xuICAgICAgICB9KShhcnIpO1xuICAgIH1cbiAgICBpc09iamVjdChvYmopIHtcbiAgICAgICAgLy9Qb3J0ZWQ6IGh0dHBzOi8vZ2l0aHViLmNvbS9mb3JjZWRvdGNvbS9hdXJhL2Jsb2IvbWFzdGVyL2F1cmEtaW1wbC9zcmMvbWFpbi9yZXNvdXJjZXMvYXVyYS91dGlsL1V0aWwuanMjTDIwNFxuICAgICAgICByZXR1cm4gdHlwZW9mIG9iaiA9PT0gXCJvYmplY3RcIiAmJiBvYmogIT09IG51bGwgJiYgIUFycmF5LmlzQXJyYXkob2JqKTtcbiAgICB9XG4gICAgaXNVbmRlZmluZWQob2JqKXtcbiAgICAgICAgLy9Qb3J0ZWQ6IGh0dHBzOi8vZ2l0aHViLmNvbS9mb3JjZWRvdGNvbS9hdXJhL2Jsb2IvbWFzdGVyL2F1cmEtaW1wbC9zcmMvbWFpbi9yZXNvdXJjZXMvYXVyYS91dGlsL1V0aWwuanMjTDMxOVxuICAgICAgICByZXR1cm4gb2JqID09PSB1bmRlZmluZWQ7XG4gICAgfVxufVxuXG4iLCJpbXBvcnQgeyBzdHViaWZ5SW5zdGFuY2UgfSBmcm9tICcuL3Npbm9uSGVscGVycydcbmltcG9ydCB7IEF1cmFVdGlsIH0gZnJvbSAnLi9hdXJhVXRpbCdcblxuZXhwb3J0IGZ1bmN0aW9uIGF1cmFGYWN0b3J5KHBhcmFtcyA9IHt9KSB7XG4gICAgcmV0dXJuIG5ldyBBdXJhKHBhcmFtcyk7XG59XG5cbmltcG9ydCB7IGNvbXBvbmVudEZhY3RvcnkgfSBmcm9tICcuL2NvbXBvbmVudEZhY3RvcnknXG5cbmNsYXNzIEF1cmEge1xuICAgIGNvbnN0cnVjdG9yKHBhcmFtcykge1xuICAgICAgICB0aGlzLnBhcmFtcyA9IHBhcmFtcztcbiAgICAgICAgdGhpcy51dGlsID0gbmV3IEF1cmFVdGlsKCk7XG4gICAgICAgIHN0dWJpZnlJbnN0YW5jZShBdXJhLCB0aGlzKTtcbiAgICB9XG4gICAgXG4gICAgc2V0UGFyYW1zKHBhcmFtcykge1xuICAgICAgICBPYmplY3QuYXNzaWduKHRoaXMucGFyYW1zLCBwYXJhbXMpO1xuICAgIH1cblxuICAgIGdldChuYW1lKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnBhcmFtc1tuYW1lXTtcbiAgICB9XG5cbiAgICBzZXQobmFtZSwgdmFsdWUpIHtcbiAgICAgICAgdGhpcy5wYXJhbXNbbmFtZV0gPSB2YWx1ZTtcbiAgICB9XG4gICAgXG4gICAgZW5xdWV1ZUFjdGlvbihhY3Rpb24pIHtcbiAgICAgICAgYWN0aW9uICYmIGFjdGlvbi5pbnZva2VDYWxsYmFjayAmJiBhY3Rpb24uaW52b2tlQ2FsbGJhY2sodHJ1ZSlcbiAgICB9XG5cbiAgICBjcmVhdGVDb21wb25lbnQodHlwZSwgYXR0cmlidXRlcywgY2FsbGJhY2spIHtcbiAgICAgICAgdGhpcy5jcmVhdGVDb21wb25lbnQudHlwZSA9IHR5cGU7XG4gICAgICAgIHRoaXMuY3JlYXRlQ29tcG9uZW50LmF0dHJpYnV0ZXMgPSBhdHRyaWJ1dGVzO1xuICAgICAgICAvLyBHZXQgY29tcG9uZW50IGluc3RhbmNlLlxuICAgICAgICAvLyBVc2UgZXhpc3RpbmcgY29tcG9uZW50IGluc3RhbmNlIGlmIHNldFxuICAgICAgICAvLyBDcmVhdGUgbmV3IGRlZmF1bHQgY29tcG9uZW50IGlmIGNvbXBvbmVudCBub3Qgc2V0XG4gICAgICAgIGxldCB7IGNvbXBvbmVudCB9ID0gdGhpcy5jcmVhdGVDb21wb25lbnQ7XG4gICAgICAgIGlmICghY29tcG9uZW50KSB7XG4gICAgICAgICAgICBjb21wb25lbnQgPSBuZXcgY29tcG9uZW50RmFjdG9yeShhdHRyaWJ1dGVzLCB0eXBlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuY3JlYXRlQ29tcG9uZW50LmNvbXBvbmVudCA9IG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGNhbGxiYWNrKSB7XG4gICAgICAgICAgICBjYWxsYmFjayhjb21wb25lbnQsICdTVUNDRVNTJywgWydTVUNDRVNTJ10pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBjb21wb25lbnQ7XG4gICAgfVxuICAgIGNyZWF0ZUNvbXBvbmVudHMoY29tcG9uZW50RGVmcywgY2FsbGJhY2spIHtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gY29tcG9uZW50RGVmc1xuICAgICAgICAgICAgLm1hcChkZWYgPT4gdGhpcy5jcmVhdGVDb21wb25lbnQoZGVmWzBdLCBkZWZbMV0pKVxuICAgICAgICBpZiAoY2FsbGJhY2spIHtcbiAgICAgICAgICAgIGNhbGxiYWNrKHJlc3VsdCwgJ1NVQ0NFU1MnLCByZXN1bHQubWFwKCAoKSA9PiAnU1VDQ0VTUycpKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cbiAgICBnZXRDYWxsYmFjayhjYWxsYmFjaykge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24oLi4uYXJncykge1xuICAgICAgICAgICAgY2FsbGJhY2sgJiYgY2FsbGJhY2soLi4uYXJncyk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZ2V0Q29tcG9uZW50KGlkKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnBhcmFtc1tpZF07XG4gICAgfVxuICAgIGdldFJlZmVyZW5jZSgpIHt9XG4gICAgZ2V0Um9vdCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucm9vdENvbXBvbmVudCB8fCAodGhpcy5yb290Q29tcG9uZW50ID0gbmV3IGNvbXBvbmVudEZhY3RvcnkoKSk7XG4gICAgfVxuICAgIGdldFRva2VuKG5hbWUpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucGFyYW1zWyd0b2tlbi4nICsgbmFtZV1cbiAgICB9XG4gICAgbG9nKHZhbHVlLCBlcnIpIHtcbiAgICAgICAgLyplc2xpbnQgbm8tY29uc29sZTogMCovXG4gICAgICAgIGNvbnNvbGUgJiYgY29uc29sZS5sb2codmFsdWUsIGVycilcbiAgICB9XG4gICAgcmVwb3J0RXJyb3IoKSB7fVxufSIsImltcG9ydCB7IHN0dWJpZnlJbnN0YW5jZSB9IGZyb20gJy4vc2lub25IZWxwZXJzJ1xuXG5leHBvcnQgZnVuY3Rpb24gYXBleENhbGxGYWN0b3J5KHBhcmFtcyA9IHt9KSB7XG4gICAgcmV0dXJuIG5ldyBBcGV4Q2FsbChwYXJhbXMpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYXBleFN1Y2Nlc3NSZXN1bHQocmVzcG9uc2UgPSB7fSkge1xuICAgIHJldHVybiBuZXcgQXBleENhbGxSZXN1bHQocmVzcG9uc2UpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYXBleEVycm9yUmVzdWx0KG1lc3NhZ2UpIHtcbiAgICByZXR1cm4gbmV3IEFwZXhDYWxsUmVzdWx0KG51bGwsIG1lc3NhZ2UpO1xufVxuXG5jbGFzcyBBcGV4Q2FsbCB7XG4gICAgY29uc3RydWN0b3IocmVzdWx0LCBpbnZva2VDYWxsYmFja09uRW5xdWV1ZSA9IHRydWUpIHtcbiAgICAgICAgdGhpcy5wYXJhbXMgPSBudWxsO1xuICAgICAgICB0aGlzLnJlc3VsdCA9IHJlc3VsdDtcbiAgICAgICAgdGhpcy5pbnZva2VDYWxsYmFja09uRW5xdWV1ZSA9IGludm9rZUNhbGxiYWNrT25FbnF1ZXVlO1xuICAgICAgICB0aGlzLmlzQmFja2dyb3VuZCA9IGZhbHNlO1xuICAgICAgICB0aGlzLnNldEFib3J0YWJsZSA9IGZhbHNlO1xuICAgICAgICBzdHViaWZ5SW5zdGFuY2UoQXBleENhbGwsIHRoaXMpO1xuICAgIH1cbiAgICBzZXRQYXJhbXMocGFyYW1zKSB7XG4gICAgICAgIHRoaXMucGFyYW1zID0gcGFyYW1zO1xuICAgIH1cbiAgICBzZXRQYXJhbShrZXksIHZhbHVlKSB7XG4gICAgICAgIHRoaXMucGFyYW1zID0gT2JqZWN0LmFzc2lnbih0aGlzLnBhcmFtcywge1trZXldIDogdmFsdWV9KTtcbiAgICB9XG4gICAgZ2V0UGFyYW1zKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wYXJhbXM7XG4gICAgfVxuICAgIHNldENhbGxiYWNrKGN0eCwgY2FsbGJhY2spIHtcbiAgICAgICAgdGhpcy5jdHggPSBjdHg7XG4gICAgICAgIHRoaXMuY2FsbGJhY2sgPSBjYWxsYmFjaztcbiAgICB9XG4gICAgaW52b2tlQ2FsbGJhY2soZnJvbUVucXVldWUgPSBmYWxzZSkge1xuICAgICAgICBpZiAoZnJvbUVucXVldWUgJiYgIXRoaXMuaW52b2tlQ2FsbGJhY2tPbkVucXVldWUpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmNhbGxiYWNrICYmIHRoaXMuY2FsbGJhY2suYmluZCh0aGlzLmN0eCkodGhpcy5yZXN1bHQpO1xuICAgIH1cbiAgICBnZXRFcnJvcigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucmVzdWx0LmdldEVycm9yKCk7XG4gICAgfVxuICAgIGdldFBhcmFtKG5hbWUpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucGFyYW1zID8gdGhpcy5wYXJhbXNbbmFtZV0gOiBudWxsO1xuICAgIH1cbiAgICBnZXRSZXR1cm5WYWx1ZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucmVzdWx0O1xuICAgIH1cbiAgICBnZXRTdGF0ZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucmVzdWx0LmdldFN0YXRlKCk7XG4gICAgfVxuICAgIGlzQmFja2dyb3VuZCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaXNCYWNrZ3JvdW5kO1xuICAgIH1cbiAgICBzZXRBYm9ydGFibGUoKSB7XG4gICAgfVxuICAgIHNldEJhY2tncm91bmQoKSB7XG4gICAgICAgIHRoaXMuaXNCYWNrZ3JvdW5kID0gdHJ1ZTtcbiAgICB9XG4gICAgc2V0U3RvcmFibGUoKSB7XG4gICAgfVxufVxuXG5jbGFzcyBBcGV4Q2FsbFJlc3VsdCB7XG4gICAgY29uc3RydWN0b3IocmVzcG9uc2UsIGVycm9yTWVzc2FnZSA9IG51bGwpIHtcbiAgICAgICAgdGhpcy5yZXNwb25zZSA9IHJlc3BvbnNlO1xuICAgICAgICB0aGlzLmVycm9yTWVzc2FnZSA9IGVycm9yTWVzc2FnZTtcbiAgICAgICAgc3R1YmlmeUluc3RhbmNlKEFwZXhDYWxsUmVzdWx0LCB0aGlzKTtcbiAgICB9XG4gICAgZ2V0U3RhdGUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmVycm9yTWVzc2FnZSA/ICdFUlJPUicgOiAnU1VDQ0VTUydcbiAgICB9XG4gICAgZ2V0RXJyb3IoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmVycm9yTWVzc2FnZSA/IFt7bWVzc2FnZTogdGhpcy5lcnJvck1lc3NhZ2V9XSA6IFtdXG4gICAgfVxuICAgIGdldFJldHVyblZhbHVlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5yZXNwb25zZTtcbiAgICB9XG59IiwiaW1wb3J0IHsgZXZlbnRGYWN0b3J5IH0gZnJvbSAnLi9ldmVudEZhY3RvcnknXG5pbXBvcnQgeyBjb21wb25lbnRGYWN0b3J5LCB1c2VDb21wb25lbnRBZGFwdGVycyB9IGZyb20gJy4vY29tcG9uZW50RmFjdG9yeSdcbmltcG9ydCB7IGF1cmFGYWN0b3J5IH0gZnJvbSAnLi9hdXJhRmFjdG9yeSdcbmltcG9ydCB7IEF1cmFVdGlsIH0gZnJvbSAnLi9hdXJhVXRpbCdcbmltcG9ydCB7IGFwZXhDYWxsRmFjdG9yeSwgYXBleFN1Y2Nlc3NSZXN1bHQsIGFwZXhFcnJvclJlc3VsdCB9IGZyb20gJy4vYXBleENhbGxGYWN0b3J5J1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBBdXJhVXRpbCxcbiAgICBldmVudEZhY3RvcnksXG4gICAgY29tcG9uZW50RmFjdG9yeSxcbiAgICB1c2VDb21wb25lbnRBZGFwdGVycyxcbiAgICBhdXJhRmFjdG9yeSxcbiAgICBhcGV4Q2FsbEZhY3RvcnksXG4gICAgYXBleFN1Y2Nlc3NSZXN1bHQsXG4gICAgYXBleEVycm9yUmVzdWx0XG59Il0sIm5hbWVzIjpbInNpbm9uIiwicmVxdWlyZSIsInN0dWJpZnlJbnN0YW5jZSIsImN0b3IiLCJpbnN0YW5jZSIsImdldE93blByb3BlcnR5TmFtZXMiLCJwcm90b3R5cGUiLCJmb3JFYWNoIiwicHJvcCIsInN0dWIiLCJjYWxsc0Zha2UiLCJwcm9wTmFtZSIsImFyZ3MiLCJjYWxsIiwiZXZlbnRGYWN0b3J5IiwicGFyYW1zIiwiRXZlbnQiLCJGQUtFX0VWRU5UX05BTUUiLCJrZXkiLCJ2YWx1ZSIsImV2ZW50TmFtZSIsIm5hbWUiLCJfIiwiRGVmYXVsdENvbXBvbmVudEFkYXB0ZXIiLCJXZWxsS25vd25Db21wb25lbnRzIiwiQ29tcG9uZW50QWRhcHRlcnMiLCJjb21wb25lbnRGYWN0b3J5Rm9yQXJyYXkiLCJhcnJheU9mVHlwZXMiLCJtYXAiLCJjb21wb25lbnRGYWN0b3J5IiwidHlwZU9yQ29tcG9uZW50IiwiQXJyYXkiLCJpc0FycmF5IiwiRXJyb3IiLCJDb21wb25lbnQiLCJhZGFwdGVyTmFtZSIsInRvTG93ZXJDYXNlIiwicmVwbGFjZSIsImFkYXB0ZXIiLCJzb21lIiwic3RhcnRzV2l0aCIsIndhcm4iLCJ1c2VDb21wb25lbnRBZGFwdGVycyIsInJlZ2lzdHJhdG9yIiwicmVnaXN0ZXIiLCJjb21wb25lbnRUeXBlIiwidHlwZSIsIk9iamVjdCIsImFzc2lnbiIsInN1YnN0cmluZyIsImdldCIsInNldCIsImZpbmRNYXAiLCJoYXNPd25Qcm9wZXJ0eSIsImNvbXBvbmVudCIsImNsYXNzTmFtZVRvQ29tcG9uZW50VmFyIiwiY2xhc3NOYW1lIiwiQXVyYVV0aWwiLCJvYmoiLCJ1bmRlZmluZWQiLCJsZW5ndGgiLCJ0b1N0cmluZyIsImtleXMiLCJ2YWwiLCJhcnIiLCJhcmciLCJhdXJhRmFjdG9yeSIsIkF1cmEiLCJ1dGlsIiwiYWN0aW9uIiwiaW52b2tlQ2FsbGJhY2siLCJhdHRyaWJ1dGVzIiwiY2FsbGJhY2siLCJjcmVhdGVDb21wb25lbnQiLCJjb21wb25lbnREZWZzIiwicmVzdWx0IiwiZGVmIiwiaWQiLCJyb290Q29tcG9uZW50IiwiZXJyIiwiY29uc29sZSIsImxvZyIsImFwZXhDYWxsRmFjdG9yeSIsIkFwZXhDYWxsIiwiYXBleFN1Y2Nlc3NSZXN1bHQiLCJyZXNwb25zZSIsIkFwZXhDYWxsUmVzdWx0IiwiYXBleEVycm9yUmVzdWx0IiwibWVzc2FnZSIsImludm9rZUNhbGxiYWNrT25FbnF1ZXVlIiwiaXNCYWNrZ3JvdW5kIiwic2V0QWJvcnRhYmxlIiwiY3R4IiwiZnJvbUVucXVldWUiLCJiaW5kIiwiZ2V0RXJyb3IiLCJnZXRTdGF0ZSIsImVycm9yTWVzc2FnZSIsIm1vZHVsZSIsImV4cG9ydHMiXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLElBQU1BLFFBQVFDLFFBQVEsT0FBUixDQUFkOztBQUVBLEFBQU8sU0FBU0MsZUFBVCxDQUF5QkMsSUFBekIsRUFBK0JDLFFBQS9CLEVBQXlDO1dBQ3JDQyxtQkFBUCxDQUEyQkYsS0FBS0csU0FBaEMsRUFBMkNDLE9BQTNDLENBQW1ELGdCQUFRO1lBQ25ELE9BQU9KLEtBQUtHLFNBQUwsQ0FBZUUsSUFBZixDQUFQLEtBQWdDLFVBQWhDLElBQThDQSxTQUFTLGFBQTNELEVBQTBFOzs7Y0FHcEVDLElBQU4sQ0FBV0wsUUFBWCxFQUFxQkksSUFBckIsRUFBMkJFLFNBQTNCLENBQXNDLFVBQUNDLFFBQUQ7bUJBQWMsWUFBYTs7O2tEQUFUQyxJQUFTO3dCQUFBOzs7dUJBQ3RELDhCQUFLTixTQUFMLENBQWVLLFFBQWYsR0FBeUJFLElBQXpCLCtCQUE4QlQsUUFBOUIsU0FBMkNRLElBQTNDLEVBQVA7YUFEa0M7U0FBRCxDQUVsQ0osSUFGa0MsQ0FBckM7S0FKSjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUNERyxTQUFTTSxZQUFULEdBQW1DO1FBQWJDLE1BQWEsdUVBQUosRUFBSTs7V0FDL0IsSUFBSUMsS0FBSixDQUFVRCxNQUFWLENBQVA7O0FBRUosSUFBTUUsa0JBQWtC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
