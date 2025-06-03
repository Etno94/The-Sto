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

    static addEventListenerWithFlag(element, type, listener, ...args) {
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
