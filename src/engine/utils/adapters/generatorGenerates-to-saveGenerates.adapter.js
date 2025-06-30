import Asserts from "../asserts.js";

class AdapterGeneratorGeneratesPointToSaveGeneratesPoint {

    /**
     * Converts an array of generates points to a PointSet object.
     * @param {DataGeneratorGeneratesPoint[]} generatesPointArray - The array of generates points.
     * @returns {PointSet} - The converted PointSet object.
     */
    static convert(generatesPointArray) {
        Asserts.nonEmptyArray(generatesPointArray);

        /** @type {SaveGeneratorPoints[]} */
        const saveGeneratorPoints = [];
        for (const item of generatesPointArray) {
            Asserts.noNullValuesObject(item, 'generatesPointArray item');

            saveGeneratorPoints.push({
                type: item.type,
                currentChance: item.baseChance,
                guaranteedChanceTries: item.startingGuaranteedChanceTries || 0
            })
        }
        return saveGeneratorPoints;
    }
}
export const ToSavePoints = AdapterGeneratorGeneratesPointToSaveGeneratesPoint.convert;