import ElBuilder from "../builders/element.builder.js";
import { POINT_TYPES, POINT_CLASSES } from "../../data/points.data.js";
import { DATA_SET_ATTRs, DATA_SET_TYPES } from "../../data/data-set-attr.data.js";

export default class PointDirector {

    /**
     * @param {string[]} [classes=[]]
     * @returns {HTMLDivElement}
     */
    static createBasicPoint(classes = []) {
        return new ElBuilder('div')
            .addClass(POINT_CLASSES.point.layer_0)
            .addClass(classes)
            .addDataSet(DATA_SET_ATTRs.type, DATA_SET_TYPES.point)
            .addDataSet(DATA_SET_ATTRs.pointType, POINT_TYPES.point)
            .finish();
    }

    /**
     * @param {string[]} [classes=[]]
     * @returns {HTMLDivElement}
     */
    static createSolidPoint(classes = []) {
        return new ElBuilder('div')
            .addClass(POINT_CLASSES.solid_point.layer_0)
            .addClass(classes)
            .addDataSet(DATA_SET_ATTRs.type, DATA_SET_TYPES.point)
            .addDataSet(DATA_SET_ATTRs.pointType, POINT_TYPES.solid_point)
            .appendChild(
                new ElBuilder('div')
                    .addClass(POINT_CLASSES.solid_point.layer_1)
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
            .addClass(POINT_CLASSES.energy_point.layer_0)
            .addClass(classes)
            .addDataSet(DATA_SET_ATTRs.type, DATA_SET_TYPES.point)
            .addDataSet(DATA_SET_ATTRs.pointType, POINT_TYPES.energy_point)
            .finish();
    }
}