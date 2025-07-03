import {BaseGenerator, ClickGenerator, CDGenerator, PulseGenerator} from "./implementations.index.js";
import {DataManager} from "../../../systems/managers-index.js";

import {Errors} from "../../../utils//utils.index.js";

class GeneratorFactory {
    
    /** @type {DataGeneratorId} */
    #generatorIds;

    /** @type {Object<string, BaseGenerator>} */
    #generatorRegistry;

    constructor() {
        this.#generatorIds = DataManager.getGeneratorIds();
        this.#generatorRegistry = {
            [this.#generatorIds.CLICK]: ClickGenerator,
            [this.#generatorIds.COOLDOWN]: CDGenerator,
            [this.#generatorIds.PULSE]: PulseGenerator,
        }
    }

    /** @param {string} generatorName */
    run(generatorName) {
        /** @type {BaseGenerator} */
        const GeneratorClass = this.#generatorRegistry[generatorName];
        if (!GeneratorClass) Errors.throwError(`Wrong generator name: ${generatorName}`);
        new GeneratorClass(generatorName).run();
    }
}

export const generatorF = new GeneratorFactory();