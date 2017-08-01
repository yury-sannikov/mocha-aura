import { stubifyInstance } from './sinonHelpers'

const classNameToComponentVar = className => `v.__cls_${className}`
export class AuraUtil {
    constructor() {
        stubifyInstance(AuraUtil, this);
    }
    
    isEmpty(obj){
        if (obj === undefined || obj === null || obj === '') {
            return true;
        }
        if (Array.isArray(obj)) {
            return obj.length === 0;
        } else if (typeof obj === 'object' && Object.prototype.toString.call(obj) === '[object Object]') {
            return Object.keys(obj).length === 0;
        }
        return false;
    }
    isUndefinedOrNull(obj) {
        return obj === undefined || obj === null;
    }
    addClass(component, className) {
        return component.set(classNameToComponentVar(className), true);
    }
    removeClass(component, className) {
        return component.set(classNameToComponentVar(className), false);
    }
    hasClass(component, className) {
        return component.get(classNameToComponentVar(className));
    }
    toggleClass(component, className) {
        component.set(classNameToComponentVar(className), !component.get(classNameToComponentVar(className)));
    }
    getBooleanValue(val) {
        // Ported: https://github.com/forcedotcom/aura/blob/master/aura-impl/src/main/resources/aura/util/Util.js#L366
        return val !== undefined && val !== null && val !== false && val !== 0 && val !== 'false' && val !== '' && val !== 'f';
    }
    isArray(arr) {
        // Ported: https://github.com/forcedotcom/aura/blob/master/aura-impl/src/main/resources/aura/util/Util.js#L189
        return (typeof Array.isArray === "function" ? Array.isArray : function(arg) {
            return Object.prototype.toString.call(arg) === '[object Array]';
        })(arr);
    }
    isObject(obj) {
        //Ported: https://github.com/forcedotcom/aura/blob/master/aura-impl/src/main/resources/aura/util/Util.js#L204
        return typeof obj === "object" && obj !== null && !Array.isArray(obj);
    }
    isUndefined(obj){
        //Ported: https://github.com/forcedotcom/aura/blob/master/aura-impl/src/main/resources/aura/util/Util.js#L319
        return obj === undefined;
    }
}

