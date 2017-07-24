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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXVyYS5qcyIsInNvdXJjZXMiOlsibGliL2V2ZW50RmFjdG9yeS5qcyIsImxpYi9jb21wb25lbnRGYWN0b3J5LmpzIiwibGliL2F1cmFVdGlsLmpzIiwibGliL2F1cmFGYWN0b3J5LmpzIiwibGliL2FwZXhDYWxsRmFjdG9yeS5qcyIsImxpYi9hdXJhLmpzIl0sInNvdXJjZXNDb250ZW50IjpbImNvbnN0IHNpbm9uID0gcmVxdWlyZSgnc2lub24nKTtcblxuZXhwb3J0IGZ1bmN0aW9uIGV2ZW50RmFjdG9yeShwYXJhbXMgPSB7fSkge1xuICAgIHJldHVybiBuZXcgRXZlbnQocGFyYW1zKTtcbn1cbmNvbnN0IEZBS0VfRVZFTlRfTkFNRSA9ICdtb2NoYS1hdXJhLWZha2UtZXZlbnQnXG5jbGFzcyBFdmVudCB7XG4gICAgY29uc3RydWN0b3IocGFyYW1zKSB7XG4gICAgICAgIHRoaXMucGFyYW1zID0gcGFyYW1zIHx8IHt9O1xuICAgICAgICB0aGlzLmZpcmUgPSBzaW5vbi5zcHkoKTtcbiAgICAgICAgdGhpcy5wYXVzZSA9IHNpbm9uLnNweSgpO1xuICAgICAgICB0aGlzLnByZXZlbnREZWZhdWx0ID0gc2lub24uc3B5KCk7XG4gICAgICAgIHRoaXMucmVzdW1lID0gc2lub24uc3B5KCk7XG4gICAgICAgIHRoaXMuc3RvcFByb3BhZ2F0aW9uID0gc2lub24uc3B5KCk7XG4gICAgfVxuICAgIHNldFBhcmFtcyhwYXJhbXMpIHtcbiAgICAgICAgdGhpcy5wYXJhbXMgPSBwYXJhbXM7XG4gICAgfVxuICAgIHNldFBhcmFtKGtleSwgdmFsdWUpIHtcbiAgICAgICAgdGhpcy5wYXJhbXNba2V5XSA9IHZhbHVlO1xuICAgIH1cbiAgICBnZXRQYXJhbXMoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnBhcmFtcztcbiAgICB9XG4gICAgZ2V0RXZlbnRUeXBlKCkge1xuICAgICAgICByZXR1cm4gJ0FQUExJQ0FUSU9OJ1xuICAgIH1cbiAgICBnZXROYW1lKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wYXJhbXMuZXZlbnROYW1lIHx8IEZBS0VfRVZFTlRfTkFNRVxuICAgIH1cbiAgICBnZXRQYXJhbShuYW1lKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnBhcmFtc1tuYW1lXVxuICAgIH1cbiAgICBnZXRQaGFzZSgpIHtcbiAgICAgICAgcmV0dXJuICdkZWZhdWx0J1xuICAgIH1cbiAgICBnZXRTb3VyY2UoKSB7XG4gICAgICAgIHJldHVybiBudWxsXG4gICAgfVxuICAgIGdldFR5cGUoKSB7XG4gICAgICAgIHJldHVybiBgYzoke0ZBS0VfRVZFTlRfTkFNRX1gXG4gICAgfVxuXG59IiwiY29uc3Qgc2lub24gPSByZXF1aXJlKCdzaW5vbicpO1xuY29uc3QgXyA9IHJlcXVpcmUoJ2xvZGFzaCcpO1xuaW1wb3J0IHsgZXZlbnRGYWN0b3J5IH0gZnJvbSAnLi9ldmVudEZhY3RvcnknXG5cbmNvbnN0IERlZmF1bHRDb21wb25lbnRBZGFwdGVyID0gJ2RlZmF1bHQnXG5jb25zdCBXZWxsS25vd25Db21wb25lbnRzID0gWydhdXJhOicsICdmb3JjZTonLCAnZm9yY2VDaGF0dGVyOicsICdsaWdodG5pbmc6JywgJ3VpOicsICdjOiddXG5cbmxldCBDb21wb25lbnRBZGFwdGVycyA9IHtcbiAgICBbRGVmYXVsdENvbXBvbmVudEFkYXB0ZXJdOiBpbnN0YW5jZSA9PiBpbnN0YW5jZVxufVxuXG5mdW5jdGlvbiBjb21wb25lbnRGYWN0b3J5Rm9yQXJyYXkocGFyYW1zLCBhcnJheU9mVHlwZXMpIHtcbiAgICByZXR1cm4gYXJyYXlPZlR5cGVzLm1hcCh0eXBlT3JDb21wb25lbnQgPT4ge1xuICAgICAgICBpZiAodHlwZU9yQ29tcG9uZW50ID09PSB0cnVlKSB7XG4gICAgICAgICAgICB0eXBlT3JDb21wb25lbnQgPSBEZWZhdWx0Q29tcG9uZW50QWRhcHRlclxuICAgICAgICB9IGVsc2UgaWYgKHR5cGVPckNvbXBvbmVudCBpbnN0YW5jZW9mIENvbXBvbmVudCkge1xuICAgICAgICAgICAgcmV0dXJuIHR5cGVPckNvbXBvbmVudDtcbiAgICAgICAgfSBlbHNlIGlmICh0eXBlT3JDb21wb25lbnQgPT09IG51bGwpIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBjb21wb25lbnRGYWN0b3J5KHBhcmFtcywgdHlwZU9yQ29tcG9uZW50KVxuICAgIH0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY29tcG9uZW50RmFjdG9yeShwYXJhbXMgPSB7fSwgdHlwZSA9IERlZmF1bHRDb21wb25lbnRBZGFwdGVyKSB7XG4gICAgaWYgKEFycmF5LmlzQXJyYXkodHlwZSkpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdVbmV4cGVjdGVkIHR5cGUgYXJndW1lbnQnKVxuICAgIH1cblxuICAgIGxldCBpbnN0YW5jZSA9IG5ldyBDb21wb25lbnQocGFyYW1zLCB0eXBlKTtcbiAgICBsZXQgYWRhcHRlck5hbWUgPSB0eXBlLnRvTG93ZXJDYXNlKCkucmVwbGFjZSgnbWFya3VwOi8vJywgJycpXG4gICAgbGV0IGFkYXB0ZXIgPSBDb21wb25lbnRBZGFwdGVyc1thZGFwdGVyTmFtZV07XG4gICAgaWYgKCFhZGFwdGVyKSB7XG4gICAgICAgIGlmICghXy5zb21lKFdlbGxLbm93bkNvbXBvbmVudHMsIG5hbWUgPT4gYWRhcHRlck5hbWUuc3RhcnRzV2l0aChuYW1lKSkpIHtcbiAgICAgICAgICAgIC8qZXNsaW50IG5vLWNvbnNvbGU6IDAqL1xuICAgICAgICAgICAgY29uc29sZS53YXJuKGBVbmFibGUgdG8gZmluZCBjb21wb25lbnQgYWRhcHRlciAke3R5cGV9YCk7XG4gICAgICAgIH1cbiAgICAgICAgYWRhcHRlciA9IENvbXBvbmVudEFkYXB0ZXJzW0RlZmF1bHRDb21wb25lbnRBZGFwdGVyXTtcbiAgICB9XG4gICAgcmV0dXJuIGFkYXB0ZXIoaW5zdGFuY2UsIHBhcmFtcyk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB1c2VDb21wb25lbnRBZGFwdGVycyhyZWdpc3RyYXRvcikge1xuICAgIGNvbnN0IHJlZ2lzdGVyID0gKGNvbXBvbmVudFR5cGUsIGFkYXB0ZXIpID0+IHtcbiAgICAgICAgY29uc3QgYWRhcHRlck5hbWUgPSBjb21wb25lbnRUeXBlLnRvTG93ZXJDYXNlKCk7XG4gICAgICAgIENvbXBvbmVudEFkYXB0ZXJzW2FkYXB0ZXJOYW1lXSA9IGFkYXB0ZXJcbiAgICB9XG4gICAgcmVnaXN0cmF0b3Ioe3JlZ2lzdGVyfSk7XG59XG5cbmNsYXNzIENvbXBvbmVudCB7XG4gICAgY29uc3RydWN0b3IocGFyYW1zLCB0eXBlKSB7XG4gICAgICAgIHRoaXMucGFyYW1zID0gT2JqZWN0LmFzc2lnbih7fSwge1xuICAgICAgICAgICAgZmluZE1hcDoge31cbiAgICAgICAgfSwgcGFyYW1zKTtcbiAgICAgICAgdGhpcy50eXBlID0gdHlwZSB8fCAnZGVmYXVsdCc7XG4gICAgICAgIHRoaXMuZ2V0U3R1YiA9IHNpbm9uLnN0dWIodGhpcywgJ2dldCcpLmNhbGxzRmFrZSgobmFtZSkgPT4ge1xuICAgICAgICAgICAgaWYgKG5hbWUuc3RhcnRzV2l0aCgndi4nKSB8fCBuYW1lLnN0YXJ0c1dpdGgoJ2MuJykgfHwgbmFtZS5zdGFydHNXaXRoKCdlLicpKSB7XG4gICAgICAgICAgICAgICAgbmFtZSA9IG5hbWUuc3Vic3RyaW5nKDIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIF8uZ2V0KHRoaXMucGFyYW1zLCBuYW1lKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy5zZXRTdHViID0gc2lub24uc3R1Yih0aGlzLCAnc2V0JykuY2FsbHNGYWtlKChuYW1lLCB2YWx1ZSkgPT4ge1xuICAgICAgICAgICAgaWYgKG5hbWUuc3RhcnRzV2l0aCgndi4nKSB8fCBuYW1lLnN0YXJ0c1dpdGgoJ2MuJykgfHwgbmFtZS5zdGFydHNXaXRoKCdlLicpKSB7XG4gICAgICAgICAgICAgICAgbmFtZSA9IG5hbWUuc3Vic3RyaW5nKDIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXy5zZXQodGhpcy5wYXJhbXMsIG5hbWUsIHZhbHVlKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHNpbm9uLnN0dWIodGhpcywgJ2FkZEV2ZW50SGFuZGxlcicpO1xuICAgICAgICBzaW5vbi5zdHViKHRoaXMsICdhZGRIYW5kbGVyJyk7XG4gICAgICAgIHNpbm9uLnN0dWIodGhpcywgJ2FkZFZhbHVlSGFuZGxlcicpO1xuICAgICAgICBzaW5vbi5zdHViKHRoaXMsICdhZGRWYWx1ZVByb3ZpZGVyJyk7XG4gICAgICAgIHNpbm9uLnN0dWIodGhpcywgJ2F1dG9EZXN0cm95Jyk7XG4gICAgICAgIHNpbm9uLnN0dWIodGhpcywgJ2Rlc3Ryb3knKTtcbiAgICAgICAgc2lub24uc3R1Yih0aGlzLCAncmVtb3ZlRXZlbnRIYW5kbGVyJyk7XG4gICAgfVxuXG4gICAgZ2V0KCkge1xuICAgIH1cbiAgICBzZXQoKSB7XG4gICAgfVxuXG4gICAgZmluZChuYW1lKSB7XG4gICAgICAgIGxldCB0eXBlT3JDb21wb25lbnQgPSB0aGlzLnBhcmFtcy5maW5kTWFwW25hbWVdO1xuICAgICAgICBpZiAoIXR5cGVPckNvbXBvbmVudCAmJiB0aGlzLnBhcmFtcy5maW5kTWFwLmhhc093blByb3BlcnR5KG5hbWUpKSB7XG4gICAgICAgICAgICByZXR1cm4gdHlwZU9yQ29tcG9uZW50O1xuICAgICAgICB9XG4gICAgICAgIGlmICh0eXBlT3JDb21wb25lbnQgaW5zdGFuY2VvZiBDb21wb25lbnQpIHtcbiAgICAgICAgICAgIHJldHVybiB0eXBlT3JDb21wb25lbnQ7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBjb21wb25lbnQgPSB0aGlzLnBhcmFtcy5maW5kTWFwW25hbWVdID0gKEFycmF5LmlzQXJyYXkodHlwZU9yQ29tcG9uZW50KSA/IFxuICAgICAgICAgICAgY29tcG9uZW50RmFjdG9yeUZvckFycmF5KHRoaXMucGFyYW1zLCB0eXBlT3JDb21wb25lbnQpIDogXG4gICAgICAgICAgICBjb21wb25lbnRGYWN0b3J5KHRoaXMucGFyYW1zLCB0eXBlT3JDb21wb25lbnQpKVxuICAgICAgICByZXR1cm4gY29tcG9uZW50O1xuICAgIH1cbiAgICBnZXRMb2NhbElkKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wYXJhbXNbJ2F1cmE6aWQnXTtcbiAgICB9XG4gICAgY2xlYXJSZWZlcmVuY2Uoa2V5KSB7XG4gICAgICAgIGRlbGV0ZSB0aGlzLnBhcmFtc1trZXldO1xuICAgIH1cbiAgICBnZXRDb25jcmV0ZUNvbXBvbmVudCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIGdldEVsZW1lbnQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICBnZXRFbGVtZW50cygpIHtcbiAgICAgICAgcmV0dXJuIFt0aGlzXTtcbiAgICB9XG4gICAgZ2V0RXZlbnQobmFtZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5wYXJhbXNbbmFtZV0gfHwgZXZlbnRGYWN0b3J5KCk7XG4gICAgfVxuICAgIGdldEdsb2JhbElkKCkge1xuICAgICAgICByZXR1cm4gYGdsb2JhbC0ke3RoaXMucGFyYW1zWydhdXJhOmlkJ119YDtcbiAgICB9XG4gICAgZ2V0TmFtZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudHlwZTtcbiAgICB9XG4gICAgZ2V0VHlwZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudHlwZTtcbiAgICB9XG4gICAgZ2V0UmVmZXJlbmNlKGtleSkge1xuICAgICAgICByZXR1cm4gdGhpcy5wYXJhbXNba2V5XTtcbiAgICB9XG4gICAgZ2V0U3VwZXIoKSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBnZXRWZXJzaW9uKCkge1xuICAgICAgICByZXR1cm4gJzEuMCc7XG4gICAgfVxuICAgIGlzQ29uY3JldGUoKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICBpc0luc3RhbmNlT2YobmFtZSkge1xuICAgICAgICByZXR1cm4gdGhpcy50eXBlID09PSBuYW1lO1xuICAgIH1cbiAgICBpc1ZhbGlkKCkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbn0iLCJjb25zdCBzaW5vbiA9IHJlcXVpcmUoJ3Npbm9uJyk7XG5cbmNvbnN0IGNsYXNzTmFtZVRvQ29tcG9uZW50VmFyID0gY2xhc3NOYW1lID0+IGB2Ll9fY2xzXyR7Y2xhc3NOYW1lfWBcbmV4cG9ydCBjbGFzcyBBdXJhVXRpbCB7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHNpbm9uLnN0dWIodGhpcywgJ2FkZENsYXNzJykuY2FsbHNGYWtlKChjb21wb25lbnQsIGNsYXNzTmFtZSkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIGNvbXBvbmVudC5zZXQoY2xhc3NOYW1lVG9Db21wb25lbnRWYXIoY2xhc3NOYW1lKSwgdHJ1ZSk7XG4gICAgICAgIH0pXG4gICAgICAgIHNpbm9uLnN0dWIodGhpcywgJ3JlbW92ZUNsYXNzJykuY2FsbHNGYWtlKChjb21wb25lbnQsIGNsYXNzTmFtZSkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIGNvbXBvbmVudC5zZXQoY2xhc3NOYW1lVG9Db21wb25lbnRWYXIoY2xhc3NOYW1lKSwgZmFsc2UpO1xuICAgICAgICB9KVxuICAgICAgICBzaW5vbi5zdHViKHRoaXMsICdoYXNDbGFzcycpLmNhbGxzRmFrZSgoY29tcG9uZW50LCBjbGFzc05hbWUpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBjb21wb25lbnQuZ2V0KGNsYXNzTmFtZVRvQ29tcG9uZW50VmFyKGNsYXNzTmFtZSkpO1xuICAgICAgICB9KVxuICAgICAgICBzaW5vbi5zdHViKHRoaXMsICd0b2dnbGVDbGFzcycpLmNhbGxzRmFrZSgoY29tcG9uZW50LCBjbGFzc05hbWUpID0+IHtcbiAgICAgICAgICAgIGNvbXBvbmVudC5zZXQoY2xhc3NOYW1lVG9Db21wb25lbnRWYXIoY2xhc3NOYW1lKSwgIWNvbXBvbmVudC5nZXQoY2xhc3NOYW1lVG9Db21wb25lbnRWYXIoY2xhc3NOYW1lKSkpO1xuICAgICAgICB9KVxuICAgICAgICB0aGlzLmlzRW1wdHkgPSBvYmogPT4ge1xuICAgICAgICAgICAgaWYgKG9iaiA9PT0gdW5kZWZpbmVkIHx8IG9iaiA9PT0gbnVsbCB8fCBvYmogPT09ICcnKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShvYmopKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG9iai5sZW5ndGggPT09IDA7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiBvYmogPT09ICdvYmplY3QnICYmIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChvYmopID09PSAnW29iamVjdCBPYmplY3RdJykge1xuICAgICAgICAgICAgICAgIHJldHVybiBPYmplY3Qua2V5cyhvYmopLmxlbmd0aCA9PT0gMDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5pc1VuZGVmaW5lZE9yTnVsbCA9IG9iaiA9PiB7XG4gICAgICAgICAgICByZXR1cm4gb2JqID09PSB1bmRlZmluZWQgfHwgb2JqID09PSBudWxsO1xuICAgICAgICB9O1xuICAgIH1cbiAgICBhZGRDbGFzcygpIHt9XG4gICAgcmVtb3ZlQ2xhc3MoKSB7fVxuICAgIGhhc0NsYXNzKCkge31cbiAgICB0b2dnbGVDbGFzcygpIHt9XG4gICAgZ2V0Qm9vbGVhblZhbHVlKHZhbCkge1xuICAgICAgICAvLyBQb3J0ZWQ6IGh0dHBzOi8vZ2l0aHViLmNvbS9mb3JjZWRvdGNvbS9hdXJhL2Jsb2IvbWFzdGVyL2F1cmEtaW1wbC9zcmMvbWFpbi9yZXNvdXJjZXMvYXVyYS91dGlsL1V0aWwuanMjTDM2NlxuICAgICAgICByZXR1cm4gdmFsICE9PSB1bmRlZmluZWQgJiYgdmFsICE9PSBudWxsICYmIHZhbCAhPT0gZmFsc2UgJiYgdmFsICE9PSAwICYmIHZhbCAhPT0gJ2ZhbHNlJyAmJiB2YWwgIT09ICcnICYmIHZhbCAhPT0gJ2YnO1xuICAgIH1cbiAgICBpc0FycmF5KGFycikge1xuICAgICAgICAvLyBQb3J0ZWQ6IGh0dHBzOi8vZ2l0aHViLmNvbS9mb3JjZWRvdGNvbS9hdXJhL2Jsb2IvbWFzdGVyL2F1cmEtaW1wbC9zcmMvbWFpbi9yZXNvdXJjZXMvYXVyYS91dGlsL1V0aWwuanMjTDE4OVxuICAgICAgICByZXR1cm4gKHR5cGVvZiBBcnJheS5pc0FycmF5ID09PSBcImZ1bmN0aW9uXCIgPyBBcnJheS5pc0FycmF5IDogZnVuY3Rpb24oYXJnKSB7XG4gICAgICAgICAgICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKGFyZykgPT09ICdbb2JqZWN0IEFycmF5XSc7XG4gICAgICAgIH0pKGFycik7XG4gICAgfVxuICAgIGlzT2JqZWN0KG9iaikge1xuICAgICAgICAvL1BvcnRlZDogaHR0cHM6Ly9naXRodWIuY29tL2ZvcmNlZG90Y29tL2F1cmEvYmxvYi9tYXN0ZXIvYXVyYS1pbXBsL3NyYy9tYWluL3Jlc291cmNlcy9hdXJhL3V0aWwvVXRpbC5qcyNMMjA0XG4gICAgICAgIHJldHVybiB0eXBlb2Ygb2JqID09PSBcIm9iamVjdFwiICYmIG9iaiAhPT0gbnVsbCAmJiAhQXJyYXkuaXNBcnJheShvYmopO1xuICAgIH1cbiAgICBpc1VuZGVmaW5lZChvYmope1xuICAgICAgICAvL1BvcnRlZDogaHR0cHM6Ly9naXRodWIuY29tL2ZvcmNlZG90Y29tL2F1cmEvYmxvYi9tYXN0ZXIvYXVyYS1pbXBsL3NyYy9tYWluL3Jlc291cmNlcy9hdXJhL3V0aWwvVXRpbC5qcyNMMzE5XG4gICAgICAgIHJldHVybiBvYmogPT09IHVuZGVmaW5lZDtcbiAgICB9XG59XG5cbiIsImNvbnN0IHNpbm9uID0gcmVxdWlyZSgnc2lub24nKTtcblxuaW1wb3J0IHsgQXVyYVV0aWwgfSBmcm9tICcuL2F1cmFVdGlsJ1xuXG5leHBvcnQgZnVuY3Rpb24gYXVyYUZhY3RvcnkocGFyYW1zID0ge30pIHtcbiAgICByZXR1cm4gbmV3IEF1cmEocGFyYW1zKTtcbn1cblxuaW1wb3J0IHsgY29tcG9uZW50RmFjdG9yeSB9IGZyb20gJy4vY29tcG9uZW50RmFjdG9yeSdcblxuY2xhc3MgQXVyYSB7XG4gICAgY29uc3RydWN0b3IocGFyYW1zKSB7XG4gICAgICAgIHRoaXMucGFyYW1zID0gcGFyYW1zO1xuICAgICAgICB0aGlzLnV0aWwgPSBuZXcgQXVyYVV0aWwoKTtcbiAgICAgICAgdGhpcy5nZXRTdHViID0gc2lub24uc3R1Yih0aGlzLCAnZ2V0JykuY2FsbHNGYWtlKChuYW1lKSA9PiBwYXJhbXNbbmFtZV0pO1xuICAgICAgICB0aGlzLnNldFN0dWIgPSBzaW5vbi5zdHViKHRoaXMsICdzZXQnKS5jYWxsc0Zha2UoKG5hbWUsIHZhbHVlKSA9PiBwYXJhbXNbbmFtZV0gPSB2YWx1ZSk7XG4gICAgICAgIHRoaXMuZW5xdWV1ZUFjdGlvblN0dWIgPSBzaW5vbi5zdHViKHRoaXMsICdlbnF1ZXVlQWN0aW9uJykuY2FsbHNGYWtlKChhY3Rpb24pID0+IGFjdGlvbiAmJiBhY3Rpb24uaW52b2tlQ2FsbGJhY2sgJiYgYWN0aW9uLmludm9rZUNhbGxiYWNrKHRydWUpKTtcbiAgICAgICAgc2lub24uc3R1Yih0aGlzLCAnZ2V0UmVmZXJlbmNlJyk7XG4gICAgICAgIHNpbm9uLnN0dWIodGhpcywgJ2dldFJvb3QnKS5jYWxsc0Zha2UoKCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMucm9vdENvbXBvbmVudCB8fCAodGhpcy5yb290Q29tcG9uZW50ID0gbmV3IGNvbXBvbmVudEZhY3RvcnkoKSk7XG4gICAgICAgIH0pXG4gICAgICAgIHNpbm9uLnN0dWIodGhpcywgJ3JlcG9ydEVycm9yJyk7XG4gICAgfVxuICAgIFxuICAgIHNldFBhcmFtcyhwYXJhbXMpIHtcbiAgICAgICAgT2JqZWN0LmFzc2lnbih0aGlzLnBhcmFtcywgcGFyYW1zKTtcbiAgICB9XG5cbiAgICBnZXQoKSB7XG4gICAgfVxuICAgIFxuICAgIGVucXVldWVBY3Rpb24oKSB7XG4gICAgfVxuXG4gICAgY3JlYXRlQ29tcG9uZW50KHR5cGUsIGF0dHJpYnV0ZXMsIGNhbGxiYWNrKSB7XG4gICAgICAgIHRoaXMuY3JlYXRlQ29tcG9uZW50LnR5cGUgPSB0eXBlO1xuICAgICAgICB0aGlzLmNyZWF0ZUNvbXBvbmVudC5hdHRyaWJ1dGVzID0gYXR0cmlidXRlcztcbiAgICAgICAgLy8gR2V0IGNvbXBvbmVudCBpbnN0YW5jZS5cbiAgICAgICAgLy8gVXNlIGV4aXN0aW5nIGNvbXBvbmVudCBpbnN0YW5jZSBpZiBzZXRcbiAgICAgICAgLy8gQ3JlYXRlIG5ldyBkZWZhdWx0IGNvbXBvbmVudCBpZiBjb21wb25lbnQgbm90IHNldFxuICAgICAgICBsZXQgeyBjb21wb25lbnQgfSA9IHRoaXMuY3JlYXRlQ29tcG9uZW50O1xuICAgICAgICBpZiAoIWNvbXBvbmVudCkge1xuICAgICAgICAgICAgY29tcG9uZW50ID0gbmV3IGNvbXBvbmVudEZhY3RvcnkoYXR0cmlidXRlcywgdHlwZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmNyZWF0ZUNvbXBvbmVudC5jb21wb25lbnQgPSBudWxsO1xuICAgICAgICB9XG4gICAgICAgIGlmIChjYWxsYmFjaykge1xuICAgICAgICAgICAgY2FsbGJhY2soY29tcG9uZW50LCAnU1VDQ0VTUycsIFsnU1VDQ0VTUyddKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gY29tcG9uZW50O1xuICAgIH1cbiAgICBjcmVhdGVDb21wb25lbnRzKGNvbXBvbmVudERlZnMsIGNhbGxiYWNrKSB7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGNvbXBvbmVudERlZnNcbiAgICAgICAgICAgIC5tYXAoZGVmID0+IHRoaXMuY3JlYXRlQ29tcG9uZW50KGRlZlswXSwgZGVmWzFdKSlcbiAgICAgICAgaWYgKGNhbGxiYWNrKSB7XG4gICAgICAgICAgICBjYWxsYmFjayhyZXN1bHQsICdTVUNDRVNTJywgcmVzdWx0Lm1hcCggKCkgPT4gJ1NVQ0NFU1MnKSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG4gICAgZ2V0Q2FsbGJhY2soY2FsbGJhY2spIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKC4uLmFyZ3MpIHtcbiAgICAgICAgICAgIGNhbGxiYWNrICYmIGNhbGxiYWNrKC4uLmFyZ3MpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGdldENvbXBvbmVudChpZCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wYXJhbXNbaWRdO1xuICAgIH1cbiAgICBnZXRSZWZlcmVuY2UoKSB7fVxuICAgIGdldFJvb3QoKSB7fVxuICAgIGdldFRva2VuKG5hbWUpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucGFyYW1zWyd0b2tlbi4nICsgbmFtZV1cbiAgICB9XG4gICAgbG9nKHZhbHVlLCBlcnIpIHtcbiAgICAgICAgLyplc2xpbnQgbm8tY29uc29sZTogMCovXG4gICAgICAgIGNvbnNvbGUgJiYgY29uc29sZS5sb2codmFsdWUsIGVycilcbiAgICB9XG4gICAgcmVwb3J0RXJyb3IoKSB7fVxufSIsImNvbnN0IHNpbm9uID0gcmVxdWlyZSgnc2lub24nKTtcblxuZXhwb3J0IGZ1bmN0aW9uIGFwZXhDYWxsRmFjdG9yeShwYXJhbXMgPSB7fSkge1xuICAgIHJldHVybiBuZXcgQXBleENhbGwocGFyYW1zKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGFwZXhTdWNjZXNzUmVzdWx0KHJlc3BvbnNlID0ge30pIHtcbiAgICByZXR1cm4gbmV3IEFwZXhDYWxsUmVzdWx0KHJlc3BvbnNlKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGFwZXhFcnJvclJlc3VsdChtZXNzYWdlKSB7XG4gICAgcmV0dXJuIG5ldyBBcGV4Q2FsbFJlc3VsdChudWxsLCBtZXNzYWdlKTtcbn1cblxuY2xhc3MgQXBleENhbGwge1xuICAgIGNvbnN0cnVjdG9yKHJlc3VsdCwgaW52b2tlQ2FsbGJhY2tPbkVucXVldWUgPSB0cnVlKSB7XG4gICAgICAgIHRoaXMucGFyYW1zID0gbnVsbDtcbiAgICAgICAgdGhpcy5yZXN1bHQgPSByZXN1bHQ7XG4gICAgICAgIHRoaXMuaW52b2tlQ2FsbGJhY2tPbkVucXVldWUgPSBpbnZva2VDYWxsYmFja09uRW5xdWV1ZTtcbiAgICAgICAgdGhpcy5pc0JhY2tncm91bmQgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5zZXRBYm9ydGFibGUgPSBmYWxzZTtcbiAgICAgICAgc2lub24uc3R1Yih0aGlzLCAnc2V0U3RvcmFibGUnKTtcbiAgICAgICAgc2lub24uc3R1Yih0aGlzLCAnc2V0QWJvcnRhYmxlJyk7XG4gICAgfVxuICAgIHNldFBhcmFtcyhwYXJhbXMpIHtcbiAgICAgICAgdGhpcy5wYXJhbXMgPSBwYXJhbXM7XG4gICAgfVxuICAgIHNldFBhcmFtKGtleSwgdmFsdWUpIHtcbiAgICAgICAgdGhpcy5wYXJhbXMgPSBPYmplY3QuYXNzaWduKHRoaXMucGFyYW1zLCB7W2tleV0gOiB2YWx1ZX0pO1xuICAgIH1cbiAgICBnZXRQYXJhbXMoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnBhcmFtcztcbiAgICB9XG4gICAgc2V0Q2FsbGJhY2soY3R4LCBjYWxsYmFjaykge1xuICAgICAgICB0aGlzLmN0eCA9IGN0eDtcbiAgICAgICAgdGhpcy5jYWxsYmFjayA9IGNhbGxiYWNrO1xuICAgIH1cbiAgICBpbnZva2VDYWxsYmFjayhmcm9tRW5xdWV1ZSA9IGZhbHNlKSB7XG4gICAgICAgIGlmIChmcm9tRW5xdWV1ZSAmJiAhdGhpcy5pbnZva2VDYWxsYmFja09uRW5xdWV1ZSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuY2FsbGJhY2sgJiYgdGhpcy5jYWxsYmFjay5iaW5kKHRoaXMuY3R4KSh0aGlzLnJlc3VsdCk7XG4gICAgfVxuICAgIGdldEVycm9yKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5yZXN1bHQuZ2V0RXJyb3IoKTtcbiAgICB9XG4gICAgZ2V0UGFyYW0obmFtZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5wYXJhbXMgPyB0aGlzLnBhcmFtc1tuYW1lXSA6IG51bGw7XG4gICAgfVxuICAgIGdldFJldHVyblZhbHVlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5yZXN1bHQ7XG4gICAgfVxuICAgIGdldFN0YXRlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5yZXN1bHQuZ2V0U3RhdGUoKTtcbiAgICB9XG4gICAgaXNCYWNrZ3JvdW5kKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5pc0JhY2tncm91bmQ7XG4gICAgfVxuICAgIHNldEFib3J0YWJsZSgpIHtcbiAgICB9XG4gICAgc2V0QmFja2dyb3VuZCgpIHtcbiAgICAgICAgdGhpcy5pc0JhY2tncm91bmQgPSB0cnVlO1xuICAgIH1cbiAgICBzZXRTdG9yYWJsZSgpIHtcbiAgICB9XG59XG5cbmNsYXNzIEFwZXhDYWxsUmVzdWx0IHtcbiAgICBjb25zdHJ1Y3RvcihyZXNwb25zZSwgZXJyb3JNZXNzYWdlID0gbnVsbCkge1xuICAgICAgICB0aGlzLnJlc3BvbnNlID0gcmVzcG9uc2U7XG4gICAgICAgIHRoaXMuZXJyb3JNZXNzYWdlID0gZXJyb3JNZXNzYWdlO1xuICAgIH1cbiAgICBnZXRTdGF0ZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZXJyb3JNZXNzYWdlID8gJ0VSUk9SJyA6ICdTVUNDRVNTJ1xuICAgIH1cbiAgICBnZXRFcnJvcigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZXJyb3JNZXNzYWdlID8gW3ttZXNzYWdlOiB0aGlzLmVycm9yTWVzc2FnZX1dIDogW11cbiAgICB9XG4gICAgZ2V0UmV0dXJuVmFsdWUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnJlc3BvbnNlO1xuICAgIH1cbn0iLCJpbXBvcnQgeyBldmVudEZhY3RvcnkgfSBmcm9tICcuL2V2ZW50RmFjdG9yeSdcbmltcG9ydCB7IGNvbXBvbmVudEZhY3RvcnksIHVzZUNvbXBvbmVudEFkYXB0ZXJzIH0gZnJvbSAnLi9jb21wb25lbnRGYWN0b3J5J1xuaW1wb3J0IHsgYXVyYUZhY3RvcnkgfSBmcm9tICcuL2F1cmFGYWN0b3J5J1xuaW1wb3J0IHsgQXVyYVV0aWwgfSBmcm9tICcuL2F1cmFVdGlsJ1xuaW1wb3J0IHsgYXBleENhbGxGYWN0b3J5LCBhcGV4U3VjY2Vzc1Jlc3VsdCwgYXBleEVycm9yUmVzdWx0IH0gZnJvbSAnLi9hcGV4Q2FsbEZhY3RvcnknXG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIEF1cmFVdGlsLFxuICAgIGV2ZW50RmFjdG9yeSxcbiAgICBjb21wb25lbnRGYWN0b3J5LFxuICAgIHVzZUNvbXBvbmVudEFkYXB0ZXJzLFxuICAgIGF1cmFGYWN0b3J5LFxuICAgIGFwZXhDYWxsRmFjdG9yeSxcbiAgICBhcGV4U3VjY2Vzc1Jlc3VsdCxcbiAgICBhcGV4RXJyb3JSZXN1bHRcbn0iXSwibmFtZXMiOlsic2lub24iLCJyZXF1aXJlIiwiZXZlbnRGYWN0b3J5IiwicGFyYW1zIiwiRXZlbnQiLCJGQUtFX0VWRU5UX05BTUUiLCJmaXJlIiwic3B5IiwicGF1c2UiLCJwcmV2ZW50RGVmYXVsdCIsInJlc3VtZSIsInN0b3BQcm9wYWdhdGlvbiIsImtleSIsInZhbHVlIiwiZXZlbnROYW1lIiwibmFtZSIsIl8iLCJEZWZhdWx0Q29tcG9uZW50QWRhcHRlciIsIldlbGxLbm93bkNvbXBvbmVudHMiLCJDb21wb25lbnRBZGFwdGVycyIsImluc3RhbmNlIiwiY29tcG9uZW50RmFjdG9yeUZvckFycmF5IiwiYXJyYXlPZlR5cGVzIiwibWFwIiwidHlwZU9yQ29tcG9uZW50IiwiQ29tcG9uZW50IiwiY29tcG9uZW50RmFjdG9yeSIsInR5cGUiLCJBcnJheSIsImlzQXJyYXkiLCJFcnJvciIsImFkYXB0ZXJOYW1lIiwidG9Mb3dlckNhc2UiLCJyZXBsYWNlIiwiYWRhcHRlciIsInNvbWUiLCJzdGFydHNXaXRoIiwid2FybiIsInVzZUNvbXBvbmVudEFkYXB0ZXJzIiwicmVnaXN0cmF0b3IiLCJyZWdpc3RlciIsImNvbXBvbmVudFR5cGUiLCJPYmplY3QiLCJhc3NpZ24iLCJnZXRTdHViIiwic3R1YiIsImNhbGxzRmFrZSIsInN1YnN0cmluZyIsImdldCIsInNldFN0dWIiLCJzZXQiLCJmaW5kTWFwIiwiaGFzT3duUHJvcGVydHkiLCJjb21wb25lbnQiLCJjbGFzc05hbWVUb0NvbXBvbmVudFZhciIsImNsYXNzTmFtZSIsIkF1cmFVdGlsIiwiaXNFbXB0eSIsIm9iaiIsInVuZGVmaW5lZCIsImxlbmd0aCIsInByb3RvdHlwZSIsInRvU3RyaW5nIiwiY2FsbCIsImtleXMiLCJpc1VuZGVmaW5lZE9yTnVsbCIsInZhbCIsImFyciIsImFyZyIsImF1cmFGYWN0b3J5IiwiQXVyYSIsInV0aWwiLCJlbnF1ZXVlQWN0aW9uU3R1YiIsImFjdGlvbiIsImludm9rZUNhbGxiYWNrIiwicm9vdENvbXBvbmVudCIsImF0dHJpYnV0ZXMiLCJjYWxsYmFjayIsImNyZWF0ZUNvbXBvbmVudCIsImNvbXBvbmVudERlZnMiLCJyZXN1bHQiLCJkZWYiLCJpZCIsImVyciIsImNvbnNvbGUiLCJsb2ciLCJhcGV4Q2FsbEZhY3RvcnkiLCJBcGV4Q2FsbCIsImFwZXhTdWNjZXNzUmVzdWx0IiwicmVzcG9uc2UiLCJBcGV4Q2FsbFJlc3VsdCIsImFwZXhFcnJvclJlc3VsdCIsIm1lc3NhZ2UiLCJpbnZva2VDYWxsYmFja09uRW5xdWV1ZSIsImlzQmFja2dyb3VuZCIsInNldEFib3J0YWJsZSIsImN0eCIsImZyb21FbnF1ZXVlIiwiYmluZCIsImdldEVycm9yIiwiZ2V0U3RhdGUiLCJlcnJvck1lc3NhZ2UiLCJtb2R1bGUiLCJleHBvcnRzIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLElBQU1BLFFBQVFDLFFBQVEsT0FBUixDQUFkOztBQUVBLEFBQU8sU0FBU0MsWUFBVCxHQUFtQztRQUFiQyxNQUFh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
