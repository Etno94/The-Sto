import {Asserts, Errors} from "../../../utils/utils.index.js";


export default class BaseGeneratorElement {

    /** @type {String} */
    elementName;

    /** @param {String} elementName */
    constructor(elementName) {
        Asserts.string(elementName);

        this.elementName = elementName;
    }

    /** @param {...any} args */
    run(...args) {}

    /** @param {...any} args */
    render(...args) {}

    /** @param {...any} args */
    trigger(...args) {}
}