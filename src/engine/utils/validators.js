export default class Validators {
    static isArray(array) {
        return Array.isArray(array) && array.length > 0 && array.every(item => item !== null && item !== undefined);
    }

    static isStringArray(array) {
        return Array.isArray(array) && array.length > 0 && array.every(item => item !== null && item !== undefined && typeof item === 'string');
    }

    static isString(string) {
        return typeof string === 'string' && string.trim() !== '';
    }

    static isHTMLElement(element) {
        return element instanceof HTMLElement && element !== null && element !== undefined;
    }

    static isFunction(func) {
        return typeof func === 'function' && func !== null && func !== undefined;
    }
}