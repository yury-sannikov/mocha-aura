const sinon = require('sinon');

exports.inputFieldAdapter = function inputFieldAdapter(instance, params = {}) {
    instance.updateValue = sinon.spy();
    return instance;
}