import {Asserts, Errors} from "../../../utils/utils.index.js";


export default class BaseGeneratorElement {

    /** @type {String} */
    elementName;

    /** @param {String} elementName */
    constructor(elementName) {
        Asserts.string(elementName);

        this.elementName = elementName;
    }

    run() {}

    render() {}
}