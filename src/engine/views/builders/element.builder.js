import UIHelper from '../helpers/ui-helper.js';
import Asserts from '../../utils/asserts.js';
import Errors from '../../utils/errors.js';

 class ElementBuilder {

    /**
     * @type {HTMLElement|null}
     */
    #element = null;

    /**
     * @param {string | HTMLElement} toCreate 
     */
    constructor(toCreate) {
        Asserts.stringOrHtmlElement(toCreate, 'toCreate');

        if (typeof toCreate === 'string') this.#element = UIHelper.create(toCreate);
        else if (toCreate instanceof HTMLElement) this.#element = toCreate.cloneNode(true);
        else Errors.throwError(`Invalid type for toCreate - typeof: ${typeof toCreate}`);
    }


    /**
     * @param {string[]} classNames
     * @returns {ElementBuilder}
     */
    addClass(classNames) {
        this.#element = UIHelper.addClass(this.#element, classNames);
        return this;
    }

    /**
     * @param {string[]} classNames
     * @returns {ElementBuilder}
     */
    removeClass(classNames) {
        this.#element = UIHelper.removeClass(this.#element, classNames);
        return this;
    }

    /**
     * @param {string} name 
     * @param {string} value 
     * @returns {ElementBuilder}
     */
    addAttribute(name, value) {
        this.#element = UIHelper.addAttribute(this.#element, name, value);
        return this;
    }

    /**
     * @param {string} name 
     * @returns {ElementBuilder}
     */
    removeAttribute(name) {
        this.#element = UIHelper.removeAttribute(this.#element, name);
        return this;
    }

     /**
     * @param {string} name 
     * @param {string} value 
     * @returns {ElementBuilder}
     */
    addDataSet(name, value) {
        this.#element = UIHelper.addDataSet(this.#element, name, value);
        return this;
    }

    /**
     * @param {string} name 
     * @returns {ElementBuilder}
     */
    removeDataSet(name) {
        this.#element = UIHelper.removeDataSet(this.#element, name);
        return this;
    }

    /**
     * @param {HTMLElement} child 
     * @returns {ElementBuilder}
     */
    appendChild(child) {
        UIHelper.appendChild(this.#element, child);
        return this;
    }

    /**
     * 
     * @param {HTMLElement} child 
     * @returns {ElementBuilder}
     */
    removeChild(child) {
        UIHelper.removeChild(this.#element, child);
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
const ElBuilder = ElementBuilder;
export default ElBuilder;