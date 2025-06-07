import DataManager from '../systems/managers/data.manager.js';

import Errors from '../utils/errors.js';
import Asserts from '../utils/asserts.js';

export default class PointCollection {

    /**
     * @type { PointSet }
     */
    collection = {};
    
    totalValue = 0;

    /**
     * @param { PointSet } newCollection 
     */
    constructor(newCollection) {
        const pointProps = DataManager.getPointPropsData();
        for (const point of pointProps) this.collection[point] = 0;
        if (newCollection) this.set(newCollection);
    }

    /**
     * @param { PointSet } pointSet
     * @param { PointCollection }
     */
    set(pointSet) {
        Asserts.object(pointSet, 'pointSet');

        for (const [key, value] of Object.entries(pointSet)) {
            Asserts.number(value);
            if (this.collection.hasOwnProperty(key)) {
                this.totalValue += value - this.collection[key];
                this.collection[key] = value;
            } else {
                this.collection = {};
                Errors.invalidObjectPropError(key);
            }
        }

        return this;
    }

    /**
     * @returns { PointSet }
     */
    get collection() {
        return this.collection;
    }

    /**
     * @returns {Number}
     */
    get total() {
        return this.totalValue;
    }
}