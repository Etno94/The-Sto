import ElFtry from "../element.factory.js";
import { POINT_TYPES } from "../../data/points.data.js";

export class PointDirector {

    /**
     * @returns {HTMLDivElement}
     */
    createBasicPoint() {
        return new ElFtry('div')
                .addClass(POINT_CLASSES.point)
                .addAttribute('data-type', POINT_TYPES.point)
                .finish();
    }

    /**
     * @returns {HTMLDivElement}
     */
    createSolidPoint() {
        return new ElFtry('div')
                .addClass(POINT_CLASSES.point)
                .addAttribute('data-type', POINT_TYPES.solid_point)
                .appendChild(
                    new ElFtry('div')
                        .addClass('inner-point')
                        .finish()
                )
                .finish();
    }

    /**
     * @returns {HTMLDivElement}
     */
    createEnergyPoint() {
        return new ElFtry('div')
                .addClass(POINT_CLASSES.point)
                .addAttribute('data-type', POINT_TYPES.energy_point)
                .finish();
    }
}