import Global from "../../core/global.js";

import {EventBus, Events} from "../../core/event-bus.js";

import DataManager from "./data.manager.js";
import PointCollection from '../point.collection.js';

import Utils from "../../utils/utils.js";
import {Asserts} from "../../utils/utils.index.js";

class PointManager {

    /**
     * @type { string[] }
     */
    #pointProps = [];

    constructor () {
        this.#pointProps = DataManager.getPointPropsData();
        this.#setBusEvents();
    }

    #setBusEvents() {
        EventBus.on(Events.points.add, (points) => this.#addPoints(points));
        EventBus.on(Events.points.substract, (points) => this.#substractPoints(points));
        EventBus.on(Events.points.substractByType, (type, limit) => this.substractAllPointsByType(type, limit));
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

    /**
     * @param {string} type 
     * @param {Number} [limit]
     * @returns {Number}
     */
    substractAllPointsByType(type, limit = 0) {
        Asserts.string(type);

        const points = Global.proxy.points;
        if (!(type in points)) return;

        let amount = points[type] ?? 0;
        if (amount <= 0) return;

        if (!limit || limit < 0) limit = points[type];
        if (amount > limit) amount = limit;

        points[type] -= amount;

        return amount;
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

    /**
     * @param {PointSet} pointSetA 
     * @param {PointSet} pointSetB
     * @returns {PointSet}
     */
    calculatePointSetDiff(pointSetA, pointSetB) {

        // We validate both point sets
        /** @type {PointSet} */
        const collectionA = new PointCollection(pointSetA).collection;
        /** @type {PointSet} */
        const collectionB = new PointCollection(pointSetB).collection;
        /** @type {PointSet} */
        const pointSetDiff = new PointCollection().collection;

        for (const type of this.#pointProps) {
            pointSetDiff[type] = pointSetA[type] - pointSetB[type]
        }

        return pointSetDiff;
    }

    /**
     * @param {PointSet} DOMPointSet 
     * @return {PointSet} 
     */
    calculateDOMPointDiff(DOMPointSet) {
        // We validate point set
        const elemPointSet = new PointCollection(DOMPointSet).collection;
        const savePointSet = new PointCollection(Global.proxy.points).collection;

        return this.calculatePointSetDiff(savePointSet, elemPointSet);
    }

    // #endregion Access
}

export const pointM = new PointManager();