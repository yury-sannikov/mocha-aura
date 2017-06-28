'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var sinon = require('sinon');

exports.eventFactory = function eventFactory() {
    var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    return new Event(params);
};
var FAKE_EVENT_NAME = 'mocha-aura-fake-event';

var Event = function () {
    function Event(params) {
        _classCallCheck(this, Event);

        this.params = params || {};
        this.fire = sinon.spy();
        this.pause = sinon.spy();
        this.preventDefault = sinon.spy();
        this.resume = sinon.spy();
        this.stopPropagation = sinon.spy();
    }

    _createClass(Event, [{
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