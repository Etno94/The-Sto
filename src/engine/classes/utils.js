export default class Utils {
    constructor() {}

    getNumberFromMSValue (value) {
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
