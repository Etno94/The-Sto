import ElBuilder from "../element.builder.js";
import DataManager from "../../../systems/managers/data.manager.js";

export default class PointDirector {

    /**
     * @param {string[]} [classes=[]]
     * @returns {HTMLDivElement}
     */
    static createBasicPoint(classes = []) {
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
        return new ElBuilder('div')
            .addClass(DataManager.getPointClassesData().energy_point.layer_0)
            .addClass(classes)
            .addDataSet(DataManager.getDataSetAttrs().type, DataManager.getDataSetTypes().point)
            .addDataSet(DataManager.getDataSetAttrs().pointType, DataManager.getPointTypesData().energy_point)
            .finish();
    }
}