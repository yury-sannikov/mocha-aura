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
var SalesforceComponents = ['aura:', 'force:', 'forceChatter:', 'lightning:', 'ui:'];

var ComponentAdapters = defineProperty({}, DefaultComponentAdapter, function (instance) {
    return instance;
});

function componentFactory() {
    var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : DefaultComponentAdapter;

    var instance = new Component(params, type);
    var adapterName = type.toLowerCase().replace('markup://', '').replace('c:', '');
    var adapter = ComponentAdapters[adapterName];
    if (!adapter) {
        if (!_.some(SalesforceComponents, function (name) {
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXVyYS5qcyIsInNvdXJjZXMiOlsibGliL2V2ZW50RmFjdG9yeS5qcyIsImxpYi9jb21wb25lbnRGYWN0b3J5LmpzIiwibGliL2F1cmFVdGlsLmpzIiwibGliL2F1cmFGYWN0b3J5LmpzIiwibGliL2FwZXhDYWxsRmFjdG9yeS5qcyIsImxpYi9hdXJhLmpzIl0sInNvdXJjZXNDb250ZW50IjpbImNvbnN0IHNpbm9uID0gcmVxdWlyZSgnc2lub24nKTtcblxuZXhwb3J0IGZ1bmN0aW9uIGV2ZW50RmFjdG9yeShwYXJhbXMgPSB7fSkge1xuICAgIHJldHVybiBuZXcgRXZlbnQocGFyYW1zKTtcbn1cbmNvbnN0IEZBS0VfRVZFTlRfTkFNRSA9ICdtb2NoYS1hdXJhLWZha2UtZXZlbnQnXG5jbGFzcyBFdmVudCB7XG4gICAgY29uc3RydWN0b3IocGFyYW1zKSB7XG4gICAgICAgIHRoaXMucGFyYW1zID0gcGFyYW1zIHx8IHt9O1xuICAgICAgICB0aGlzLmZpcmUgPSBzaW5vbi5zcHkoKTtcbiAgICAgICAgdGhpcy5wYXVzZSA9IHNpbm9uLnNweSgpO1xuICAgICAgICB0aGlzLnByZXZlbnREZWZhdWx0ID0gc2lub24uc3B5KCk7XG4gICAgICAgIHRoaXMucmVzdW1lID0gc2lub24uc3B5KCk7XG4gICAgICAgIHRoaXMuc3RvcFByb3BhZ2F0aW9uID0gc2lub24uc3B5KCk7XG4gICAgfVxuICAgIHNldFBhcmFtcyhwYXJhbXMpIHtcbiAgICAgICAgdGhpcy5wYXJhbXMgPSBwYXJhbXM7XG4gICAgfVxuICAgIHNldFBhcmFtKGtleSwgdmFsdWUpIHtcbiAgICAgICAgdGhpcy5wYXJhbXNba2V5XSA9IHZhbHVlO1xuICAgIH1cbiAgICBnZXRQYXJhbXMoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnBhcmFtcztcbiAgICB9XG4gICAgZ2V0RXZlbnRUeXBlKCkge1xuICAgICAgICByZXR1cm4gJ0FQUExJQ0FUSU9OJ1xuICAgIH1cbiAgICBnZXROYW1lKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wYXJhbXMuZXZlbnROYW1lIHx8IEZBS0VfRVZFTlRfTkFNRVxuICAgIH1cbiAgICBnZXRQYXJhbShuYW1lKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnBhcmFtc1tuYW1lXVxuICAgIH1cbiAgICBnZXRQaGFzZSgpIHtcbiAgICAgICAgcmV0dXJuICdkZWZhdWx0J1xuICAgIH1cbiAgICBnZXRTb3VyY2UoKSB7XG4gICAgICAgIHJldHVybiBudWxsXG4gICAgfVxuICAgIGdldFR5cGUoKSB7XG4gICAgICAgIHJldHVybiBgYzoke0ZBS0VfRVZFTlRfTkFNRX1gXG4gICAgfVxuXG59IiwiY29uc3Qgc2lub24gPSByZXF1aXJlKCdzaW5vbicpO1xuY29uc3QgXyA9IHJlcXVpcmUoJ2xvZGFzaCcpO1xuaW1wb3J0IHsgZXZlbnRGYWN0b3J5IH0gZnJvbSAnLi9ldmVudEZhY3RvcnknXG5cbmNvbnN0IERlZmF1bHRDb21wb25lbnRBZGFwdGVyID0gJ2RlZmF1bHQnXG5jb25zdCBTYWxlc2ZvcmNlQ29tcG9uZW50cyA9IFsnYXVyYTonLCAnZm9yY2U6JywgJ2ZvcmNlQ2hhdHRlcjonLCAnbGlnaHRuaW5nOicsICd1aTonXVxuXG5sZXQgQ29tcG9uZW50QWRhcHRlcnMgPSB7XG4gICAgW0RlZmF1bHRDb21wb25lbnRBZGFwdGVyXTogaW5zdGFuY2UgPT4gaW5zdGFuY2Vcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNvbXBvbmVudEZhY3RvcnkocGFyYW1zID0ge30sIHR5cGUgPSBEZWZhdWx0Q29tcG9uZW50QWRhcHRlcikge1xuICAgIGxldCBpbnN0YW5jZSA9IG5ldyBDb21wb25lbnQocGFyYW1zLCB0eXBlKTtcbiAgICBsZXQgYWRhcHRlck5hbWUgPSB0eXBlLnRvTG93ZXJDYXNlKCkucmVwbGFjZSgnbWFya3VwOi8vJywgJycpLnJlcGxhY2UoJ2M6JywgJycpO1xuICAgIGxldCBhZGFwdGVyID0gQ29tcG9uZW50QWRhcHRlcnNbYWRhcHRlck5hbWVdO1xuICAgIGlmICghYWRhcHRlcikge1xuICAgICAgICBpZiAoIV8uc29tZShTYWxlc2ZvcmNlQ29tcG9uZW50cywgbmFtZSA9PiBhZGFwdGVyTmFtZS5zdGFydHNXaXRoKG5hbWUpKSkge1xuICAgICAgICAgICAgLyplc2xpbnQgbm8tY29uc29sZTogMCovXG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYFVuYWJsZSB0byBmaW5kIGNvbXBvbmVudCBhZGFwdGVyICR7dHlwZX1gKTtcbiAgICAgICAgfVxuICAgICAgICBhZGFwdGVyID0gQ29tcG9uZW50QWRhcHRlcnNbRGVmYXVsdENvbXBvbmVudEFkYXB0ZXJdO1xuICAgIH1cbiAgICByZXR1cm4gYWRhcHRlcihpbnN0YW5jZSwgcGFyYW1zKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHVzZUNvbXBvbmVudEFkYXB0ZXJzKHJlZ2lzdHJhdG9yKSB7XG4gICAgY29uc3QgcmVnaXN0ZXIgPSAoY29tcG9uZW50VHlwZSwgYWRhcHRlcikgPT4ge1xuICAgICAgICBjb25zdCBhZGFwdGVyTmFtZSA9IGNvbXBvbmVudFR5cGUudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgQ29tcG9uZW50QWRhcHRlcnNbYWRhcHRlck5hbWVdID0gYWRhcHRlclxuICAgIH1cbiAgICByZWdpc3RyYXRvcih7cmVnaXN0ZXJ9KTtcbn1cblxuY2xhc3MgQ29tcG9uZW50IHtcbiAgICBjb25zdHJ1Y3RvcihwYXJhbXMsIHR5cGUpIHtcbiAgICAgICAgdGhpcy5wYXJhbXMgPSBPYmplY3QuYXNzaWduKHt9LCB7XG4gICAgICAgICAgICBmaW5kTWFwOiB7fVxuICAgICAgICB9LCBwYXJhbXMpO1xuICAgICAgICB0aGlzLnR5cGUgPSB0eXBlIHx8ICdkZWZhdWx0JztcbiAgICAgICAgdGhpcy5nZXRTdHViID0gc2lub24uc3R1Yih0aGlzLCAnZ2V0JykuY2FsbHNGYWtlKChuYW1lKSA9PiB7XG4gICAgICAgICAgICBpZiAobmFtZS5zdGFydHNXaXRoKCd2LicpIHx8IG5hbWUuc3RhcnRzV2l0aCgnYy4nKSB8fCBuYW1lLnN0YXJ0c1dpdGgoJ2UuJykpIHtcbiAgICAgICAgICAgICAgICBuYW1lID0gbmFtZS5zdWJzdHJpbmcoMik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gXy5nZXQodGhpcy5wYXJhbXMsIG5hbWUpO1xuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLnNldFN0dWIgPSBzaW5vbi5zdHViKHRoaXMsICdzZXQnKS5jYWxsc0Zha2UoKG5hbWUsIHZhbHVlKSA9PiB7XG4gICAgICAgICAgICBpZiAobmFtZS5zdGFydHNXaXRoKCd2LicpIHx8IG5hbWUuc3RhcnRzV2l0aCgnYy4nKSB8fCBuYW1lLnN0YXJ0c1dpdGgoJ2UuJykpIHtcbiAgICAgICAgICAgICAgICBuYW1lID0gbmFtZS5zdWJzdHJpbmcoMik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBfLnNldCh0aGlzLnBhcmFtcywgbmFtZSwgdmFsdWUpO1xuICAgICAgICB9KTtcbiAgICAgICAgc2lub24uc3R1Yih0aGlzLCAnYWRkRXZlbnRIYW5kbGVyJyk7XG4gICAgICAgIHNpbm9uLnN0dWIodGhpcywgJ2FkZEhhbmRsZXInKTtcbiAgICAgICAgc2lub24uc3R1Yih0aGlzLCAnYWRkVmFsdWVIYW5kbGVyJyk7XG4gICAgICAgIHNpbm9uLnN0dWIodGhpcywgJ2FkZFZhbHVlUHJvdmlkZXInKTtcbiAgICAgICAgc2lub24uc3R1Yih0aGlzLCAnYXV0b0Rlc3Ryb3knKTtcbiAgICAgICAgc2lub24uc3R1Yih0aGlzLCAnZGVzdHJveScpO1xuICAgICAgICBzaW5vbi5zdHViKHRoaXMsICdyZW1vdmVFdmVudEhhbmRsZXInKTtcbiAgICB9XG5cbiAgICBnZXQoKSB7XG4gICAgfVxuICAgIHNldCgpIHtcbiAgICB9XG5cbiAgICBmaW5kKG5hbWUpIHtcbiAgICAgICAgbGV0IHR5cGVPckNvbXBvbmVudCA9IHRoaXMucGFyYW1zLmZpbmRNYXBbbmFtZV07XG4gICAgICAgIGlmICh0eXBlT3JDb21wb25lbnQgaW5zdGFuY2VvZiBDb21wb25lbnQpIHtcbiAgICAgICAgICAgIHJldHVybiB0eXBlT3JDb21wb25lbnQ7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCF0eXBlT3JDb21wb25lbnQgJiYgdGhpcy5wYXJhbXMuZmluZE1hcC5oYXNPd25Qcm9wZXJ0eShuYW1lKSkge1xuICAgICAgICAgICAgcmV0dXJuIHR5cGVPckNvbXBvbmVudDtcbiAgICAgICAgfVxuICAgICAgICBpZiAodHlwZU9yQ29tcG9uZW50ID09PSB0cnVlKSB7XG4gICAgICAgICAgICB0eXBlT3JDb21wb25lbnQgPSBEZWZhdWx0Q29tcG9uZW50QWRhcHRlclxuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGNvbXBvbmVudCA9IHRoaXMucGFyYW1zLmZpbmRNYXBbbmFtZV0gPSBjb21wb25lbnRGYWN0b3J5KHRoaXMucGFyYW1zLCB0eXBlT3JDb21wb25lbnQpO1xuICAgICAgICByZXR1cm4gY29tcG9uZW50O1xuICAgIH1cbiAgICBnZXRMb2NhbElkKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wYXJhbXNbJ2F1cmE6aWQnXTtcbiAgICB9XG4gICAgY2xlYXJSZWZlcmVuY2Uoa2V5KSB7XG4gICAgICAgIGRlbGV0ZSB0aGlzLnBhcmFtc1trZXldO1xuICAgIH1cbiAgICBnZXRDb25jcmV0ZUNvbXBvbmVudCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIGdldEVsZW1lbnQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICBnZXRFbGVtZW50cygpIHtcbiAgICAgICAgcmV0dXJuIFt0aGlzXTtcbiAgICB9XG4gICAgZ2V0RXZlbnQobmFtZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5wYXJhbXNbbmFtZV0gfHwgZXZlbnRGYWN0b3J5KCk7XG4gICAgfVxuICAgIGdldEdsb2JhbElkKCkge1xuICAgICAgICByZXR1cm4gYGdsb2JhbC0ke3RoaXMucGFyYW1zWydhdXJhOmlkJ119YDtcbiAgICB9XG4gICAgZ2V0TmFtZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudHlwZTtcbiAgICB9XG4gICAgZ2V0VHlwZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudHlwZTtcbiAgICB9XG4gICAgZ2V0UmVmZXJlbmNlKGtleSkge1xuICAgICAgICByZXR1cm4gdGhpcy5wYXJhbXNba2V5XTtcbiAgICB9XG4gICAgZ2V0U3VwZXIoKSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBnZXRWZXJzaW9uKCkge1xuICAgICAgICByZXR1cm4gJzEuMCc7XG4gICAgfVxuICAgIGlzQ29uY3JldGUoKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICBpc0luc3RhbmNlT2YobmFtZSkge1xuICAgICAgICByZXR1cm4gdGhpcy50eXBlID09PSBuYW1lO1xuICAgIH1cbiAgICBpc1ZhbGlkKCkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbn0iLCJjb25zdCBzaW5vbiA9IHJlcXVpcmUoJ3Npbm9uJyk7XG5cbmNvbnN0IGNsYXNzTmFtZVRvQ29tcG9uZW50VmFyID0gY2xhc3NOYW1lID0+IGB2Ll9fY2xzXyR7Y2xhc3NOYW1lfWBcbmV4cG9ydCBjbGFzcyBBdXJhVXRpbCB7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHNpbm9uLnN0dWIodGhpcywgJ2FkZENsYXNzJykuY2FsbHNGYWtlKChjb21wb25lbnQsIGNsYXNzTmFtZSkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIGNvbXBvbmVudC5zZXQoY2xhc3NOYW1lVG9Db21wb25lbnRWYXIoY2xhc3NOYW1lKSwgdHJ1ZSk7XG4gICAgICAgIH0pXG4gICAgICAgIHNpbm9uLnN0dWIodGhpcywgJ3JlbW92ZUNsYXNzJykuY2FsbHNGYWtlKChjb21wb25lbnQsIGNsYXNzTmFtZSkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIGNvbXBvbmVudC5zZXQoY2xhc3NOYW1lVG9Db21wb25lbnRWYXIoY2xhc3NOYW1lKSwgZmFsc2UpO1xuICAgICAgICB9KVxuICAgICAgICBzaW5vbi5zdHViKHRoaXMsICdoYXNDbGFzcycpLmNhbGxzRmFrZSgoY29tcG9uZW50LCBjbGFzc05hbWUpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBjb21wb25lbnQuZ2V0KGNsYXNzTmFtZVRvQ29tcG9uZW50VmFyKGNsYXNzTmFtZSkpO1xuICAgICAgICB9KVxuICAgICAgICBzaW5vbi5zdHViKHRoaXMsICd0b2dnbGVDbGFzcycpLmNhbGxzRmFrZSgoY29tcG9uZW50LCBjbGFzc05hbWUpID0+IHtcbiAgICAgICAgICAgIGNvbXBvbmVudC5zZXQoY2xhc3NOYW1lVG9Db21wb25lbnRWYXIoY2xhc3NOYW1lKSwgIWNvbXBvbmVudC5nZXQoY2xhc3NOYW1lVG9Db21wb25lbnRWYXIoY2xhc3NOYW1lKSkpO1xuICAgICAgICB9KVxuICAgICAgICB0aGlzLmlzRW1wdHkgPSBvYmogPT4ge1xuICAgICAgICAgICAgaWYgKG9iaiA9PT0gdW5kZWZpbmVkIHx8IG9iaiA9PT0gbnVsbCB8fCBvYmogPT09ICcnKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShvYmopKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG9iai5sZW5ndGggPT09IDA7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiBvYmogPT09ICdvYmplY3QnICYmIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChvYmopID09PSAnW29iamVjdCBPYmplY3RdJykge1xuICAgICAgICAgICAgICAgIHJldHVybiBPYmplY3Qua2V5cyhvYmopLmxlbmd0aCA9PT0gMDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5pc1VuZGVmaW5lZE9yTnVsbCA9IG9iaiA9PiB7XG4gICAgICAgICAgICByZXR1cm4gb2JqID09PSB1bmRlZmluZWQgfHwgb2JqID09PSBudWxsO1xuICAgICAgICB9O1xuICAgIH1cbiAgICBhZGRDbGFzcygpIHt9XG4gICAgcmVtb3ZlQ2xhc3MoKSB7fVxuICAgIGhhc0NsYXNzKCkge31cbiAgICB0b2dnbGVDbGFzcygpIHt9XG4gICAgZ2V0Qm9vbGVhblZhbHVlKHZhbCkge1xuICAgICAgICAvLyBQb3J0ZWQ6IGh0dHBzOi8vZ2l0aHViLmNvbS9mb3JjZWRvdGNvbS9hdXJhL2Jsb2IvbWFzdGVyL2F1cmEtaW1wbC9zcmMvbWFpbi9yZXNvdXJjZXMvYXVyYS91dGlsL1V0aWwuanMjTDM2NlxuICAgICAgICByZXR1cm4gdmFsICE9PSB1bmRlZmluZWQgJiYgdmFsICE9PSBudWxsICYmIHZhbCAhPT0gZmFsc2UgJiYgdmFsICE9PSAwICYmIHZhbCAhPT0gJ2ZhbHNlJyAmJiB2YWwgIT09ICcnICYmIHZhbCAhPT0gJ2YnO1xuICAgIH1cbiAgICBpc0FycmF5KGFycikge1xuICAgICAgICAvLyBQb3J0ZWQ6IGh0dHBzOi8vZ2l0aHViLmNvbS9mb3JjZWRvdGNvbS9hdXJhL2Jsb2IvbWFzdGVyL2F1cmEtaW1wbC9zcmMvbWFpbi9yZXNvdXJjZXMvYXVyYS91dGlsL1V0aWwuanMjTDE4OVxuICAgICAgICByZXR1cm4gKHR5cGVvZiBBcnJheS5pc0FycmF5ID09PSBcImZ1bmN0aW9uXCIgPyBBcnJheS5pc0FycmF5IDogZnVuY3Rpb24oYXJnKSB7XG4gICAgICAgICAgICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKGFyZykgPT09ICdbb2JqZWN0IEFycmF5XSc7XG4gICAgICAgIH0pKGFycik7XG4gICAgfVxuICAgIGlzT2JqZWN0KG9iaikge1xuICAgICAgICAvL1BvcnRlZDogaHR0cHM6Ly9naXRodWIuY29tL2ZvcmNlZG90Y29tL2F1cmEvYmxvYi9tYXN0ZXIvYXVyYS1pbXBsL3NyYy9tYWluL3Jlc291cmNlcy9hdXJhL3V0aWwvVXRpbC5qcyNMMjA0XG4gICAgICAgIHJldHVybiB0eXBlb2Ygb2JqID09PSBcIm9iamVjdFwiICYmIG9iaiAhPT0gbnVsbCAmJiAhQXJyYXkuaXNBcnJheShvYmopO1xuICAgIH1cbiAgICBpc1VuZGVmaW5lZChvYmope1xuICAgICAgICAvL1BvcnRlZDogaHR0cHM6Ly9naXRodWIuY29tL2ZvcmNlZG90Y29tL2F1cmEvYmxvYi9tYXN0ZXIvYXVyYS1pbXBsL3NyYy9tYWluL3Jlc291cmNlcy9hdXJhL3V0aWwvVXRpbC5qcyNMMzE5XG4gICAgICAgIHJldHVybiBvYmogPT09IHVuZGVmaW5lZDtcbiAgICB9XG59XG5cbiIsImNvbnN0IHNpbm9uID0gcmVxdWlyZSgnc2lub24nKTtcblxuaW1wb3J0IHsgQXVyYVV0aWwgfSBmcm9tICcuL2F1cmFVdGlsJ1xuXG5leHBvcnQgZnVuY3Rpb24gYXVyYUZhY3RvcnkocGFyYW1zID0ge30pIHtcbiAgICByZXR1cm4gbmV3IEF1cmEocGFyYW1zKTtcbn1cblxuaW1wb3J0IHsgY29tcG9uZW50RmFjdG9yeSB9IGZyb20gJy4vY29tcG9uZW50RmFjdG9yeSdcblxuY2xhc3MgQXVyYSB7XG4gICAgY29uc3RydWN0b3IocGFyYW1zKSB7XG4gICAgICAgIHRoaXMucGFyYW1zID0gcGFyYW1zO1xuICAgICAgICB0aGlzLnV0aWwgPSBuZXcgQXVyYVV0aWwoKTtcbiAgICAgICAgdGhpcy5nZXRTdHViID0gc2lub24uc3R1Yih0aGlzLCAnZ2V0JykuY2FsbHNGYWtlKChuYW1lKSA9PiBwYXJhbXNbbmFtZV0pO1xuICAgICAgICB0aGlzLnNldFN0dWIgPSBzaW5vbi5zdHViKHRoaXMsICdzZXQnKS5jYWxsc0Zha2UoKG5hbWUsIHZhbHVlKSA9PiBwYXJhbXNbbmFtZV0gPSB2YWx1ZSk7XG4gICAgICAgIHRoaXMuZW5xdWV1ZUFjdGlvblN0dWIgPSBzaW5vbi5zdHViKHRoaXMsICdlbnF1ZXVlQWN0aW9uJykuY2FsbHNGYWtlKChhY3Rpb24pID0+IGFjdGlvbiAmJiBhY3Rpb24uaW52b2tlQ2FsbGJhY2sgJiYgYWN0aW9uLmludm9rZUNhbGxiYWNrKHRydWUpKTtcbiAgICAgICAgc2lub24uc3R1Yih0aGlzLCAnZ2V0UmVmZXJlbmNlJyk7XG4gICAgICAgIHNpbm9uLnN0dWIodGhpcywgJ2dldFJvb3QnKS5jYWxsc0Zha2UoKCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMucm9vdENvbXBvbmVudCB8fCAodGhpcy5yb290Q29tcG9uZW50ID0gbmV3IGNvbXBvbmVudEZhY3RvcnkoKSk7XG4gICAgICAgIH0pXG4gICAgICAgIHNpbm9uLnN0dWIodGhpcywgJ3JlcG9ydEVycm9yJyk7XG4gICAgfVxuICAgIFxuICAgIHNldFBhcmFtcyhwYXJhbXMpIHtcbiAgICAgICAgT2JqZWN0LmFzc2lnbih0aGlzLnBhcmFtcywgcGFyYW1zKTtcbiAgICB9XG5cbiAgICBnZXQoKSB7XG4gICAgfVxuICAgIFxuICAgIGVucXVldWVBY3Rpb24oKSB7XG4gICAgfVxuXG4gICAgY3JlYXRlQ29tcG9uZW50KHR5cGUsIGF0dHJpYnV0ZXMsIGNhbGxiYWNrKSB7XG4gICAgICAgIHRoaXMuY3JlYXRlQ29tcG9uZW50LnR5cGUgPSB0eXBlO1xuICAgICAgICB0aGlzLmNyZWF0ZUNvbXBvbmVudC5hdHRyaWJ1dGVzID0gYXR0cmlidXRlcztcbiAgICAgICAgLy8gR2V0IGNvbXBvbmVudCBpbnN0YW5jZS5cbiAgICAgICAgLy8gVXNlIGV4aXN0aW5nIGNvbXBvbmVudCBpbnN0YW5jZSBpZiBzZXRcbiAgICAgICAgLy8gQ3JlYXRlIG5ldyBkZWZhdWx0IGNvbXBvbmVudCBpZiBjb21wb25lbnQgbm90IHNldFxuICAgICAgICBsZXQgeyBjb21wb25lbnQgfSA9IHRoaXMuY3JlYXRlQ29tcG9uZW50O1xuICAgICAgICBpZiAoIWNvbXBvbmVudCkge1xuICAgICAgICAgICAgY29tcG9uZW50ID0gbmV3IGNvbXBvbmVudEZhY3RvcnkoYXR0cmlidXRlcywgdHlwZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmNyZWF0ZUNvbXBvbmVudC5jb21wb25lbnQgPSBudWxsO1xuICAgICAgICB9XG4gICAgICAgIGlmIChjYWxsYmFjaykge1xuICAgICAgICAgICAgY2FsbGJhY2soY29tcG9uZW50LCAnU1VDQ0VTUycsIFsnU1VDQ0VTUyddKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gY29tcG9uZW50O1xuICAgIH1cbiAgICBjcmVhdGVDb21wb25lbnRzKGNvbXBvbmVudERlZnMsIGNhbGxiYWNrKSB7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGNvbXBvbmVudERlZnNcbiAgICAgICAgICAgIC5tYXAoZGVmID0+IHRoaXMuY3JlYXRlQ29tcG9uZW50KGRlZlswXSwgZGVmWzFdKSlcbiAgICAgICAgaWYgKGNhbGxiYWNrKSB7XG4gICAgICAgICAgICBjYWxsYmFjayhyZXN1bHQsICdTVUNDRVNTJywgcmVzdWx0Lm1hcCggKCkgPT4gJ1NVQ0NFU1MnKSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG4gICAgZ2V0Q2FsbGJhY2soY2FsbGJhY2spIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgY2FsbGJhY2sgJiYgY2FsbGJhY2soKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBnZXRDb21wb25lbnQoaWQpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucGFyYW1zW2lkXTtcbiAgICB9XG4gICAgZ2V0UmVmZXJlbmNlKCkge31cbiAgICBnZXRSb290KCkge31cbiAgICBnZXRUb2tlbihuYW1lKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnBhcmFtc1sndG9rZW4uJyArIG5hbWVdXG4gICAgfVxuICAgIGxvZyh2YWx1ZSwgZXJyKSB7XG4gICAgICAgIC8qZXNsaW50IG5vLWNvbnNvbGU6IDAqL1xuICAgICAgICBjb25zb2xlICYmIGNvbnNvbGUubG9nKHZhbHVlLCBlcnIpXG4gICAgfVxuICAgIHJlcG9ydEVycm9yKCkge31cbn0iLCJjb25zdCBzaW5vbiA9IHJlcXVpcmUoJ3Npbm9uJyk7XG5cbmV4cG9ydCBmdW5jdGlvbiBhcGV4Q2FsbEZhY3RvcnkocGFyYW1zID0ge30pIHtcbiAgICByZXR1cm4gbmV3IEFwZXhDYWxsKHBhcmFtcyk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBhcGV4U3VjY2Vzc1Jlc3VsdChyZXNwb25zZSA9IHt9KSB7XG4gICAgcmV0dXJuIG5ldyBBcGV4Q2FsbFJlc3VsdChyZXNwb25zZSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBhcGV4RXJyb3JSZXN1bHQobWVzc2FnZSkge1xuICAgIHJldHVybiBuZXcgQXBleENhbGxSZXN1bHQobnVsbCwgbWVzc2FnZSk7XG59XG5cbmNsYXNzIEFwZXhDYWxsIHtcbiAgICBjb25zdHJ1Y3RvcihyZXN1bHQsIGludm9rZUNhbGxiYWNrT25FbnF1ZXVlID0gdHJ1ZSkge1xuICAgICAgICB0aGlzLnBhcmFtcyA9IG51bGw7XG4gICAgICAgIHRoaXMucmVzdWx0ID0gcmVzdWx0O1xuICAgICAgICB0aGlzLmludm9rZUNhbGxiYWNrT25FbnF1ZXVlID0gaW52b2tlQ2FsbGJhY2tPbkVucXVldWU7XG4gICAgICAgIHRoaXMuaXNCYWNrZ3JvdW5kID0gZmFsc2U7XG4gICAgICAgIHRoaXMuc2V0QWJvcnRhYmxlID0gZmFsc2U7XG4gICAgICAgIHNpbm9uLnN0dWIodGhpcywgJ3NldFN0b3JhYmxlJyk7XG4gICAgICAgIHNpbm9uLnN0dWIodGhpcywgJ3NldEFib3J0YWJsZScpO1xuICAgIH1cbiAgICBzZXRQYXJhbXMocGFyYW1zKSB7XG4gICAgICAgIHRoaXMucGFyYW1zID0gcGFyYW1zO1xuICAgIH1cbiAgICBzZXRQYXJhbShrZXksIHZhbHVlKSB7XG4gICAgICAgIHRoaXMucGFyYW1zID0gT2JqZWN0LmFzc2lnbih0aGlzLnBhcmFtcywge1trZXldIDogdmFsdWV9KTtcbiAgICB9XG4gICAgZ2V0UGFyYW1zKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wYXJhbXM7XG4gICAgfVxuICAgIHNldENhbGxiYWNrKGN0eCwgY2FsbGJhY2spIHtcbiAgICAgICAgdGhpcy5jdHggPSBjdHg7XG4gICAgICAgIHRoaXMuY2FsbGJhY2sgPSBjYWxsYmFjaztcbiAgICB9XG4gICAgaW52b2tlQ2FsbGJhY2soZnJvbUVucXVldWUgPSBmYWxzZSkge1xuICAgICAgICBpZiAoZnJvbUVucXVldWUgJiYgIXRoaXMuaW52b2tlQ2FsbGJhY2tPbkVucXVldWUpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmNhbGxiYWNrICYmIHRoaXMuY2FsbGJhY2suYmluZCh0aGlzLmN0eCkodGhpcy5yZXN1bHQpO1xuICAgIH1cbiAgICBnZXRFcnJvcigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucmVzdWx0LmdldEVycm9yKCk7XG4gICAgfVxuICAgIGdldFBhcmFtKG5hbWUpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucGFyYW1zID8gdGhpcy5wYXJhbXNbbmFtZV0gOiBudWxsO1xuICAgIH1cbiAgICBnZXRSZXR1cm5WYWx1ZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucmVzdWx0O1xuICAgIH1cbiAgICBnZXRTdGF0ZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucmVzdWx0LmdldFN0YXRlKCk7XG4gICAgfVxuICAgIGlzQmFja2dyb3VuZCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaXNCYWNrZ3JvdW5kO1xuICAgIH1cbiAgICBzZXRBYm9ydGFibGUoKSB7XG4gICAgfVxuICAgIHNldEJhY2tncm91bmQoKSB7XG4gICAgICAgIHRoaXMuaXNCYWNrZ3JvdW5kID0gdHJ1ZTtcbiAgICB9XG4gICAgc2V0U3RvcmFibGUoKSB7XG4gICAgfVxufVxuXG5jbGFzcyBBcGV4Q2FsbFJlc3VsdCB7XG4gICAgY29uc3RydWN0b3IocmVzcG9uc2UsIGVycm9yTWVzc2FnZSA9IG51bGwpIHtcbiAgICAgICAgdGhpcy5yZXNwb25zZSA9IHJlc3BvbnNlO1xuICAgICAgICB0aGlzLmVycm9yTWVzc2FnZSA9IGVycm9yTWVzc2FnZTtcbiAgICB9XG4gICAgZ2V0U3RhdGUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmVycm9yTWVzc2FnZSA/ICdFUlJPUicgOiAnU1VDQ0VTUydcbiAgICB9XG4gICAgZ2V0RXJyb3IoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmVycm9yTWVzc2FnZSA/IFt7bWVzc2FnZTogdGhpcy5lcnJvck1lc3NhZ2V9XSA6IFtdXG4gICAgfVxuICAgIGdldFJldHVyblZhbHVlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5yZXNwb25zZTtcbiAgICB9XG59IiwiaW1wb3J0IHsgZXZlbnRGYWN0b3J5IH0gZnJvbSAnLi9ldmVudEZhY3RvcnknXG5pbXBvcnQgeyBjb21wb25lbnRGYWN0b3J5LCB1c2VDb21wb25lbnRBZGFwdGVycyB9IGZyb20gJy4vY29tcG9uZW50RmFjdG9yeSdcbmltcG9ydCB7IGF1cmFGYWN0b3J5IH0gZnJvbSAnLi9hdXJhRmFjdG9yeSdcbmltcG9ydCB7IEF1cmFVdGlsIH0gZnJvbSAnLi9hdXJhVXRpbCdcbmltcG9ydCB7IGFwZXhDYWxsRmFjdG9yeSwgYXBleFN1Y2Nlc3NSZXN1bHQsIGFwZXhFcnJvclJlc3VsdCB9IGZyb20gJy4vYXBleENhbGxGYWN0b3J5J1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBBdXJhVXRpbCxcbiAgICBldmVudEZhY3RvcnksXG4gICAgY29tcG9uZW50RmFjdG9yeSxcbiAgICB1c2VDb21wb25lbnRBZGFwdGVycyxcbiAgICBhdXJhRmFjdG9yeSxcbiAgICBhcGV4Q2FsbEZhY3RvcnksXG4gICAgYXBleFN1Y2Nlc3NSZXN1bHQsXG4gICAgYXBleEVycm9yUmVzdWx0XG59Il0sIm5hbWVzIjpbInNpbm9uIiwicmVxdWlyZSIsImV2ZW50RmFjdG9yeSIsInBhcmFtcyIsIkV2ZW50IiwiRkFLRV9FVkVOVF9OQU1FIiwiZmlyZSIsInNweSIsInBhdXNlIiwicHJldmVudERlZmF1bHQiLCJyZXN1bWUiLCJzdG9wUHJvcGFnYXRpb24iLCJrZXkiLCJ2YWx1ZSIsImV2ZW50TmFtZSIsIm5hbWUiLCJfIiwiRGVmYXVsdENvbXBvbmVudEFkYXB0ZXIiLCJTYWxlc2ZvcmNlQ29tcG9uZW50cyIsIkNvbXBvbmVudEFkYXB0ZXJzIiwiaW5zdGFuY2UiLCJjb21wb25lbnRGYWN0b3J5IiwidHlwZSIsIkNvbXBvbmVudCIsImFkYXB0ZXJOYW1lIiwidG9Mb3dlckNhc2UiLCJyZXBsYWNlIiwiYWRhcHRlciIsInNvbWUiLCJzdGFydHNXaXRoIiwid2FybiIsInVzZUNvbXBvbmVudEFkYXB0ZXJzIiwicmVnaXN0cmF0b3IiLCJyZWdpc3RlciIsImNvbXBvbmVudFR5cGUiLCJPYmplY3QiLCJhc3NpZ24iLCJnZXRTdHViIiwic3R1YiIsImNhbGxzRmFrZSIsInN1YnN0cmluZyIsImdldCIsInNldFN0dWIiLCJzZXQiLCJ0eXBlT3JDb21wb25lbnQiLCJmaW5kTWFwIiwiaGFzT3duUHJvcGVydHkiLCJjb21wb25lbnQiLCJjbGFzc05hbWVUb0NvbXBvbmVudFZhciIsImNsYXNzTmFtZSIsIkF1cmFVdGlsIiwiaXNFbXB0eSIsIm9iaiIsInVuZGVmaW5lZCIsIkFycmF5IiwiaXNBcnJheSIsImxlbmd0aCIsInByb3RvdHlwZSIsInRvU3RyaW5nIiwiY2FsbCIsImtleXMiLCJpc1VuZGVmaW5lZE9yTnVsbCIsInZhbCIsImFyciIsImFyZyIsImF1cmFGYWN0b3J5IiwiQXVyYSIsInV0aWwiLCJlbnF1ZXVlQWN0aW9uU3R1YiIsImFjdGlvbiIsImludm9rZUNhbGxiYWNrIiwicm9vdENvbXBvbmVudCIsImF0dHJpYnV0ZXMiLCJjYWxsYmFjayIsImNyZWF0ZUNvbXBvbmVudCIsImNvbXBvbmVudERlZnMiLCJyZXN1bHQiLCJtYXAiLCJkZWYiLCJpZCIsImVyciIsImNvbnNvbGUiLCJsb2ciLCJhcGV4Q2FsbEZhY3RvcnkiLCJBcGV4Q2FsbCIsImFwZXhTdWNjZXNzUmVzdWx0IiwicmVzcG9uc2UiLCJBcGV4Q2FsbFJlc3VsdCIsImFwZXhFcnJvclJlc3VsdCIsIm1lc3NhZ2UiLCJpbnZva2VDYWxsYmFja09uRW5xdWV1ZSIsImlzQmFja2dyb3VuZCIsInNldEFib3J0YWJsZSIsImN0eCIsImZyb21FbnF1ZXVlIiwiYmluZCIsImdldEVycm9yIiwiZ2V0U3RhdGUiLCJlcnJvck1lc3NhZ2UiLCJtb2R1bGUiLCJleHBvcnRzIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLElBQU1BLFFBQVFDLFFBQVEsT0FBUixDQUFkOztBQUVBLEFBQU8sU0FBU0MsWUFBVCxHQUFtQztRQUFiQyxNQUFhLHVFQUFKLEVBQUk7O1dBQy9CLElBQUlDLEtBQUosQ0FBVUQsTUFBVixDQUFQOztBQUVKLElBQU1FLGtCQUFrQix1QkFBeEI7O0lBQ01EO21CQUNVRCxNQUFaLEVBQW9COzs7YUFDWEEsTUFBTCxHQUFjQSxVQUFVLEVBQXhCO2FBQ0tHLElBQUwsR0FBWU4sTUFBTU8sR0FBTixFQUFaO2FBQ0tDLEtBQUwsR0FBYVIsTUFBTU8sR0FBTixFQUFiO2FBQ0tFLGNBQUwsR0FBc0JULE1BQU1PLEdBQU4sRUFBdEI7YUFDS0csTUFBTCxHQUFjVixNQUFNTyxHQUFOLEVBQWQ7YUFDS0ksZUFBTCxHQUF1QlgsTUFBTU8sR0FBTixFQUF2Qjs7Ozs7a0NBRU1KLFFBQVE7aUJBQ1RBLE1BQUwsR0FBY0EsTUFBZDs7OztpQ0FFS1MsS0FBS0MsT0FBTztpQkFDWlYsTUFBTCxDQUFZUyxHQUFaLElBQW1CQyxLQUFuQjs7OztvQ0FFUTttQkFDRCxLQUFLVixNQUFaOzs7O3VDQUVXO21CQUNKLGFBQVA7Ozs7a0NBRU07bUJBQ0MsS0FBS0EsTUFBTCxDQUFZVyxTQUFaLElBQXlCVCxlQUFoQzs7OztpQ0FFS1UsTUFBTTttQkFDSixLQUFLWixNQUFMLENBQVlZLElBQVosQ0FBUDs7OzttQ0FFTzttQkFDQSxTQUFQOzs7O29DQUVRO21CQUNELElBQVA7Ozs7a0NBRU07MEJBQ01WLGVBQVo7Ozs7OztBQ3hDUixJQUFNTCxV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
