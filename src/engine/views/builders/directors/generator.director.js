import ElBuilder from "../element.builder.js";
import DataManager from "../../../systems/managers/data.manager.js";
import Asserts from "../../../utils/asserts.js";

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
     * @param {HTMLDivElement[]} [statusElements]
     * @returns {HTMLDivElement}
     */
    static createGeneratorStatusWrap(statusElements = []) {
        Asserts.htmlArray(statusElements);

        const pointChancesWrapper = new ElBuilder('div')
            .addClass(DataManager.getGeneratorStatusWrapClasses().layer_0)

        for (const wrap of statusElements) {
            pointChancesWrapper.appendChild(wrap);
        }

        return pointChancesWrapper.finish();
    }

    /**
     * @param {HTMLDivElement[]} pointElements
     * @param {string[]} [chances]
     * @returns {HTMLDivElement[]}
     */
    static createPointChanceWrap(pointElements, chances = []) {
        Asserts.htmlArray(pointElements);
        Asserts.stringArray(chances);

        /** @type {HTMLElement[]} */
        let pointChanceWrappers = [];

        for (const point of pointElements) {
            const pointChanceWrap = new ElBuilder('div')
                .addClass(DataManager.getPointChanceWrapClasses().layer_0)
                .appendChild(
                    new ElBuilder(point)
                        .addDataSet(DataManager.getDataSetAttrs().generatorStatus, DataManager.getDataSetGeneratorStatus().pointChance)
                        .finish()
                )
                .appendChild(
                    new ElBuilder(point)
                        .addDataSet(DataManager.getDataSetAttrs().generatorStatus, DataManager.getDataSetGeneratorStatus().shadowPoint)
                        .addClass(DataManager.getPointChanceWrapClasses().layer_1.shadowPoint)
                        .finish()
                );

            pointChanceWrappers.push(pointChanceWrap.finish());
        }

        return pointChanceWrappers;
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