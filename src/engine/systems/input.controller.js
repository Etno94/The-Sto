import Global from "../core/global.js";
import GameSave from "../core/save.js";
import { EventBus, Events } from "../core/event-bus.js";

import Asserts from "../utils/asserts.js";
import Errors from "../utils/errors.js";
import Validators from "../utils/validators.js";

class InputController {

    /** @type {Map<HTMLElement, Map<string, function>>} */
    #trackedElements = new Map();
    
    // Settings
    #saveButton = document.getElementById("saveGame");
    #resetButton = document.getElementById("resetGame");

    #dump = document.getElementById("dump");

    constructor() {
        this.addEventListener(this.#saveButton, 'click', GameSave.save, Global.proxy);
        this.addEventListener(this.#resetButton, 'click', GameSave.reset);
        this.addEventListener(this.#dump, 'click', () => EventBus.emit(Events.points.burnAll));
    }

    /**
     * @param {HTMLElement} element 
     * @param {string} type 
     * @param {Function} listener 
     * @param  {...any} args 
     */
    addEventListener(element, type, listener, ...args) {
        Asserts.htmlElement(element, 'element');
        Asserts.string(type, 'type');
        Asserts.function(listener, 'listener');

        const wrapper = () => listener(...args);

        if (!this.#trackedElements.has(element)) {
            this.#trackedElements.set(element, new Map([[type, wrapper]]));
            element.addEventListener(type, wrapper);
        } else {
            /** @type {Map<string, function>} */
            const elementListenersMap = this.#trackedElements.get(element);

            if (!elementListenersMap.has(type)) {
                elementListenersMap.set(type, wrapper);
                element.addEventListener(type, wrapper);
            } else {
                const listener = elementListenersMap.get(type);
                if (!Validators.isFunction(listener)) {
                    Errors.logError(`Expected function: ${listener}`, listener);
                }
            }
            
        }
    }

    /**
     * @param {HTMLElement} element 
     * @param {string} type 
     */
    removeEventListener(element, type) {
        Asserts.htmlElement(element, 'element');
        Asserts.string(type, 'type');

        const elementListenersMap = this.#trackedElements.get(element);
        if (!elementListenersMap) return;

        const wrapper = elementListenersMap.get(type);
        if (Validators.isFunction(wrapper)) {
            element.removeEventListener(type, wrapper);
            elementListenersMap.delete(type);

            if (elementListenersMap.size === 0) {
                this.#trackedElements.delete(element);
            }
        } else {
            Errors.logError(`No valid listener found for ${type} on element`, element);
        }
    }
}
export default new InputController();