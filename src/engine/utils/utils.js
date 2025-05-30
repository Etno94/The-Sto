export default class Utils {
    constructor() {}

    getNumberFromMSValue (value) {
        if (typeof value !== 'string') {
            throw new Error(`Invalid value: ${value}. Expected a string with 'ms' suffix.`);
        }
        return Number(value.split('ms')[0]);
    }

    addEventListenerWithFlag(element, type, listener, ...args) {
        if (!element.eventListenerActive) {
            element.addEventListener(type, () => listener(...args));
            element.eventListenerActive = true;
        }
    }

    delay(ms) {
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

    // #region Arrays
    static isValidArray(array) {
        return Array.isArray(array) && array.length > 0 && array.every(item => item !== null && item !== undefined);
    }

    static isStringArray(array) {
        return Array.isArray(array) && array.length > 0 && array.every(item => item !== null && item !== undefined && typeof item === 'string');
    }
    // #endregion Arrays

    static isValidString(string) {
        return typeof string === 'string' && string.trim() !== '';
    }

    static isValidHTMLElement(element) {
        return element instanceof HTMLElement && element !== null && element !== undefined;
    }
}
