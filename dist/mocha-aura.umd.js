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
var ComponentAdapters = {
    'default': function _default(instance) {
        return instance;
    }
};

function componentFactory() {
    var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'default';

    var instance = new Component(params, type);
    var adapter = ComponentAdapters[type.toLowerCase()];
    return adapter ? adapter(instance, params) : instance;
}

function useComponentAdapters(registrator) {
    var register = function register(componentType, adapter) {
        ComponentAdapters[componentType.toLowerCase()] = adapter;
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
            if (name.startsWith('v.')) {
                name = name.substring(2);
            }
            _this.params[name] = value;
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
            return componentFactory(this.params, typeOrComponent);
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
                callback && callback();
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9jaGEtYXVyYS51bWQuanMiLCJzb3VyY2VzIjpbIi4uL2xpYi9ldmVudEZhY3RvcnkuanMiLCIuLi9saWIvY29tcG9uZW50RmFjdG9yeS5qcyIsIi4uL2xpYi9hdXJhVXRpbC5qcyIsIi4uL2xpYi9hdXJhRmFjdG9yeS5qcyIsIi4uL2xpYi9hcGV4Q2FsbEZhY3RvcnkuanMiLCIuLi9saWIvYXVyYS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCBzaW5vbiA9IHJlcXVpcmUoJ3Npbm9uJyk7XG5cbmV4cG9ydCBmdW5jdGlvbiBldmVudEZhY3RvcnkocGFyYW1zID0ge30pIHtcbiAgICByZXR1cm4gbmV3IEV2ZW50KHBhcmFtcyk7XG59XG5jb25zdCBGQUtFX0VWRU5UX05BTUUgPSAnbW9jaGEtYXVyYS1mYWtlLWV2ZW50J1xuY2xhc3MgRXZlbnQge1xuICAgIGNvbnN0cnVjdG9yKHBhcmFtcykge1xuICAgICAgICB0aGlzLnBhcmFtcyA9IHBhcmFtcyB8fCB7fTtcbiAgICAgICAgdGhpcy5maXJlID0gc2lub24uc3B5KCk7XG4gICAgICAgIHRoaXMucGF1c2UgPSBzaW5vbi5zcHkoKTtcbiAgICAgICAgdGhpcy5wcmV2ZW50RGVmYXVsdCA9IHNpbm9uLnNweSgpO1xuICAgICAgICB0aGlzLnJlc3VtZSA9IHNpbm9uLnNweSgpO1xuICAgICAgICB0aGlzLnN0b3BQcm9wYWdhdGlvbiA9IHNpbm9uLnNweSgpO1xuICAgIH1cbiAgICBzZXRQYXJhbXMocGFyYW1zKSB7XG4gICAgICAgIHRoaXMucGFyYW1zID0gcGFyYW1zO1xuICAgIH1cbiAgICBzZXRQYXJhbShrZXksIHZhbHVlKSB7XG4gICAgICAgIHRoaXMucGFyYW1zW2tleV0gPSB2YWx1ZTtcbiAgICB9XG4gICAgZ2V0UGFyYW1zKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wYXJhbXM7XG4gICAgfVxuICAgIGdldEV2ZW50VHlwZSgpIHtcbiAgICAgICAgcmV0dXJuICdBUFBMSUNBVElPTidcbiAgICB9XG4gICAgZ2V0TmFtZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucGFyYW1zLmV2ZW50TmFtZSB8fCBGQUtFX0VWRU5UX05BTUVcbiAgICB9XG4gICAgZ2V0UGFyYW0obmFtZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5wYXJhbXNbbmFtZV1cbiAgICB9XG4gICAgZ2V0UGhhc2UoKSB7XG4gICAgICAgIHJldHVybiAnZGVmYXVsdCdcbiAgICB9XG4gICAgZ2V0U291cmNlKCkge1xuICAgICAgICByZXR1cm4gbnVsbFxuICAgIH1cbiAgICBnZXRUeXBlKCkge1xuICAgICAgICByZXR1cm4gYGM6JHtGQUtFX0VWRU5UX05BTUV9YFxuICAgIH1cblxufSIsImNvbnN0IHNpbm9uID0gcmVxdWlyZSgnc2lub24nKTtcbmNvbnN0IF8gPSByZXF1aXJlKCdsb2Rhc2gnKTtcbmltcG9ydCB7IGV2ZW50RmFjdG9yeSB9IGZyb20gJy4vZXZlbnRGYWN0b3J5J1xuXG5sZXQgQ29tcG9uZW50QWRhcHRlcnMgPSB7XG4gICAgJ2RlZmF1bHQnOiBpbnN0YW5jZSA9PiBpbnN0YW5jZVxufVxuXG5leHBvcnQgZnVuY3Rpb24gY29tcG9uZW50RmFjdG9yeShwYXJhbXMgPSB7fSwgdHlwZSA9ICdkZWZhdWx0Jykge1xuICAgIGxldCBpbnN0YW5jZSA9IG5ldyBDb21wb25lbnQocGFyYW1zLCB0eXBlKTtcbiAgICBjb25zdCBhZGFwdGVyID0gQ29tcG9uZW50QWRhcHRlcnNbdHlwZS50b0xvd2VyQ2FzZSgpXTtcbiAgICByZXR1cm4gYWRhcHRlciA/IGFkYXB0ZXIoaW5zdGFuY2UsIHBhcmFtcykgOiBpbnN0YW5jZTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHVzZUNvbXBvbmVudEFkYXB0ZXJzKHJlZ2lzdHJhdG9yKSB7XG4gICAgY29uc3QgcmVnaXN0ZXIgPSAoY29tcG9uZW50VHlwZSwgYWRhcHRlcikgPT4ge1xuICAgICAgICBDb21wb25lbnRBZGFwdGVyc1tjb21wb25lbnRUeXBlLnRvTG93ZXJDYXNlKCldID0gYWRhcHRlclxuICAgIH1cbiAgICByZWdpc3RyYXRvcih7cmVnaXN0ZXJ9KTtcbn1cblxuY2xhc3MgQ29tcG9uZW50IHtcbiAgICBjb25zdHJ1Y3RvcihwYXJhbXMsIHR5cGUpIHtcbiAgICAgICAgdGhpcy5wYXJhbXMgPSBPYmplY3QuYXNzaWduKHt9LCB7XG4gICAgICAgICAgICBmaW5kTWFwOiB7fVxuICAgICAgICB9LCBwYXJhbXMpO1xuICAgICAgICB0aGlzLnR5cGUgPSB0eXBlIHx8ICdkZWZhdWx0JztcbiAgICAgICAgdGhpcy5nZXRTdHViID0gc2lub24uc3R1Yih0aGlzLCAnZ2V0JykuY2FsbHNGYWtlKChuYW1lKSA9PiB7XG4gICAgICAgICAgICBpZiAobmFtZS5zdGFydHNXaXRoKCd2LicpIHx8IG5hbWUuc3RhcnRzV2l0aCgnYy4nKSB8fCBuYW1lLnN0YXJ0c1dpdGgoJ2UuJykpIHtcbiAgICAgICAgICAgICAgICBuYW1lID0gbmFtZS5zdWJzdHJpbmcoMik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gXy5nZXQodGhpcy5wYXJhbXMsIG5hbWUpO1xuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLnNldFN0dWIgPSBzaW5vbi5zdHViKHRoaXMsICdzZXQnKS5jYWxsc0Zha2UoKG5hbWUsIHZhbHVlKSA9PiB7XG4gICAgICAgICAgICBpZiAobmFtZS5zdGFydHNXaXRoKCd2LicpKSB7XG4gICAgICAgICAgICAgICAgbmFtZSA9IG5hbWUuc3Vic3RyaW5nKDIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5wYXJhbXNbbmFtZV0gPSB2YWx1ZTtcbiAgICAgICAgfSk7XG4gICAgICAgIHNpbm9uLnN0dWIodGhpcywgJ2FkZEV2ZW50SGFuZGxlcicpO1xuICAgICAgICBzaW5vbi5zdHViKHRoaXMsICdhZGRIYW5kbGVyJyk7XG4gICAgICAgIHNpbm9uLnN0dWIodGhpcywgJ2FkZFZhbHVlSGFuZGxlcicpO1xuICAgICAgICBzaW5vbi5zdHViKHRoaXMsICdhZGRWYWx1ZVByb3ZpZGVyJyk7XG4gICAgICAgIHNpbm9uLnN0dWIodGhpcywgJ2F1dG9EZXN0cm95Jyk7XG4gICAgICAgIHNpbm9uLnN0dWIodGhpcywgJ2Rlc3Ryb3knKTtcbiAgICAgICAgc2lub24uc3R1Yih0aGlzLCAncmVtb3ZlRXZlbnRIYW5kbGVyJyk7XG4gICAgfVxuXG4gICAgZ2V0KCkge1xuICAgIH1cbiAgICBzZXQoKSB7XG4gICAgfVxuXG4gICAgZmluZChuYW1lKSB7XG4gICAgICAgIGNvbnN0IHR5cGVPckNvbXBvbmVudCA9IHRoaXMucGFyYW1zLmZpbmRNYXBbbmFtZV07XG4gICAgICAgIGlmICh0eXBlT3JDb21wb25lbnQgaW5zdGFuY2VvZiBDb21wb25lbnQpIHtcbiAgICAgICAgICAgIHJldHVybiB0eXBlT3JDb21wb25lbnQ7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCF0eXBlT3JDb21wb25lbnQgJiYgdGhpcy5wYXJhbXMuZmluZE1hcC5oYXNPd25Qcm9wZXJ0eShuYW1lKSkge1xuICAgICAgICAgICAgcmV0dXJuIHR5cGVPckNvbXBvbmVudDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gY29tcG9uZW50RmFjdG9yeSh0aGlzLnBhcmFtcywgdHlwZU9yQ29tcG9uZW50KTtcbiAgICB9XG4gICAgZ2V0TG9jYWxJZCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucGFyYW1zWydhdXJhOmlkJ107XG4gICAgfVxuICAgIGNsZWFyUmVmZXJlbmNlKGtleSkge1xuICAgICAgICBkZWxldGUgdGhpcy5wYXJhbXNba2V5XTtcbiAgICB9XG4gICAgZ2V0Q29uY3JldGVDb21wb25lbnQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICBnZXRFbGVtZW50KCkge1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgZ2V0RWxlbWVudHMoKSB7XG4gICAgICAgIHJldHVybiBbdGhpc107XG4gICAgfVxuICAgIGdldEV2ZW50KG5hbWUpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucGFyYW1zW25hbWVdIHx8IGV2ZW50RmFjdG9yeSgpO1xuICAgIH1cbiAgICBnZXRHbG9iYWxJZCgpIHtcbiAgICAgICAgcmV0dXJuIGBnbG9iYWwtJHt0aGlzLnBhcmFtc1snYXVyYTppZCddfWA7XG4gICAgfVxuICAgIGdldE5hbWUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnR5cGU7XG4gICAgfVxuICAgIGdldFR5cGUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnR5cGU7XG4gICAgfVxuICAgIGdldFJlZmVyZW5jZShrZXkpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucGFyYW1zW2tleV07XG4gICAgfVxuICAgIGdldFN1cGVyKCkge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgZ2V0VmVyc2lvbigpIHtcbiAgICAgICAgcmV0dXJuICcxLjAnO1xuICAgIH1cbiAgICBpc0NvbmNyZXRlKCkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgaXNJbnN0YW5jZU9mKG5hbWUpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudHlwZSA9PT0gbmFtZTtcbiAgICB9XG4gICAgaXNWYWxpZCgpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG59IiwiY29uc3Qgc2lub24gPSByZXF1aXJlKCdzaW5vbicpO1xuXG5jb25zdCBjbGFzc05hbWVUb0NvbXBvbmVudFZhciA9IGNsYXNzTmFtZSA9PiBgdi5fX2Nsc18ke2NsYXNzTmFtZX1gXG5leHBvcnQgY2xhc3MgQXVyYVV0aWwge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBzaW5vbi5zdHViKHRoaXMsICdhZGRDbGFzcycpLmNhbGxzRmFrZSgoY29tcG9uZW50LCBjbGFzc05hbWUpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBjb21wb25lbnQuc2V0KGNsYXNzTmFtZVRvQ29tcG9uZW50VmFyKGNsYXNzTmFtZSksIHRydWUpO1xuICAgICAgICB9KVxuICAgICAgICBzaW5vbi5zdHViKHRoaXMsICdyZW1vdmVDbGFzcycpLmNhbGxzRmFrZSgoY29tcG9uZW50LCBjbGFzc05hbWUpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBjb21wb25lbnQuc2V0KGNsYXNzTmFtZVRvQ29tcG9uZW50VmFyKGNsYXNzTmFtZSksIGZhbHNlKTtcbiAgICAgICAgfSlcbiAgICAgICAgc2lub24uc3R1Yih0aGlzLCAnaGFzQ2xhc3MnKS5jYWxsc0Zha2UoKGNvbXBvbmVudCwgY2xhc3NOYW1lKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gY29tcG9uZW50LmdldChjbGFzc05hbWVUb0NvbXBvbmVudFZhcihjbGFzc05hbWUpKTtcbiAgICAgICAgfSlcbiAgICAgICAgc2lub24uc3R1Yih0aGlzLCAndG9nZ2xlQ2xhc3MnKS5jYWxsc0Zha2UoKGNvbXBvbmVudCwgY2xhc3NOYW1lKSA9PiB7XG4gICAgICAgICAgICBjb21wb25lbnQuc2V0KGNsYXNzTmFtZVRvQ29tcG9uZW50VmFyKGNsYXNzTmFtZSksICFjb21wb25lbnQuZ2V0KGNsYXNzTmFtZVRvQ29tcG9uZW50VmFyKGNsYXNzTmFtZSkpKTtcbiAgICAgICAgfSlcbiAgICAgICAgdGhpcy5pc0VtcHR5ID0gb2JqID0+IHtcbiAgICAgICAgICAgIGlmIChvYmogPT09IHVuZGVmaW5lZCB8fCBvYmogPT09IG51bGwgfHwgb2JqID09PSAnJykge1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkob2JqKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBvYmoubGVuZ3RoID09PSAwO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh0eXBlb2Ygb2JqID09PSAnb2JqZWN0JyAmJiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwob2JqKSA9PT0gJ1tvYmplY3QgT2JqZWN0XScpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gT2JqZWN0LmtleXMob2JqKS5sZW5ndGggPT09IDA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH07XG4gICAgICAgIHRoaXMuaXNVbmRlZmluZWRPck51bGwgPSBvYmogPT4ge1xuICAgICAgICAgICAgcmV0dXJuIG9iaiA9PT0gdW5kZWZpbmVkIHx8IG9iaiA9PT0gbnVsbDtcbiAgICAgICAgfTtcbiAgICB9XG4gICAgYWRkQ2xhc3MoKSB7fVxuICAgIHJlbW92ZUNsYXNzKCkge31cbiAgICBoYXNDbGFzcygpIHt9XG4gICAgdG9nZ2xlQ2xhc3MoKSB7fVxuICAgIGdldEJvb2xlYW5WYWx1ZSh2YWwpIHtcbiAgICAgICAgLy8gUG9ydGVkOiBodHRwczovL2dpdGh1Yi5jb20vZm9yY2Vkb3Rjb20vYXVyYS9ibG9iL21hc3Rlci9hdXJhLWltcGwvc3JjL21haW4vcmVzb3VyY2VzL2F1cmEvdXRpbC9VdGlsLmpzI0wzNjZcbiAgICAgICAgcmV0dXJuIHZhbCAhPT0gdW5kZWZpbmVkICYmIHZhbCAhPT0gbnVsbCAmJiB2YWwgIT09IGZhbHNlICYmIHZhbCAhPT0gMCAmJiB2YWwgIT09ICdmYWxzZScgJiYgdmFsICE9PSAnJyAmJiB2YWwgIT09ICdmJztcbiAgICB9XG4gICAgaXNBcnJheShhcnIpIHtcbiAgICAgICAgLy8gUG9ydGVkOiBodHRwczovL2dpdGh1Yi5jb20vZm9yY2Vkb3Rjb20vYXVyYS9ibG9iL21hc3Rlci9hdXJhLWltcGwvc3JjL21haW4vcmVzb3VyY2VzL2F1cmEvdXRpbC9VdGlsLmpzI0wxODlcbiAgICAgICAgcmV0dXJuICh0eXBlb2YgQXJyYXkuaXNBcnJheSA9PT0gXCJmdW5jdGlvblwiID8gQXJyYXkuaXNBcnJheSA6IGZ1bmN0aW9uKGFyZykge1xuICAgICAgICAgICAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChhcmcpID09PSAnW29iamVjdCBBcnJheV0nO1xuICAgICAgICB9KShhcnIpO1xuICAgIH1cbiAgICBpc09iamVjdChvYmopIHtcbiAgICAgICAgLy9Qb3J0ZWQ6IGh0dHBzOi8vZ2l0aHViLmNvbS9mb3JjZWRvdGNvbS9hdXJhL2Jsb2IvbWFzdGVyL2F1cmEtaW1wbC9zcmMvbWFpbi9yZXNvdXJjZXMvYXVyYS91dGlsL1V0aWwuanMjTDIwNFxuICAgICAgICByZXR1cm4gdHlwZW9mIG9iaiA9PT0gXCJvYmplY3RcIiAmJiBvYmogIT09IG51bGwgJiYgIUFycmF5LmlzQXJyYXkob2JqKTtcbiAgICB9XG4gICAgaXNVbmRlZmluZWQob2JqKXtcbiAgICAgICAgLy9Qb3J0ZWQ6IGh0dHBzOi8vZ2l0aHViLmNvbS9mb3JjZWRvdGNvbS9hdXJhL2Jsb2IvbWFzdGVyL2F1cmEtaW1wbC9zcmMvbWFpbi9yZXNvdXJjZXMvYXVyYS91dGlsL1V0aWwuanMjTDMxOVxuICAgICAgICByZXR1cm4gb2JqID09PSB1bmRlZmluZWQ7XG4gICAgfVxufVxuXG4iLCJjb25zdCBzaW5vbiA9IHJlcXVpcmUoJ3Npbm9uJyk7XG5cbmltcG9ydCB7IEF1cmFVdGlsIH0gZnJvbSAnLi9hdXJhVXRpbCdcblxuZXhwb3J0IGZ1bmN0aW9uIGF1cmFGYWN0b3J5KHBhcmFtcyA9IHt9KSB7XG4gICAgcmV0dXJuIG5ldyBBdXJhKHBhcmFtcyk7XG59XG5cbmltcG9ydCB7IGNvbXBvbmVudEZhY3RvcnkgfSBmcm9tICcuL2NvbXBvbmVudEZhY3RvcnknXG5cbmNsYXNzIEF1cmEge1xuICAgIGNvbnN0cnVjdG9yKHBhcmFtcykge1xuICAgICAgICB0aGlzLnBhcmFtcyA9IHBhcmFtcztcbiAgICAgICAgdGhpcy51dGlsID0gbmV3IEF1cmFVdGlsKCk7XG4gICAgICAgIHRoaXMuZ2V0U3R1YiA9IHNpbm9uLnN0dWIodGhpcywgJ2dldCcpLmNhbGxzRmFrZSgobmFtZSkgPT4gcGFyYW1zW25hbWVdKTtcbiAgICAgICAgdGhpcy5zZXRTdHViID0gc2lub24uc3R1Yih0aGlzLCAnc2V0JykuY2FsbHNGYWtlKChuYW1lLCB2YWx1ZSkgPT4gcGFyYW1zW25hbWVdID0gdmFsdWUpO1xuICAgICAgICB0aGlzLmVucXVldWVBY3Rpb25TdHViID0gc2lub24uc3R1Yih0aGlzLCAnZW5xdWV1ZUFjdGlvbicpLmNhbGxzRmFrZSgoYWN0aW9uKSA9PiBhY3Rpb24gJiYgYWN0aW9uLmludm9rZUNhbGxiYWNrICYmIGFjdGlvbi5pbnZva2VDYWxsYmFjayh0cnVlKSk7XG4gICAgICAgIHNpbm9uLnN0dWIodGhpcywgJ2dldFJlZmVyZW5jZScpO1xuICAgICAgICBzaW5vbi5zdHViKHRoaXMsICdnZXRSb290JykuY2FsbHNGYWtlKCgpID0+IHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnJvb3RDb21wb25lbnQgfHwgKHRoaXMucm9vdENvbXBvbmVudCA9IG5ldyBjb21wb25lbnRGYWN0b3J5KCkpO1xuICAgICAgICB9KVxuICAgICAgICBzaW5vbi5zdHViKHRoaXMsICdyZXBvcnRFcnJvcicpO1xuICAgIH1cbiAgICBcbiAgICBzZXRQYXJhbXMocGFyYW1zKSB7XG4gICAgICAgIE9iamVjdC5hc3NpZ24odGhpcy5wYXJhbXMsIHBhcmFtcyk7XG4gICAgfVxuXG4gICAgZ2V0KCkge1xuICAgIH1cbiAgICBcbiAgICBlbnF1ZXVlQWN0aW9uKCkge1xuICAgIH1cblxuICAgIGNyZWF0ZUNvbXBvbmVudCh0eXBlLCBhdHRyaWJ1dGVzLCBjYWxsYmFjaykge1xuICAgICAgICB0aGlzLmNyZWF0ZUNvbXBvbmVudC50eXBlID0gdHlwZTtcbiAgICAgICAgdGhpcy5jcmVhdGVDb21wb25lbnQuYXR0cmlidXRlcyA9IGF0dHJpYnV0ZXM7XG4gICAgICAgIC8vIEdldCBjb21wb25lbnQgaW5zdGFuY2UuXG4gICAgICAgIC8vIFVzZSBleGlzdGluZyBjb21wb25lbnQgaW5zdGFuY2UgaWYgc2V0XG4gICAgICAgIC8vIENyZWF0ZSBuZXcgZGVmYXVsdCBjb21wb25lbnQgaWYgY29tcG9uZW50IG5vdCBzZXRcbiAgICAgICAgbGV0IHsgY29tcG9uZW50IH0gPSB0aGlzLmNyZWF0ZUNvbXBvbmVudDtcbiAgICAgICAgaWYgKCFjb21wb25lbnQpIHtcbiAgICAgICAgICAgIGNvbXBvbmVudCA9IG5ldyBjb21wb25lbnRGYWN0b3J5KGF0dHJpYnV0ZXMsIHR5cGUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5jcmVhdGVDb21wb25lbnQuY29tcG9uZW50ID0gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBpZiAoY2FsbGJhY2spIHtcbiAgICAgICAgICAgIGNhbGxiYWNrKGNvbXBvbmVudCwgJ1NVQ0NFU1MnLCBbJ1NVQ0NFU1MnXSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGNvbXBvbmVudDtcbiAgICB9XG4gICAgY3JlYXRlQ29tcG9uZW50cyhjb21wb25lbnREZWZzLCBjYWxsYmFjaykge1xuICAgICAgICBjb25zdCByZXN1bHQgPSBjb21wb25lbnREZWZzXG4gICAgICAgICAgICAubWFwKGRlZiA9PiB0aGlzLmNyZWF0ZUNvbXBvbmVudChkZWZbMF0sIGRlZlsxXSkpXG4gICAgICAgIGlmIChjYWxsYmFjaykge1xuICAgICAgICAgICAgY2FsbGJhY2socmVzdWx0LCAnU1VDQ0VTUycsIHJlc3VsdC5tYXAoICgpID0+ICdTVUNDRVNTJykpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuICAgIGdldENhbGxiYWNrKGNhbGxiYWNrKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGNhbGxiYWNrICYmIGNhbGxiYWNrKCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZ2V0Q29tcG9uZW50KGlkKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnBhcmFtc1tpZF07XG4gICAgfVxuICAgIGdldFJlZmVyZW5jZSgpIHt9XG4gICAgZ2V0Um9vdCgpIHt9XG4gICAgZ2V0VG9rZW4obmFtZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5wYXJhbXNbJ3Rva2VuLicgKyBuYW1lXVxuICAgIH1cbiAgICBsb2codmFsdWUsIGVycikge1xuICAgICAgICAvKmVzbGludCBuby1jb25zb2xlOiAwKi9cbiAgICAgICAgY29uc29sZSAmJiBjb25zb2xlLmxvZyh2YWx1ZSwgZXJyKVxuICAgIH1cbiAgICByZXBvcnRFcnJvcigpIHt9XG59IiwiY29uc3Qgc2lub24gPSByZXF1aXJlKCdzaW5vbicpO1xuXG5leHBvcnQgZnVuY3Rpb24gYXBleENhbGxGYWN0b3J5KHBhcmFtcyA9IHt9KSB7XG4gICAgcmV0dXJuIG5ldyBBcGV4Q2FsbChwYXJhbXMpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYXBleFN1Y2Nlc3NSZXN1bHQocmVzcG9uc2UgPSB7fSkge1xuICAgIHJldHVybiBuZXcgQXBleENhbGxSZXN1bHQocmVzcG9uc2UpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYXBleEVycm9yUmVzdWx0KG1lc3NhZ2UpIHtcbiAgICByZXR1cm4gbmV3IEFwZXhDYWxsUmVzdWx0KG51bGwsIG1lc3NhZ2UpO1xufVxuXG5jbGFzcyBBcGV4Q2FsbCB7XG4gICAgY29uc3RydWN0b3IocmVzdWx0LCBpbnZva2VDYWxsYmFja09uRW5xdWV1ZSA9IHRydWUpIHtcbiAgICAgICAgdGhpcy5wYXJhbXMgPSBudWxsO1xuICAgICAgICB0aGlzLnJlc3VsdCA9IHJlc3VsdDtcbiAgICAgICAgdGhpcy5pbnZva2VDYWxsYmFja09uRW5xdWV1ZSA9IGludm9rZUNhbGxiYWNrT25FbnF1ZXVlO1xuICAgICAgICB0aGlzLmlzQmFja2dyb3VuZCA9IGZhbHNlO1xuICAgICAgICB0aGlzLnNldEFib3J0YWJsZSA9IGZhbHNlO1xuICAgICAgICBzaW5vbi5zdHViKHRoaXMsICdzZXRTdG9yYWJsZScpO1xuICAgICAgICBzaW5vbi5zdHViKHRoaXMsICdzZXRBYm9ydGFibGUnKTtcbiAgICB9XG4gICAgc2V0UGFyYW1zKHBhcmFtcykge1xuICAgICAgICB0aGlzLnBhcmFtcyA9IHBhcmFtcztcbiAgICB9XG4gICAgc2V0UGFyYW0oa2V5LCB2YWx1ZSkge1xuICAgICAgICB0aGlzLnBhcmFtcyA9IE9iamVjdC5hc3NpZ24odGhpcy5wYXJhbXMsIHtba2V5XSA6IHZhbHVlfSk7XG4gICAgfVxuICAgIGdldFBhcmFtcygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucGFyYW1zO1xuICAgIH1cbiAgICBzZXRDYWxsYmFjayhjdHgsIGNhbGxiYWNrKSB7XG4gICAgICAgIHRoaXMuY3R4ID0gY3R4O1xuICAgICAgICB0aGlzLmNhbGxiYWNrID0gY2FsbGJhY2s7XG4gICAgfVxuICAgIGludm9rZUNhbGxiYWNrKGZyb21FbnF1ZXVlID0gZmFsc2UpIHtcbiAgICAgICAgaWYgKGZyb21FbnF1ZXVlICYmICF0aGlzLmludm9rZUNhbGxiYWNrT25FbnF1ZXVlKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5jYWxsYmFjayAmJiB0aGlzLmNhbGxiYWNrLmJpbmQodGhpcy5jdHgpKHRoaXMucmVzdWx0KTtcbiAgICB9XG4gICAgZ2V0RXJyb3IoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnJlc3VsdC5nZXRFcnJvcigpO1xuICAgIH1cbiAgICBnZXRQYXJhbShuYW1lKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnBhcmFtcyA/IHRoaXMucGFyYW1zW25hbWVdIDogbnVsbDtcbiAgICB9XG4gICAgZ2V0UmV0dXJuVmFsdWUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnJlc3VsdDtcbiAgICB9XG4gICAgZ2V0U3RhdGUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnJlc3VsdC5nZXRTdGF0ZSgpO1xuICAgIH1cbiAgICBpc0JhY2tncm91bmQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmlzQmFja2dyb3VuZDtcbiAgICB9XG4gICAgc2V0QWJvcnRhYmxlKCkge1xuICAgIH1cbiAgICBzZXRCYWNrZ3JvdW5kKCkge1xuICAgICAgICB0aGlzLmlzQmFja2dyb3VuZCA9IHRydWU7XG4gICAgfVxuICAgIHNldFN0b3JhYmxlKCkge1xuICAgIH1cbn1cblxuY2xhc3MgQXBleENhbGxSZXN1bHQge1xuICAgIGNvbnN0cnVjdG9yKHJlc3BvbnNlLCBlcnJvck1lc3NhZ2UgPSBudWxsKSB7XG4gICAgICAgIHRoaXMucmVzcG9uc2UgPSByZXNwb25zZTtcbiAgICAgICAgdGhpcy5lcnJvck1lc3NhZ2UgPSBlcnJvck1lc3NhZ2U7XG4gICAgfVxuICAgIGdldFN0YXRlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5lcnJvck1lc3NhZ2UgPyAnRVJST1InIDogJ1NVQ0NFU1MnXG4gICAgfVxuICAgIGdldEVycm9yKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5lcnJvck1lc3NhZ2UgPyBbe21lc3NhZ2U6IHRoaXMuZXJyb3JNZXNzYWdlfV0gOiBbXVxuICAgIH1cbiAgICBnZXRSZXR1cm5WYWx1ZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucmVzcG9uc2U7XG4gICAgfVxufSIsImltcG9ydCB7IGV2ZW50RmFjdG9yeSB9IGZyb20gJy4vZXZlbnRGYWN0b3J5J1xuaW1wb3J0IHsgY29tcG9uZW50RmFjdG9yeSwgdXNlQ29tcG9uZW50QWRhcHRlcnMgfSBmcm9tICcuL2NvbXBvbmVudEZhY3RvcnknXG5pbXBvcnQgeyBhdXJhRmFjdG9yeSB9IGZyb20gJy4vYXVyYUZhY3RvcnknXG5pbXBvcnQgeyBBdXJhVXRpbCB9IGZyb20gJy4vYXVyYVV0aWwnXG5pbXBvcnQgeyBhcGV4Q2FsbEZhY3RvcnksIGFwZXhTdWNjZXNzUmVzdWx0LCBhcGV4RXJyb3JSZXN1bHQgfSBmcm9tICcuL2FwZXhDYWxsRmFjdG9yeSdcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgQXVyYVV0aWwsXG4gICAgZXZlbnRGYWN0b3J5LFxuICAgIGNvbXBvbmVudEZhY3RvcnksXG4gICAgdXNlQ29tcG9uZW50QWRhcHRlcnMsXG4gICAgYXVyYUZhY3RvcnksXG4gICAgYXBleENhbGxGYWN0b3J5LFxuICAgIGFwZXhTdWNjZXNzUmVzdWx0LFxuICAgIGFwZXhFcnJvclJlc3VsdFxufSJdLCJuYW1lcyI6WyJzaW5vbiIsInJlcXVpcmUiLCJldmVudEZhY3RvcnkiLCJwYXJhbXMiLCJFdmVudCIsIkZBS0VfRVZFTlRfTkFNRSIsImZpcmUiLCJzcHkiLCJwYXVzZSIsInByZXZlbnREZWZhdWx0IiwicmVzdW1lIiwic3RvcFByb3BhZ2F0aW9uIiwia2V5IiwidmFsdWUiLCJldmVudE5hbWUiLCJuYW1lIiwiXyIsIkNvbXBvbmVudEFkYXB0ZXJzIiwiaW5zdGFuY2UiLCJjb21wb25lbnRGYWN0b3J5IiwidHlwZSIsIkNvbXBvbmVudCIsImFkYXB0ZXIiLCJ0b0xvd2VyQ2FzZSIsInVzZUNvbXBvbmVudEFkYXB0ZXJzIiwicmVnaXN0cmF0b3IiLCJyZWdpc3RlciIsImNvbXBvbmVudFR5cGUiLCJPYmplY3QiLCJhc3NpZ24iLCJnZXRTdHViIiwic3R1YiIsImNhbGxzRmFrZSIsInN0YXJ0c1dpdGgiLCJzdWJzdHJpbmciLCJnZXQiLCJzZXRTdHViIiwidHlwZU9yQ29tcG9uZW50IiwiZmluZE1hcCIsImhhc093blByb3BlcnR5IiwiY2xhc3NOYW1lVG9Db21wb25lbnRWYXIiLCJjbGFzc05hbWUiLCJBdXJhVXRpbCIsImNvbXBvbmVudCIsInNldCIsImlzRW1wdHkiLCJvYmoiLCJ1bmRlZmluZWQiLCJBcnJheSIsImlzQXJyYXkiLCJsZW5ndGgiLCJwcm90b3R5cGUiLCJ0b1N0cmluZyIsImNhbGwiLCJrZXlzIiwiaXNVbmRlZmluZWRPck51bGwiLCJ2YWwiLCJhcnIiLCJhcmciLCJhdXJhRmFjdG9yeSIsIkF1cmEiLCJ1dGlsIiwiZW5xdWV1ZUFjdGlvblN0dWIiLCJhY3Rpb24iLCJpbnZva2VDYWxsYmFjayIsInJvb3RDb21wb25lbnQiLCJhdHRyaWJ1dGVzIiwiY2FsbGJhY2siLCJjcmVhdGVDb21wb25lbnQiLCJjb21wb25lbnREZWZzIiwicmVzdWx0IiwibWFwIiwiZGVmIiwiaWQiLCJlcnIiLCJjb25zb2xlIiwibG9nIiwiYXBleENhbGxGYWN0b3J5IiwiQXBleENhbGwiLCJhcGV4U3VjY2Vzc1Jlc3VsdCIsInJlc3BvbnNlIiwiQXBleENhbGxSZXN1bHQiLCJhcGV4RXJyb3JSZXN1bHQiLCJtZXNzYWdlIiwiaW52b2tlQ2FsbGJhY2tPbkVucXVldWUiLCJpc0JhY2tncm91bmQiLCJzZXRBYm9ydGFibGUiLCJjdHgiLCJmcm9tRW5xdWV1ZSIsImJpbmQiLCJnZXRFcnJvciIsImdldFN0YXRlIiwiZXJyb3JNZXNzYWdlIiwibW9kdWxlIiwiZXhwb3J0cyJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxJQUFNQSxRQUFRQyxRQUFRLE9BQVIsQ0FBZDs7QUFFQSxBQUFPLFNBQVNDLFlBQVQsR0FBbUM7UUFBYkMsTUFBYSx1RUFBSixFQUFJOztXQUMvQixJQUFJQyxLQUFKLENBQVVELE1BQVYsQ0FBUDs7QUFFSixJQUFNRSxrQkFBa0IsdUJBQXhCOztJQUNNRDttQkFDVUQsTUFBWixFQUFvQjs7O2FBQ1hBLE1BQUwsR0FBY0EsVUFBVSxFQUF4QjthQUNLRyxJQUFMLEdBQVlOLE1BQU1PLEdBQU4sRUFBWjthQUNLQyxLQUFMLEdBQWFSLE1BQU1PLEdBQU4sRUFBYjthQUNLRSxjQUFMLEdBQXNCVCxNQUFNTyxHQUFOLEVBQXRCO2FBQ0tHLE1BQUwsR0FBY1YsTUFBTU8sR0FBTixFQUFkO2FBQ0tJLGVBQUwsR0FBdUJYLE1BQU1PLEdBQU4sRUFBdkI7Ozs7O2tDQUVNSixRQUFRO2lCQUNUQSxNQUFMLEdBQWNBLE1BQWQ7Ozs7aUNBRUtTLEtBQUtDLE9BQU87aUJBQ1pWLE1BQUwsQ0FBWVMsR0FBWixJQUFtQkMsS0FBbkI7Ozs7b0NBRVE7bUJBQ0QsS0FBS1YsTUFBWjs7Ozt1Q0FFVzttQkFDSixhQUFQOzs7O2tDQUVNO21CQUNDLEtBQUtBLE1BQUwsQ0FBWVcsU0FBWixJQUF5QlQsZUFBaEM7Ozs7aUNBRUtVLE1BQU07bUJBQ0osS0FBS1osTUFBTCxDQUFZWSxJQUFaLENBQVA7Ozs7bUNBRU87bUJBQ0Es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
