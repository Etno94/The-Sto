import {POINT_PROPS, POINT_TYPES} from '../data/points.data.js';

export default class PointCollection {

    collection = {};
    totalValue = 0;

    /**
     * @param { {[key: string]: number} } newCollection 
     */
    constructor(newCollection) {
        for (const point of POINT_PROPS) this.collection[point] = 0;
        if (newCollection) this.set(newCollection);
    }

    /**
     * @param {{[key: string]: number}} collectionValues 
     */
    set(collectionValues) {
        if (!collectionValues || 
            !typeof collectionValues === 'object')
            return;

        for (const [key, value] of Object.entries(collectionValues)) {
            if (this.collection.hasOwnProperty(key)) {
                this.totalValue += value - this.collection[key];
                this.collection[key] = value;
            }
        }
    }

    /**
     * @returns {{[key: string]: number}} POINT_PROPS from points.data.js
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