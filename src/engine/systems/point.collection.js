import DataManager from '../systems/data.manager.js';

import Validators from '../utils/validators.js';
import Errors from '../utils/errors.js';

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
        const pointProps = DataManager.getPointTypeData();
        for (const point of pointProps) this.collection[point] = 0;
        if (newCollection) this.set(newCollection);
    }

    /**
     * @param { PointSet } pointSet
     * @param { PointCollection }
     */
    set(pointSet) {
        if (!Validators.isObject(pointSet)) {
            Errors.invalidTypeError(typeof pointSet, 'object')
            return;
        }

        for (const [key, value] of Object.entries(pointSet)) {
            if (!Validators.isNumber(value)) {
                Errors.invalidTypeError(typeof value,'number');
            }
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