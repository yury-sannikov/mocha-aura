(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(factory());
}(this, (function () { 'use strict';

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

var sinon = require('sinon');

function eventFactory() {
    var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    return new Event(params);
}
var FAKE_EVENT_NAME = 'mocha-aura-fake-event';

var Event = function () {
    function Event(params) {
        classCallCheck(this, Event);

        this.params = params || {};
        this.fire = sinon.spy();
        this.pause = sinon.spy();
        this.preventDefault = sinon.spy();
        this.resume = sinon.spy();
        this.stopPropagation = sinon.spy();
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
    }]);
    return Event;
}();

var sinon$1 = require('sinon');
var _ = require('lodash');
var DefaultComponentAdapter = 'default';
var WellKnownComponents = ['aura:', 'force:', 'forceChatter:', 'lightning:', 'ui:', 'c:'];

var ComponentAdapters = defineProperty({}, DefaultComponentAdapter, function (instance) {
    return instance;
});

function componentFactoryForArray(params, arrayOfTypes) {
    return arrayOfTypes.map(function (typeOrComponent) {
        if (typeOrComponent === true) {
            typeOrComponent = DefaultComponentAdapter;
        } else if (typeOrComponent instanceof Component) {
            return typeOrComponent;
        } else if (typeOrComponent === null) {
            return null;
        }
        return componentFactory(params, typeOrComponent);
    });
}

function componentFactory() {
    var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : DefaultComponentAdapter;

    if (Array.isArray(type)) {
        throw new Error('Unexpected type argument');
    }

    var instance = new Component(params, type);
    var adapterName = type.toLowerCase().replace('markup://', '');
    var adapter = ComponentAdapters[adapterName];
    if (!adapter) {
        if (!_.some(WellKnownComponents, function (name) {
            return adapterName.startsWith(name);
        })) {
            /*eslint no-console: 0*/
            console.warn('Unable to find component adapter ' + type);
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
        var _this = this;

        classCallCheck(this, Component);

        this.params = Object.assign({}, {
            findMap: {}
        }, params);
        this.type = type || 'default';
        this.getStub = sinon$1.stub(this, 'get').callsFake(function (name) {
            if (name.startsWith('v.') || name.startsWith('c.') || name.startsWith('e.')) {
                name = name.substring(2);
            }
            return _.get(_this.params, name);
        });

        this.setStub = sinon$1.stub(this, 'set').callsFake(function (name, value) {
            if (name.startsWith('v.') || name.startsWith('c.') || name.startsWith('e.')) {
                name = name.substring(2);
            }
            _.set(_this.params, name, value);
        });
        sinon$1.stub(this, 'addEventHandler');
        sinon$1.stub(this, 'addHandler');
        sinon$1.stub(this, 'addValueHandler');
        sinon$1.stub(this, 'addValueProvider');
        sinon$1.stub(this, 'autoDestroy');
        sinon$1.stub(this, 'destroy');
        sinon$1.stub(this, 'removeEventHandler');
    }

    createClass(Component, [{
        key: 'get',
        value: function get$$1() {}
    }, {
        key: 'set',
        value: function set$$1() {}
    }, {
        key: 'find',
        value: function find(name) {
            var typeOrComponent = this.params.findMap[name];
            if (!typeOrComponent && this.params.findMap.hasOwnProperty(name)) {
                return typeOrComponent;
            }
            if (typeOrComponent instanceof Component) {
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
    }]);
    return Component;
}();

var sinon$3 = require('sinon');

var classNameToComponentVar = function classNameToComponentVar(className) {
    return 'v.__cls_' + className;
};
var AuraUtil = function () {
    function AuraUtil() {
        classCallCheck(this, AuraUtil);

        sinon$3.stub(this, 'addClass').callsFake(function (component, className) {
            return component.set(classNameToComponentVar(className), true);
        });
        sinon$3.stub(this, 'removeClass').callsFake(function (component, className) {
            return component.set(classNameToComponentVar(className), false);
        });
        sinon$3.stub(this, 'hasClass').callsFake(function (component, className) {
            return component.get(classNameToComponentVar(className));
        });
        sinon$3.stub(this, 'toggleClass').callsFake(function (component, className) {
            component.set(classNameToComponentVar(className), !component.get(classNameToComponentVar(className)));
        });
        this.isEmpty = function (obj) {
            if (obj === undefined || obj === null || obj === '') {
                return true;
            }
            if (Array.isArray(obj)) {
                return obj.length === 0;
            } else if ((typeof obj === 'undefined' ? 'undefined' : _typeof(obj)) === 'object' && Object.prototype.toString.call(obj) === '[object Object]') {
                return Object.keys(obj).length === 0;
            }
            return false;
        };
        this.isUndefinedOrNull = function (obj) {
            return obj === undefined || obj === null;
        };
    }

    createClass(AuraUtil, [{
        key: 'addClass',
        value: function addClass() {}
    }, {
        key: 'removeClass',
        value: function removeClass() {}
    }, {
        key: 'hasClass',
        value: function hasClass() {}
    }, {
        key: 'toggleClass',
        value: function toggleClass() {}
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

var sinon$2 = require('sinon');

function auraFactory() {
    var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    return new Aura(params);
}

var Aura = function () {
    function Aura(params) {
        var _this = this;

        classCallCheck(this, Aura);

        this.params = params;
        this.util = new AuraUtil();
        this.getStub = sinon$2.stub(this, 'get').callsFake(function (name) {
            return params[name];
        });
        this.setStub = sinon$2.stub(this, 'set').callsFake(function (name, value) {
            return params[name] = value;
        });
        this.enqueueActionStub = sinon$2.stub(this, 'enqueueAction').callsFake(function (action) {
            return action && action.invokeCallback && action.invokeCallback(true);
        });
        sinon$2.stub(this, 'getReference');
        sinon$2.stub(this, 'getRoot').callsFake(function () {
            return _this.rootComponent || (_this.rootComponent = new componentFactory());
        });
        sinon$2.stub(this, 'reportError');
    }

    createClass(Aura, [{
        key: 'setParams',
        value: function setParams(params) {
            Object.assign(this.params, params);
        }
    }, {
        key: 'get',
        value: function get$$1() {}
    }, {
        key: 'enqueueAction',
        value: function enqueueAction() {}
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
            var _this2 = this;

            var result = componentDefs.map(function (def) {
                return _this2.createComponent(def[0], def[1]);
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
        value: function getRoot() {}
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

var sinon$4 = require('sinon');

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
        sinon$4.stub(this, 'setStorable');
        sinon$4.stub(this, 'setAbortable');
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9jaGEtYXVyYS51bWQuanMiLCJzb3VyY2VzIjpbIi4uL2xpYi9ldmVudEZhY3RvcnkuanMiLCIuLi9saWIvY29tcG9uZW50RmFjdG9yeS5qcyIsIi4uL2xpYi9hdXJhVXRpbC5qcyIsIi4uL2xpYi9hdXJhRmFjdG9yeS5qcyIsIi4uL2xpYi9hcGV4Q2FsbEZhY3RvcnkuanMiLCIuLi9saWIvYXVyYS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCBzaW5vbiA9IHJlcXVpcmUoJ3Npbm9uJyk7XG5cbmV4cG9ydCBmdW5jdGlvbiBldmVudEZhY3RvcnkocGFyYW1zID0ge30pIHtcbiAgICByZXR1cm4gbmV3IEV2ZW50KHBhcmFtcyk7XG59XG5jb25zdCBGQUtFX0VWRU5UX05BTUUgPSAnbW9jaGEtYXVyYS1mYWtlLWV2ZW50J1xuY2xhc3MgRXZlbnQge1xuICAgIGNvbnN0cnVjdG9yKHBhcmFtcykge1xuICAgICAgICB0aGlzLnBhcmFtcyA9IHBhcmFtcyB8fCB7fTtcbiAgICAgICAgdGhpcy5maXJlID0gc2lub24uc3B5KCk7XG4gICAgICAgIHRoaXMucGF1c2UgPSBzaW5vbi5zcHkoKTtcbiAgICAgICAgdGhpcy5wcmV2ZW50RGVmYXVsdCA9IHNpbm9uLnNweSgpO1xuICAgICAgICB0aGlzLnJlc3VtZSA9IHNpbm9uLnNweSgpO1xuICAgICAgICB0aGlzLnN0b3BQcm9wYWdhdGlvbiA9IHNpbm9uLnNweSgpO1xuICAgIH1cbiAgICBzZXRQYXJhbXMocGFyYW1zKSB7XG4gICAgICAgIHRoaXMucGFyYW1zID0gcGFyYW1zO1xuICAgIH1cbiAgICBzZXRQYXJhbShrZXksIHZhbHVlKSB7XG4gICAgICAgIHRoaXMucGFyYW1zW2tleV0gPSB2YWx1ZTtcbiAgICB9XG4gICAgZ2V0UGFyYW1zKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wYXJhbXM7XG4gICAgfVxuICAgIGdldEV2ZW50VHlwZSgpIHtcbiAgICAgICAgcmV0dXJuICdBUFBMSUNBVElPTidcbiAgICB9XG4gICAgZ2V0TmFtZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucGFyYW1zLmV2ZW50TmFtZSB8fCBGQUtFX0VWRU5UX05BTUVcbiAgICB9XG4gICAgZ2V0UGFyYW0obmFtZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5wYXJhbXNbbmFtZV1cbiAgICB9XG4gICAgZ2V0UGhhc2UoKSB7XG4gICAgICAgIHJldHVybiAnZGVmYXVsdCdcbiAgICB9XG4gICAgZ2V0U291cmNlKCkge1xuICAgICAgICByZXR1cm4gbnVsbFxuICAgIH1cbiAgICBnZXRUeXBlKCkge1xuICAgICAgICByZXR1cm4gYGM6JHtGQUtFX0VWRU5UX05BTUV9YFxuICAgIH1cblxufSIsImNvbnN0IHNpbm9uID0gcmVxdWlyZSgnc2lub24nKTtcbmNvbnN0IF8gPSByZXF1aXJlKCdsb2Rhc2gnKTtcbmltcG9ydCB7IGV2ZW50RmFjdG9yeSB9IGZyb20gJy4vZXZlbnRGYWN0b3J5J1xuXG5jb25zdCBEZWZhdWx0Q29tcG9uZW50QWRhcHRlciA9ICdkZWZhdWx0J1xuY29uc3QgV2VsbEtub3duQ29tcG9uZW50cyA9IFsnYXVyYTonLCAnZm9yY2U6JywgJ2ZvcmNlQ2hhdHRlcjonLCAnbGlnaHRuaW5nOicsICd1aTonLCAnYzonXVxuXG5sZXQgQ29tcG9uZW50QWRhcHRlcnMgPSB7XG4gICAgW0RlZmF1bHRDb21wb25lbnRBZGFwdGVyXTogaW5zdGFuY2UgPT4gaW5zdGFuY2Vcbn1cblxuZnVuY3Rpb24gY29tcG9uZW50RmFjdG9yeUZvckFycmF5KHBhcmFtcywgYXJyYXlPZlR5cGVzKSB7XG4gICAgcmV0dXJuIGFycmF5T2ZUeXBlcy5tYXAodHlwZU9yQ29tcG9uZW50ID0+IHtcbiAgICAgICAgaWYgKHR5cGVPckNvbXBvbmVudCA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgdHlwZU9yQ29tcG9uZW50ID0gRGVmYXVsdENvbXBvbmVudEFkYXB0ZXJcbiAgICAgICAgfSBlbHNlIGlmICh0eXBlT3JDb21wb25lbnQgaW5zdGFuY2VvZiBDb21wb25lbnQpIHtcbiAgICAgICAgICAgIHJldHVybiB0eXBlT3JDb21wb25lbnQ7XG4gICAgICAgIH0gZWxzZSBpZiAodHlwZU9yQ29tcG9uZW50ID09PSBudWxsKSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gY29tcG9uZW50RmFjdG9yeShwYXJhbXMsIHR5cGVPckNvbXBvbmVudClcbiAgICB9KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNvbXBvbmVudEZhY3RvcnkocGFyYW1zID0ge30sIHR5cGUgPSBEZWZhdWx0Q29tcG9uZW50QWRhcHRlcikge1xuICAgIGlmIChBcnJheS5pc0FycmF5KHR5cGUpKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignVW5leHBlY3RlZCB0eXBlIGFyZ3VtZW50JylcbiAgICB9XG5cbiAgICBsZXQgaW5zdGFuY2UgPSBuZXcgQ29tcG9uZW50KHBhcmFtcywgdHlwZSk7XG4gICAgbGV0IGFkYXB0ZXJOYW1lID0gdHlwZS50b0xvd2VyQ2FzZSgpLnJlcGxhY2UoJ21hcmt1cDovLycsICcnKVxuICAgIGxldCBhZGFwdGVyID0gQ29tcG9uZW50QWRhcHRlcnNbYWRhcHRlck5hbWVdO1xuICAgIGlmICghYWRhcHRlcikge1xuICAgICAgICBpZiAoIV8uc29tZShXZWxsS25vd25Db21wb25lbnRzLCBuYW1lID0+IGFkYXB0ZXJOYW1lLnN0YXJ0c1dpdGgobmFtZSkpKSB7XG4gICAgICAgICAgICAvKmVzbGludCBuby1jb25zb2xlOiAwKi9cbiAgICAgICAgICAgIGNvbnNvbGUud2FybihgVW5hYmxlIHRvIGZpbmQgY29tcG9uZW50IGFkYXB0ZXIgJHt0eXBlfWApO1xuICAgICAgICB9XG4gICAgICAgIGFkYXB0ZXIgPSBDb21wb25lbnRBZGFwdGVyc1tEZWZhdWx0Q29tcG9uZW50QWRhcHRlcl07XG4gICAgfVxuICAgIHJldHVybiBhZGFwdGVyKGluc3RhbmNlLCBwYXJhbXMpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdXNlQ29tcG9uZW50QWRhcHRlcnMocmVnaXN0cmF0b3IpIHtcbiAgICBjb25zdCByZWdpc3RlciA9IChjb21wb25lbnRUeXBlLCBhZGFwdGVyKSA9PiB7XG4gICAgICAgIGNvbnN0IGFkYXB0ZXJOYW1lID0gY29tcG9uZW50VHlwZS50b0xvd2VyQ2FzZSgpO1xuICAgICAgICBDb21wb25lbnRBZGFwdGVyc1thZGFwdGVyTmFtZV0gPSBhZGFwdGVyXG4gICAgfVxuICAgIHJlZ2lzdHJhdG9yKHtyZWdpc3Rlcn0pO1xufVxuXG5jbGFzcyBDb21wb25lbnQge1xuICAgIGNvbnN0cnVjdG9yKHBhcmFtcywgdHlwZSkge1xuICAgICAgICB0aGlzLnBhcmFtcyA9IE9iamVjdC5hc3NpZ24oe30sIHtcbiAgICAgICAgICAgIGZpbmRNYXA6IHt9XG4gICAgICAgIH0sIHBhcmFtcyk7XG4gICAgICAgIHRoaXMudHlwZSA9IHR5cGUgfHwgJ2RlZmF1bHQnO1xuICAgICAgICB0aGlzLmdldFN0dWIgPSBzaW5vbi5zdHViKHRoaXMsICdnZXQnKS5jYWxsc0Zha2UoKG5hbWUpID0+IHtcbiAgICAgICAgICAgIGlmIChuYW1lLnN0YXJ0c1dpdGgoJ3YuJykgfHwgbmFtZS5zdGFydHNXaXRoKCdjLicpIHx8IG5hbWUuc3RhcnRzV2l0aCgnZS4nKSkge1xuICAgICAgICAgICAgICAgIG5hbWUgPSBuYW1lLnN1YnN0cmluZygyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBfLmdldCh0aGlzLnBhcmFtcywgbmFtZSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMuc2V0U3R1YiA9IHNpbm9uLnN0dWIodGhpcywgJ3NldCcpLmNhbGxzRmFrZSgobmFtZSwgdmFsdWUpID0+IHtcbiAgICAgICAgICAgIGlmIChuYW1lLnN0YXJ0c1dpdGgoJ3YuJykgfHwgbmFtZS5zdGFydHNXaXRoKCdjLicpIHx8IG5hbWUuc3RhcnRzV2l0aCgnZS4nKSkge1xuICAgICAgICAgICAgICAgIG5hbWUgPSBuYW1lLnN1YnN0cmluZygyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIF8uc2V0KHRoaXMucGFyYW1zLCBuYW1lLCB2YWx1ZSk7XG4gICAgICAgIH0pO1xuICAgICAgICBzaW5vbi5zdHViKHRoaXMsICdhZGRFdmVudEhhbmRsZXInKTtcbiAgICAgICAgc2lub24uc3R1Yih0aGlzLCAnYWRkSGFuZGxlcicpO1xuICAgICAgICBzaW5vbi5zdHViKHRoaXMsICdhZGRWYWx1ZUhhbmRsZXInKTtcbiAgICAgICAgc2lub24uc3R1Yih0aGlzLCAnYWRkVmFsdWVQcm92aWRlcicpO1xuICAgICAgICBzaW5vbi5zdHViKHRoaXMsICdhdXRvRGVzdHJveScpO1xuICAgICAgICBzaW5vbi5zdHViKHRoaXMsICdkZXN0cm95Jyk7XG4gICAgICAgIHNpbm9uLnN0dWIodGhpcywgJ3JlbW92ZUV2ZW50SGFuZGxlcicpO1xuICAgIH1cblxuICAgIGdldCgpIHtcbiAgICB9XG4gICAgc2V0KCkge1xuICAgIH1cblxuICAgIGZpbmQobmFtZSkge1xuICAgICAgICBsZXQgdHlwZU9yQ29tcG9uZW50ID0gdGhpcy5wYXJhbXMuZmluZE1hcFtuYW1lXTtcbiAgICAgICAgaWYgKCF0eXBlT3JDb21wb25lbnQgJiYgdGhpcy5wYXJhbXMuZmluZE1hcC5oYXNPd25Qcm9wZXJ0eShuYW1lKSkge1xuICAgICAgICAgICAgcmV0dXJuIHR5cGVPckNvbXBvbmVudDtcbiAgICAgICAgfVxuICAgICAgICBpZiAodHlwZU9yQ29tcG9uZW50IGluc3RhbmNlb2YgQ29tcG9uZW50KSB7XG4gICAgICAgICAgICByZXR1cm4gdHlwZU9yQ29tcG9uZW50O1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgY29tcG9uZW50ID0gdGhpcy5wYXJhbXMuZmluZE1hcFtuYW1lXSA9IChBcnJheS5pc0FycmF5KHR5cGVPckNvbXBvbmVudCkgPyBcbiAgICAgICAgICAgIGNvbXBvbmVudEZhY3RvcnlGb3JBcnJheSh0aGlzLnBhcmFtcywgdHlwZU9yQ29tcG9uZW50KSA6IFxuICAgICAgICAgICAgY29tcG9uZW50RmFjdG9yeSh0aGlzLnBhcmFtcywgdHlwZU9yQ29tcG9uZW50KSlcbiAgICAgICAgcmV0dXJuIGNvbXBvbmVudDtcbiAgICB9XG4gICAgZ2V0TG9jYWxJZCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucGFyYW1zWydhdXJhOmlkJ107XG4gICAgfVxuICAgIGNsZWFyUmVmZXJlbmNlKGtleSkge1xuICAgICAgICBkZWxldGUgdGhpcy5wYXJhbXNba2V5XTtcbiAgICB9XG4gICAgZ2V0Q29uY3JldGVDb21wb25lbnQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICBnZXRFbGVtZW50KCkge1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgZ2V0RWxlbWVudHMoKSB7XG4gICAgICAgIHJldHVybiBbdGhpc107XG4gICAgfVxuICAgIGdldEV2ZW50KG5hbWUpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucGFyYW1zW25hbWVdIHx8IGV2ZW50RmFjdG9yeSgpO1xuICAgIH1cbiAgICBnZXRHbG9iYWxJZCgpIHtcbiAgICAgICAgcmV0dXJuIGBnbG9iYWwtJHt0aGlzLnBhcmFtc1snYXVyYTppZCddfWA7XG4gICAgfVxuICAgIGdldE5hbWUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnR5cGU7XG4gICAgfVxuICAgIGdldFR5cGUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnR5cGU7XG4gICAgfVxuICAgIGdldFJlZmVyZW5jZShrZXkpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucGFyYW1zW2tleV07XG4gICAgfVxuICAgIGdldFN1cGVyKCkge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgZ2V0VmVyc2lvbigpIHtcbiAgICAgICAgcmV0dXJuICcxLjAnO1xuICAgIH1cbiAgICBpc0NvbmNyZXRlKCkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgaXNJbnN0YW5jZU9mKG5hbWUpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudHlwZSA9PT0gbmFtZTtcbiAgICB9XG4gICAgaXNWYWxpZCgpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG59IiwiY29uc3Qgc2lub24gPSByZXF1aXJlKCdzaW5vbicpO1xuXG5jb25zdCBjbGFzc05hbWVUb0NvbXBvbmVudFZhciA9IGNsYXNzTmFtZSA9PiBgdi5fX2Nsc18ke2NsYXNzTmFtZX1gXG5leHBvcnQgY2xhc3MgQXVyYVV0aWwge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBzaW5vbi5zdHViKHRoaXMsICdhZGRDbGFzcycpLmNhbGxzRmFrZSgoY29tcG9uZW50LCBjbGFzc05hbWUpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBjb21wb25lbnQuc2V0KGNsYXNzTmFtZVRvQ29tcG9uZW50VmFyKGNsYXNzTmFtZSksIHRydWUpO1xuICAgICAgICB9KVxuICAgICAgICBzaW5vbi5zdHViKHRoaXMsICdyZW1vdmVDbGFzcycpLmNhbGxzRmFrZSgoY29tcG9uZW50LCBjbGFzc05hbWUpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBjb21wb25lbnQuc2V0KGNsYXNzTmFtZVRvQ29tcG9uZW50VmFyKGNsYXNzTmFtZSksIGZhbHNlKTtcbiAgICAgICAgfSlcbiAgICAgICAgc2lub24uc3R1Yih0aGlzLCAnaGFzQ2xhc3MnKS5jYWxsc0Zha2UoKGNvbXBvbmVudCwgY2xhc3NOYW1lKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gY29tcG9uZW50LmdldChjbGFzc05hbWVUb0NvbXBvbmVudFZhcihjbGFzc05hbWUpKTtcbiAgICAgICAgfSlcbiAgICAgICAgc2lub24uc3R1Yih0aGlzLCAndG9nZ2xlQ2xhc3MnKS5jYWxsc0Zha2UoKGNvbXBvbmVudCwgY2xhc3NOYW1lKSA9PiB7XG4gICAgICAgICAgICBjb21wb25lbnQuc2V0KGNsYXNzTmFtZVRvQ29tcG9uZW50VmFyKGNsYXNzTmFtZSksICFjb21wb25lbnQuZ2V0KGNsYXNzTmFtZVRvQ29tcG9uZW50VmFyKGNsYXNzTmFtZSkpKTtcbiAgICAgICAgfSlcbiAgICAgICAgdGhpcy5pc0VtcHR5ID0gb2JqID0+IHtcbiAgICAgICAgICAgIGlmIChvYmogPT09IHVuZGVmaW5lZCB8fCBvYmogPT09IG51bGwgfHwgb2JqID09PSAnJykge1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkob2JqKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBvYmoubGVuZ3RoID09PSAwO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh0eXBlb2Ygb2JqID09PSAnb2JqZWN0JyAmJiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwob2JqKSA9PT0gJ1tvYmplY3QgT2JqZWN0XScpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gT2JqZWN0LmtleXMob2JqKS5sZW5ndGggPT09IDA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH07XG4gICAgICAgIHRoaXMuaXNVbmRlZmluZWRPck51bGwgPSBvYmogPT4ge1xuICAgICAgICAgICAgcmV0dXJuIG9iaiA9PT0gdW5kZWZpbmVkIHx8IG9iaiA9PT0gbnVsbDtcbiAgICAgICAgfTtcbiAgICB9XG4gICAgYWRkQ2xhc3MoKSB7fVxuICAgIHJlbW92ZUNsYXNzKCkge31cbiAgICBoYXNDbGFzcygpIHt9XG4gICAgdG9nZ2xlQ2xhc3MoKSB7fVxuICAgIGdldEJvb2xlYW5WYWx1ZSh2YWwpIHtcbiAgICAgICAgLy8gUG9ydGVkOiBodHRwczovL2dpdGh1Yi5jb20vZm9yY2Vkb3Rjb20vYXVyYS9ibG9iL21hc3Rlci9hdXJhLWltcGwvc3JjL21haW4vcmVzb3VyY2VzL2F1cmEvdXRpbC9VdGlsLmpzI0wzNjZcbiAgICAgICAgcmV0dXJuIHZhbCAhPT0gdW5kZWZpbmVkICYmIHZhbCAhPT0gbnVsbCAmJiB2YWwgIT09IGZhbHNlICYmIHZhbCAhPT0gMCAmJiB2YWwgIT09ICdmYWxzZScgJiYgdmFsICE9PSAnJyAmJiB2YWwgIT09ICdmJztcbiAgICB9XG4gICAgaXNBcnJheShhcnIpIHtcbiAgICAgICAgLy8gUG9ydGVkOiBodHRwczovL2dpdGh1Yi5jb20vZm9yY2Vkb3Rjb20vYXVyYS9ibG9iL21hc3Rlci9hdXJhLWltcGwvc3JjL21haW4vcmVzb3VyY2VzL2F1cmEvdXRpbC9VdGlsLmpzI0wxODlcbiAgICAgICAgcmV0dXJuICh0eXBlb2YgQXJyYXkuaXNBcnJheSA9PT0gXCJmdW5jdGlvblwiID8gQXJyYXkuaXNBcnJheSA6IGZ1bmN0aW9uKGFyZykge1xuICAgICAgICAgICAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChhcmcpID09PSAnW29iamVjdCBBcnJheV0nO1xuICAgICAgICB9KShhcnIpO1xuICAgIH1cbiAgICBpc09iamVjdChvYmopIHtcbiAgICAgICAgLy9Qb3J0ZWQ6IGh0dHBzOi8vZ2l0aHViLmNvbS9mb3JjZWRvdGNvbS9hdXJhL2Jsb2IvbWFzdGVyL2F1cmEtaW1wbC9zcmMvbWFpbi9yZXNvdXJjZXMvYXVyYS91dGlsL1V0aWwuanMjTDIwNFxuICAgICAgICByZXR1cm4gdHlwZW9mIG9iaiA9PT0gXCJvYmplY3RcIiAmJiBvYmogIT09IG51bGwgJiYgIUFycmF5LmlzQXJyYXkob2JqKTtcbiAgICB9XG4gICAgaXNVbmRlZmluZWQob2JqKXtcbiAgICAgICAgLy9Qb3J0ZWQ6IGh0dHBzOi8vZ2l0aHViLmNvbS9mb3JjZWRvdGNvbS9hdXJhL2Jsb2IvbWFzdGVyL2F1cmEtaW1wbC9zcmMvbWFpbi9yZXNvdXJjZXMvYXVyYS91dGlsL1V0aWwuanMjTDMxOVxuICAgICAgICByZXR1cm4gb2JqID09PSB1bmRlZmluZWQ7XG4gICAgfVxufVxuXG4iLCJjb25zdCBzaW5vbiA9IHJlcXVpcmUoJ3Npbm9uJyk7XG5cbmltcG9ydCB7IEF1cmFVdGlsIH0gZnJvbSAnLi9hdXJhVXRpbCdcblxuZXhwb3J0IGZ1bmN0aW9uIGF1cmFGYWN0b3J5KHBhcmFtcyA9IHt9KSB7XG4gICAgcmV0dXJuIG5ldyBBdXJhKHBhcmFtcyk7XG59XG5cbmltcG9ydCB7IGNvbXBvbmVudEZhY3RvcnkgfSBmcm9tICcuL2NvbXBvbmVudEZhY3RvcnknXG5cbmNsYXNzIEF1cmEge1xuICAgIGNvbnN0cnVjdG9yKHBhcmFtcykge1xuICAgICAgICB0aGlzLnBhcmFtcyA9IHBhcmFtcztcbiAgICAgICAgdGhpcy51dGlsID0gbmV3IEF1cmFVdGlsKCk7XG4gICAgICAgIHRoaXMuZ2V0U3R1YiA9IHNpbm9uLnN0dWIodGhpcywgJ2dldCcpLmNhbGxzRmFrZSgobmFtZSkgPT4gcGFyYW1zW25hbWVdKTtcbiAgICAgICAgdGhpcy5zZXRTdHViID0gc2lub24uc3R1Yih0aGlzLCAnc2V0JykuY2FsbHNGYWtlKChuYW1lLCB2YWx1ZSkgPT4gcGFyYW1zW25hbWVdID0gdmFsdWUpO1xuICAgICAgICB0aGlzLmVucXVldWVBY3Rpb25TdHViID0gc2lub24uc3R1Yih0aGlzLCAnZW5xdWV1ZUFjdGlvbicpLmNhbGxzRmFrZSgoYWN0aW9uKSA9PiBhY3Rpb24gJiYgYWN0aW9uLmludm9rZUNhbGxiYWNrICYmIGFjdGlvbi5pbnZva2VDYWxsYmFjayh0cnVlKSk7XG4gICAgICAgIHNpbm9uLnN0dWIodGhpcywgJ2dldFJlZmVyZW5jZScpO1xuICAgICAgICBzaW5vbi5zdHViKHRoaXMsICdnZXRSb290JykuY2FsbHNGYWtlKCgpID0+IHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnJvb3RDb21wb25lbnQgfHwgKHRoaXMucm9vdENvbXBvbmVudCA9IG5ldyBjb21wb25lbnRGYWN0b3J5KCkpO1xuICAgICAgICB9KVxuICAgICAgICBzaW5vbi5zdHViKHRoaXMsICdyZXBvcnRFcnJvcicpO1xuICAgIH1cbiAgICBcbiAgICBzZXRQYXJhbXMocGFyYW1zKSB7XG4gICAgICAgIE9iamVjdC5hc3NpZ24odGhpcy5wYXJhbXMsIHBhcmFtcyk7XG4gICAgfVxuXG4gICAgZ2V0KCkge1xuICAgIH1cbiAgICBcbiAgICBlbnF1ZXVlQWN0aW9uKCkge1xuICAgIH1cblxuICAgIGNyZWF0ZUNvbXBvbmVudCh0eXBlLCBhdHRyaWJ1dGVzLCBjYWxsYmFjaykge1xuICAgICAgICB0aGlzLmNyZWF0ZUNvbXBvbmVudC50eXBlID0gdHlwZTtcbiAgICAgICAgdGhpcy5jcmVhdGVDb21wb25lbnQuYXR0cmlidXRlcyA9IGF0dHJpYnV0ZXM7XG4gICAgICAgIC8vIEdldCBjb21wb25lbnQgaW5zdGFuY2UuXG4gICAgICAgIC8vIFVzZSBleGlzdGluZyBjb21wb25lbnQgaW5zdGFuY2UgaWYgc2V0XG4gICAgICAgIC8vIENyZWF0ZSBuZXcgZGVmYXVsdCBjb21wb25lbnQgaWYgY29tcG9uZW50IG5vdCBzZXRcbiAgICAgICAgbGV0IHsgY29tcG9uZW50IH0gPSB0aGlzLmNyZWF0ZUNvbXBvbmVudDtcbiAgICAgICAgaWYgKCFjb21wb25lbnQpIHtcbiAgICAgICAgICAgIGNvbXBvbmVudCA9IG5ldyBjb21wb25lbnRGYWN0b3J5KGF0dHJpYnV0ZXMsIHR5cGUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5jcmVhdGVDb21wb25lbnQuY29tcG9uZW50ID0gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBpZiAoY2FsbGJhY2spIHtcbiAgICAgICAgICAgIGNhbGxiYWNrKGNvbXBvbmVudCwgJ1NVQ0NFU1MnLCBbJ1NVQ0NFU1MnXSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGNvbXBvbmVudDtcbiAgICB9XG4gICAgY3JlYXRlQ29tcG9uZW50cyhjb21wb25lbnREZWZzLCBjYWxsYmFjaykge1xuICAgICAgICBjb25zdCByZXN1bHQgPSBjb21wb25lbnREZWZzXG4gICAgICAgICAgICAubWFwKGRlZiA9PiB0aGlzLmNyZWF0ZUNvbXBvbmVudChkZWZbMF0sIGRlZlsxXSkpXG4gICAgICAgIGlmIChjYWxsYmFjaykge1xuICAgICAgICAgICAgY2FsbGJhY2socmVzdWx0LCAnU1VDQ0VTUycsIHJlc3VsdC5tYXAoICgpID0+ICdTVUNDRVNTJykpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuICAgIGdldENhbGxiYWNrKGNhbGxiYWNrKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiguLi5hcmdzKSB7XG4gICAgICAgICAgICBjYWxsYmFjayAmJiBjYWxsYmFjayguLi5hcmdzKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBnZXRDb21wb25lbnQoaWQpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucGFyYW1zW2lkXTtcbiAgICB9XG4gICAgZ2V0UmVmZXJlbmNlKCkge31cbiAgICBnZXRSb290KCkge31cbiAgICBnZXRUb2tlbihuYW1lKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnBhcmFtc1sndG9rZW4uJyArIG5hbWVdXG4gICAgfVxuICAgIGxvZyh2YWx1ZSwgZXJyKSB7XG4gICAgICAgIC8qZXNsaW50IG5vLWNvbnNvbGU6IDAqL1xuICAgICAgICBjb25zb2xlICYmIGNvbnNvbGUubG9nKHZhbHVlLCBlcnIpXG4gICAgfVxuICAgIHJlcG9ydEVycm9yKCkge31cbn0iLCJjb25zdCBzaW5vbiA9IHJlcXVpcmUoJ3Npbm9uJyk7XG5cbmV4cG9ydCBmdW5jdGlvbiBhcGV4Q2FsbEZhY3RvcnkocGFyYW1zID0ge30pIHtcbiAgICByZXR1cm4gbmV3IEFwZXhDYWxsKHBhcmFtcyk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBhcGV4U3VjY2Vzc1Jlc3VsdChyZXNwb25zZSA9IHt9KSB7XG4gICAgcmV0dXJuIG5ldyBBcGV4Q2FsbFJlc3VsdChyZXNwb25zZSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBhcGV4RXJyb3JSZXN1bHQobWVzc2FnZSkge1xuICAgIHJldHVybiBuZXcgQXBleENhbGxSZXN1bHQobnVsbCwgbWVzc2FnZSk7XG59XG5cbmNsYXNzIEFwZXhDYWxsIHtcbiAgICBjb25zdHJ1Y3RvcihyZXN1bHQsIGludm9rZUNhbGxiYWNrT25FbnF1ZXVlID0gdHJ1ZSkge1xuICAgICAgICB0aGlzLnBhcmFtcyA9IG51bGw7XG4gICAgICAgIHRoaXMucmVzdWx0ID0gcmVzdWx0O1xuICAgICAgICB0aGlzLmludm9rZUNhbGxiYWNrT25FbnF1ZXVlID0gaW52b2tlQ2FsbGJhY2tPbkVucXVldWU7XG4gICAgICAgIHRoaXMuaXNCYWNrZ3JvdW5kID0gZmFsc2U7XG4gICAgICAgIHRoaXMuc2V0QWJvcnRhYmxlID0gZmFsc2U7XG4gICAgICAgIHNpbm9uLnN0dWIodGhpcywgJ3NldFN0b3JhYmxlJyk7XG4gICAgICAgIHNpbm9uLnN0dWIodGhpcywgJ3NldEFib3J0YWJsZScpO1xuICAgIH1cbiAgICBzZXRQYXJhbXMocGFyYW1zKSB7XG4gICAgICAgIHRoaXMucGFyYW1zID0gcGFyYW1zO1xuICAgIH1cbiAgICBzZXRQYXJhbShrZXksIHZhbHVlKSB7XG4gICAgICAgIHRoaXMucGFyYW1zID0gT2JqZWN0LmFzc2lnbih0aGlzLnBhcmFtcywge1trZXldIDogdmFsdWV9KTtcbiAgICB9XG4gICAgZ2V0UGFyYW1zKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wYXJhbXM7XG4gICAgfVxuICAgIHNldENhbGxiYWNrKGN0eCwgY2FsbGJhY2spIHtcbiAgICAgICAgdGhpcy5jdHggPSBjdHg7XG4gICAgICAgIHRoaXMuY2FsbGJhY2sgPSBjYWxsYmFjaztcbiAgICB9XG4gICAgaW52b2tlQ2FsbGJhY2soZnJvbUVucXVldWUgPSBmYWxzZSkge1xuICAgICAgICBpZiAoZnJvbUVucXVldWUgJiYgIXRoaXMuaW52b2tlQ2FsbGJhY2tPbkVucXVldWUpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmNhbGxiYWNrICYmIHRoaXMuY2FsbGJhY2suYmluZCh0aGlzLmN0eCkodGhpcy5yZXN1bHQpO1xuICAgIH1cbiAgICBnZXRFcnJvcigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucmVzdWx0LmdldEVycm9yKCk7XG4gICAgfVxuICAgIGdldFBhcmFtKG5hbWUpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucGFyYW1zID8gdGhpcy5wYXJhbXNbbmFtZV0gOiBudWxsO1xuICAgIH1cbiAgICBnZXRSZXR1cm5WYWx1ZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucmVzdWx0O1xuICAgIH1cbiAgICBnZXRTdGF0ZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucmVzdWx0LmdldFN0YXRlKCk7XG4gICAgfVxuICAgIGlzQmFja2dyb3VuZCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaXNCYWNrZ3JvdW5kO1xuICAgIH1cbiAgICBzZXRBYm9ydGFibGUoKSB7XG4gICAgfVxuICAgIHNldEJhY2tncm91bmQoKSB7XG4gICAgICAgIHRoaXMuaXNCYWNrZ3JvdW5kID0gdHJ1ZTtcbiAgICB9XG4gICAgc2V0U3RvcmFibGUoKSB7XG4gICAgfVxufVxuXG5jbGFzcyBBcGV4Q2FsbFJlc3VsdCB7XG4gICAgY29uc3RydWN0b3IocmVzcG9uc2UsIGVycm9yTWVzc2FnZSA9IG51bGwpIHtcbiAgICAgICAgdGhpcy5yZXNwb25zZSA9IHJlc3BvbnNlO1xuICAgICAgICB0aGlzLmVycm9yTWVzc2FnZSA9IGVycm9yTWVzc2FnZTtcbiAgICB9XG4gICAgZ2V0U3RhdGUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmVycm9yTWVzc2FnZSA/ICdFUlJPUicgOiAnU1VDQ0VTUydcbiAgICB9XG4gICAgZ2V0RXJyb3IoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmVycm9yTWVzc2FnZSA/IFt7bWVzc2FnZTogdGhpcy5lcnJvck1lc3NhZ2V9XSA6IFtdXG4gICAgfVxuICAgIGdldFJldHVyblZhbHVlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5yZXNwb25zZTtcbiAgICB9XG59IiwiaW1wb3J0IHsgZXZlbnRGYWN0b3J5IH0gZnJvbSAnLi9ldmVudEZhY3RvcnknXG5pbXBvcnQgeyBjb21wb25lbnRGYWN0b3J5LCB1c2VDb21wb25lbnRBZGFwdGVycyB9IGZyb20gJy4vY29tcG9uZW50RmFjdG9yeSdcbmltcG9ydCB7IGF1cmFGYWN0b3J5IH0gZnJvbSAnLi9hdXJhRmFjdG9yeSdcbmltcG9ydCB7IEF1cmFVdGlsIH0gZnJvbSAnLi9hdXJhVXRpbCdcbmltcG9ydCB7IGFwZXhDYWxsRmFjdG9yeSwgYXBleFN1Y2Nlc3NSZXN1bHQsIGFwZXhFcnJvclJlc3VsdCB9IGZyb20gJy4vYXBleENhbGxGYWN0b3J5J1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBBdXJhVXRpbCxcbiAgICBldmVudEZhY3RvcnksXG4gICAgY29tcG9uZW50RmFjdG9yeSxcbiAgICB1c2VDb21wb25lbnRBZGFwdGVycyxcbiAgICBhdXJhRmFjdG9yeSxcbiAgICBhcGV4Q2FsbEZhY3RvcnksXG4gICAgYXBleFN1Y2Nlc3NSZXN1bHQsXG4gICAgYXBleEVycm9yUmVzdWx0XG59Il0sIm5hbWVzIjpbInNpbm9uIiwicmVxdWlyZSIsImV2ZW50RmFjdG9yeSIsInBhcmFtcyIsIkV2ZW50IiwiRkFLRV9FVkVOVF9OQU1FIiwiZmlyZSIsInNweSIsInBhdXNlIiwicHJldmVudERlZmF1bHQiLCJyZXN1bWUiLCJzdG9wUHJvcGFnYXRpb24iLCJrZXkiLCJ2YWx1ZSIsImV2ZW50TmFtZSIsIm5hbWUiLCJfIiwiRGVmYXVsdENvbXBvbmVudEFkYXB0ZXIiLCJXZWxsS25vd25Db21wb25lbnRzIiwiQ29tcG9uZW50QWRhcHRlcnMiLCJpbnN0YW5jZSIsImNvbXBvbmVudEZhY3RvcnlGb3JBcnJheSIsImFycmF5T2ZUeXBlcyIsIm1hcCIsInR5cGVPckNvbXBvbmVudCIsIkNvbXBvbmVudCIsImNvbXBvbmVudEZhY3RvcnkiLCJ0eXBlIiwiQXJyYXkiLCJpc0FycmF5IiwiRXJyb3IiLCJhZGFwdGVyTmFtZSIsInRvTG93ZXJDYXNlIiwicmVwbGFjZSIsImFkYXB0ZXIiLCJzb21lIiwic3RhcnRzV2l0aCIsIndhcm4iLCJ1c2VDb21wb25lbnRBZGFwdGVycyIsInJlZ2lzdHJhdG9yIiwicmVnaXN0ZXIiLCJjb21wb25lbnRUeXBlIiwiT2JqZWN0IiwiYXNzaWduIiwiZ2V0U3R1YiIsInN0dWIiLCJjYWxsc0Zha2UiLCJzdWJzdHJpbmciLCJnZXQiLCJzZXRTdHViIiwic2V0IiwiZmluZE1hcCIsImhhc093blByb3BlcnR5IiwiY29tcG9uZW50IiwiY2xhc3NOYW1lVG9Db21wb25lbnRWYXIiLCJjbGFzc05hbWUiLCJBdXJhVXRpbCIsImlzRW1wdHkiLCJvYmoiLCJ1bmRlZmluZWQiLCJsZW5ndGgiLCJwcm90b3R5cGUiLCJ0b1N0cmluZyIsImNhbGwiLCJrZXlzIiwiaXNVbmRlZmluZWRPck51bGwiLCJ2YWwiLCJhcnIiLCJhcmciLCJhdXJhRmFjdG9yeSIsIkF1cmEiLCJ1dGlsIiwiZW5xdWV1ZUFjdGlvblN0dWIiLCJhY3Rpb24iLCJpbnZva2VDYWxsYmFjayIsInJvb3RDb21wb25lbnQiLCJhdHRyaWJ1dGVzIiwiY2FsbGJhY2siLCJjcmVhdGVDb21wb25lbnQiLCJjb21wb25lbnREZWZzIiwicmVzdWx0IiwiZGVmIiwiaWQiLCJlcnIiLCJjb25zb2xlIiwibG9nIiwiYXBleENhbGxGYWN0b3J5IiwiQXBleENhbGwiLCJhcGV4U3VjY2Vzc1Jlc3VsdCIsInJlc3BvbnNlIiwiQXBleENhbGxSZXN1bHQiLCJhcGV4RXJyb3JSZXN1bHQiLCJtZXNzYWdlIiwiaW52b2tlQ2FsbGJhY2tPbkVucXVldWUiLCJpc0JhY2tncm91bmQiLCJzZXRBYm9ydGFibGUiLCJjdHgiLCJmcm9tRW5xdWV1ZSIsImJpbmQiLCJnZXRFcnJvciIsImdldFN0YXRlIiwiZXJyb3JNZXNzYWdlIiwibW9kdWxlIiwiZXhwb3J0cyJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxJQUFNQSxRQUFRQyxRQUFRLE9BQVIsQ0FBZDs7QUFF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
