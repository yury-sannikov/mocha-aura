const sinon = require('sinon');

export function stubifyInstance(ctor, instance) {
    Object.getOwnPropertyNames(ctor.prototype).forEach(prop => {
        if (typeof ctor.prototype[prop] !== 'function' || prop === 'constructor') {
            return;
        }
        sinon.stub(instance, prop).callsFake(((propName) => (...args) => {
            return ctor.prototype[propName].call(instance, ...args);
        })(prop))
    })
}
