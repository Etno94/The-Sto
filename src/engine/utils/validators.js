export default class Validators {

    static isNotNullNorUndefined(value) {
        return value !== null && value !== undefined;
    }

    static isObject(obj) {
        return obj !== null && typeof obj === 'object' && !Array.isArray(obj);
    }

    static isArray(array) {
        return Array.isArray(array) && array.every(item => Validators.isNotNullNorUndefined(item));
    }

    static isNonEmptyArray(array) {
        return Validators.isArray(array) && array.length > 0;
    }

    static isStringArray(array) {
        return Validators.isArray(array) && array.every(item => typeof item === 'string');
    }

    static isString(string) {
        return typeof string === 'string' && string.trim() !== '';
    }

    static isHTMLElement(element) {
        return element instanceof HTMLElement && Validators.isNotNullNorUndefined(element);
    }

    static isFunction(func) {
        return typeof func === 'function' && Validators.isNotNullNorUndefined(func);
    }

    static isProxy(proxy) {
        return proxy instanceof Proxy && Validators.isNotNullNorUndefined(proxy);
    }
}