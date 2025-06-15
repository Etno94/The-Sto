import Asserts from './asserts.js';

export default class Utils {
    constructor() {}

    /** @param {Function} fn */
    static deferFrame(fn) {
        Asserts.function(fn);
        requestAnimationFrame(fn);
    }

    /** @param {Function} fn */
    static deferTimeout(fn) {
        Asserts.function(fn);
        setTimeout(fn, 0);
    }


    /** @param {string} value */
    static getNumberFromMSValue (value) {
        const numberMsSuffix = /^\d+ms$/;
        Asserts.regex(value, numberMsSuffix, `Expected a string with 'ms' suffix.`);
        
        return Number(value.split('ms')[0]);
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
     * @param {number} baseValue 
     * @param {number} refValue
     * @returns {number}
     */
    static getPercentInDecimals(baseValue, refValue) {
        Asserts.number(baseValue);
        Asserts.number(refValue);
        
        return refValue / baseValue;
    }

    /**
     * @param {number} baseValue 
     * @param {number} refValue
     * @returns {number}
     */
    static getDegPercent(baseValue, refValue) {
        Asserts.number(baseValue);
        Asserts.number(refValue);

        return 360 * Utils.getPercentInDecimals(baseValue, refValue);
    }

    /**
     * @param {number} degs 
     * @returns {number}
     */
    static getReversedDeg(degs) {
        Asserts.number(degs);

        return 360 - degs;
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
     * @param { Array } arr 
     * @param { Function } criteria
     * @param { number } n 
     * @returns { Array }
     */
    static selectInitialNItems(arr, criteria, n) {
        Asserts.array(arr, 'arr');
        Asserts.function(criteria, 'criteria');
        Asserts.number(n, 'n');

        let count = 0;
        return arr.filter((item) => {
            if (criteria(item) && count < n) {
                count++;
                return true;
            }
            return false;
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
