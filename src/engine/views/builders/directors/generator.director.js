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
     * @param {HTMLDivElement[]} [pointsToShow]
     * @returns {HTMLDivElement}
     */
    static createPointChancesWrap(pointsToShow = []) {
        /** @type {HTMLElement[]} */
        let lastWrappers = [];

        for (const point of pointsToShow) {
            const lastWrapper = new ElBuilder('div')
                .addClass(DataManager.getPointChancesWrapClasses().layer_1)
                .appendChild(
                    new ElBuilder(point)
                        .addDataSet(DataManager.getDataSetAttrs().generatorStatus, DataManager.getDataSetGeneratorStatus().point)
                        .finish()
                )
                .appendChild(
                    new ElBuilder(point)
                        .addDataSet(DataManager.getDataSetAttrs().generatorStatus, DataManager.getDataSetGeneratorStatus().shadowPoint)
                        .addClass(DataManager.getPointChancesWrapClasses().layer_shadow_point)
                        .finish()
                );

            lastWrappers.push(lastWrapper.finish());
        }

        const pointChancesWrapper = new ElBuilder('div')
            .addClass(DataManager.getPointChancesWrapClasses().layer_0)

        for (const wrap of lastWrappers) {
            pointChancesWrapper.appendChild(wrap);
        }

        return pointChancesWrapper.finish();
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