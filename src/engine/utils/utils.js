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
}
