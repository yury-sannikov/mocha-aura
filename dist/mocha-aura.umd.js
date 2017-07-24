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

function componentFactory() {
    var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : DefaultComponentAdapter;

    if (Array.isArray(type)) {
        return type.map(function (t) {
            return componentFactory(params, t);
        });
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
            if (typeOrComponent instanceof Component) {
                return typeOrComponent;
            }
            if (!typeOrComponent && this.params.findMap.hasOwnProperty(name)) {
                return typeOrComponent;
            }
            if (typeOrComponent === true) {
                typeOrComponent = DefaultComponentAdapter;
            }
            var component = this.params.findMap[name] = componentFactory(this.params, typeOrComponent);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9jaGEtYXVyYS51bWQuanMiLCJzb3VyY2VzIjpbIi4uL2xpYi9ldmVudEZhY3RvcnkuanMiLCIuLi9saWIvY29tcG9uZW50RmFjdG9yeS5qcyIsIi4uL2xpYi9hdXJhVXRpbC5qcyIsIi4uL2xpYi9hdXJhRmFjdG9yeS5qcyIsIi4uL2xpYi9hcGV4Q2FsbEZhY3RvcnkuanMiLCIuLi9saWIvYXVyYS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCBzaW5vbiA9IHJlcXVpcmUoJ3Npbm9uJyk7XG5cbmV4cG9ydCBmdW5jdGlvbiBldmVudEZhY3RvcnkocGFyYW1zID0ge30pIHtcbiAgICByZXR1cm4gbmV3IEV2ZW50KHBhcmFtcyk7XG59XG5jb25zdCBGQUtFX0VWRU5UX05BTUUgPSAnbW9jaGEtYXVyYS1mYWtlLWV2ZW50J1xuY2xhc3MgRXZlbnQge1xuICAgIGNvbnN0cnVjdG9yKHBhcmFtcykge1xuICAgICAgICB0aGlzLnBhcmFtcyA9IHBhcmFtcyB8fCB7fTtcbiAgICAgICAgdGhpcy5maXJlID0gc2lub24uc3B5KCk7XG4gICAgICAgIHRoaXMucGF1c2UgPSBzaW5vbi5zcHkoKTtcbiAgICAgICAgdGhpcy5wcmV2ZW50RGVmYXVsdCA9IHNpbm9uLnNweSgpO1xuICAgICAgICB0aGlzLnJlc3VtZSA9IHNpbm9uLnNweSgpO1xuICAgICAgICB0aGlzLnN0b3BQcm9wYWdhdGlvbiA9IHNpbm9uLnNweSgpO1xuICAgIH1cbiAgICBzZXRQYXJhbXMocGFyYW1zKSB7XG4gICAgICAgIHRoaXMucGFyYW1zID0gcGFyYW1zO1xuICAgIH1cbiAgICBzZXRQYXJhbShrZXksIHZhbHVlKSB7XG4gICAgICAgIHRoaXMucGFyYW1zW2tleV0gPSB2YWx1ZTtcbiAgICB9XG4gICAgZ2V0UGFyYW1zKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wYXJhbXM7XG4gICAgfVxuICAgIGdldEV2ZW50VHlwZSgpIHtcbiAgICAgICAgcmV0dXJuICdBUFBMSUNBVElPTidcbiAgICB9XG4gICAgZ2V0TmFtZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucGFyYW1zLmV2ZW50TmFtZSB8fCBGQUtFX0VWRU5UX05BTUVcbiAgICB9XG4gICAgZ2V0UGFyYW0obmFtZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5wYXJhbXNbbmFtZV1cbiAgICB9XG4gICAgZ2V0UGhhc2UoKSB7XG4gICAgICAgIHJldHVybiAnZGVmYXVsdCdcbiAgICB9XG4gICAgZ2V0U291cmNlKCkge1xuICAgICAgICByZXR1cm4gbnVsbFxuICAgIH1cbiAgICBnZXRUeXBlKCkge1xuICAgICAgICByZXR1cm4gYGM6JHtGQUtFX0VWRU5UX05BTUV9YFxuICAgIH1cblxufSIsImNvbnN0IHNpbm9uID0gcmVxdWlyZSgnc2lub24nKTtcbmNvbnN0IF8gPSByZXF1aXJlKCdsb2Rhc2gnKTtcbmltcG9ydCB7IGV2ZW50RmFjdG9yeSB9IGZyb20gJy4vZXZlbnRGYWN0b3J5J1xuXG5jb25zdCBEZWZhdWx0Q29tcG9uZW50QWRhcHRlciA9ICdkZWZhdWx0J1xuY29uc3QgV2VsbEtub3duQ29tcG9uZW50cyA9IFsnYXVyYTonLCAnZm9yY2U6JywgJ2ZvcmNlQ2hhdHRlcjonLCAnbGlnaHRuaW5nOicsICd1aTonLCAnYzonXVxuXG5sZXQgQ29tcG9uZW50QWRhcHRlcnMgPSB7XG4gICAgW0RlZmF1bHRDb21wb25lbnRBZGFwdGVyXTogaW5zdGFuY2UgPT4gaW5zdGFuY2Vcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNvbXBvbmVudEZhY3RvcnkocGFyYW1zID0ge30sIHR5cGUgPSBEZWZhdWx0Q29tcG9uZW50QWRhcHRlcikge1xuICAgIGlmIChBcnJheS5pc0FycmF5KHR5cGUpKSB7XG4gICAgICAgIHJldHVybiB0eXBlLm1hcCh0ID0+IGNvbXBvbmVudEZhY3RvcnkocGFyYW1zLCB0KSk7XG4gICAgfVxuICAgIGxldCBpbnN0YW5jZSA9IG5ldyBDb21wb25lbnQocGFyYW1zLCB0eXBlKTtcbiAgICBsZXQgYWRhcHRlck5hbWUgPSB0eXBlLnRvTG93ZXJDYXNlKCkucmVwbGFjZSgnbWFya3VwOi8vJywgJycpXG4gICAgbGV0IGFkYXB0ZXIgPSBDb21wb25lbnRBZGFwdGVyc1thZGFwdGVyTmFtZV07XG4gICAgaWYgKCFhZGFwdGVyKSB7XG4gICAgICAgIGlmICghXy5zb21lKFdlbGxLbm93bkNvbXBvbmVudHMsIG5hbWUgPT4gYWRhcHRlck5hbWUuc3RhcnRzV2l0aChuYW1lKSkpIHtcbiAgICAgICAgICAgIC8qZXNsaW50IG5vLWNvbnNvbGU6IDAqL1xuICAgICAgICAgICAgY29uc29sZS53YXJuKGBVbmFibGUgdG8gZmluZCBjb21wb25lbnQgYWRhcHRlciAke3R5cGV9YCk7XG4gICAgICAgIH1cbiAgICAgICAgYWRhcHRlciA9IENvbXBvbmVudEFkYXB0ZXJzW0RlZmF1bHRDb21wb25lbnRBZGFwdGVyXTtcbiAgICB9XG4gICAgcmV0dXJuIGFkYXB0ZXIoaW5zdGFuY2UsIHBhcmFtcyk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB1c2VDb21wb25lbnRBZGFwdGVycyhyZWdpc3RyYXRvcikge1xuICAgIGNvbnN0IHJlZ2lzdGVyID0gKGNvbXBvbmVudFR5cGUsIGFkYXB0ZXIpID0+IHtcbiAgICAgICAgY29uc3QgYWRhcHRlck5hbWUgPSBjb21wb25lbnRUeXBlLnRvTG93ZXJDYXNlKCk7XG4gICAgICAgIENvbXBvbmVudEFkYXB0ZXJzW2FkYXB0ZXJOYW1lXSA9IGFkYXB0ZXJcbiAgICB9XG4gICAgcmVnaXN0cmF0b3Ioe3JlZ2lzdGVyfSk7XG59XG5cbmNsYXNzIENvbXBvbmVudCB7XG4gICAgY29uc3RydWN0b3IocGFyYW1zLCB0eXBlKSB7XG4gICAgICAgIHRoaXMucGFyYW1zID0gT2JqZWN0LmFzc2lnbih7fSwge1xuICAgICAgICAgICAgZmluZE1hcDoge31cbiAgICAgICAgfSwgcGFyYW1zKTtcbiAgICAgICAgdGhpcy50eXBlID0gdHlwZSB8fCAnZGVmYXVsdCc7XG4gICAgICAgIHRoaXMuZ2V0U3R1YiA9IHNpbm9uLnN0dWIodGhpcywgJ2dldCcpLmNhbGxzRmFrZSgobmFtZSkgPT4ge1xuICAgICAgICAgICAgaWYgKG5hbWUuc3RhcnRzV2l0aCgndi4nKSB8fCBuYW1lLnN0YXJ0c1dpdGgoJ2MuJykgfHwgbmFtZS5zdGFydHNXaXRoKCdlLicpKSB7XG4gICAgICAgICAgICAgICAgbmFtZSA9IG5hbWUuc3Vic3RyaW5nKDIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIF8uZ2V0KHRoaXMucGFyYW1zLCBuYW1lKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy5zZXRTdHViID0gc2lub24uc3R1Yih0aGlzLCAnc2V0JykuY2FsbHNGYWtlKChuYW1lLCB2YWx1ZSkgPT4ge1xuICAgICAgICAgICAgaWYgKG5hbWUuc3RhcnRzV2l0aCgndi4nKSB8fCBuYW1lLnN0YXJ0c1dpdGgoJ2MuJykgfHwgbmFtZS5zdGFydHNXaXRoKCdlLicpKSB7XG4gICAgICAgICAgICAgICAgbmFtZSA9IG5hbWUuc3Vic3RyaW5nKDIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXy5zZXQodGhpcy5wYXJhbXMsIG5hbWUsIHZhbHVlKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHNpbm9uLnN0dWIodGhpcywgJ2FkZEV2ZW50SGFuZGxlcicpO1xuICAgICAgICBzaW5vbi5zdHViKHRoaXMsICdhZGRIYW5kbGVyJyk7XG4gICAgICAgIHNpbm9uLnN0dWIodGhpcywgJ2FkZFZhbHVlSGFuZGxlcicpO1xuICAgICAgICBzaW5vbi5zdHViKHRoaXMsICdhZGRWYWx1ZVByb3ZpZGVyJyk7XG4gICAgICAgIHNpbm9uLnN0dWIodGhpcywgJ2F1dG9EZXN0cm95Jyk7XG4gICAgICAgIHNpbm9uLnN0dWIodGhpcywgJ2Rlc3Ryb3knKTtcbiAgICAgICAgc2lub24uc3R1Yih0aGlzLCAncmVtb3ZlRXZlbnRIYW5kbGVyJyk7XG4gICAgfVxuXG4gICAgZ2V0KCkge1xuICAgIH1cbiAgICBzZXQoKSB7XG4gICAgfVxuXG4gICAgZmluZChuYW1lKSB7XG4gICAgICAgIGxldCB0eXBlT3JDb21wb25lbnQgPSB0aGlzLnBhcmFtcy5maW5kTWFwW25hbWVdO1xuICAgICAgICBpZiAodHlwZU9yQ29tcG9uZW50IGluc3RhbmNlb2YgQ29tcG9uZW50KSB7XG4gICAgICAgICAgICByZXR1cm4gdHlwZU9yQ29tcG9uZW50O1xuICAgICAgICB9XG4gICAgICAgIGlmICghdHlwZU9yQ29tcG9uZW50ICYmIHRoaXMucGFyYW1zLmZpbmRNYXAuaGFzT3duUHJvcGVydHkobmFtZSkpIHtcbiAgICAgICAgICAgIHJldHVybiB0eXBlT3JDb21wb25lbnQ7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHR5cGVPckNvbXBvbmVudCA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgdHlwZU9yQ29tcG9uZW50ID0gRGVmYXVsdENvbXBvbmVudEFkYXB0ZXJcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBjb21wb25lbnQgPSB0aGlzLnBhcmFtcy5maW5kTWFwW25hbWVdID0gY29tcG9uZW50RmFjdG9yeSh0aGlzLnBhcmFtcywgdHlwZU9yQ29tcG9uZW50KTtcbiAgICAgICAgcmV0dXJuIGNvbXBvbmVudDtcbiAgICB9XG4gICAgZ2V0TG9jYWxJZCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucGFyYW1zWydhdXJhOmlkJ107XG4gICAgfVxuICAgIGNsZWFyUmVmZXJlbmNlKGtleSkge1xuICAgICAgICBkZWxldGUgdGhpcy5wYXJhbXNba2V5XTtcbiAgICB9XG4gICAgZ2V0Q29uY3JldGVDb21wb25lbnQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICBnZXRFbGVtZW50KCkge1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgZ2V0RWxlbWVudHMoKSB7XG4gICAgICAgIHJldHVybiBbdGhpc107XG4gICAgfVxuICAgIGdldEV2ZW50KG5hbWUpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucGFyYW1zW25hbWVdIHx8IGV2ZW50RmFjdG9yeSgpO1xuICAgIH1cbiAgICBnZXRHbG9iYWxJZCgpIHtcbiAgICAgICAgcmV0dXJuIGBnbG9iYWwtJHt0aGlzLnBhcmFtc1snYXVyYTppZCddfWA7XG4gICAgfVxuICAgIGdldE5hbWUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnR5cGU7XG4gICAgfVxuICAgIGdldFR5cGUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnR5cGU7XG4gICAgfVxuICAgIGdldFJlZmVyZW5jZShrZXkpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucGFyYW1zW2tleV07XG4gICAgfVxuICAgIGdldFN1cGVyKCkge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgZ2V0VmVyc2lvbigpIHtcbiAgICAgICAgcmV0dXJuICcxLjAnO1xuICAgIH1cbiAgICBpc0NvbmNyZXRlKCkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgaXNJbnN0YW5jZU9mKG5hbWUpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudHlwZSA9PT0gbmFtZTtcbiAgICB9XG4gICAgaXNWYWxpZCgpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG59IiwiY29uc3Qgc2lub24gPSByZXF1aXJlKCdzaW5vbicpO1xuXG5jb25zdCBjbGFzc05hbWVUb0NvbXBvbmVudFZhciA9IGNsYXNzTmFtZSA9PiBgdi5fX2Nsc18ke2NsYXNzTmFtZX1gXG5leHBvcnQgY2xhc3MgQXVyYVV0aWwge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBzaW5vbi5zdHViKHRoaXMsICdhZGRDbGFzcycpLmNhbGxzRmFrZSgoY29tcG9uZW50LCBjbGFzc05hbWUpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBjb21wb25lbnQuc2V0KGNsYXNzTmFtZVRvQ29tcG9uZW50VmFyKGNsYXNzTmFtZSksIHRydWUpO1xuICAgICAgICB9KVxuICAgICAgICBzaW5vbi5zdHViKHRoaXMsICdyZW1vdmVDbGFzcycpLmNhbGxzRmFrZSgoY29tcG9uZW50LCBjbGFzc05hbWUpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBjb21wb25lbnQuc2V0KGNsYXNzTmFtZVRvQ29tcG9uZW50VmFyKGNsYXNzTmFtZSksIGZhbHNlKTtcbiAgICAgICAgfSlcbiAgICAgICAgc2lub24uc3R1Yih0aGlzLCAnaGFzQ2xhc3MnKS5jYWxsc0Zha2UoKGNvbXBvbmVudCwgY2xhc3NOYW1lKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gY29tcG9uZW50LmdldChjbGFzc05hbWVUb0NvbXBvbmVudFZhcihjbGFzc05hbWUpKTtcbiAgICAgICAgfSlcbiAgICAgICAgc2lub24uc3R1Yih0aGlzLCAndG9nZ2xlQ2xhc3MnKS5jYWxsc0Zha2UoKGNvbXBvbmVudCwgY2xhc3NOYW1lKSA9PiB7XG4gICAgICAgICAgICBjb21wb25lbnQuc2V0KGNsYXNzTmFtZVRvQ29tcG9uZW50VmFyKGNsYXNzTmFtZSksICFjb21wb25lbnQuZ2V0KGNsYXNzTmFtZVRvQ29tcG9uZW50VmFyKGNsYXNzTmFtZSkpKTtcbiAgICAgICAgfSlcbiAgICAgICAgdGhpcy5pc0VtcHR5ID0gb2JqID0+IHtcbiAgICAgICAgICAgIGlmIChvYmogPT09IHVuZGVmaW5lZCB8fCBvYmogPT09IG51bGwgfHwgb2JqID09PSAnJykge1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkob2JqKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBvYmoubGVuZ3RoID09PSAwO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh0eXBlb2Ygb2JqID09PSAnb2JqZWN0JyAmJiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwob2JqKSA9PT0gJ1tvYmplY3QgT2JqZWN0XScpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gT2JqZWN0LmtleXMob2JqKS5sZW5ndGggPT09IDA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH07XG4gICAgICAgIHRoaXMuaXNVbmRlZmluZWRPck51bGwgPSBvYmogPT4ge1xuICAgICAgICAgICAgcmV0dXJuIG9iaiA9PT0gdW5kZWZpbmVkIHx8IG9iaiA9PT0gbnVsbDtcbiAgICAgICAgfTtcbiAgICB9XG4gICAgYWRkQ2xhc3MoKSB7fVxuICAgIHJlbW92ZUNsYXNzKCkge31cbiAgICBoYXNDbGFzcygpIHt9XG4gICAgdG9nZ2xlQ2xhc3MoKSB7fVxuICAgIGdldEJvb2xlYW5WYWx1ZSh2YWwpIHtcbiAgICAgICAgLy8gUG9ydGVkOiBodHRwczovL2dpdGh1Yi5jb20vZm9yY2Vkb3Rjb20vYXVyYS9ibG9iL21hc3Rlci9hdXJhLWltcGwvc3JjL21haW4vcmVzb3VyY2VzL2F1cmEvdXRpbC9VdGlsLmpzI0wzNjZcbiAgICAgICAgcmV0dXJuIHZhbCAhPT0gdW5kZWZpbmVkICYmIHZhbCAhPT0gbnVsbCAmJiB2YWwgIT09IGZhbHNlICYmIHZhbCAhPT0gMCAmJiB2YWwgIT09ICdmYWxzZScgJiYgdmFsICE9PSAnJyAmJiB2YWwgIT09ICdmJztcbiAgICB9XG4gICAgaXNBcnJheShhcnIpIHtcbiAgICAgICAgLy8gUG9ydGVkOiBodHRwczovL2dpdGh1Yi5jb20vZm9yY2Vkb3Rjb20vYXVyYS9ibG9iL21hc3Rlci9hdXJhLWltcGwvc3JjL21haW4vcmVzb3VyY2VzL2F1cmEvdXRpbC9VdGlsLmpzI0wxODlcbiAgICAgICAgcmV0dXJuICh0eXBlb2YgQXJyYXkuaXNBcnJheSA9PT0gXCJmdW5jdGlvblwiID8gQXJyYXkuaXNBcnJheSA6IGZ1bmN0aW9uKGFyZykge1xuICAgICAgICAgICAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChhcmcpID09PSAnW29iamVjdCBBcnJheV0nO1xuICAgICAgICB9KShhcnIpO1xuICAgIH1cbiAgICBpc09iamVjdChvYmopIHtcbiAgICAgICAgLy9Qb3J0ZWQ6IGh0dHBzOi8vZ2l0aHViLmNvbS9mb3JjZWRvdGNvbS9hdXJhL2Jsb2IvbWFzdGVyL2F1cmEtaW1wbC9zcmMvbWFpbi9yZXNvdXJjZXMvYXVyYS91dGlsL1V0aWwuanMjTDIwNFxuICAgICAgICByZXR1cm4gdHlwZW9mIG9iaiA9PT0gXCJvYmplY3RcIiAmJiBvYmogIT09IG51bGwgJiYgIUFycmF5LmlzQXJyYXkob2JqKTtcbiAgICB9XG4gICAgaXNVbmRlZmluZWQob2JqKXtcbiAgICAgICAgLy9Qb3J0ZWQ6IGh0dHBzOi8vZ2l0aHViLmNvbS9mb3JjZWRvdGNvbS9hdXJhL2Jsb2IvbWFzdGVyL2F1cmEtaW1wbC9zcmMvbWFpbi9yZXNvdXJjZXMvYXVyYS91dGlsL1V0aWwuanMjTDMxOVxuICAgICAgICByZXR1cm4gb2JqID09PSB1bmRlZmluZWQ7XG4gICAgfVxufVxuXG4iLCJjb25zdCBzaW5vbiA9IHJlcXVpcmUoJ3Npbm9uJyk7XG5cbmltcG9ydCB7IEF1cmFVdGlsIH0gZnJvbSAnLi9hdXJhVXRpbCdcblxuZXhwb3J0IGZ1bmN0aW9uIGF1cmFGYWN0b3J5KHBhcmFtcyA9IHt9KSB7XG4gICAgcmV0dXJuIG5ldyBBdXJhKHBhcmFtcyk7XG59XG5cbmltcG9ydCB7IGNvbXBvbmVudEZhY3RvcnkgfSBmcm9tICcuL2NvbXBvbmVudEZhY3RvcnknXG5cbmNsYXNzIEF1cmEge1xuICAgIGNvbnN0cnVjdG9yKHBhcmFtcykge1xuICAgICAgICB0aGlzLnBhcmFtcyA9IHBhcmFtcztcbiAgICAgICAgdGhpcy51dGlsID0gbmV3IEF1cmFVdGlsKCk7XG4gICAgICAgIHRoaXMuZ2V0U3R1YiA9IHNpbm9uLnN0dWIodGhpcywgJ2dldCcpLmNhbGxzRmFrZSgobmFtZSkgPT4gcGFyYW1zW25hbWVdKTtcbiAgICAgICAgdGhpcy5zZXRTdHViID0gc2lub24uc3R1Yih0aGlzLCAnc2V0JykuY2FsbHNGYWtlKChuYW1lLCB2YWx1ZSkgPT4gcGFyYW1zW25hbWVdID0gdmFsdWUpO1xuICAgICAgICB0aGlzLmVucXVldWVBY3Rpb25TdHViID0gc2lub24uc3R1Yih0aGlzLCAnZW5xdWV1ZUFjdGlvbicpLmNhbGxzRmFrZSgoYWN0aW9uKSA9PiBhY3Rpb24gJiYgYWN0aW9uLmludm9rZUNhbGxiYWNrICYmIGFjdGlvbi5pbnZva2VDYWxsYmFjayh0cnVlKSk7XG4gICAgICAgIHNpbm9uLnN0dWIodGhpcywgJ2dldFJlZmVyZW5jZScpO1xuICAgICAgICBzaW5vbi5zdHViKHRoaXMsICdnZXRSb290JykuY2FsbHNGYWtlKCgpID0+IHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnJvb3RDb21wb25lbnQgfHwgKHRoaXMucm9vdENvbXBvbmVudCA9IG5ldyBjb21wb25lbnRGYWN0b3J5KCkpO1xuICAgICAgICB9KVxuICAgICAgICBzaW5vbi5zdHViKHRoaXMsICdyZXBvcnRFcnJvcicpO1xuICAgIH1cbiAgICBcbiAgICBzZXRQYXJhbXMocGFyYW1zKSB7XG4gICAgICAgIE9iamVjdC5hc3NpZ24odGhpcy5wYXJhbXMsIHBhcmFtcyk7XG4gICAgfVxuXG4gICAgZ2V0KCkge1xuICAgIH1cbiAgICBcbiAgICBlbnF1ZXVlQWN0aW9uKCkge1xuICAgIH1cblxuICAgIGNyZWF0ZUNvbXBvbmVudCh0eXBlLCBhdHRyaWJ1dGVzLCBjYWxsYmFjaykge1xuICAgICAgICB0aGlzLmNyZWF0ZUNvbXBvbmVudC50eXBlID0gdHlwZTtcbiAgICAgICAgdGhpcy5jcmVhdGVDb21wb25lbnQuYXR0cmlidXRlcyA9IGF0dHJpYnV0ZXM7XG4gICAgICAgIC8vIEdldCBjb21wb25lbnQgaW5zdGFuY2UuXG4gICAgICAgIC8vIFVzZSBleGlzdGluZyBjb21wb25lbnQgaW5zdGFuY2UgaWYgc2V0XG4gICAgICAgIC8vIENyZWF0ZSBuZXcgZGVmYXVsdCBjb21wb25lbnQgaWYgY29tcG9uZW50IG5vdCBzZXRcbiAgICAgICAgbGV0IHsgY29tcG9uZW50IH0gPSB0aGlzLmNyZWF0ZUNvbXBvbmVudDtcbiAgICAgICAgaWYgKCFjb21wb25lbnQpIHtcbiAgICAgICAgICAgIGNvbXBvbmVudCA9IG5ldyBjb21wb25lbnRGYWN0b3J5KGF0dHJpYnV0ZXMsIHR5cGUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5jcmVhdGVDb21wb25lbnQuY29tcG9uZW50ID0gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBpZiAoY2FsbGJhY2spIHtcbiAgICAgICAgICAgIGNhbGxiYWNrKGNvbXBvbmVudCwgJ1NVQ0NFU1MnLCBbJ1NVQ0NFU1MnXSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGNvbXBvbmVudDtcbiAgICB9XG4gICAgY3JlYXRlQ29tcG9uZW50cyhjb21wb25lbnREZWZzLCBjYWxsYmFjaykge1xuICAgICAgICBjb25zdCByZXN1bHQgPSBjb21wb25lbnREZWZzXG4gICAgICAgICAgICAubWFwKGRlZiA9PiB0aGlzLmNyZWF0ZUNvbXBvbmVudChkZWZbMF0sIGRlZlsxXSkpXG4gICAgICAgIGlmIChjYWxsYmFjaykge1xuICAgICAgICAgICAgY2FsbGJhY2socmVzdWx0LCAnU1VDQ0VTUycsIHJlc3VsdC5tYXAoICgpID0+ICdTVUNDRVNTJykpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuICAgIGdldENhbGxiYWNrKGNhbGxiYWNrKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiguLi5hcmdzKSB7XG4gICAgICAgICAgICBjYWxsYmFjayAmJiBjYWxsYmFjayguLi5hcmdzKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBnZXRDb21wb25lbnQoaWQpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucGFyYW1zW2lkXTtcbiAgICB9XG4gICAgZ2V0UmVmZXJlbmNlKCkge31cbiAgICBnZXRSb290KCkge31cbiAgICBnZXRUb2tlbihuYW1lKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnBhcmFtc1sndG9rZW4uJyArIG5hbWVdXG4gICAgfVxuICAgIGxvZyh2YWx1ZSwgZXJyKSB7XG4gICAgICAgIC8qZXNsaW50IG5vLWNvbnNvbGU6IDAqL1xuICAgICAgICBjb25zb2xlICYmIGNvbnNvbGUubG9nKHZhbHVlLCBlcnIpXG4gICAgfVxuICAgIHJlcG9ydEVycm9yKCkge31cbn0iLCJjb25zdCBzaW5vbiA9IHJlcXVpcmUoJ3Npbm9uJyk7XG5cbmV4cG9ydCBmdW5jdGlvbiBhcGV4Q2FsbEZhY3RvcnkocGFyYW1zID0ge30pIHtcbiAgICByZXR1cm4gbmV3IEFwZXhDYWxsKHBhcmFtcyk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBhcGV4U3VjY2Vzc1Jlc3VsdChyZXNwb25zZSA9IHt9KSB7XG4gICAgcmV0dXJuIG5ldyBBcGV4Q2FsbFJlc3VsdChyZXNwb25zZSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBhcGV4RXJyb3JSZXN1bHQobWVzc2FnZSkge1xuICAgIHJldHVybiBuZXcgQXBleENhbGxSZXN1bHQobnVsbCwgbWVzc2FnZSk7XG59XG5cbmNsYXNzIEFwZXhDYWxsIHtcbiAgICBjb25zdHJ1Y3RvcihyZXN1bHQsIGludm9rZUNhbGxiYWNrT25FbnF1ZXVlID0gdHJ1ZSkge1xuICAgICAgICB0aGlzLnBhcmFtcyA9IG51bGw7XG4gICAgICAgIHRoaXMucmVzdWx0ID0gcmVzdWx0O1xuICAgICAgICB0aGlzLmludm9rZUNhbGxiYWNrT25FbnF1ZXVlID0gaW52b2tlQ2FsbGJhY2tPbkVucXVldWU7XG4gICAgICAgIHRoaXMuaXNCYWNrZ3JvdW5kID0gZmFsc2U7XG4gICAgICAgIHRoaXMuc2V0QWJvcnRhYmxlID0gZmFsc2U7XG4gICAgICAgIHNpbm9uLnN0dWIodGhpcywgJ3NldFN0b3JhYmxlJyk7XG4gICAgICAgIHNpbm9uLnN0dWIodGhpcywgJ3NldEFib3J0YWJsZScpO1xuICAgIH1cbiAgICBzZXRQYXJhbXMocGFyYW1zKSB7XG4gICAgICAgIHRoaXMucGFyYW1zID0gcGFyYW1zO1xuICAgIH1cbiAgICBzZXRQYXJhbShrZXksIHZhbHVlKSB7XG4gICAgICAgIHRoaXMucGFyYW1zID0gT2JqZWN0LmFzc2lnbih0aGlzLnBhcmFtcywge1trZXldIDogdmFsdWV9KTtcbiAgICB9XG4gICAgZ2V0UGFyYW1zKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wYXJhbXM7XG4gICAgfVxuICAgIHNldENhbGxiYWNrKGN0eCwgY2FsbGJhY2spIHtcbiAgICAgICAgdGhpcy5jdHggPSBjdHg7XG4gICAgICAgIHRoaXMuY2FsbGJhY2sgPSBjYWxsYmFjaztcbiAgICB9XG4gICAgaW52b2tlQ2FsbGJhY2soZnJvbUVucXVldWUgPSBmYWxzZSkge1xuICAgICAgICBpZiAoZnJvbUVucXVldWUgJiYgIXRoaXMuaW52b2tlQ2FsbGJhY2tPbkVucXVldWUpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmNhbGxiYWNrICYmIHRoaXMuY2FsbGJhY2suYmluZCh0aGlzLmN0eCkodGhpcy5yZXN1bHQpO1xuICAgIH1cbiAgICBnZXRFcnJvcigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucmVzdWx0LmdldEVycm9yKCk7XG4gICAgfVxuICAgIGdldFBhcmFtKG5hbWUpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucGFyYW1zID8gdGhpcy5wYXJhbXNbbmFtZV0gOiBudWxsO1xuICAgIH1cbiAgICBnZXRSZXR1cm5WYWx1ZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucmVzdWx0O1xuICAgIH1cbiAgICBnZXRTdGF0ZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucmVzdWx0LmdldFN0YXRlKCk7XG4gICAgfVxuICAgIGlzQmFja2dyb3VuZCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaXNCYWNrZ3JvdW5kO1xuICAgIH1cbiAgICBzZXRBYm9ydGFibGUoKSB7XG4gICAgfVxuICAgIHNldEJhY2tncm91bmQoKSB7XG4gICAgICAgIHRoaXMuaXNCYWNrZ3JvdW5kID0gdHJ1ZTtcbiAgICB9XG4gICAgc2V0U3RvcmFibGUoKSB7XG4gICAgfVxufVxuXG5jbGFzcyBBcGV4Q2FsbFJlc3VsdCB7XG4gICAgY29uc3RydWN0b3IocmVzcG9uc2UsIGVycm9yTWVzc2FnZSA9IG51bGwpIHtcbiAgICAgICAgdGhpcy5yZXNwb25zZSA9IHJlc3BvbnNlO1xuICAgICAgICB0aGlzLmVycm9yTWVzc2FnZSA9IGVycm9yTWVzc2FnZTtcbiAgICB9XG4gICAgZ2V0U3RhdGUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmVycm9yTWVzc2FnZSA/ICdFUlJPUicgOiAnU1VDQ0VTUydcbiAgICB9XG4gICAgZ2V0RXJyb3IoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmVycm9yTWVzc2FnZSA/IFt7bWVzc2FnZTogdGhpcy5lcnJvck1lc3NhZ2V9XSA6IFtdXG4gICAgfVxuICAgIGdldFJldHVyblZhbHVlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5yZXNwb25zZTtcbiAgICB9XG59IiwiaW1wb3J0IHsgZXZlbnRGYWN0b3J5IH0gZnJvbSAnLi9ldmVudEZhY3RvcnknXG5pbXBvcnQgeyBjb21wb25lbnRGYWN0b3J5LCB1c2VDb21wb25lbnRBZGFwdGVycyB9IGZyb20gJy4vY29tcG9uZW50RmFjdG9yeSdcbmltcG9ydCB7IGF1cmFGYWN0b3J5IH0gZnJvbSAnLi9hdXJhRmFjdG9yeSdcbmltcG9ydCB7IEF1cmFVdGlsIH0gZnJvbSAnLi9hdXJhVXRpbCdcbmltcG9ydCB7IGFwZXhDYWxsRmFjdG9yeSwgYXBleFN1Y2Nlc3NSZXN1bHQsIGFwZXhFcnJvclJlc3VsdCB9IGZyb20gJy4vYXBleENhbGxGYWN0b3J5J1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBBdXJhVXRpbCxcbiAgICBldmVudEZhY3RvcnksXG4gICAgY29tcG9uZW50RmFjdG9yeSxcbiAgICB1c2VDb21wb25lbnRBZGFwdGVycyxcbiAgICBhdXJhRmFjdG9yeSxcbiAgICBhcGV4Q2FsbEZhY3RvcnksXG4gICAgYXBleFN1Y2Nlc3NSZXN1bHQsXG4gICAgYXBleEVycm9yUmVzdWx0XG59Il0sIm5hbWVzIjpbInNpbm9uIiwicmVxdWlyZSIsImV2ZW50RmFjdG9yeSIsInBhcmFtcyIsIkV2ZW50IiwiRkFLRV9FVkVOVF9OQU1FIiwiZmlyZSIsInNweSIsInBhdXNlIiwicHJldmVudERlZmF1bHQiLCJyZXN1bWUiLCJzdG9wUHJvcGFnYXRpb24iLCJrZXkiLCJ2YWx1ZSIsImV2ZW50TmFtZSIsIm5hbWUiLCJfIiwiRGVmYXVsdENvbXBvbmVudEFkYXB0ZXIiLCJXZWxsS25vd25Db21wb25lbnRzIiwiQ29tcG9uZW50QWRhcHRlcnMiLCJpbnN0YW5jZSIsImNvbXBvbmVudEZhY3RvcnkiLCJ0eXBlIiwiQXJyYXkiLCJpc0FycmF5IiwibWFwIiwidCIsIkNvbXBvbmVudCIsImFkYXB0ZXJOYW1lIiwidG9Mb3dlckNhc2UiLCJyZXBsYWNlIiwiYWRhcHRlciIsInNvbWUiLCJzdGFydHNXaXRoIiwid2FybiIsInVzZUNvbXBvbmVudEFkYXB0ZXJzIiwicmVnaXN0cmF0b3IiLCJyZWdpc3RlciIsImNvbXBvbmVudFR5cGUiLCJPYmplY3QiLCJhc3NpZ24iLCJnZXRTdHViIiwic3R1YiIsImNhbGxzRmFrZSIsInN1YnN0cmluZyIsImdldCIsInNldFN0dWIiLCJzZXQiLCJ0eXBlT3JDb21wb25lbnQiLCJmaW5kTWFwIiwiaGFzT3duUHJvcGVydHkiLCJjb21wb25lbnQiLCJjbGFzc05hbWVUb0NvbXBvbmVudFZhciIsImNsYXNzTmFtZSIsIkF1cmFVdGlsIiwiaXNFbXB0eSIsIm9iaiIsInVuZGVmaW5lZCIsImxlbmd0aCIsInByb3RvdHlwZSIsInRvU3RyaW5nIiwiY2FsbCIsImtleXMiLCJpc1VuZGVmaW5lZE9yTnVsbCIsInZhbCIsImFyciIsImFyZyIsImF1cmFGYWN0b3J5IiwiQXVyYSIsInV0aWwiLCJlbnF1ZXVlQWN0aW9uU3R1YiIsImFjdGlvbiIsImludm9rZUNhbGxiYWNrIiwicm9vdENvbXBvbmVudCIsImF0dHJpYnV0ZXMiLCJjYWxsYmFjayIsImNyZWF0ZUNvbXBvbmVudCIsImNvbXBvbmVudERlZnMiLCJyZXN1bHQiLCJkZWYiLCJpZCIsImVyciIsImNvbnNvbGUiLCJsb2ciLCJhcGV4Q2FsbEZhY3RvcnkiLCJBcGV4Q2FsbCIsImFwZXhTdWNjZXNzUmVzdWx0IiwicmVzcG9uc2UiLCJBcGV4Q2FsbFJlc3VsdCIsImFwZXhFcnJvclJlc3VsdCIsIm1lc3NhZ2UiLCJpbnZva2VDYWxsYmFja09uRW5xdWV1ZSIsImlzQmFja2dyb3VuZCIsInNldEFib3J0YWJsZSIsImN0eCIsImZyb21FbnF1ZXVlIiwiYmluZCIsImdldEVycm9yIiwiZ2V0U3RhdGUiLCJlcnJvck1lc3NhZ2UiLCJtb2R1bGUiLCJleHBvcnRzIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLElBQU1BLFFBQVFDLFFBQVEsT0FBUixDQUFkOztBQUVBLEFBQU8sU0FBU0MsWUFBVCxHQUFtQztRQUFiQyxNQUFhLHVFQUFKLEVBQUk7O1dBQy9CLElBQUlDLEtBQUosQ0FBVUQsTUFBVixDQUFQOztBQUVKLElBQU1FLGtCQUFrQix1QkFBeEI7O0lBQ01EO21CQUNVRCxNQUFaLEVBQW9COzs7YUFDWEEsTUFBTCxHQUFjQSxVQUFVLEVBQXhCO2FBQ0tHLElBQUwsR0FBWU4sTUFBTU8sR0FBTixFQUFaO2FBQ0tDLEtBQUwsR0FBYVIsTUFBTU8sR0FBTixFQUFiO2FBQ0tFLGNBQUwsR0FBc0JULE1BQU1PLEdBQU4sRUFBdEI7YUFDS0csTUFBTCxHQUFjVixNQUFNTyxHQUFOLEVBQWQ7YUFDS0ksZUFBTCxHQUF1QlgsTUFBTU8sR0FBTixFQUF2Qjs7Ozs7a0NBRU1KLFFBQVE7aUJBQ1RBLE1BQUwsR0FBY0EsTUFBZDs7OztpQ0FFS1MsS0FBS0MsT0FBTztpQkFDWlYsTUFBTCxDQUFZUyxHQUFaLElBQW1CQyxLQUFuQjs7OztvQ0FFUTttQkFDRCxLQUFLVixNQUFaOzs7O3VDQUVXO21CQUNKLGFBQVA7Ozs7a0NBRU07bUJBQ0MsS0FBS0EsTUFBTCxDQUFZVyxTQUFaLElBQXlC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
