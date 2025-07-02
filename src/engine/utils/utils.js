import Asserts from './asserts.js';
import Errors from './errors.js';
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
     * Converts a kebab-case string to camelCase.
     * @param {string} str
     * @returns {string}
     */
    static kebabToCamel(str) {
        Asserts.string(str, 'str');
        return str.replace(/-([a-z])/g, (match, letter) => letter.toUpperCase());
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
        if (obj === null || typeof obj !== 'object') return obj;

        if (Array.isArray(obj)) {
            return obj.map(Utils.deepCopy);
        }

        const copy = {};
        for (const key in obj) {
            copy[key] = Utils.deepCopy(obj[key]);
        }
        return copy;
    }

    /**
     * @param { Array } arr 
     * @returns { Array }
     */
    static arrCopy(arr) {
        Asserts.array(arr, 'arr');
        return arr.slice();
    }

    /**
     * @param {string} matrixString 
     * @returns {string}
     */
    static reverse2DMatrixString(matrixString) {
        Asserts.string(matrixString);

        const values = matrixString
            .match(/matrix\(([^)]+)\)/)[1]
            .split(',').map(Number);
        const [a, b, c, d, e, f] = values;

        const det = a * d - b * c;
        Asserts.reversable2DMatrix(det, 'matrixString');

        const aInv =  d / det;
        const bInv = -b / det;
        const cInv = -c / det;
        const dInv =  a / det;
        const eInv = (c * f - d * e) / det;
        const fInv = (b * e - a * f) / det;

        return `matrix(${aInv}, ${bInv}, ${cInv}, ${dInv}, ${eInv}, ${fInv})`;
    }

    /**
     * @param {number} percent
     * @returns {boolean}
     */
    static chance(percent) {
        Asserts.number(percent, 'percent');
        return Math.random() * 100 < percent;
    }

    /**
     * Returns the number of successes based on overload chance.
     * If percent > 100, always returns at least 1, and the decimal part is used as a chance for an extra success.
     * @param {number} percent - The chance percentage (can be above 100).
     * @returns {number} - Number of successes (0, 1, or 2 for percent <= 200, etc.)
     */
    static overloadChance(percent) {
        Asserts.number(percent, 'percent');
        if (percent <= 0) return 0;
        const guaranteed = Math.floor(percent / 100);
        const remainder = percent % 100;
        let total = guaranteed;
        if (Math.random() * 100 < remainder) total += 1;
        return total;
    }

    /**
     * @param {number} dividend 
     * @param {number} divisor 
     * @returns {[number, number]}
     */
    static getDivisionRemainder(dividend, divisor) {
        Asserts.number(dividend, 'divident');
        Asserts.number(divisor, 'divisor');
        if (divisor === 0) Errors.logError(`divisor cant be 0`);

        const total = Math.floor(dividend / divisor);
        const remainder = dividend % divisor;

        return [total, remainder];
    }
}
