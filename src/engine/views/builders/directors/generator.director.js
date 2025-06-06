import ElBuilder from "../element.builder.js";
import { DATA_SET_ATTRs, DATA_SET_TYPES } from "../../../data/data-set-attr.data.js";

export default class GeneratorDirector {

    /**
     * 
     * @param {string} generatorName 
     * @param {string[]} classes 
     * @returns {HTMLDivElement}
     */
    static createGenerator(generatorName, classes = []) {
        return new ElBuilder('div')
            .addAttribute('id', generatorName)
            .addClass(["cell", "m-24"])
            .addClass(classes)
            .addDataSet(DATA_SET_ATTRs.type, DATA_SET_TYPES.generator)
            .finish();
    }

    /**
     * @returns {HTMLDivElement}
     */
    static createCostPreview() {
        return new ElBuilder('div')
            .addClass("cost-preview")
            .addDataSet(DATA_SET_ATTRs.type, DATA_SET_TYPES.costPreview)
            .finish();
    }

}