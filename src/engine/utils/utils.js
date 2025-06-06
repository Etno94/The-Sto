import Validators from './validators.js';
import Errors from './errors.js';

export default class Utils {
    constructor() {}

    static getNumberFromMSValue (value) {
        if (typeof value !== 'string') {
            Errors.throwError(`Invalid value: ${value}. Expected a string with 'ms' suffix.`);
        }
        return Number(value.split('ms')[0]);
    }

    /**
     * @param {HTMLElement} element 
     * @param {string} type 
     * @param {Function} listener 
     * @param  {...any} args 
     */
    static addEventListenerWithFlag(element, type, listener, ...args) {
        if (!Validators.isHTMLElement(element)) {
            Errors.invalidTypeError(element.constructor.name,'instanceof HTMLElement')
            return;
        }
        if (!element.eventListenerActive) {
            element.addEventListener(type, () => listener(...args));
            element.eventListenerActive = true;
        }
    }

    static delay(ms) {
        return new Promise(resolve => {
            const start = performance.now();
            function frame(time) {
                if (time - start >= ms) {
                    resolve();
                } else {
                    requestAnimationFrame(frame);
                }
            }
            requestAnimationFrame(frame);
        });
    }

    /**
     * 
     * @param { Array } arr 
     * @param { Function } criteria
     * @param { number } n 
     * @returns { Array }
     */
    static filterInitialNItems(arr, criteria, n) {
        if (!Validators.isArray(arr)) {
            Errors.invalidTypeError(typeof arr, 'array');
        }
        if (!Validators.isFunction(criteria)) {
            Errors.invalidTypeError(typeof criteria, 'function');
        }
        if (!Validators.isNumber(n)) {
            Errors.invalidTypeError(typeof n, 'number');
        }

        let count = 0;
        return arr.filter((item) => {
            if (criteria(item) && count < n) {
                count++;
                return false;
            }
            return true;
        });
    }

    static shallowCopy(obj) {
        if (!Validators.isObject(obj)) {
            Errors.throwError(`Invalid object: ${obj}. Expected a non-null object.`);
        }
        return { ...obj };
    }

    static deepCopy(obj) {
        if (!Validators.isObject(obj)) {
            Errors.throwError(`Invalid object: ${obj}. Expected a non-null object.`);
        }
        return JSON.parse(JSON.stringify(obj));
    }

    static arrCopy(arr) {
        if (!Validators.isArray(arr)) {
            Errors.throwError(`Invalid array: ${arr}. Expected a non-empty array.`);
        }
        return arr.slice();
    }

}
