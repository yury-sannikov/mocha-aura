/*global Proxy*/
const sinon = require('sinon');

export function stubifyInstance(ctor, instance, params) {
    const propExcluded = (prop) => params && params.doNotMock && (Array.isArray(params.doNotMock) ? 
        params.doNotMock.indexOf(prop) !== -1 : params.doNotMock === prop);

    Object.getOwnPropertyNames(ctor.prototype).forEach(prop => {
        if (propExcluded(prop) || typeof ctor.prototype[prop] !== 'function' || prop === 'constructor') {
            return;
        }
        instance['stub_' + prop] = sinon.stub(instance, prop).callsFake(((propName) => (...args) => {
            return ctor.prototype[propName].call(instance, ...args);
        })(prop))
    })
    return instance;
}

export function stubifyInstanceOnDemand(ctor, instance) {
    const handler = {
        _instanceProps: {},
        defineProperty(target, property, descriptor) {
            handler._instanceProps[property] = descriptor;
            return true;
        },
        get(target, propKey) {
            // Check for Symbol for iterators
            if (typeof propKey !== 'string') {
                return target[propKey];
            }
            // If we add some props to the instance, return it w/o mocking
            // Usually added stuff is mocked through data adapters
            if (handler._instanceProps[propKey]) {
                return handler._instanceProps[propKey].value
            }
            
            //Warn on unknown propKey for better debugging
            if (target[propKey] === undefined) {
                /*eslint no-console: 0*/
                console.warn('\n\nstubifyInstanceOnDemand: Unknown property ' + propKey, '\n\n');
                return target[propKey];
            }

            // Stub methods that defined on prototype only, e.g. has public api
            const stubName = 'stub_' + propKey;
            const isSpyOrStubbed = !!(target[propKey] && target[propKey].calledBefore);
            const hasOnProto = !!ctor.prototype[propKey];

            if (hasOnProto && !isSpyOrStubbed && typeof target[propKey] === 'function' && propKey !== 'constructor') {
                target[stubName] = sinon.stub(target, propKey).callsFake((...args) => {
                    return ctor.prototype[propKey].call(instance, ...args);
                })
            }
            return target[propKey];
        }
    }

    const proxy = new Proxy(instance, handler);
    return proxy;
}