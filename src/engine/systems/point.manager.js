import Global from "../core/global.js";
import DataManager from "./data.manager.js";
import Utils from "../utils/utils.js";
import Validators from '../utils/validators.js';
import Errors from '../utils/errors.js';

export default class PointManager {

    /**
     * @param { PointSet } generatePoints 
     * @param { PointSet } consumePoints 
     */
    balancePoints (generatePoints, consumePoints) {

    }

    /**
     * @param {PointSet} pointsToMeet
     * @returns {Boolean}
     */
    hasEnoughPoints(pointsToMeet) {
    let hasEnoughPoints = true;
    if (pointsToMeet) {
        for (const [key, value] of Object.entries(pointsToMeet)) {
        if (value > Global.proxy.points[key]) hasEnoughPoints = false;
        }
    }
    return hasEnoughPoints;
    }
}