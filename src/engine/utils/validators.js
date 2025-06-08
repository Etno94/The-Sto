export default class Validators {

    static isNotNullNorUndefined(value) {
        return value !== null && value !== undefined;
    }

    static isObject(obj) {
        return typeof obj === 'object' && !Array.isArray(obj);
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

    static matchesRegex(string, regex) {
        return regex.test(string);
    }

    static isNumber(number) {
        return typeof number === 'number';
    }

    static isBoolean(bool) {
        return typeof bool === 'boolean';
    }

    static isHTMLElement(element) {
        return element instanceof HTMLElement;
    }

    static isFunction(func) {
        return typeof func === 'function';
    }

    static isProxy(proxy) {
        return proxy instanceof Proxy;
    }
}