import Utils from '../utils/utils.js';

 class ElementFactory {

    /**
     * @type {HTMLElement|null}
     */
    #element = null;

    /**
     * @param {string} tag 
     */
    constructor(tag) {
        if (Utils.isValidString(tag)) {
            this.#element = document.createElement(tag);
        }
    }

    /**
     * Creates a new HTML element with the specified tag.
     * @param {string} tag
     * @returns {HTMLElement|null}
     */
    create(tag) {
        this.#element = Utils.isValidString(tag) ? document.createElement(tag) : null;
        return this;
    }

    /**
     * @param {HTMLElement} element
     * @param {string[]} classNames
     * @returns {HTMLElement}
     */
    addClass(classNames) {
        switch(typeof classNames) {
            case 'string':
                if (Utils.isValidString(classNames)) this.#element.classList.add(classNames);
                break;
            case 'object':
                if (Utils.isStringArray(classNames)) this.#element.classList.add(...classNames);
                break;
        }
        return this;
    }

    /**
     * @param {HTMLElement} element
     * @param {string[]} classNames
     * @returns {HTMLElement}
     */
    removeClass(classNames) {
        switch(typeof classNames) {
            case 'string':
                if (Utils.isValidString(classNames)) this.#element.classList.remove(classNames);
                break;
            case 'object':
                if (Utils.isStringArray(classNames)) this.#element.classList.remove(...classNames);
                break;
        }
        return this;
    }

    /**
     * Return the current element
     * @returns {HTMLElement | null}
     */
    export() {
        return this.#element;
    }

    /**
     * Return the built element and cleans the factory state.
     * @returns {HTMLElement | null}
     */
    finish() {
        const element = this.#element;
        this.#element = null;
        return element;
    }
}
const ElFtry = ElementFactory;
export default ElFtry;