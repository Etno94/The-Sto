import ElBuilder from "../element.builder.js";
import { POINT_TYPES, POINT_CLASSES } from "../../data/points.data.js";

export default class PointDirector {

    /**
     * @param {string[]} [classes=[]]
     * @returns {HTMLDivElement}
     */
    static createBasicPoint(classes = []) {
        return new ElBuilder('div')
                .addClass(POINT_CLASSES.point)
                .addClass(classes)
                .addAttribute('data-type', POINT_TYPES.point)
                .finish();
    }

    /**
     * @param {string[]} [classes=[]]
     * @returns {HTMLDivElement}
     */
    static createSolidPoint(classes = []) {
        return new ElBuilder('div')
                .addClass(POINT_CLASSES.solid_point)
                .addClass(classes)
                .addAttribute('data-type', POINT_TYPES.solid_point)
                .appendChild(
                    new ElBuilder('div')
                        .addClass('inner-point')
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
                .addClass(POINT_CLASSES.energy_point)
                .addClass(classes)
                .addAttribute('data-type', POINT_TYPES.energy_point)
                .finish();
    }
}