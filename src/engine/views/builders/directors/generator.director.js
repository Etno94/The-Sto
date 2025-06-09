import ElBuilder from "../element.builder.js";
import DataManager from "../../../systems/managers/data.manager.js";

export default class GeneratorDirector {

    /**
     * 
     * @param {string} generatorName 
     * @param {string[]} classes 
     * @returns {HTMLDivElement}
     */
    static createGenerator(generatorName, classes = []) {
        return new ElBuilder('button')
            .addAttribute('id', generatorName)
            .addClass(DataManager.getGeneratorClasses().default)
            .addClass(classes)
            .addDataSet(DataManager.getDataSetAttrs().type, DataManager.getDataSetTypes().generator)
            .finish();
    }

    /**
     * @returns {HTMLDivElement}
     */
    static createCostPreview() {
        return new ElBuilder('div')
            .addClass("cost-preview")
            .addDataSet(DataManager.getDataSetAttrs().type, DataManager.getDataSetTypes().costPreview)
            .finish();
    }

}