import debounce from '../utils/debounce.js';

class SaveProxy {

    /** @type {Set<string>} */
    timeSaveTypeProperties = new Set([
        'saveTimestamp',
        'accumulator'
    ]);

    constructor(initialSave) {
        if (initialSave) this.setSaveProxy(initialSave);
    }

    setSaveProxy(save) {
        this.subscribers = [];
        this.notifyDebounced = debounce(() => {
            this.subscribers.forEach(callback => callback(this.proxySave));
        }, 10);
        this.proxySave = this.createProxy(save);
    }

    createProxy(save) {
        return new Proxy(save, {
            set: (target, property, value) => {
                if (target[property] === value && typeof value !== 'object') return true;
                target[property] = value;
                if (this.timeSaveTypeProperties.has(property)) return true;
                this.notifyDebounced();
                return true;
            },
            get: (obj, prop) => {
                const value = obj[prop];
                if (typeof value === 'object' && value !== null) {
                    return this.createProxy(value);
                }
                return value;
            }
        });
    }

    subscribe(callback) {
        this.subscribers.push(callback);
    }

    unsubscribe(callback) {
        this.subscribers = this.subscribers.filter(subscriber => subscriber !== callback);
    }

    /** @returns {SaveType} */
    get proxy() {
        return this.proxySave;
    }
}

export default SaveProxy;

