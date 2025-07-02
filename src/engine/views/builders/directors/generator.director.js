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
     * @param {{element: HTMLElement, chance: number}[]} pointElementsWithChances
     * @returns {HTMLDivElement[]}
     */
    static createPointChanceWrap(pointElementsWithChances = []) {
        Asserts.array(pointElementsWithChances);

        /** @type {HTMLElement[]} */
        let pointChanceWrappers = [];

        for (const {element, chance} of pointElementsWithChances) {
            const pointChanceWrap = new ElBuilder('div')
                .addClass(DataManager.getPointChanceWrapClasses().layer_0)
                .setProperty('--point-chance-percent', `${chance}%`)
                .appendChild(
                    new ElBuilder(element)
                        .addDataSet(DataManager.getDataSetAttrs().generatorStatus, DataManager.getDataSetGeneratorStatus().pointChance)
                        .finish()
                )
                .appendChild(
                    new ElBuilder(element)
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
            .addClass(DataManager.getCostPreviewClasses())
            .addDataSet(DataManager.getDataSetAttrs().type, DataManager.getDataSetTypes().costPreview)
            .finish();
    }

}