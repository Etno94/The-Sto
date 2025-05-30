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
     * @returns {ElementFactory}
     */
    create(tag) {
        this.#element = Utils.isValidString(tag) ? document.createElement(tag) : null;
        return this;
    }

    /**
     * @param {HTMLElement} element
     * @param {string[]} classNames
     * @returns {ElementFactory}
     */
    addClass(classNames) {
        switch(typeof classNames) {
            case 'string':
                if (Utils.isValidString(classNames)) 
                    this.#element.classList.add(classNames);
                break;
            case 'object':
                if (Utils.isStringArray(classNames)) 
                    this.#element.classList.add(...classNames);
                break;
        }
        return this;
    }

    /**
     * @param {HTMLElement} element
     * @param {string[]} classNames
     * @returns {ElementFactory}
     */
    removeClass(classNames) {
        switch(typeof classNames) {
            case 'string':
                if (Utils.isValidString(classNames)) 
                    this.#element.classList.remove(classNames);
                break;
            case 'object':
                if (Utils.isStringArray(classNames)) 
                    this.#element.classList.remove(...classNames);
                break;
        }
        return this;
    }

    /**
     * 
     * @param {string} name 
     * @param {string} value 
     * @returns {ElementFactory}
     */
    addAttribute(name, value) {
        if (Utils.isValidString(name) && Utils.isValidString(value)) {
            this.#element.setAttribute(name, value);
        }
        return this;
    }

    /**
     * 
     * @param {string} name 
     * @param {string} value 
     * @returns {ElementFactory}
     */
    removeAttribute(name, value) {
        if (Utils.isValidString(name) && Utils.isValidString(value)) {
            this.#element.removeAttribute(name, value);
        }
        return this;
    }

    /**
     * 
     * @param {HTMLElement} child 
     * @returns {ElementFactory}
     */
    appendChild(child) {
        if (Utils.isValidHTMLElement(child) &&
            !this.#element.contains(child)) {
            this.#element.appendChild(child);
        }
        return this;
    }

    /**
     * 
     * @param {HTMLElement} child 
     * @returns {ElementFactory}
     */
    removeChild(child) {
        if (Utils.isValidHTMLElement(child) &&
            this.#element.contains(child)) {
            this.#element.removeChild(child);
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