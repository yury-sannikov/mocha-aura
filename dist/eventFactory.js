"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

exports.eventFactory = function eventFactory() {
    var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    return new Event(params);
};

var Event = function () {
    function Event(params) {
        _classCallCheck(this, Event);

        this.params = params;
    }

    _createClass(Event, [{
        key: "getParams",
        value: function getParams() {
            return this.params;
        }
    }]);

    return Event;
}();