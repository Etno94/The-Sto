import ElBuilder from "../element.builder.js";
import DataManager from "../../../systems/managers/data.manager.js";
import Asserts from "../../../utils/asserts.js";

export default class PointDirector {

    /**
     * @param {string[]} [classes=[]]
     * @param {HTMLDivElement} pointToWrap
     * @returns {HTMLDivElement}
     */
    static wrapBasicPoint(pointToWrap, classes = []) {
        Asserts.stringArray(classes);
        Asserts.htmlElement(pointToWrap);

        return new ElBuilder('div')
            .addClass(DataManager.getPointClassesData().wrap.layer_0)
            .addClass(classes)
            .appendChild(pointToWrap)
            .finish();
    }

    /**
     * @param {string[]} [classes=[]]
     * @returns {HTMLDivElement}
     */
    static createBasicPoint(classes = []) {
        Asserts.stringArray(classes);

        return new ElBuilder('div')
            .addClass(DataManager.getPointClassesData().point.layer_0)
            .addClass(classes)
            .addDataSet(DataManager.getDataSetAttrs().type, DataManager.getDataSetTypes().point)
            .addDataSet(DataManager.getDataSetAttrs().pointType, DataManager.getPointTypesData().point)
            .finish();
    }

    /**
     * @param {string[]} [classes=[]]
     * @returns {HTMLDivElement}
     */
    static createSolidPoint(classes = []) {
        Asserts.stringArray(classes);

        return new ElBuilder('div')
            .addClass(DataManager.getPointClassesData().solid_point.layer_0)
            .addClass(classes)
            .addDataSet(DataManager.getDataSetAttrs().type, DataManager.getDataSetTypes().point)
            .addDataSet(DataManager.getDataSetAttrs().pointType, DataManager.getPointTypesData().solid_point)
            .appendChild(
                new ElBuilder('div')
                    .addClass(DataManager.getPointClassesData().solid_point.layer_1)
                    .finish()
            )
            .finish();
    }

    /**
     * @param {string[]} [classes=[]]
     * @returns {HTMLDivElement}
     */
    static createEnergyPoint(classes = []) {
        Asserts.stringArray(classes);
        
        return new ElBuilder('div')
            .addClass(DataManager.getPointClassesData().energy_point.layer_0)
            .addClass(classes)
            .addDataSet(DataManager.getDataSetAttrs().type, DataManager.getDataSetTypes().point)
            .addDataSet(DataManager.getDataSetAttrs().pointType, DataManager.getPointTypesData().energy_point)
            .finish();
    }
}