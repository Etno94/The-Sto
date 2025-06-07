import Asserts from './asserts.js';

export default class Utils {
    constructor() {}

    /** @param {string} value */
    static getNumberFromMSValue (value) {
        const numberMsSuffix = /^\d+ms$/;
        Asserts.regex(value, numberMsSuffix, `Expected a string with 'ms' suffix.`);
        
        return Number(value.split('ms')[0]);
    }

    /**
     * @param {HTMLElement} element 
     * @param {string} type 
     * @param {Function} listener 
     * @param  {...any} args 
     */
    static addEventListenerWithFlag(element, type, listener, ...args) {
        Asserts.htmlElement(element, 'element');
        Asserts.string(type, 'type');
        Asserts.function(listener, 'listener');

        if (!element.eventListenerActive) {
            element.addEventListener(type, () => listener(...args));
            element.eventListenerActive = true;
        }
    }

    /**
     * @param { number } ms 
     * @returns { Promise }
     */
    static delay(ms) {
        Asserts.number(ms, 'ms');

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
     * @param { Array } arr 
     * @param { Function } criteria
     * @param { number } n 
     * @returns { Array }
     */
    static filterInitialNItems(arr, criteria, n) {
        Asserts.array(arr, 'arr');
        Asserts.function(criteria, 'criteria');
        Asserts.number(n, 'n');

        let count = 0;
        return arr.filter((item) => {
            if (criteria(item) && count < n) {
                count++;
                return false;
            }
            return true;
        });
    }

    /**
     * @param { Object } obj 
     * @returns { Object}
     */
    static shallowCopy(obj) {
        Asserts.object(obj, 'obj');
        return { ...obj };
    }

    /**
     * @param { Object } obj 
     * @returns { Object}
     */
    static deepCopy(obj) {
        Asserts.object(obj, 'obj');
        return JSON.parse(JSON.stringify(obj));
    }

    /**
     * @param { Array } arr 
     * @returns { Array }
     */
    static arrCopy(arr) {
        Asserts.array(arr, 'arr');
        return arr.slice();
    }

}
