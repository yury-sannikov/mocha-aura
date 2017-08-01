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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXVyYS5qcyIsInNvdXJjZXMiOlsibGliL3Npbm9uSGVscGVycy5qcyIsImxpYi9ldmVudEZhY3RvcnkuanMiLCJsaWIvY29tcG9uZW50RmFjdG9yeS5qcyIsImxpYi9hdXJhVXRpbC5qcyIsImxpYi9hdXJhRmFjdG9yeS5qcyIsImxpYi9hcGV4Q2FsbEZhY3RvcnkuanMiLCJsaWIvYXVyYS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCBzaW5vbiA9IHJlcXVpcmUoJ3Npbm9uJyk7XG5cbmV4cG9ydCBmdW5jdGlvbiBzdHViaWZ5SW5zdGFuY2UoY3RvciwgaW5zdGFuY2UpIHtcbiAgICBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyhjdG9yLnByb3RvdHlwZSkuZm9yRWFjaChwcm9wID0+IHtcbiAgICAgICAgaWYgKHR5cGVvZiBjdG9yLnByb3RvdHlwZVtwcm9wXSAhPT0gJ2Z1bmN0aW9uJyB8fCBwcm9wID09PSAnY29uc3RydWN0b3InKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgc2lub24uc3R1YihpbnN0YW5jZSwgcHJvcCkuY2FsbHNGYWtlKCgocHJvcE5hbWUpID0+ICguLi5hcmdzKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gY3Rvci5wcm90b3R5cGVbcHJvcE5hbWVdLmNhbGwoaW5zdGFuY2UsIC4uLmFyZ3MpO1xuICAgICAgICB9KShwcm9wKSlcbiAgICB9KVxufVxuIiwiaW1wb3J0IHsgc3R1YmlmeUluc3RhbmNlIH0gZnJvbSAnLi9zaW5vbkhlbHBlcnMnXG5cbmV4cG9ydCBmdW5jdGlvbiBldmVudEZhY3RvcnkocGFyYW1zID0ge30pIHtcbiAgICByZXR1cm4gbmV3IEV2ZW50KHBhcmFtcyk7XG59XG5jb25zdCBGQUtFX0VWRU5UX05BTUUgPSAnbW9jaGEtYXVyYS1mYWtlLWV2ZW50J1xuXG5jbGFzcyBFdmVudCB7XG4gICAgY29uc3RydWN0b3IocGFyYW1zKSB7XG4gICAgICAgIHRoaXMucGFyYW1zID0gcGFyYW1zIHx8IHt9O1xuICAgICAgICBzdHViaWZ5SW5zdGFuY2UoRXZlbnQsIHRoaXMpO1xuICAgIH1cbiAgICBzZXRQYXJhbXMocGFyYW1zKSB7XG4gICAgICAgIHRoaXMucGFyYW1zID0gcGFyYW1zO1xuICAgIH1cbiAgICBzZXRQYXJhbShrZXksIHZhbHVlKSB7XG4gICAgICAgIHRoaXMucGFyYW1zW2tleV0gPSB2YWx1ZTtcbiAgICB9XG4gICAgZ2V0UGFyYW1zKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wYXJhbXM7XG4gICAgfVxuICAgIGdldEV2ZW50VHlwZSgpIHtcbiAgICAgICAgcmV0dXJuICdBUFBMSUNBVElPTidcbiAgICB9XG4gICAgZ2V0TmFtZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucGFyYW1zLmV2ZW50TmFtZSB8fCBGQUtFX0VWRU5UX05BTUVcbiAgICB9XG4gICAgZ2V0UGFyYW0obmFtZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5wYXJhbXNbbmFtZV1cbiAgICB9XG4gICAgZ2V0UGhhc2UoKSB7XG4gICAgICAgIHJldHVybiAnZGVmYXVsdCdcbiAgICB9XG4gICAgZ2V0U291cmNlKCkge1xuICAgICAgICByZXR1cm4gbnVsbFxuICAgIH1cbiAgICBnZXRUeXBlKCkge1xuICAgICAgICByZXR1cm4gYGM6JHtGQUtFX0VWRU5UX05BTUV9YFxuICAgIH1cbiAgICBmaXJlKCkge31cbiAgICBwYXVzZSgpIHt9XG4gICAgcHJldmVudERlZmF1bHQoKSB7fVxuICAgIHJlc3VtZSgpIHt9XG4gICAgc3RvcFByb3BhZ2F0aW9uKCkge31cbiAgICBcblxufSIsImNvbnN0IF8gPSByZXF1aXJlKCdsb2Rhc2gnKTtcbmltcG9ydCB7IGV2ZW50RmFjdG9yeSB9IGZyb20gJy4vZXZlbnRGYWN0b3J5J1xuaW1wb3J0IHsgc3R1YmlmeUluc3RhbmNlIH0gZnJvbSAnLi9zaW5vbkhlbHBlcnMnXG5cbmNvbnN0IERlZmF1bHRDb21wb25lbnRBZGFwdGVyID0gJ2RlZmF1bHQnXG5jb25zdCBXZWxsS25vd25Db21wb25lbnRzID0gWydhdXJhOicsICdmb3JjZTonLCAnZm9yY2VDaGF0dGVyOicsICdsaWdodG5pbmc6JywgJ3VpOicsICdjOiddXG5cbmxldCBDb21wb25lbnRBZGFwdGVycyA9IHtcbiAgICBbRGVmYXVsdENvbXBvbmVudEFkYXB0ZXJdOiBpbnN0YW5jZSA9PiBpbnN0YW5jZVxufVxuXG5mdW5jdGlvbiBjb21wb25lbnRGYWN0b3J5Rm9yQXJyYXkocGFyYW1zLCBhcnJheU9mVHlwZXMpIHtcbiAgICByZXR1cm4gYXJyYXlPZlR5cGVzLm1hcCh0eXBlT3JDb21wb25lbnQgPT4gY29tcG9uZW50RmFjdG9yeShwYXJhbXMsIHR5cGVPckNvbXBvbmVudCkpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY29tcG9uZW50RmFjdG9yeShwYXJhbXMgPSB7fSwgdHlwZU9yQ29tcG9uZW50ID0gRGVmYXVsdENvbXBvbmVudEFkYXB0ZXIpIHtcbiAgICBpZiAoQXJyYXkuaXNBcnJheSh0eXBlT3JDb21wb25lbnQpKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignVW5leHBlY3RlZCB0eXBlIGFyZ3VtZW50JylcbiAgICB9XG5cbiAgICBpZiAodHlwZU9yQ29tcG9uZW50ID09PSB0cnVlKSB7XG4gICAgICAgIHR5cGVPckNvbXBvbmVudCA9IERlZmF1bHRDb21wb25lbnRBZGFwdGVyXG4gICAgfSBlbHNlIGlmICh0eXBlT3JDb21wb25lbnQgaW5zdGFuY2VvZiBDb21wb25lbnQpIHtcbiAgICAgICAgcmV0dXJuIHR5cGVPckNvbXBvbmVudDtcbiAgICB9IGVsc2UgaWYgKHR5cGVPckNvbXBvbmVudCA9PT0gbnVsbCkge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBsZXQgaW5zdGFuY2UgPSBuZXcgQ29tcG9uZW50KHBhcmFtcywgdHlwZU9yQ29tcG9uZW50KTtcbiAgICBsZXQgYWRhcHRlck5hbWUgPSB0eXBlT3JDb21wb25lbnQudG9Mb3dlckNhc2UoKS5yZXBsYWNlKCdtYXJrdXA6Ly8nLCAnJylcbiAgICBsZXQgYWRhcHRlciA9IENvbXBvbmVudEFkYXB0ZXJzW2FkYXB0ZXJOYW1lXTtcbiAgICBpZiAoIWFkYXB0ZXIpIHtcbiAgICAgICAgaWYgKCFfLnNvbWUoV2VsbEtub3duQ29tcG9uZW50cywgbmFtZSA9PiBhZGFwdGVyTmFtZS5zdGFydHNXaXRoKG5hbWUpKSkge1xuICAgICAgICAgICAgLyplc2xpbnQgbm8tY29uc29sZTogMCovXG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYFVuYWJsZSB0byBmaW5kIGNvbXBvbmVudCBhZGFwdGVyICR7dHlwZU9yQ29tcG9uZW50fWApO1xuICAgICAgICB9XG4gICAgICAgIGFkYXB0ZXIgPSBDb21wb25lbnRBZGFwdGVyc1tEZWZhdWx0Q29tcG9uZW50QWRhcHRlcl07XG4gICAgfVxuICAgIHJldHVybiBhZGFwdGVyKGluc3RhbmNlLCBwYXJhbXMpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdXNlQ29tcG9uZW50QWRhcHRlcnMocmVnaXN0cmF0b3IpIHtcbiAgICBjb25zdCByZWdpc3RlciA9IChjb21wb25lbnRUeXBlLCBhZGFwdGVyKSA9PiB7XG4gICAgICAgIGNvbnN0IGFkYXB0ZXJOYW1lID0gY29tcG9uZW50VHlwZS50b0xvd2VyQ2FzZSgpO1xuICAgICAgICBDb21wb25lbnRBZGFwdGVyc1thZGFwdGVyTmFtZV0gPSBhZGFwdGVyXG4gICAgfVxuICAgIHJlZ2lzdHJhdG9yKHtyZWdpc3Rlcn0pO1xufVxuXG5jbGFzcyBDb21wb25lbnQge1xuICAgIGNvbnN0cnVjdG9yKHBhcmFtcywgdHlwZSkge1xuICAgICAgICB0aGlzLnBhcmFtcyA9IE9iamVjdC5hc3NpZ24oe30sIHtcbiAgICAgICAgICAgIGZpbmRNYXA6IHt9XG4gICAgICAgIH0sIHBhcmFtcyk7XG4gICAgICAgIHRoaXMudHlwZSA9IHR5cGUgfHwgJ2RlZmF1bHQnO1xuICAgICAgICBzdHViaWZ5SW5zdGFuY2UoQ29tcG9uZW50LCB0aGlzKTtcbiAgICB9XG4gICAgZ2V0KG5hbWUpIHtcbiAgICAgICAgaWYgKG5hbWUuc3RhcnRzV2l0aCgndi4nKSB8fCBuYW1lLnN0YXJ0c1dpdGgoJ2MuJykgfHwgbmFtZS5zdGFydHNXaXRoKCdlLicpKSB7XG4gICAgICAgICAgICBuYW1lID0gbmFtZS5zdWJzdHJpbmcoMik7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIF8uZ2V0KHRoaXMucGFyYW1zLCBuYW1lKTtcbiAgICB9XG4gICAgc2V0KG5hbWUsIHZhbHVlKSB7XG4gICAgICAgIGlmIChuYW1lLnN0YXJ0c1dpdGgoJ3YuJykgfHwgbmFtZS5zdGFydHNXaXRoKCdjLicpIHx8IG5hbWUuc3RhcnRzV2l0aCgnZS4nKSkge1xuICAgICAgICAgICAgbmFtZSA9IG5hbWUuc3Vic3RyaW5nKDIpO1xuICAgICAgICB9XG4gICAgICAgIF8uc2V0KHRoaXMucGFyYW1zLCBuYW1lLCB2YWx1ZSk7XG4gICAgfVxuICAgIGZpbmQobmFtZSkge1xuICAgICAgICBsZXQgdHlwZU9yQ29tcG9uZW50ID0gdGhpcy5wYXJhbXMuZmluZE1hcFtuYW1lXTtcbiAgICAgICAgaWYgKCF0eXBlT3JDb21wb25lbnQgJiYgdGhpcy5wYXJhbXMuZmluZE1hcC5oYXNPd25Qcm9wZXJ0eShuYW1lKSkge1xuICAgICAgICAgICAgcmV0dXJuIHR5cGVPckNvbXBvbmVudDtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGNvbXBvbmVudCA9IHRoaXMucGFyYW1zLmZpbmRNYXBbbmFtZV0gPSAoQXJyYXkuaXNBcnJheSh0eXBlT3JDb21wb25lbnQpID8gXG4gICAgICAgICAgICBjb21wb25lbnRGYWN0b3J5Rm9yQXJyYXkodGhpcy5wYXJhbXMsIHR5cGVPckNvbXBvbmVudCkgOiBcbiAgICAgICAgICAgIGNvbXBvbmVudEZhY3RvcnkodGhpcy5wYXJhbXMsIHR5cGVPckNvbXBvbmVudCkpXG4gICAgICAgIHJldHVybiBjb21wb25lbnQ7XG4gICAgfVxuICAgIGdldExvY2FsSWQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnBhcmFtc1snYXVyYTppZCddO1xuICAgIH1cbiAgICBjbGVhclJlZmVyZW5jZShrZXkpIHtcbiAgICAgICAgZGVsZXRlIHRoaXMucGFyYW1zW2tleV07XG4gICAgfVxuICAgIGdldENvbmNyZXRlQ29tcG9uZW50KCkge1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgZ2V0RWxlbWVudCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIGdldEVsZW1lbnRzKCkge1xuICAgICAgICByZXR1cm4gW3RoaXNdO1xuICAgIH1cbiAgICBnZXRFdmVudChuYW1lKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnBhcmFtc1tuYW1lXSB8fCBldmVudEZhY3RvcnkoKTtcbiAgICB9XG4gICAgZ2V0R2xvYmFsSWQoKSB7XG4gICAgICAgIHJldHVybiBgZ2xvYmFsLSR7dGhpcy5wYXJhbXNbJ2F1cmE6aWQnXX1gO1xuICAgIH1cbiAgICBnZXROYW1lKCkge1xuICAgICAgICByZXR1cm4gdGhpcy50eXBlO1xuICAgIH1cbiAgICBnZXRUeXBlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy50eXBlO1xuICAgIH1cbiAgICBnZXRSZWZlcmVuY2Uoa2V5KSB7XG4gICAgICAgIHJldHVybiB0aGlzLnBhcmFtc1trZXldO1xuICAgIH1cbiAgICBnZXRTdXBlcigpIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGdldFZlcnNpb24oKSB7XG4gICAgICAgIHJldHVybiAnMS4wJztcbiAgICB9XG4gICAgaXNDb25jcmV0ZSgpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIGlzSW5zdGFuY2VPZihuYW1lKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnR5cGUgPT09IG5hbWU7XG4gICAgfVxuICAgIGlzVmFsaWQoKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICBhZGRFdmVudEhhbmRsZXIoKSB7fVxuICAgIGFkZEhhbmRsZXIoKSB7fVxuICAgIGFkZFZhbHVlSGFuZGxlcigpIHt9XG4gICAgYWRkVmFsdWVQcm92aWRlcigpIHt9XG4gICAgYXV0b0Rlc3Ryb3koKSB7fVxuICAgIGRlc3Ryb3koKSB7fVxuICAgIHJlbW92ZUV2ZW50SGFuZGxlcigpIHt9XG5cbn0iLCJpbXBvcnQgeyBzdHViaWZ5SW5zdGFuY2UgfSBmcm9tICcuL3Npbm9uSGVscGVycydcblxuY29uc3QgY2xhc3NOYW1lVG9Db21wb25lbnRWYXIgPSBjbGFzc05hbWUgPT4gYHYuX19jbHNfJHtjbGFzc05hbWV9YFxuZXhwb3J0IGNsYXNzIEF1cmFVdGlsIHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgc3R1YmlmeUluc3RhbmNlKEF1cmFVdGlsLCB0aGlzKTtcbiAgICB9XG4gICAgXG4gICAgaXNFbXB0eShvYmope1xuICAgICAgICBpZiAob2JqID09PSB1bmRlZmluZWQgfHwgb2JqID09PSBudWxsIHx8IG9iaiA9PT0gJycpIHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIGlmIChBcnJheS5pc0FycmF5KG9iaikpIHtcbiAgICAgICAgICAgIHJldHVybiBvYmoubGVuZ3RoID09PSAwO1xuICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiBvYmogPT09ICdvYmplY3QnICYmIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChvYmopID09PSAnW29iamVjdCBPYmplY3RdJykge1xuICAgICAgICAgICAgcmV0dXJuIE9iamVjdC5rZXlzKG9iaikubGVuZ3RoID09PSAwO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgaXNVbmRlZmluZWRPck51bGwob2JqKSB7XG4gICAgICAgIHJldHVybiBvYmogPT09IHVuZGVmaW5lZCB8fCBvYmogPT09IG51bGw7XG4gICAgfVxuICAgIGFkZENsYXNzKGNvbXBvbmVudCwgY2xhc3NOYW1lKSB7XG4gICAgICAgIHJldHVybiBjb21wb25lbnQuc2V0KGNsYXNzTmFtZVRvQ29tcG9uZW50VmFyKGNsYXNzTmFtZSksIHRydWUpO1xuICAgIH1cbiAgICByZW1vdmVDbGFzcyhjb21wb25lbnQsIGNsYXNzTmFtZSkge1xuICAgICAgICByZXR1cm4gY29tcG9uZW50LnNldChjbGFzc05hbWVUb0NvbXBvbmVudFZhcihjbGFzc05hbWUpLCBmYWxzZSk7XG4gICAgfVxuICAgIGhhc0NsYXNzKGNvbXBvbmVudCwgY2xhc3NOYW1lKSB7XG4gICAgICAgIHJldHVybiBjb21wb25lbnQuZ2V0KGNsYXNzTmFtZVRvQ29tcG9uZW50VmFyKGNsYXNzTmFtZSkpO1xuICAgIH1cbiAgICB0b2dnbGVDbGFzcyhjb21wb25lbnQsIGNsYXNzTmFtZSkge1xuICAgICAgICBjb21wb25lbnQuc2V0KGNsYXNzTmFtZVRvQ29tcG9uZW50VmFyKGNsYXNzTmFtZSksICFjb21wb25lbnQuZ2V0KGNsYXNzTmFtZVRvQ29tcG9uZW50VmFyKGNsYXNzTmFtZSkpKTtcbiAgICB9XG4gICAgZ2V0Qm9vbGVhblZhbHVlKHZhbCkge1xuICAgICAgICAvLyBQb3J0ZWQ6IGh0dHBzOi8vZ2l0aHViLmNvbS9mb3JjZWRvdGNvbS9hdXJhL2Jsb2IvbWFzdGVyL2F1cmEtaW1wbC9zcmMvbWFpbi9yZXNvdXJjZXMvYXVyYS91dGlsL1V0aWwuanMjTDM2NlxuICAgICAgICByZXR1cm4gdmFsICE9PSB1bmRlZmluZWQgJiYgdmFsICE9PSBudWxsICYmIHZhbCAhPT0gZmFsc2UgJiYgdmFsICE9PSAwICYmIHZhbCAhPT0gJ2ZhbHNlJyAmJiB2YWwgIT09ICcnICYmIHZhbCAhPT0gJ2YnO1xuICAgIH1cbiAgICBpc0FycmF5KGFycikge1xuICAgICAgICAvLyBQb3J0ZWQ6IGh0dHBzOi8vZ2l0aHViLmNvbS9mb3JjZWRvdGNvbS9hdXJhL2Jsb2IvbWFzdGVyL2F1cmEtaW1wbC9zcmMvbWFpbi9yZXNvdXJjZXMvYXVyYS91dGlsL1V0aWwuanMjTDE4OVxuICAgICAgICByZXR1cm4gKHR5cGVvZiBBcnJheS5pc0FycmF5ID09PSBcImZ1bmN0aW9uXCIgPyBBcnJheS5pc0FycmF5IDogZnVuY3Rpb24oYXJnKSB7XG4gICAgICAgICAgICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKGFyZykgPT09ICdbb2JqZWN0IEFycmF5XSc7XG4gICAgICAgIH0pKGFycik7XG4gICAgfVxuICAgIGlzT2JqZWN0KG9iaikge1xuICAgICAgICAvL1BvcnRlZDogaHR0cHM6Ly9naXRodWIuY29tL2ZvcmNlZG90Y29tL2F1cmEvYmxvYi9tYXN0ZXIvYXVyYS1pbXBsL3NyYy9tYWluL3Jlc291cmNlcy9hdXJhL3V0aWwvVXRpbC5qcyNMMjA0XG4gICAgICAgIHJldHVybiB0eXBlb2Ygb2JqID09PSBcIm9iamVjdFwiICYmIG9iaiAhPT0gbnVsbCAmJiAhQXJyYXkuaXNBcnJheShvYmopO1xuICAgIH1cbiAgICBpc1VuZGVmaW5lZChvYmope1xuICAgICAgICAvL1BvcnRlZDogaHR0cHM6Ly9naXRodWIuY29tL2ZvcmNlZG90Y29tL2F1cmEvYmxvYi9tYXN0ZXIvYXVyYS1pbXBsL3NyYy9tYWluL3Jlc291cmNlcy9hdXJhL3V0aWwvVXRpbC5qcyNMMzE5XG4gICAgICAgIHJldHVybiBvYmogPT09IHVuZGVmaW5lZDtcbiAgICB9XG59XG5cbiIsImltcG9ydCB7IHN0dWJpZnlJbnN0YW5jZSB9IGZyb20gJy4vc2lub25IZWxwZXJzJ1xuaW1wb3J0IHsgQXVyYVV0aWwgfSBmcm9tICcuL2F1cmFVdGlsJ1xuXG5leHBvcnQgZnVuY3Rpb24gYXVyYUZhY3RvcnkocGFyYW1zID0ge30pIHtcbiAgICByZXR1cm4gbmV3IEF1cmEocGFyYW1zKTtcbn1cblxuaW1wb3J0IHsgY29tcG9uZW50RmFjdG9yeSB9IGZyb20gJy4vY29tcG9uZW50RmFjdG9yeSdcblxuY2xhc3MgQXVyYSB7XG4gICAgY29uc3RydWN0b3IocGFyYW1zKSB7XG4gICAgICAgIHRoaXMucGFyYW1zID0gcGFyYW1zO1xuICAgICAgICB0aGlzLnV0aWwgPSBuZXcgQXVyYVV0aWwoKTtcbiAgICAgICAgc3R1YmlmeUluc3RhbmNlKEF1cmEsIHRoaXMpO1xuICAgIH1cbiAgICBcbiAgICBzZXRQYXJhbXMocGFyYW1zKSB7XG4gICAgICAgIE9iamVjdC5hc3NpZ24odGhpcy5wYXJhbXMsIHBhcmFtcyk7XG4gICAgfVxuXG4gICAgZ2V0KG5hbWUpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucGFyYW1zW25hbWVdO1xuICAgIH1cblxuICAgIHNldChuYW1lLCB2YWx1ZSkge1xuICAgICAgICB0aGlzLnBhcmFtc1tuYW1lXSA9IHZhbHVlO1xuICAgIH1cbiAgICBcbiAgICBlbnF1ZXVlQWN0aW9uKGFjdGlvbikge1xuICAgICAgICBhY3Rpb24gJiYgYWN0aW9uLmludm9rZUNhbGxiYWNrICYmIGFjdGlvbi5pbnZva2VDYWxsYmFjayh0cnVlKVxuICAgIH1cblxuICAgIGNyZWF0ZUNvbXBvbmVudCh0eXBlLCBhdHRyaWJ1dGVzLCBjYWxsYmFjaykge1xuICAgICAgICB0aGlzLmNyZWF0ZUNvbXBvbmVudC50eXBlID0gdHlwZTtcbiAgICAgICAgdGhpcy5jcmVhdGVDb21wb25lbnQuYXR0cmlidXRlcyA9IGF0dHJpYnV0ZXM7XG4gICAgICAgIC8vIEdldCBjb21wb25lbnQgaW5zdGFuY2UuXG4gICAgICAgIC8vIFVzZSBleGlzdGluZyBjb21wb25lbnQgaW5zdGFuY2UgaWYgc2V0XG4gICAgICAgIC8vIENyZWF0ZSBuZXcgZGVmYXVsdCBjb21wb25lbnQgaWYgY29tcG9uZW50IG5vdCBzZXRcbiAgICAgICAgbGV0IHsgY29tcG9uZW50IH0gPSB0aGlzLmNyZWF0ZUNvbXBvbmVudDtcbiAgICAgICAgaWYgKCFjb21wb25lbnQpIHtcbiAgICAgICAgICAgIGNvbXBvbmVudCA9IG5ldyBjb21wb25lbnRGYWN0b3J5KGF0dHJpYnV0ZXMsIHR5cGUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5jcmVhdGVDb21wb25lbnQuY29tcG9uZW50ID0gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBpZiAoY2FsbGJhY2spIHtcbiAgICAgICAgICAgIGNhbGxiYWNrKGNvbXBvbmVudCwgJ1NVQ0NFU1MnLCBbJ1NVQ0NFU1MnXSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGNvbXBvbmVudDtcbiAgICB9XG4gICAgY3JlYXRlQ29tcG9uZW50cyhjb21wb25lbnREZWZzLCBjYWxsYmFjaykge1xuICAgICAgICBjb25zdCByZXN1bHQgPSBjb21wb25lbnREZWZzXG4gICAgICAgICAgICAubWFwKGRlZiA9PiB0aGlzLmNyZWF0ZUNvbXBvbmVudChkZWZbMF0sIGRlZlsxXSkpXG4gICAgICAgIGlmIChjYWxsYmFjaykge1xuICAgICAgICAgICAgY2FsbGJhY2socmVzdWx0LCAnU1VDQ0VTUycsIHJlc3VsdC5tYXAoICgpID0+ICdTVUNDRVNTJykpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuICAgIGdldENhbGxiYWNrKGNhbGxiYWNrKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiguLi5hcmdzKSB7XG4gICAgICAgICAgICBjYWxsYmFjayAmJiBjYWxsYmFjayguLi5hcmdzKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBnZXRDb21wb25lbnQoaWQpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucGFyYW1zW2lkXTtcbiAgICB9XG4gICAgZ2V0UmVmZXJlbmNlKCkge31cbiAgICBnZXRSb290KCkge1xuICAgICAgICByZXR1cm4gdGhpcy5yb290Q29tcG9uZW50IHx8ICh0aGlzLnJvb3RDb21wb25lbnQgPSBuZXcgY29tcG9uZW50RmFjdG9yeSgpKTtcbiAgICB9XG4gICAgZ2V0VG9rZW4obmFtZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5wYXJhbXNbJ3Rva2VuLicgKyBuYW1lXVxuICAgIH1cbiAgICBsb2codmFsdWUsIGVycikge1xuICAgICAgICAvKmVzbGludCBuby1jb25zb2xlOiAwKi9cbiAgICAgICAgY29uc29sZSAmJiBjb25zb2xlLmxvZyh2YWx1ZSwgZXJyKVxuICAgIH1cbiAgICByZXBvcnRFcnJvcigpIHt9XG59IiwiaW1wb3J0IHsgc3R1YmlmeUluc3RhbmNlIH0gZnJvbSAnLi9zaW5vbkhlbHBlcnMnXG5cbmV4cG9ydCBmdW5jdGlvbiBhcGV4Q2FsbEZhY3RvcnkocGFyYW1zID0ge30pIHtcbiAgICByZXR1cm4gbmV3IEFwZXhDYWxsKHBhcmFtcyk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBhcGV4U3VjY2Vzc1Jlc3VsdChyZXNwb25zZSA9IHt9KSB7XG4gICAgcmV0dXJuIG5ldyBBcGV4Q2FsbFJlc3VsdChyZXNwb25zZSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBhcGV4RXJyb3JSZXN1bHQobWVzc2FnZSkge1xuICAgIHJldHVybiBuZXcgQXBleENhbGxSZXN1bHQobnVsbCwgbWVzc2FnZSk7XG59XG5cbmNsYXNzIEFwZXhDYWxsIHtcbiAgICBjb25zdHJ1Y3RvcihyZXN1bHQsIGludm9rZUNhbGxiYWNrT25FbnF1ZXVlID0gdHJ1ZSkge1xuICAgICAgICB0aGlzLnBhcmFtcyA9IG51bGw7XG4gICAgICAgIHRoaXMucmVzdWx0ID0gcmVzdWx0O1xuICAgICAgICB0aGlzLmludm9rZUNhbGxiYWNrT25FbnF1ZXVlID0gaW52b2tlQ2FsbGJhY2tPbkVucXVldWU7XG4gICAgICAgIHRoaXMuaXNCYWNrZ3JvdW5kID0gZmFsc2U7XG4gICAgICAgIHRoaXMuc2V0QWJvcnRhYmxlID0gZmFsc2U7XG4gICAgICAgIHN0dWJpZnlJbnN0YW5jZShBcGV4Q2FsbCwgdGhpcyk7XG4gICAgfVxuICAgIHNldFBhcmFtcyhwYXJhbXMpIHtcbiAgICAgICAgdGhpcy5wYXJhbXMgPSBwYXJhbXM7XG4gICAgfVxuICAgIHNldFBhcmFtKGtleSwgdmFsdWUpIHtcbiAgICAgICAgdGhpcy5wYXJhbXMgPSBPYmplY3QuYXNzaWduKHRoaXMucGFyYW1zLCB7W2tleV0gOiB2YWx1ZX0pO1xuICAgIH1cbiAgICBnZXRQYXJhbXMoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnBhcmFtcztcbiAgICB9XG4gICAgc2V0Q2FsbGJhY2soY3R4LCBjYWxsYmFjaykge1xuICAgICAgICB0aGlzLmN0eCA9IGN0eDtcbiAgICAgICAgdGhpcy5jYWxsYmFjayA9IGNhbGxiYWNrO1xuICAgIH1cbiAgICBpbnZva2VDYWxsYmFjayhmcm9tRW5xdWV1ZSA9IGZhbHNlKSB7XG4gICAgICAgIGlmIChmcm9tRW5xdWV1ZSAmJiAhdGhpcy5pbnZva2VDYWxsYmFja09uRW5xdWV1ZSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuY2FsbGJhY2sgJiYgdGhpcy5jYWxsYmFjay5iaW5kKHRoaXMuY3R4KSh0aGlzLnJlc3VsdCk7XG4gICAgfVxuICAgIGdldEVycm9yKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5yZXN1bHQuZ2V0RXJyb3IoKTtcbiAgICB9XG4gICAgZ2V0UGFyYW0obmFtZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5wYXJhbXMgPyB0aGlzLnBhcmFtc1tuYW1lXSA6IG51bGw7XG4gICAgfVxuICAgIGdldFJldHVyblZhbHVlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5yZXN1bHQ7XG4gICAgfVxuICAgIGdldFN0YXRlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5yZXN1bHQuZ2V0U3RhdGUoKTtcbiAgICB9XG4gICAgaXNCYWNrZ3JvdW5kKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5pc0JhY2tncm91bmQ7XG4gICAgfVxuICAgIHNldEFib3J0YWJsZSgpIHtcbiAgICB9XG4gICAgc2V0QmFja2dyb3VuZCgpIHtcbiAgICAgICAgdGhpcy5pc0JhY2tncm91bmQgPSB0cnVlO1xuICAgIH1cbiAgICBzZXRTdG9yYWJsZSgpIHtcbiAgICB9XG59XG5cbmNsYXNzIEFwZXhDYWxsUmVzdWx0IHtcbiAgICBjb25zdHJ1Y3RvcihyZXNwb25zZSwgZXJyb3JNZXNzYWdlID0gbnVsbCkge1xuICAgICAgICB0aGlzLnJlc3BvbnNlID0gcmVzcG9uc2U7XG4gICAgICAgIHRoaXMuZXJyb3JNZXNzYWdlID0gZXJyb3JNZXNzYWdlO1xuICAgICAgICBzdHViaWZ5SW5zdGFuY2UoQXBleENhbGxSZXN1bHQsIHRoaXMpO1xuICAgIH1cbiAgICBnZXRTdGF0ZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZXJyb3JNZXNzYWdlID8gJ0VSUk9SJyA6ICdTVUNDRVNTJ1xuICAgIH1cbiAgICBnZXRFcnJvcigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZXJyb3JNZXNzYWdlID8gW3ttZXNzYWdlOiB0aGlzLmVycm9yTWVzc2FnZX1dIDogW11cbiAgICB9XG4gICAgZ2V0UmV0dXJuVmFsdWUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnJlc3BvbnNlO1xuICAgIH1cbn0iLCJpbXBvcnQgeyBldmVudEZhY3RvcnkgfSBmcm9tICcuL2V2ZW50RmFjdG9yeSdcbmltcG9ydCB7IGNvbXBvbmVudEZhY3RvcnksIHVzZUNvbXBvbmVudEFkYXB0ZXJzIH0gZnJvbSAnLi9jb21wb25lbnRGYWN0b3J5J1xuaW1wb3J0IHsgYXVyYUZhY3RvcnkgfSBmcm9tICcuL2F1cmFGYWN0b3J5J1xuaW1wb3J0IHsgQXVyYVV0aWwgfSBmcm9tICcuL2F1cmFVdGlsJ1xuaW1wb3J0IHsgYXBleENhbGxGYWN0b3J5LCBhcGV4U3VjY2Vzc1Jlc3VsdCwgYXBleEVycm9yUmVzdWx0IH0gZnJvbSAnLi9hcGV4Q2FsbEZhY3RvcnknXG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIEF1cmFVdGlsLFxuICAgIGV2ZW50RmFjdG9yeSxcbiAgICBjb21wb25lbnRGYWN0b3J5LFxuICAgIHVzZUNvbXBvbmVudEFkYXB0ZXJzLFxuICAgIGF1cmFGYWN0b3J5LFxuICAgIGFwZXhDYWxsRmFjdG9yeSxcbiAgICBhcGV4U3VjY2Vzc1Jlc3VsdCxcbiAgICBhcGV4RXJyb3JSZXN1bHRcbn0iXSwibmFtZXMiOlsic2lub24iLCJyZXF1aXJlIiwic3R1YmlmeUluc3RhbmNlIiwiY3RvciIsImluc3RhbmNlIiwiZ2V0T3duUHJvcGVydHlOYW1lcyIsInByb3RvdHlwZSIsImZvckVhY2giLCJwcm9wIiwic3R1YiIsImNhbGxzRmFrZSIsInByb3BOYW1lIiwiYXJncyIsImNhbGwiLCJldmVudEZhY3RvcnkiLCJwYXJhbXMiLCJFdmVudCIsIkZBS0VfRVZFTlRfTkFNRSIsImtleSIsInZhbHVlIiwiZXZlbnROYW1lIiwibmFtZSIsIl8iLCJEZWZhdWx0Q29tcG9uZW50QWRhcHRlciIsIldlbGxLbm93bkNvbXBvbmVudHMiLCJDb21wb25lbnRBZGFwdGVycyIsImNvbXBvbmVudEZhY3RvcnlGb3JBcnJheSIsImFycmF5T2ZUeXBlcyIsIm1hcCIsImNvbXBvbmVudEZhY3RvcnkiLCJ0eXBlT3JDb21wb25lbnQiLCJBcnJheSIsImlzQXJyYXkiLCJFcnJvciIsIkNvbXBvbmVudCIsImFkYXB0ZXJOYW1lIiwidG9Mb3dlckNhc2UiLCJyZXBsYWNlIiwiYWRhcHRlciIsInNvbWUiLCJzdGFydHNXaXRoIiwid2FybiIsInVzZUNvbXBvbmVudEFkYXB0ZXJzIiwicmVnaXN0cmF0b3IiLCJyZWdpc3RlciIsImNvbXBvbmVudFR5cGUiLCJ0eXBlIiwiT2JqZWN0IiwiYXNzaWduIiwic3Vic3RyaW5nIiwiZ2V0Iiwic2V0IiwiZmluZE1hcCIsImhhc093blByb3BlcnR5IiwiY29tcG9uZW50IiwiY2xhc3NOYW1lVG9Db21wb25lbnRWYXIiLCJjbGFzc05hbWUiLCJBdXJhVXRpbCIsIm9iaiIsInVuZGVmaW5lZCIsImxlbmd0aCIsInRvU3RyaW5nIiwia2V5cyIsInZhbCIsImFyciIsImFyZyIsImF1cmFGYWN0b3J5IiwiQXVyYSIsInV0aWwiLCJhY3Rpb24iLCJpbnZva2VDYWxsYmFjayIsImF0dHJpYnV0ZXMiLCJjYWxsYmFjayIsImNyZWF0ZUNvbXBvbmVudCIsImNvbXBvbmVudERlZnMiLCJyZXN1bHQiLCJkZWYiLCJpZCIsInJvb3RDb21wb25lbnQiLCJlcnIiLCJjb25zb2xlIiwibG9nIiwiYXBleENhbGxGYWN0b3J5IiwiQXBleENhbGwiLCJhcGV4U3VjY2Vzc1Jlc3VsdCIsInJlc3BvbnNlIiwiQXBleENhbGxSZXN1bHQiLCJhcGV4RXJyb3JSZXN1bHQiLCJtZXNzYWdlIiwiaW52b2tlQ2FsbGJhY2tPbkVucXVldWUiLCJpc0JhY2tncm91bmQiLCJzZXRBYm9ydGFibGUiLCJjdHgiLCJmcm9tRW5xdWV1ZSIsImJpbmQiLCJnZXRFcnJvciIsImdldFN0YXRlIiwiZXJyb3JNZXNzYWdlIiwibW9kdWxlIiwiZXhwb3J0cyJdLCJtYXBwaW5ncyI6IkFBQUEsSUFBTUEsUUFBUUMsUUFBUSxPQUFSLENBQWQ7O0FBRUEsQUFBTyxTQUFTQyxlQUFULENBQXlCQyxJQUF6QixFQUErQkMsUUFBL0IsRUFBeUM7V0FDckNDLG1CQUFQLENBQTJCRixLQUFLRyxTQUFoQyxFQUEyQ0MsT0FBM0MsQ0FBbUQsZ0JBQVE7WUFDbkQsT0FBT0osS0FBS0csU0FBTCxDQUFlRSxJQUFmLENBQVAsS0FBZ0MsVUFBaEMsSUFBOENBLFNBQVMsYUFBM0QsRUFBMEU7OztjQUdwRUMsSUFBTixDQUFXTCxRQUFYLEVBQXFCSSxJQUFyQixFQUEyQkUsU0FBM0IsQ0FBc0MsVUFBQ0MsUUFBRDttQkFBYyxZQUFhOzs7a0RBQVRDLElBQVM7d0JBQUE7Ozt1QkFDdEQsOEJBQUtOLFNBQUwsQ0FBZUssUUFBZixHQUF5QkUsSUFBekIsK0JBQThCVCxRQUE5QixTQUEyQ1EsSUFBM0MsRUFBUDthQURrQztTQUFELENBRWxDSixJQUZrQyxDQUFyQztLQUpKOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQ0RHLFNBQVNNLFlBQVQsR0FBbUM7UUFBYkMsTUFBYSx1RUFBSixFQUFJOztXQUMvQixJQUFJQyxLQUFKLENBQVVELE1BQVYsQ0FBUDs7QUFFSixJQUFNRSxrQkFBa0IsdUJBQXhCOztJQUVNRDttQkFDVUQsTUFBWixFQUFvQjs7O2FBQ1hBLE1BQUwsR0FBY0EsVUFBVSxFQUF4Qjt3QkFDZ0JDLEtBQWhCLEVBQXVCLElBQXZCOzs7OztrQ0FFTUQsUUFBUTtpQkFDVEEsTUFBTCxHQUFjQSxNQUFkOzs7O2lDQUVLRyxLQUFLQyxPQUFPO2lCQUNaSixNQUFMLENBQVlHLEdBQVosSUFBbUJDLEtBQW5COzs7O29DQUVRO21CQUNELEtBQUtKLE1BQVo7Ozs7dUNBRVc7bUJBQ0osYUFBUDs7OztrQ0FFTTttQkFDQyxLQUFLQSxNQUFMLENBQVlLLFNBQVosSUFBeUJILGVBQWhDOzs7O2lDQUVLSSxNQUFNO21CQUNKLEtBQUtOLE1BQUwsQ0FBWU0sSUFBWixDQUFQOzs7O21DQUVPO21CQUNBLFNBQVA7Ozs7b0NBRVE7bUJBQ0QsSUFBUDs7OztrQ0FFTTswQkFDTUosZUFBWjs7OzsrQkFFRzs7O2dDQUNDOzs7eUNBQ1M7OztpQ0FDUjs7OzBDQUNTOzs7OztBQzNDdEIsSUFBTUssSUFBSXJCLFFBQVEsUUFBUixDQUFWO0FBQ0EsQUFHQSxJQUFNc0IsMEJBQTBCLFNBQWhDO0FBQ0EsSUFBTUMsc0JBQXNCLENBQUMsT0FBRCxFQUFVLFFBQVYsRUFBb0IsZUFBcEIsRUFBcUMsWUFBckMsRUFBbUQsS0FBbkQsRUFBMEQsSUFBMUQsQ0FBNUI7O0FBRUEsSUFBSUMsdUNBQ0NGLHVCQURELEVBQzJCO1dBQVluQixRQUFaO0NBRDNCLENBQUo7O0FBSUEsU0FBU3NCLHdCQUFULENBQWtDWCxNQUFsQyxFQUEwQ1ksWUFBMUMsRUFBd0Q7V0FDN0NBLGFBQWFDLEdBQWIsQ0FBaUI7ZUFBbUJDLGlCQUFpQmQsTUFBakIsRUFBeUJlLGVBQXpCLENBQW5CO0tBQWpCLENBQVA7OztBQUdKLEFBQU8sU0FBU0QsZ0JBQVQsR0FBa0Y7UUFBeERkLE1BQXdELHVFQUEvQyxFQUErQztRQUEzQ2UsZUFBMkMsdUVBQXpCUCx1QkFBeUI7O1FBQ2pGUSxNQUFNQyxPQUFOLENBQWNGLGVBQWQsQ0FBSixFQUFvQztjQUMxQixJQUFJRyxLQUFKLENBQVUsMEJBQVYsQ0FBTjs7O1FBR0FILG9CQUFvQixJQUF4QixFQUE4QjswQkFDUlAsdUJBQWxCO0tBREosTUFFTyxJQUFJTywyQkFBMkJJLFNBQS9CLEVBQTBDO2VBQ3RDSixlQUFQO0tBREcsTUFFQSxJQUFJQSxvQkFBb0IsSUFBeEIsRUFBOEI7ZUFDMUIsSUFBUDs7O1FBR0ExQixXQUFXLElBQUk4QixTQUFKLENBQWNuQixNQUFkLEVBQXNCZSxlQUF0QixDQUFmO1FBQ0lLLGNBQWNMLGdCQUFnQk0sV0FBaEIsR0FBOEJDLE9BQTlCLENBQXNDLFdBQXRDLEVBQW1ELEVBQW5ELENBQWxCO1FBQ0lDLFVBQVViLGtCQUFrQlUsV0FBbEIsQ0FBZDtRQUNJLENBQUNHLE9BQUwsRUFBYztZQUNOLENBQUNoQixFQUFFaUIsSUFBRixDQUFPZixtQkFBUCxFQUE0QjttQkFBUVcsWUFBWUssVUFBWixDQUF1Qm5CLElBQXZCLENBQVI7U0FBNUIsQ0FBTCxFQUF3RTs7b0JBRTVEb0IsSUFBUix1Q0FBaURYLGVBQWpEOztrQkFFTUwsa0JBQWtCRix1QkFBbEIsQ0FBVjs7V0FFR2UsUUFBUWxDLFFBQVIsRUFBa0JXLE1BQWxCLENBQVA7OztBQUdKLEFBQU8sU0FBUzJCLG9CQUFULENBQThCQyxXQUE5QixFQUEyQztRQUN4Q0MsV0FBVyxTQUFYQSxRQUFXLENBQUNDLGFBQUQsRUFBZ0JQLE9BQWhCLEVBQTRCO1lBQ25DSCxjQUFjVSxjQUFjVCxXQUFkLEVBQXBCOzBCQUNrQkQsV0FBbEIsSUFBaUNHLE9BQWpDO0tBRko7Z0JBSVksRUFBQ00sa0JBQUQsRUFBWjs7O0lBR0VWO3VCQUNVbkIsTUFBWixFQUFvQitCLElBQXBCLEVBQTBCOzs7YUFDakIvQixNQUFMLEdBQWNnQyxPQUFPQyxNQUFQLENBQWMsRUFBZCxFQUFrQjtxQkFDbkI7U0FEQyxFQUVYakMsTUFGVyxDQUFkO2FBR0srQixJQUFMLEdBQVlBLFFBQVEsU0FBcEI7d0JBQ2dCWixTQUFoQixFQUEyQixJQUEzQjs7Ozs7K0JBRUFiLE1BQU07Z0JBQ0ZBLEtBQUttQixVQUFMLENBQWdCLElBQWhCLEtBQXlCbkIsS0FBS21CLFVBQUwsQ0FBZ0IsSUFBaEIsQ0FBekIsSUFBa0RuQixLQUFLbUIsVUFBTCxDQUFnQixJQUFoQixDQUF0RCxFQUE2RTt1QkFDbEVuQixLQUFLNEIsU0FBTCxDQUFlLENBQWYsQ0FBUDs7bUJBRUczQixFQUFFNEIsR0FBRixDQUFNLEtBQUtuQyxNQUFYLEVBQW1CTSxJQUFuQixDQUFQOzs7OytCQUVBQSxNQUFNRixPQUFPO2dCQUNURSxLQUFLbUIsVUFBTCxDQUFnQixJQUFoQixLQUF5Qm5CLEtBQUttQixVQUFMLENBQWdCLElBQWhCLENBQXpCLElBQWtEbkIsS0FBS21CLFVBQUwsQ0FBZ0IsSUFBaEIsQ0FBdEQsRUFBNkU7dUJBQ2xFbkIsS0FBSzRCLFNBQUwsQ0FBZSxDQUFmLENBQVA7O2NBRUZFLEdBQUYsQ0FBTSxLQUFLcEMsTUFBWCxFQUFtQk0sSUFBbkIsRUFBeUJGLEtBQXpCOzs7OzZCQUVDRSxNQUFNO2dCQUNIUyxrQkFBa0IsS0FBS2YsTUFBTCxDQUFZcUMsT0FBWixDQUFvQi9CLElBQXBCLENBQXRCO2dCQUNJLENBQUNTLGVBQUQsSUFBb0IsS0FBS2YsTUFBTCxDQUFZcUMsT0FBWixDQUFvQkMsY0FBcEIsQ0FBbUNoQyxJQUFuQyxDQUF4QixFQUFrRTt1QkFDdkRTLGVBQVA7OztnQkFHRXdCLFlBQVksS0FBS3ZDLE1BQUwsQ0FBWXFDLE9BQVosQ0FBb0IvQixJQUFwQixJQUE2QlUsTUFBTUMsT0FBTixDQUFjRixlQUFkLElBQzNDSix5QkFBeUIsS0FBS1gsTUFBOUIsRUFBc0NlLGVBQXRDLENBRDJDLEdBRTNDRCxpQkFBaUIsS0FBS2QsTUFBdEIsRUFBOEJlLGVBQTlCLENBRko7bUJBR093QixTQUFQOzs7O3FDQUVTO21CQUNGLEtBQUt2QyxNQUFMLENBQVksU0FBWixDQUFQOzs7O3VDQUVXRyxLQUFLO21CQUNULEtBQUtILE1BQUwsQ0FBWUcsR0FBWixDQUFQOzs7OytDQUVtQjttQkFDWixJQUFQOzs7O3FDQUVTO21CQUNGLElBQVA7Ozs7c0NBRVU7bUJBQ0gsQ0FBQyxJQUFELENBQVA7Ozs7aUNBRUtHLE1BQU07bUJBQ0osS0FBS04sTUFBTCxDQUFZTSxJQUFaLEtBQXFCUCxjQUE1Qjs7OztzQ0FFVTsrQkFDTyxLQUFLQyxNQUFMLENBQVksU0FBWixDQUFqQjs7OztrQ0FFTTttQkFDQyxLQUFLK0IsSUFBWjs7OztrQ0FFTTttQkFDQyxLQUFLQSxJQUFaOzs7O3FDQUVTNUIsS0FBSzttQkFDUCxLQUFLSCxNQUFMLENBQVlHLEdBQVosQ0FBUDs7OzttQ0FFTzttQkFDQSxJQUFQOzs7O3FDQUVTO21CQUNGLEtBQVA7Ozs7cUNBRVM7bUJBQ0YsSUFBUDs7OztxQ0FFU0csTUFBTTttQkFDUixLQUFLeUIsSUFBTCxLQUFjekIsSUFBckI7Ozs7a0NBRU07bUJBQ0MsSUFBUDs7OzswQ0FFYzs7O3FDQUNMOzs7MENBQ0s7OzsyQ0FDQzs7O3NDQUNMOzs7a0NBQ0o7Ozs2Q0FDVzs7Ozs7QUNqSXpCLElBQU1rQywwQkFBMEIsU0FBMUJBLHVCQUEwQjt3QkFBd0JDLFNBQXhCO0NBQWhDO0FBQ0EsSUFBYUMsUUFBYjt3QkFDa0I7Ozt3QkFDTUEsUUFBaEIsRUFBMEIsSUFBMUI7Ozs7O2dDQUdJQyxHQUxaLEVBS2dCO2dCQUNKQSxRQUFRQyxTQUFSLElBQXFCRCxRQUFRLElBQTdCLElBQXFDQSxRQUFRLEVBQWpELEVBQXFEO3VCQUMxQyxJQUFQOztnQkFFQTNCLE1BQU1DLE9BQU4sQ0FBYzBCLEdBQWQsQ0FBSixFQUF3Qjt1QkFDYkEsSUFBSUUsTUFBSixLQUFlLENBQXRCO2FBREosTUFFTyxJQUFJLFFBQU9GLEdBQVAseUNBQU9BLEdBQVAsT0FBZSxRQUFmLElBQTJCWCxPQUFPekMsU0FBUCxDQUFpQnVELFFBQWpCLENBQTBCaEQsSUFBMUIsQ0FBK0I2QyxHQUEvQixNQUF3QyxpQkFBdkUsRUFBMEY7dUJBQ3RGWCxPQUFPZSxJQUFQLENBQVlKLEdBQVosRUFBaUJFLE1BQWpCLEtBQTRCLENBQW5DOzttQkFFRyxLQUFQOzs7OzBDQUVjRixHQWhCdEIsRUFnQjJCO21CQUNaQSxRQUFRQyxTQUFSLElBQXFCRCxRQUFRLElBQXBDOzs7O2lDQUVLSixTQW5CYixFQW1Cd0JFLFNBbkJ4QixFQW1CbUM7bUJBQ3BCRixVQUFVSCxHQUFWLENBQWNJLHdCQUF3QkMsU0FBeEIsQ0FBZCxFQUFrRCxJQUFsRCxDQUFQOzs7O29DQUVRRixTQXRCaEIsRUFzQjJCRSxTQXRCM0IsRUFzQnNDO21CQUN2QkYsVUFBVUgsR0FBVixDQUFjSSx3QkFBd0JDLFNBQXhCLENBQWQsRUFBa0QsS0FBbEQsQ0FBUDs7OztpQ0FFS0YsU0F6QmIsRUF5QndCRSxTQXpCeEIsRUF5Qm1DO21CQUNwQkYsVUFBVUosR0FBVixDQUFjSyx3QkFBd0JDLFNBQXhCLENBQWQsQ0FBUDs7OztvQ0FFUUYsU0E1QmhCLEVBNEIyQkUsU0E1QjNCLEVBNEJzQztzQkFDcEJMLEdBQVYsQ0FBY0ksd0JBQXdCQyxTQUF4QixDQUFkLEVBQWtELENBQUNGLFVBQVVKLEdBQVYsQ0FBY0ssd0JBQXdCQyxTQUF4QixDQUFkLENBQW5EOzs7O3dDQUVZTyxHQS9CcEIsRUErQnlCOzttQkFFVkEsUUFBUUosU0FBUixJQUFxQkksUUFBUSxJQUE3QixJQUFxQ0EsUUFBUSxLQUE3QyxJQUFzREEsUUFBUSxDQUE5RCxJQUFtRUEsUUFBUSxPQUEzRSxJQUFzRkEsUUFBUSxFQUE5RixJQUFvR0EsUUFBUSxHQUFuSDs7OztnQ0FFSUMsR0FuQ1osRUFtQ2lCOzttQkFFRixDQUFDLE9BQU9qQyxNQUFNQyxPQUFiLEtBQXlCLFVBQXpCLEdBQXNDRCxNQUFNQyxPQUE1QyxHQUFzRCxVQUFTaUMsR0FBVCxFQUFjO3VCQUNqRWxCLE9BQU96QyxTQUFQLENBQWlCdUQsUUFBakIsQ0FBMEJoRCxJQUExQixDQUErQm9ELEdBQS9CLE1BQXdDLGdCQUEvQzthQURHLEVBRUpELEdBRkksQ0FBUDs7OztpQ0FJS04sR0F6Q2IsRUF5Q2tCOzttQkFFSCxRQUFPQSxHQUFQLHlDQUFPQSxHQUFQLE9BQWUsUUFBZixJQUEyQkEsUUFBUSxJQUFuQyxJQUEyQyxDQUFDM0IsTUFBTUMsT0FBTixDQUFjMEIsR0FBZCxDQUFuRDs7OztvQ0FFUUEsR0E3Q2hCLEVBNkNvQjs7bUJBRUxBLFFBQVFDLFNBQWY7Ozs7OztBQy9DRCxTQUFTTyxXQUFULEdBQWtDO1FBQWJuRCxNQUFhLHVFQUFKLEVBQUk7O1dBQzlCLElBQUlvRCxJQUFKLENBQVNwRCxNQUFULENBQVA7OztBQUdKLElBRU1vRDtrQkFDVXBELE1BQVosRUFBb0I7OzthQUNYQSxNQUFMLEdBQWNBLE1BQWQ7YUFDS3FELElBQUwsR0FBWSxJQUFJWCxRQUFKLEVBQVo7d0JBQ2dCVSxJQUFoQixFQUFzQixJQUF0Qjs7Ozs7a0NBR01wRCxRQUFRO21CQUNQaUMsTUFBUCxDQUFjLEtBQUtqQyxNQUFuQixFQUEyQkEsTUFBM0I7Ozs7K0JBR0FNLE1BQU07bUJBQ0MsS0FBS04sTUFBTCxDQUFZTSxJQUFaLENBQVA7Ozs7K0JBR0FBLE1BQU1GLE9BQU87aUJBQ1JKLE1BQUwsQ0FBWU0sSUFBWixJQUFvQkYsS0FBcEI7Ozs7c0NBR1VrRCxRQUFRO3NCQUNSQSxPQUFPQyxjQUFqQixJQUFtQ0QsT0FBT0MsY0FBUCxDQUFzQixJQUF0QixDQUFuQzs7Ozt3Q0FHWXhCLE1BQU15QixZQUFZQyxVQUFVO2lCQUNuQ0MsZUFBTCxDQUFxQjNCLElBQXJCLEdBQTRCQSxJQUE1QjtpQkFDSzJCLGVBQUwsQ0FBcUJGLFVBQXJCLEdBQWtDQSxVQUFsQzs7OztnQkFJTWpCLFNBTmtDLEdBTXBCLEtBQUttQixlQU5lLENBTWxDbkIsU0FOa0M7O2dCQU9wQyxDQUFDQSxTQUFMLEVBQWdCOzRCQUNBLElBQUl6QixnQkFBSixDQUFxQjBDLFVBQXJCLEVBQWlDekIsSUFBakMsQ0FBWjthQURKLE1BRU87cUJBQ0UyQixlQUFMLENBQXFCbkIsU0FBckIsR0FBaUMsSUFBakM7O2dCQUVBa0IsUUFBSixFQUFjO3lCQUNEbEIsU0FBVCxFQUFvQixTQUFwQixFQUErQixDQUFDLFNBQUQsQ0FBL0I7O21CQUVHQSxTQUFQOzs7O3lDQUVhb0IsZUFBZUYsVUFBVTs7O2dCQUNoQ0csU0FBU0QsY0FDVjlDLEdBRFUsQ0FDTjt1QkFBTyxNQUFLNkMsZUFBTCxDQUFxQkcsSUFBSSxDQUFKLENBQXJCLEVBQTZCQSxJQUFJLENBQUosQ0FBN0IsQ0FBUDthQURNLENBQWY7Z0JBRUlKLFFBQUosRUFBYzt5QkFDREcsTUFBVCxFQUFpQixTQUFqQixFQUE0QkEsT0FBTy9DLEdBQVAsQ0FBWTsyQkFBTSxTQUFOO2lCQUFaLENBQTVCOzttQkFFRytDLE1BQVA7Ozs7b0NBRVFILFVBQVU7bUJBQ1gsWUFBa0I7NEJBQ1RBLG9DQUFaO2FBREo7Ozs7cUNBSVNLLElBQUk7bUJBQ04sS0FBSzlELE1BQUwsQ0FBWThELEVBQVosQ0FBUDs7Ozt1Q0FFVzs7O2tDQUNMO21CQUNDLEtBQUtDLGFBQUwsS0FBdUIsS0FBS0EsYUFBTCxHQUFxQixJQUFJakQsZ0JBQUosRUFBNUMsQ0FBUDs7OztpQ0FFS1IsTUFBTTttQkFDSixLQUFLTixNQUFMLENBQVksV0FBV00sSUFBdkIsQ0FBUDs7Ozs0QkFFQUYsT0FBTzRELEtBQUs7O3VCQUVEQyxRQUFRQyxHQUFSLENBQVk5RCxLQUFaLEVBQW1CNEQsR0FBbkIsQ0FBWDs7OztzQ0FFVTs7Ozs7QUMxRVgsU0FBU0csZUFBVCxHQUFzQztRQUFibkUsTUFBYSx1RUFBSixFQUFJOztXQUNsQyxJQUFJb0UsUUFBSixDQUFhcEUsTUFBYixDQUFQOzs7QUFHSixBQUFPLFNBQVNxRSxpQkFBVCxHQUEwQztRQUFmQyxRQUFlLHVFQUFKLEVBQUk7O1dBQ3RDLElBQUlDLGNBQUosQ0FBbUJELFFBQW5CLENBQVA7OztBQUdKLEFBQU8sU0FBU0UsZUFBVCxDQUF5QkMsT0FBekIsRUFBa0M7V0FDOUIsSUFBSUYsY0FBSixDQUFtQixJQUFuQixFQUF5QkUsT0FBekIsQ0FBUDs7O0lBR0VMO3NCQUNVUixNQUFaLEVBQW9EO1lBQWhDYyx1QkFBZ0MsdUVBQU4sSUFBTTs7O2FBQzNDMUUsTUFBTCxHQUFjLElBQWQ7YUFDSzRELE1BQUwsR0FBY0EsTUFBZDthQUNLYyx1QkFBTCxHQUErQkEsdUJBQS9CO2FBQ0tDLFlBQUwsR0FBb0IsS0FBcEI7YUFDS0MsWUFBTCxHQUFvQixLQUFwQjt3QkFDZ0JSLFFBQWhCLEVBQTBCLElBQTFCOzs7OztrQ0FFTXBFLFFBQVE7aUJBQ1RBLE1BQUwsR0FBY0EsTUFBZDs7OztpQ0FFS0csS0FBS0MsT0FBTztpQkFDWkosTUFBTCxHQUFjZ0MsT0FBT0MsTUFBUCxDQUFjLEtBQUtqQyxNQUFuQixxQkFBNkJHLEdBQTdCLEVBQW9DQyxLQUFwQyxFQUFkOzs7O29DQUVRO21CQUNELEtBQUtKLE1BQVo7Ozs7b0NBRVE2RSxLQUFLcEIsVUFBVTtpQkFDbEJvQixHQUFMLEdBQVdBLEdBQVg7aUJBQ0twQixRQUFMLEdBQWdCQSxRQUFoQjs7Ozt5Q0FFZ0M7Z0JBQXJCcUIsV0FBcUIsdUVBQVAsS0FBTzs7Z0JBQzVCQSxlQUFlLENBQUMsS0FBS0osdUJBQXpCLEVBQWtEOzs7aUJBRzdDakIsUUFBTCxJQUFpQixLQUFLQSxRQUFMLENBQWNzQixJQUFkLENBQW1CLEtBQUtGLEdBQXhCLEVBQTZCLEtBQUtqQixNQUFsQyxDQUFqQjs7OzttQ0FFTzttQkFDQSxLQUFLQSxNQUFMLENBQVlvQixRQUFaLEVBQVA7Ozs7aUNBRUsxRSxNQUFNO21CQUNKLEtBQUtOLE1BQUwsR0FBYyxLQUFLQSxNQUFMLENBQVlNLElBQVosQ0FBZCxHQUFrQyxJQUF6Qzs7Ozt5Q0FFYTttQkFDTixLQUFLc0QsTUFBWjs7OzttQ0FFTzttQkFDQSxLQUFLQSxNQUFMLENBQVlxQixRQUFaLEVBQVA7Ozs7dUNBRVc7bUJBQ0osS0FBS04sWUFBWjs7Ozt1Q0FFVzs7O3dDQUVDO2lCQUNQQSxZQUFMLEdBQW9CLElBQXBCOzs7O3NDQUVVOzs7OztJQUlaSjs0QkFDVUQsUUFBWixFQUEyQztZQUFyQlksWUFBcUIsdUVBQU4sSUFBTTs7O2FBQ2xDWixRQUFMLEdBQWdCQSxRQUFoQjthQUNLWSxZQUFMLEdBQW9CQSxZQUFwQjt3QkFDZ0JYLGNBQWhCLEVBQWdDLElBQWhDOzs7OzttQ0FFTzttQkFDQSxLQUFLVyxZQUFMLEdBQW9CLE9BQXBCLEdBQThCLFNBQXJDOzs7O21DQUVPO21CQUNBLEtBQUtBLFlBQUwsR0FBb0IsQ0FBQyxFQUFDVCxTQUFTLEtBQUtTLFlBQWYsRUFBRCxDQUFwQixHQUFxRCxFQUE1RDs7Ozt5Q0FFYTttQkFDTixLQUFLWixRQUFaOzs7Ozs7QUN6RVJhLE9BQU9DLE9BQVAsR0FBaUI7c0JBQUE7OEJBQUE7c0NBQUE7OENBQUE7NEJBQUE7b0NBQUE7d0NBQUE7O0NBQWpCIn0=
