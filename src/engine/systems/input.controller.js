import Global from "../core/global.js";
import GameSave from "../core/save.js";
import { EventBus, Events } from "../core/event-bus.js";

import Asserts from "../utils/asserts.js";

class InputController {

    /** @type {Map} */
    trackedElements = new Map();
    
    // Settings
    saveButton = document.getElementById("saveGame");
    resetButton = document.getElementById("resetGame");

    dump = document.getElementById("dump");

    constructor() {
        this.saveButton.addEventListener("click", () => GameSave.save(Global.proxy));
        this.resetButton.addEventListener("click", () => GameSave.reset());
        this.dump.addEventListener("click", () => EventBus.emit(Events.points.burnAll));
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

        if (!this.trackedElements.has(element)) {
            const listeners = new Map(type, () => listener(...args));
            this.trackedElements.set(element, listeners);
            element.addEventListener(type, () => listener(...args));
        } else {
            /** @type {Map} */
            const elementListenersMap = this.trackedElements.get(elementListenersMap);

            if (!elementListenersMap.has(type)) {
                elementListenersMap.set(type, () => listener(...args));
                element.addEventListener(type, () => listener(...args));
            }
            
        }
    }
}
export default new InputController();