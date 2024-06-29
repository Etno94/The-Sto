import debounce from './debounce.js';

class SaveProxy {
    constructor(initialSave) {
        this.subscribers = [];
        this.notifyDebounced = debounce(() => {
            this.subscribers.forEach(callback => callback(this.proxySave));
        }, 200);
        this.proxySave = this.createProxy(initialSave);
    }

    createProxy(save) {
        return new Proxy(save, {
            set: (target, property, value) => {
                target[property] = value;
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

    get proxy() {
        return this.proxySave;
    }
}

export default SaveProxy;

