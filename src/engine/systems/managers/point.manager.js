import Global from "../core/global.js";

import {EventBus, Events} from "../core/event-bus.js";

import DataManager from "./data.manager.js";
import PointCollection from './point.collection.js';

import Utils from "../utils/utils.js";

export default class PointManager {

    /**
     * @type { string[] }
     */
    #pointProps = [];

    constructor () {
        this.#pointProps = DataManager.getPointTypeData();
        this.#setBusEvents();
    }

    #setBusEvents() {
        EventBus.on(Events.points.add, (points) => this.#addPoints(points));
        EventBus.on(Events.points.substract, (points) => this.#substractPoints(points));
        EventBus.on(Events.points.burnAll, () => this.#burnPoints());
    }

    // #region Manage

    /**
     * @param { PointSet } generatePoints 
     */
    #addPoints(generatePoints) {
        const points = new PointCollection(generatePoints).collection;
        for (const type of this.#pointProps) {
            Global.proxy.points[type] += points[type];
            Global.proxy.points_order.push(...new Array(points[type]).fill(type));
        }
    }

    /**
     * @param { PointSet } consumePoints 
     */
    #substractPoints(consumePoints) {
        const points = new PointCollection(consumePoints).collection;
        for (const type of this.#pointProps) {
            Global.proxy.points[type] -= points[type];
            Global.proxy.points_order = Utils.filterInitialNItems(
                Global.proxy.points_order, 
                (item) => item === type,
                points[type]);
        }
    }

    #burnPoints() {
        Global.proxy.points = new PointCollection().collection; // fresh PointSet
        Global.proxy.points_order = [];
    }

    // #endregion Manage

    // #region Access

    /**
     * @param {PointSet} pointsToMeet
     * @returns {Boolean}
     */
    hasEnoughPoints(pointsToMeet) {
        const points = new PointCollection().set(pointsToMeet).collection;
        let hasEnoughPoints = true;

        for (const [key, value] of Object.entries(points)) {
            if (value > Global.proxy.points[key]) hasEnoughPoints = false;
        }
        
        return hasEnoughPoints;
    }

    /**
     * @returns { number }
     */
    getCurrentTotalPoints() {
        return new PointCollection(Global.proxy.points).total;
    }

    // #endregion Access
}