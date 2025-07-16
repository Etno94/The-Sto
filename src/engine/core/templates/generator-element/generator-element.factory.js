import {PulseCell} from "./implementations.index.js";
import {DataManager} from "../../../systems/managers-index.js";

class GeneratorElementFactory {

    /** @type {GeneratorElementNamesData} */
    #elementIds;

    /** @type {Object<string, BaseGeneratorElement>} */
    #elementRegistry;

    constructor() {
        this.#elementIds = DataManager.getGeneratorElementNames();
        this.#elementRegistry = {
            [this.#elementIds.cdCharge1]: null,
            [this.#elementIds.cdCharge2]: null,
            [this.#elementIds.cdCharge3]: null,
            [this.#elementIds.pulseCell1]: PulseCell,
            [this.#elementIds.pulseCell2]: PulseCell,
            [this.#elementIds.pulseCell3]: PulseCell,
        }
    }

    /** @param {string} elementName */
    run(elementName) {
        /** @type {BaseGeneratorElement} */
        const elementClass = this.#elementRegistry[elementName];
        if (!elementClass) return;
        new elementClass(elementName).run();
    }

    render(elementName) {
        /** @type {BaseGeneratorElement} */
        const elementClass = this.#elementRegistry[elementName];
        if (!elementClass) return;
        new elementClass(elementName).render();
    }
}
export const genElementF = new GeneratorElementFactory();