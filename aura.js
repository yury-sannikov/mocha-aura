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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXVyYS5qcyIsInNvdXJjZXMiOlsibGliL2V2ZW50RmFjdG9yeS5qcyIsImxpYi9jb21wb25lbnRGYWN0b3J5LmpzIiwibGliL2F1cmFVdGlsLmpzIiwibGliL2F1cmFGYWN0b3J5LmpzIiwibGliL2FwZXhDYWxsRmFjdG9yeS5qcyIsImxpYi9hdXJhLmpzIl0sInNvdXJjZXNDb250ZW50IjpbImNvbnN0IHNpbm9uID0gcmVxdWlyZSgnc2lub24nKTtcblxuZXhwb3J0IGZ1bmN0aW9uIGV2ZW50RmFjdG9yeShwYXJhbXMgPSB7fSkge1xuICAgIHJldHVybiBuZXcgRXZlbnQocGFyYW1zKTtcbn1cbmNvbnN0IEZBS0VfRVZFTlRfTkFNRSA9ICdtb2NoYS1hdXJhLWZha2UtZXZlbnQnXG5jbGFzcyBFdmVudCB7XG4gICAgY29uc3RydWN0b3IocGFyYW1zKSB7XG4gICAgICAgIHRoaXMucGFyYW1zID0gcGFyYW1zIHx8IHt9O1xuICAgICAgICB0aGlzLmZpcmUgPSBzaW5vbi5zcHkoKTtcbiAgICAgICAgdGhpcy5wYXVzZSA9IHNpbm9uLnNweSgpO1xuICAgICAgICB0aGlzLnByZXZlbnREZWZhdWx0ID0gc2lub24uc3B5KCk7XG4gICAgICAgIHRoaXMucmVzdW1lID0gc2lub24uc3B5KCk7XG4gICAgICAgIHRoaXMuc3RvcFByb3BhZ2F0aW9uID0gc2lub24uc3B5KCk7XG4gICAgfVxuICAgIHNldFBhcmFtcyhwYXJhbXMpIHtcbiAgICAgICAgdGhpcy5wYXJhbXMgPSBwYXJhbXM7XG4gICAgfVxuICAgIHNldFBhcmFtKGtleSwgdmFsdWUpIHtcbiAgICAgICAgdGhpcy5wYXJhbXNba2V5XSA9IHZhbHVlO1xuICAgIH1cbiAgICBnZXRQYXJhbXMoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnBhcmFtcztcbiAgICB9XG4gICAgZ2V0RXZlbnRUeXBlKCkge1xuICAgICAgICByZXR1cm4gJ0FQUExJQ0FUSU9OJ1xuICAgIH1cbiAgICBnZXROYW1lKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wYXJhbXMuZXZlbnROYW1lIHx8IEZBS0VfRVZFTlRfTkFNRVxuICAgIH1cbiAgICBnZXRQYXJhbShuYW1lKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnBhcmFtc1tuYW1lXVxuICAgIH1cbiAgICBnZXRQaGFzZSgpIHtcbiAgICAgICAgcmV0dXJuICdkZWZhdWx0J1xuICAgIH1cbiAgICBnZXRTb3VyY2UoKSB7XG4gICAgICAgIHJldHVybiBudWxsXG4gICAgfVxuICAgIGdldFR5cGUoKSB7XG4gICAgICAgIHJldHVybiBgYzoke0ZBS0VfRVZFTlRfTkFNRX1gXG4gICAgfVxuXG59IiwiY29uc3Qgc2lub24gPSByZXF1aXJlKCdzaW5vbicpO1xuY29uc3QgXyA9IHJlcXVpcmUoJ2xvZGFzaCcpO1xuaW1wb3J0IHsgZXZlbnRGYWN0b3J5IH0gZnJvbSAnLi9ldmVudEZhY3RvcnknXG5cbmNvbnN0IERlZmF1bHRDb21wb25lbnRBZGFwdGVyID0gJ2RlZmF1bHQnXG5jb25zdCBXZWxsS25vd25Db21wb25lbnRzID0gWydhdXJhOicsICdmb3JjZTonLCAnZm9yY2VDaGF0dGVyOicsICdsaWdodG5pbmc6JywgJ3VpOicsICdjOiddXG5cbmxldCBDb21wb25lbnRBZGFwdGVycyA9IHtcbiAgICBbRGVmYXVsdENvbXBvbmVudEFkYXB0ZXJdOiBpbnN0YW5jZSA9PiBpbnN0YW5jZVxufVxuXG5mdW5jdGlvbiBjb21wb25lbnRGYWN0b3J5Rm9yQXJyYXkocGFyYW1zLCBhcnJheU9mVHlwZXMpIHtcbiAgICByZXR1cm4gYXJyYXlPZlR5cGVzLm1hcCh0eXBlT3JDb21wb25lbnQgPT4gY29tcG9uZW50RmFjdG9yeShwYXJhbXMsIHR5cGVPckNvbXBvbmVudCkpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY29tcG9uZW50RmFjdG9yeShwYXJhbXMgPSB7fSwgdHlwZU9yQ29tcG9uZW50ID0gRGVmYXVsdENvbXBvbmVudEFkYXB0ZXIpIHtcbiAgICBpZiAoQXJyYXkuaXNBcnJheSh0eXBlT3JDb21wb25lbnQpKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignVW5leHBlY3RlZCB0eXBlIGFyZ3VtZW50JylcbiAgICB9XG5cbiAgICBpZiAodHlwZU9yQ29tcG9uZW50ID09PSB0cnVlKSB7XG4gICAgICAgIHR5cGVPckNvbXBvbmVudCA9IERlZmF1bHRDb21wb25lbnRBZGFwdGVyXG4gICAgfSBlbHNlIGlmICh0eXBlT3JDb21wb25lbnQgaW5zdGFuY2VvZiBDb21wb25lbnQpIHtcbiAgICAgICAgcmV0dXJuIHR5cGVPckNvbXBvbmVudDtcbiAgICB9IGVsc2UgaWYgKHR5cGVPckNvbXBvbmVudCA9PT0gbnVsbCkge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBsZXQgaW5zdGFuY2UgPSBuZXcgQ29tcG9uZW50KHBhcmFtcywgdHlwZU9yQ29tcG9uZW50KTtcbiAgICBsZXQgYWRhcHRlck5hbWUgPSB0eXBlT3JDb21wb25lbnQudG9Mb3dlckNhc2UoKS5yZXBsYWNlKCdtYXJrdXA6Ly8nLCAnJylcbiAgICBsZXQgYWRhcHRlciA9IENvbXBvbmVudEFkYXB0ZXJzW2FkYXB0ZXJOYW1lXTtcbiAgICBpZiAoIWFkYXB0ZXIpIHtcbiAgICAgICAgaWYgKCFfLnNvbWUoV2VsbEtub3duQ29tcG9uZW50cywgbmFtZSA9PiBhZGFwdGVyTmFtZS5zdGFydHNXaXRoKG5hbWUpKSkge1xuICAgICAgICAgICAgLyplc2xpbnQgbm8tY29uc29sZTogMCovXG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYFVuYWJsZSB0byBmaW5kIGNvbXBvbmVudCBhZGFwdGVyICR7dHlwZU9yQ29tcG9uZW50fWApO1xuICAgICAgICB9XG4gICAgICAgIGFkYXB0ZXIgPSBDb21wb25lbnRBZGFwdGVyc1tEZWZhdWx0Q29tcG9uZW50QWRhcHRlcl07XG4gICAgfVxuICAgIHJldHVybiBhZGFwdGVyKGluc3RhbmNlLCBwYXJhbXMpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdXNlQ29tcG9uZW50QWRhcHRlcnMocmVnaXN0cmF0b3IpIHtcbiAgICBjb25zdCByZWdpc3RlciA9IChjb21wb25lbnRUeXBlLCBhZGFwdGVyKSA9PiB7XG4gICAgICAgIGNvbnN0IGFkYXB0ZXJOYW1lID0gY29tcG9uZW50VHlwZS50b0xvd2VyQ2FzZSgpO1xuICAgICAgICBDb21wb25lbnRBZGFwdGVyc1thZGFwdGVyTmFtZV0gPSBhZGFwdGVyXG4gICAgfVxuICAgIHJlZ2lzdHJhdG9yKHtyZWdpc3Rlcn0pO1xufVxuXG5jbGFzcyBDb21wb25lbnQge1xuICAgIGNvbnN0cnVjdG9yKHBhcmFtcywgdHlwZSkge1xuICAgICAgICB0aGlzLnBhcmFtcyA9IE9iamVjdC5hc3NpZ24oe30sIHtcbiAgICAgICAgICAgIGZpbmRNYXA6IHt9XG4gICAgICAgIH0sIHBhcmFtcyk7XG4gICAgICAgIHRoaXMudHlwZSA9IHR5cGUgfHwgJ2RlZmF1bHQnO1xuICAgICAgICB0aGlzLmdldFN0dWIgPSBzaW5vbi5zdHViKHRoaXMsICdnZXQnKS5jYWxsc0Zha2UoKG5hbWUpID0+IHtcbiAgICAgICAgICAgIGlmIChuYW1lLnN0YXJ0c1dpdGgoJ3YuJykgfHwgbmFtZS5zdGFydHNXaXRoKCdjLicpIHx8IG5hbWUuc3RhcnRzV2l0aCgnZS4nKSkge1xuICAgICAgICAgICAgICAgIG5hbWUgPSBuYW1lLnN1YnN0cmluZygyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBfLmdldCh0aGlzLnBhcmFtcywgbmFtZSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMuc2V0U3R1YiA9IHNpbm9uLnN0dWIodGhpcywgJ3NldCcpLmNhbGxzRmFrZSgobmFtZSwgdmFsdWUpID0+IHtcbiAgICAgICAgICAgIGlmIChuYW1lLnN0YXJ0c1dpdGgoJ3YuJykgfHwgbmFtZS5zdGFydHNXaXRoKCdjLicpIHx8IG5hbWUuc3RhcnRzV2l0aCgnZS4nKSkge1xuICAgICAgICAgICAgICAgIG5hbWUgPSBuYW1lLnN1YnN0cmluZygyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIF8uc2V0KHRoaXMucGFyYW1zLCBuYW1lLCB2YWx1ZSk7XG4gICAgICAgIH0pO1xuICAgICAgICBzaW5vbi5zdHViKHRoaXMsICdhZGRFdmVudEhhbmRsZXInKTtcbiAgICAgICAgc2lub24uc3R1Yih0aGlzLCAnYWRkSGFuZGxlcicpO1xuICAgICAgICBzaW5vbi5zdHViKHRoaXMsICdhZGRWYWx1ZUhhbmRsZXInKTtcbiAgICAgICAgc2lub24uc3R1Yih0aGlzLCAnYWRkVmFsdWVQcm92aWRlcicpO1xuICAgICAgICBzaW5vbi5zdHViKHRoaXMsICdhdXRvRGVzdHJveScpO1xuICAgICAgICBzaW5vbi5zdHViKHRoaXMsICdkZXN0cm95Jyk7XG4gICAgICAgIHNpbm9uLnN0dWIodGhpcywgJ3JlbW92ZUV2ZW50SGFuZGxlcicpO1xuICAgIH1cblxuICAgIGdldCgpIHtcbiAgICB9XG4gICAgc2V0KCkge1xuICAgIH1cblxuICAgIGZpbmQobmFtZSkge1xuICAgICAgICBsZXQgdHlwZU9yQ29tcG9uZW50ID0gdGhpcy5wYXJhbXMuZmluZE1hcFtuYW1lXTtcbiAgICAgICAgaWYgKCF0eXBlT3JDb21wb25lbnQgJiYgdGhpcy5wYXJhbXMuZmluZE1hcC5oYXNPd25Qcm9wZXJ0eShuYW1lKSkge1xuICAgICAgICAgICAgcmV0dXJuIHR5cGVPckNvbXBvbmVudDtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGNvbXBvbmVudCA9IHRoaXMucGFyYW1zLmZpbmRNYXBbbmFtZV0gPSAoQXJyYXkuaXNBcnJheSh0eXBlT3JDb21wb25lbnQpID8gXG4gICAgICAgICAgICBjb21wb25lbnRGYWN0b3J5Rm9yQXJyYXkodGhpcy5wYXJhbXMsIHR5cGVPckNvbXBvbmVudCkgOiBcbiAgICAgICAgICAgIGNvbXBvbmVudEZhY3RvcnkodGhpcy5wYXJhbXMsIHR5cGVPckNvbXBvbmVudCkpXG4gICAgICAgIHJldHVybiBjb21wb25lbnQ7XG4gICAgfVxuICAgIGdldExvY2FsSWQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnBhcmFtc1snYXVyYTppZCddO1xuICAgIH1cbiAgICBjbGVhclJlZmVyZW5jZShrZXkpIHtcbiAgICAgICAgZGVsZXRlIHRoaXMucGFyYW1zW2tleV07XG4gICAgfVxuICAgIGdldENvbmNyZXRlQ29tcG9uZW50KCkge1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgZ2V0RWxlbWVudCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIGdldEVsZW1lbnRzKCkge1xuICAgICAgICByZXR1cm4gW3RoaXNdO1xuICAgIH1cbiAgICBnZXRFdmVudChuYW1lKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnBhcmFtc1tuYW1lXSB8fCBldmVudEZhY3RvcnkoKTtcbiAgICB9XG4gICAgZ2V0R2xvYmFsSWQoKSB7XG4gICAgICAgIHJldHVybiBgZ2xvYmFsLSR7dGhpcy5wYXJhbXNbJ2F1cmE6aWQnXX1gO1xuICAgIH1cbiAgICBnZXROYW1lKCkge1xuICAgICAgICByZXR1cm4gdGhpcy50eXBlO1xuICAgIH1cbiAgICBnZXRUeXBlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy50eXBlO1xuICAgIH1cbiAgICBnZXRSZWZlcmVuY2Uoa2V5KSB7XG4gICAgICAgIHJldHVybiB0aGlzLnBhcmFtc1trZXldO1xuICAgIH1cbiAgICBnZXRTdXBlcigpIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGdldFZlcnNpb24oKSB7XG4gICAgICAgIHJldHVybiAnMS4wJztcbiAgICB9XG4gICAgaXNDb25jcmV0ZSgpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIGlzSW5zdGFuY2VPZihuYW1lKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnR5cGUgPT09IG5hbWU7XG4gICAgfVxuICAgIGlzVmFsaWQoKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxufSIsImNvbnN0IHNpbm9uID0gcmVxdWlyZSgnc2lub24nKTtcblxuY29uc3QgY2xhc3NOYW1lVG9Db21wb25lbnRWYXIgPSBjbGFzc05hbWUgPT4gYHYuX19jbHNfJHtjbGFzc05hbWV9YFxuZXhwb3J0IGNsYXNzIEF1cmFVdGlsIHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgc2lub24uc3R1Yih0aGlzLCAnYWRkQ2xhc3MnKS5jYWxsc0Zha2UoKGNvbXBvbmVudCwgY2xhc3NOYW1lKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gY29tcG9uZW50LnNldChjbGFzc05hbWVUb0NvbXBvbmVudFZhcihjbGFzc05hbWUpLCB0cnVlKTtcbiAgICAgICAgfSlcbiAgICAgICAgc2lub24uc3R1Yih0aGlzLCAncmVtb3ZlQ2xhc3MnKS5jYWxsc0Zha2UoKGNvbXBvbmVudCwgY2xhc3NOYW1lKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gY29tcG9uZW50LnNldChjbGFzc05hbWVUb0NvbXBvbmVudFZhcihjbGFzc05hbWUpLCBmYWxzZSk7XG4gICAgICAgIH0pXG4gICAgICAgIHNpbm9uLnN0dWIodGhpcywgJ2hhc0NsYXNzJykuY2FsbHNGYWtlKChjb21wb25lbnQsIGNsYXNzTmFtZSkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIGNvbXBvbmVudC5nZXQoY2xhc3NOYW1lVG9Db21wb25lbnRWYXIoY2xhc3NOYW1lKSk7XG4gICAgICAgIH0pXG4gICAgICAgIHNpbm9uLnN0dWIodGhpcywgJ3RvZ2dsZUNsYXNzJykuY2FsbHNGYWtlKChjb21wb25lbnQsIGNsYXNzTmFtZSkgPT4ge1xuICAgICAgICAgICAgY29tcG9uZW50LnNldChjbGFzc05hbWVUb0NvbXBvbmVudFZhcihjbGFzc05hbWUpLCAhY29tcG9uZW50LmdldChjbGFzc05hbWVUb0NvbXBvbmVudFZhcihjbGFzc05hbWUpKSk7XG4gICAgICAgIH0pXG4gICAgICAgIHRoaXMuaXNFbXB0eSA9IG9iaiA9PiB7XG4gICAgICAgICAgICBpZiAob2JqID09PSB1bmRlZmluZWQgfHwgb2JqID09PSBudWxsIHx8IG9iaiA9PT0gJycpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChBcnJheS5pc0FycmF5KG9iaikpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gb2JqLmxlbmd0aCA9PT0gMDtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIG9iaiA9PT0gJ29iamVjdCcgJiYgT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKG9iaikgPT09ICdbb2JqZWN0IE9iamVjdF0nKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIE9iamVjdC5rZXlzKG9iaikubGVuZ3RoID09PSAwO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9O1xuICAgICAgICB0aGlzLmlzVW5kZWZpbmVkT3JOdWxsID0gb2JqID0+IHtcbiAgICAgICAgICAgIHJldHVybiBvYmogPT09IHVuZGVmaW5lZCB8fCBvYmogPT09IG51bGw7XG4gICAgICAgIH07XG4gICAgfVxuICAgIGFkZENsYXNzKCkge31cbiAgICByZW1vdmVDbGFzcygpIHt9XG4gICAgaGFzQ2xhc3MoKSB7fVxuICAgIHRvZ2dsZUNsYXNzKCkge31cbiAgICBnZXRCb29sZWFuVmFsdWUodmFsKSB7XG4gICAgICAgIC8vIFBvcnRlZDogaHR0cHM6Ly9naXRodWIuY29tL2ZvcmNlZG90Y29tL2F1cmEvYmxvYi9tYXN0ZXIvYXVyYS1pbXBsL3NyYy9tYWluL3Jlc291cmNlcy9hdXJhL3V0aWwvVXRpbC5qcyNMMzY2XG4gICAgICAgIHJldHVybiB2YWwgIT09IHVuZGVmaW5lZCAmJiB2YWwgIT09IG51bGwgJiYgdmFsICE9PSBmYWxzZSAmJiB2YWwgIT09IDAgJiYgdmFsICE9PSAnZmFsc2UnICYmIHZhbCAhPT0gJycgJiYgdmFsICE9PSAnZic7XG4gICAgfVxuICAgIGlzQXJyYXkoYXJyKSB7XG4gICAgICAgIC8vIFBvcnRlZDogaHR0cHM6Ly9naXRodWIuY29tL2ZvcmNlZG90Y29tL2F1cmEvYmxvYi9tYXN0ZXIvYXVyYS1pbXBsL3NyYy9tYWluL3Jlc291cmNlcy9hdXJhL3V0aWwvVXRpbC5qcyNMMTg5XG4gICAgICAgIHJldHVybiAodHlwZW9mIEFycmF5LmlzQXJyYXkgPT09IFwiZnVuY3Rpb25cIiA/IEFycmF5LmlzQXJyYXkgOiBmdW5jdGlvbihhcmcpIHtcbiAgICAgICAgICAgIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoYXJnKSA9PT0gJ1tvYmplY3QgQXJyYXldJztcbiAgICAgICAgfSkoYXJyKTtcbiAgICB9XG4gICAgaXNPYmplY3Qob2JqKSB7XG4gICAgICAgIC8vUG9ydGVkOiBodHRwczovL2dpdGh1Yi5jb20vZm9yY2Vkb3Rjb20vYXVyYS9ibG9iL21hc3Rlci9hdXJhLWltcGwvc3JjL21haW4vcmVzb3VyY2VzL2F1cmEvdXRpbC9VdGlsLmpzI0wyMDRcbiAgICAgICAgcmV0dXJuIHR5cGVvZiBvYmogPT09IFwib2JqZWN0XCIgJiYgb2JqICE9PSBudWxsICYmICFBcnJheS5pc0FycmF5KG9iaik7XG4gICAgfVxuICAgIGlzVW5kZWZpbmVkKG9iail7XG4gICAgICAgIC8vUG9ydGVkOiBodHRwczovL2dpdGh1Yi5jb20vZm9yY2Vkb3Rjb20vYXVyYS9ibG9iL21hc3Rlci9hdXJhLWltcGwvc3JjL21haW4vcmVzb3VyY2VzL2F1cmEvdXRpbC9VdGlsLmpzI0wzMTlcbiAgICAgICAgcmV0dXJuIG9iaiA9PT0gdW5kZWZpbmVkO1xuICAgIH1cbn1cblxuIiwiY29uc3Qgc2lub24gPSByZXF1aXJlKCdzaW5vbicpO1xuXG5pbXBvcnQgeyBBdXJhVXRpbCB9IGZyb20gJy4vYXVyYVV0aWwnXG5cbmV4cG9ydCBmdW5jdGlvbiBhdXJhRmFjdG9yeShwYXJhbXMgPSB7fSkge1xuICAgIHJldHVybiBuZXcgQXVyYShwYXJhbXMpO1xufVxuXG5pbXBvcnQgeyBjb21wb25lbnRGYWN0b3J5IH0gZnJvbSAnLi9jb21wb25lbnRGYWN0b3J5J1xuXG5jbGFzcyBBdXJhIHtcbiAgICBjb25zdHJ1Y3RvcihwYXJhbXMpIHtcbiAgICAgICAgdGhpcy5wYXJhbXMgPSBwYXJhbXM7XG4gICAgICAgIHRoaXMudXRpbCA9IG5ldyBBdXJhVXRpbCgpO1xuICAgICAgICB0aGlzLmdldFN0dWIgPSBzaW5vbi5zdHViKHRoaXMsICdnZXQnKS5jYWxsc0Zha2UoKG5hbWUpID0+IHBhcmFtc1tuYW1lXSk7XG4gICAgICAgIHRoaXMuc2V0U3R1YiA9IHNpbm9uLnN0dWIodGhpcywgJ3NldCcpLmNhbGxzRmFrZSgobmFtZSwgdmFsdWUpID0+IHBhcmFtc1tuYW1lXSA9IHZhbHVlKTtcbiAgICAgICAgdGhpcy5lbnF1ZXVlQWN0aW9uU3R1YiA9IHNpbm9uLnN0dWIodGhpcywgJ2VucXVldWVBY3Rpb24nKS5jYWxsc0Zha2UoKGFjdGlvbikgPT4gYWN0aW9uICYmIGFjdGlvbi5pbnZva2VDYWxsYmFjayAmJiBhY3Rpb24uaW52b2tlQ2FsbGJhY2sodHJ1ZSkpO1xuICAgICAgICBzaW5vbi5zdHViKHRoaXMsICdnZXRSZWZlcmVuY2UnKTtcbiAgICAgICAgc2lub24uc3R1Yih0aGlzLCAnZ2V0Um9vdCcpLmNhbGxzRmFrZSgoKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5yb290Q29tcG9uZW50IHx8ICh0aGlzLnJvb3RDb21wb25lbnQgPSBuZXcgY29tcG9uZW50RmFjdG9yeSgpKTtcbiAgICAgICAgfSlcbiAgICAgICAgc2lub24uc3R1Yih0aGlzLCAncmVwb3J0RXJyb3InKTtcbiAgICB9XG4gICAgXG4gICAgc2V0UGFyYW1zKHBhcmFtcykge1xuICAgICAgICBPYmplY3QuYXNzaWduKHRoaXMucGFyYW1zLCBwYXJhbXMpO1xuICAgIH1cblxuICAgIGdldCgpIHtcbiAgICB9XG4gICAgXG4gICAgZW5xdWV1ZUFjdGlvbigpIHtcbiAgICB9XG5cbiAgICBjcmVhdGVDb21wb25lbnQodHlwZSwgYXR0cmlidXRlcywgY2FsbGJhY2spIHtcbiAgICAgICAgdGhpcy5jcmVhdGVDb21wb25lbnQudHlwZSA9IHR5cGU7XG4gICAgICAgIHRoaXMuY3JlYXRlQ29tcG9uZW50LmF0dHJpYnV0ZXMgPSBhdHRyaWJ1dGVzO1xuICAgICAgICAvLyBHZXQgY29tcG9uZW50IGluc3RhbmNlLlxuICAgICAgICAvLyBVc2UgZXhpc3RpbmcgY29tcG9uZW50IGluc3RhbmNlIGlmIHNldFxuICAgICAgICAvLyBDcmVhdGUgbmV3IGRlZmF1bHQgY29tcG9uZW50IGlmIGNvbXBvbmVudCBub3Qgc2V0XG4gICAgICAgIGxldCB7IGNvbXBvbmVudCB9ID0gdGhpcy5jcmVhdGVDb21wb25lbnQ7XG4gICAgICAgIGlmICghY29tcG9uZW50KSB7XG4gICAgICAgICAgICBjb21wb25lbnQgPSBuZXcgY29tcG9uZW50RmFjdG9yeShhdHRyaWJ1dGVzLCB0eXBlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuY3JlYXRlQ29tcG9uZW50LmNvbXBvbmVudCA9IG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGNhbGxiYWNrKSB7XG4gICAgICAgICAgICBjYWxsYmFjayhjb21wb25lbnQsICdTVUNDRVNTJywgWydTVUNDRVNTJ10pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBjb21wb25lbnQ7XG4gICAgfVxuICAgIGNyZWF0ZUNvbXBvbmVudHMoY29tcG9uZW50RGVmcywgY2FsbGJhY2spIHtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gY29tcG9uZW50RGVmc1xuICAgICAgICAgICAgLm1hcChkZWYgPT4gdGhpcy5jcmVhdGVDb21wb25lbnQoZGVmWzBdLCBkZWZbMV0pKVxuICAgICAgICBpZiAoY2FsbGJhY2spIHtcbiAgICAgICAgICAgIGNhbGxiYWNrKHJlc3VsdCwgJ1NVQ0NFU1MnLCByZXN1bHQubWFwKCAoKSA9PiAnU1VDQ0VTUycpKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cbiAgICBnZXRDYWxsYmFjayhjYWxsYmFjaykge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24oLi4uYXJncykge1xuICAgICAgICAgICAgY2FsbGJhY2sgJiYgY2FsbGJhY2soLi4uYXJncyk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZ2V0Q29tcG9uZW50KGlkKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnBhcmFtc1tpZF07XG4gICAgfVxuICAgIGdldFJlZmVyZW5jZSgpIHt9XG4gICAgZ2V0Um9vdCgpIHt9XG4gICAgZ2V0VG9rZW4obmFtZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5wYXJhbXNbJ3Rva2VuLicgKyBuYW1lXVxuICAgIH1cbiAgICBsb2codmFsdWUsIGVycikge1xuICAgICAgICAvKmVzbGludCBuby1jb25zb2xlOiAwKi9cbiAgICAgICAgY29uc29sZSAmJiBjb25zb2xlLmxvZyh2YWx1ZSwgZXJyKVxuICAgIH1cbiAgICByZXBvcnRFcnJvcigpIHt9XG59IiwiY29uc3Qgc2lub24gPSByZXF1aXJlKCdzaW5vbicpO1xuXG5leHBvcnQgZnVuY3Rpb24gYXBleENhbGxGYWN0b3J5KHBhcmFtcyA9IHt9KSB7XG4gICAgcmV0dXJuIG5ldyBBcGV4Q2FsbChwYXJhbXMpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYXBleFN1Y2Nlc3NSZXN1bHQocmVzcG9uc2UgPSB7fSkge1xuICAgIHJldHVybiBuZXcgQXBleENhbGxSZXN1bHQocmVzcG9uc2UpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYXBleEVycm9yUmVzdWx0KG1lc3NhZ2UpIHtcbiAgICByZXR1cm4gbmV3IEFwZXhDYWxsUmVzdWx0KG51bGwsIG1lc3NhZ2UpO1xufVxuXG5jbGFzcyBBcGV4Q2FsbCB7XG4gICAgY29uc3RydWN0b3IocmVzdWx0LCBpbnZva2VDYWxsYmFja09uRW5xdWV1ZSA9IHRydWUpIHtcbiAgICAgICAgdGhpcy5wYXJhbXMgPSBudWxsO1xuICAgICAgICB0aGlzLnJlc3VsdCA9IHJlc3VsdDtcbiAgICAgICAgdGhpcy5pbnZva2VDYWxsYmFja09uRW5xdWV1ZSA9IGludm9rZUNhbGxiYWNrT25FbnF1ZXVlO1xuICAgICAgICB0aGlzLmlzQmFja2dyb3VuZCA9IGZhbHNlO1xuICAgICAgICB0aGlzLnNldEFib3J0YWJsZSA9IGZhbHNlO1xuICAgICAgICBzaW5vbi5zdHViKHRoaXMsICdzZXRTdG9yYWJsZScpO1xuICAgICAgICBzaW5vbi5zdHViKHRoaXMsICdzZXRBYm9ydGFibGUnKTtcbiAgICB9XG4gICAgc2V0UGFyYW1zKHBhcmFtcykge1xuICAgICAgICB0aGlzLnBhcmFtcyA9IHBhcmFtcztcbiAgICB9XG4gICAgc2V0UGFyYW0oa2V5LCB2YWx1ZSkge1xuICAgICAgICB0aGlzLnBhcmFtcyA9IE9iamVjdC5hc3NpZ24odGhpcy5wYXJhbXMsIHtba2V5XSA6IHZhbHVlfSk7XG4gICAgfVxuICAgIGdldFBhcmFtcygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucGFyYW1zO1xuICAgIH1cbiAgICBzZXRDYWxsYmFjayhjdHgsIGNhbGxiYWNrKSB7XG4gICAgICAgIHRoaXMuY3R4ID0gY3R4O1xuICAgICAgICB0aGlzLmNhbGxiYWNrID0gY2FsbGJhY2s7XG4gICAgfVxuICAgIGludm9rZUNhbGxiYWNrKGZyb21FbnF1ZXVlID0gZmFsc2UpIHtcbiAgICAgICAgaWYgKGZyb21FbnF1ZXVlICYmICF0aGlzLmludm9rZUNhbGxiYWNrT25FbnF1ZXVlKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5jYWxsYmFjayAmJiB0aGlzLmNhbGxiYWNrLmJpbmQodGhpcy5jdHgpKHRoaXMucmVzdWx0KTtcbiAgICB9XG4gICAgZ2V0RXJyb3IoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnJlc3VsdC5nZXRFcnJvcigpO1xuICAgIH1cbiAgICBnZXRQYXJhbShuYW1lKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnBhcmFtcyA/IHRoaXMucGFyYW1zW25hbWVdIDogbnVsbDtcbiAgICB9XG4gICAgZ2V0UmV0dXJuVmFsdWUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnJlc3VsdDtcbiAgICB9XG4gICAgZ2V0U3RhdGUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnJlc3VsdC5nZXRTdGF0ZSgpO1xuICAgIH1cbiAgICBpc0JhY2tncm91bmQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmlzQmFja2dyb3VuZDtcbiAgICB9XG4gICAgc2V0QWJvcnRhYmxlKCkge1xuICAgIH1cbiAgICBzZXRCYWNrZ3JvdW5kKCkge1xuICAgICAgICB0aGlzLmlzQmFja2dyb3VuZCA9IHRydWU7XG4gICAgfVxuICAgIHNldFN0b3JhYmxlKCkge1xuICAgIH1cbn1cblxuY2xhc3MgQXBleENhbGxSZXN1bHQge1xuICAgIGNvbnN0cnVjdG9yKHJlc3BvbnNlLCBlcnJvck1lc3NhZ2UgPSBudWxsKSB7XG4gICAgICAgIHRoaXMucmVzcG9uc2UgPSByZXNwb25zZTtcbiAgICAgICAgdGhpcy5lcnJvck1lc3NhZ2UgPSBlcnJvck1lc3NhZ2U7XG4gICAgfVxuICAgIGdldFN0YXRlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5lcnJvck1lc3NhZ2UgPyAnRVJST1InIDogJ1NVQ0NFU1MnXG4gICAgfVxuICAgIGdldEVycm9yKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5lcnJvck1lc3NhZ2UgPyBbe21lc3NhZ2U6IHRoaXMuZXJyb3JNZXNzYWdlfV0gOiBbXVxuICAgIH1cbiAgICBnZXRSZXR1cm5WYWx1ZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucmVzcG9uc2U7XG4gICAgfVxufSIsImltcG9ydCB7IGV2ZW50RmFjdG9yeSB9IGZyb20gJy4vZXZlbnRGYWN0b3J5J1xuaW1wb3J0IHsgY29tcG9uZW50RmFjdG9yeSwgdXNlQ29tcG9uZW50QWRhcHRlcnMgfSBmcm9tICcuL2NvbXBvbmVudEZhY3RvcnknXG5pbXBvcnQgeyBhdXJhRmFjdG9yeSB9IGZyb20gJy4vYXVyYUZhY3RvcnknXG5pbXBvcnQgeyBBdXJhVXRpbCB9IGZyb20gJy4vYXVyYVV0aWwnXG5pbXBvcnQgeyBhcGV4Q2FsbEZhY3RvcnksIGFwZXhTdWNjZXNzUmVzdWx0LCBhcGV4RXJyb3JSZXN1bHQgfSBmcm9tICcuL2FwZXhDYWxsRmFjdG9yeSdcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgQXVyYVV0aWwsXG4gICAgZXZlbnRGYWN0b3J5LFxuICAgIGNvbXBvbmVudEZhY3RvcnksXG4gICAgdXNlQ29tcG9uZW50QWRhcHRlcnMsXG4gICAgYXVyYUZhY3RvcnksXG4gICAgYXBleENhbGxGYWN0b3J5LFxuICAgIGFwZXhTdWNjZXNzUmVzdWx0LFxuICAgIGFwZXhFcnJvclJlc3VsdFxufSJdLCJuYW1lcyI6WyJzaW5vbiIsInJlcXVpcmUiLCJldmVudEZhY3RvcnkiLCJwYXJhbXMiLCJFdmVudCIsIkZBS0VfRVZFTlRfTkFNRSIsImZpcmUiLCJzcHkiLCJwYXVzZSIsInByZXZlbnREZWZhdWx0IiwicmVzdW1lIiwic3RvcFByb3BhZ2F0aW9uIiwia2V5IiwidmFsdWUiLCJldmVudE5hbWUiLCJuYW1lIiwiXyIsIkRlZmF1bHRDb21wb25lbnRBZGFwdGVyIiwiV2VsbEtub3duQ29tcG9uZW50cyIsIkNvbXBvbmVudEFkYXB0ZXJzIiwiaW5zdGFuY2UiLCJjb21wb25lbnRGYWN0b3J5Rm9yQXJyYXkiLCJhcnJheU9mVHlwZXMiLCJtYXAiLCJjb21wb25lbnRGYWN0b3J5IiwidHlwZU9yQ29tcG9uZW50IiwiQXJyYXkiLCJpc0FycmF5IiwiRXJyb3IiLCJDb21wb25lbnQiLCJhZGFwdGVyTmFtZSIsInRvTG93ZXJDYXNlIiwicmVwbGFjZSIsImFkYXB0ZXIiLCJzb21lIiwic3RhcnRzV2l0aCIsIndhcm4iLCJ1c2VDb21wb25lbnRBZGFwdGVycyIsInJlZ2lzdHJhdG9yIiwicmVnaXN0ZXIiLCJjb21wb25lbnRUeXBlIiwidHlwZSIsIk9iamVjdCIsImFzc2lnbiIsImdldFN0dWIiLCJzdHViIiwiY2FsbHNGYWtlIiwic3Vic3RyaW5nIiwiZ2V0Iiwic2V0U3R1YiIsInNldCIsImZpbmRNYXAiLCJoYXNPd25Qcm9wZXJ0eSIsImNvbXBvbmVudCIsImNsYXNzTmFtZVRvQ29tcG9uZW50VmFyIiwiY2xhc3NOYW1lIiwiQXVyYVV0aWwiLCJpc0VtcHR5Iiwib2JqIiwidW5kZWZpbmVkIiwibGVuZ3RoIiwicHJvdG90eXBlIiwidG9TdHJpbmciLCJjYWxsIiwia2V5cyIsImlzVW5kZWZpbmVkT3JOdWxsIiwidmFsIiwiYXJyIiwiYXJnIiwiYXVyYUZhY3RvcnkiLCJBdXJhIiwidXRpbCIsImVucXVldWVBY3Rpb25TdHViIiwiYWN0aW9uIiwiaW52b2tlQ2FsbGJhY2siLCJyb290Q29tcG9uZW50IiwiYXR0cmlidXRlcyIsImNhbGxiYWNrIiwiY3JlYXRlQ29tcG9uZW50IiwiY29tcG9uZW50RGVmcyIsInJlc3VsdCIsImRlZiIsImlkIiwiZXJyIiwiY29uc29sZSIsImxvZyIsImFwZXhDYWxsRmFjdG9yeSIsIkFwZXhDYWxsIiwiYXBleFN1Y2Nlc3NSZXN1bHQiLCJyZXNwb25zZSIsIkFwZXhDYWxsUmVzdWx0IiwiYXBleEVycm9yUmVzdWx0IiwibWVzc2FnZSIsImludm9rZUNhbGxiYWNrT25FbnF1ZXVlIiwiaXNCYWNrZ3JvdW5kIiwic2V0QWJvcnRhYmxlIiwiY3R4IiwiZnJvbUVucXVldWUiLCJiaW5kIiwiZ2V0RXJyb3IiLCJnZXRTdGF0ZSIsImVycm9yTWVzc2FnZSIsIm1vZHVsZSIsImV4cG9ydHMiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsSUFBTUEsUUFBUUMsUUFBUSxPQUFSLENBQWQ7O0FBRUEsQUFBTyxTQUFTQyxZQUFULEdBQW1DO1FBQWJDLE1BQWEsdUVBQUosRUFBSTs7V0FDL0IsSUFBSUMsS0FBSixDQUFVRCxNQUFWLENBQVA7O0FBRUosSUFBTUUsa0JBQWtCLHVCQUF4Qjs7SUFDTUQ7bUJBQ1VELE1BQVosRUFBb0I7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
