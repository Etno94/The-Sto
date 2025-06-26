import Asserts from "../asserts.js";
import Validators from "../validators.js";

class AdapterGeneratorGeneratesPointToPointSet {

    /**
     * Converts an array of generates points to a PointSet object.
     * @param {DataGeneratorGeneratesPoint[]} generatesPointArray - The array of generates points.
     * @returns {PointSet} - The converted PointSet object.
     */
    static convert(generatesPointArray) {
        Asserts.array(generatesPointArray);

        /** @type {PointSet} */
        const pointSet = {};
        for (const item of generatesPointArray) {
            if (!Validators.isNotNullNorUndefined(item.type) || !Validators.isString(item.type)) continue;
            pointSet[item.type] = (pointSet[item.type] || 0) + 1;
        }
        return pointSet;
    }
}
export const ToPointSet = AdapterGeneratorGeneratesPointToPointSet.convert;