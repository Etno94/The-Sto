import {DataManager} from "../../../systems/managers-index.js";
import {Asserts, Utils} from "../../../utils/utils.index.js";

class PointChanceStrategy {

    /** @type {DataGeneratorId} */
    #generatorIds;

    /** @type {Object<string, function>} */
    #generatorRegistry;

    constructor() {
        this.#generatorIds = DataManager.getGeneratorIds();
        this.#generatorRegistry = {
            [this.#generatorIds.CLICK]: this.#updatePointChanceForClickGenerator,
            [this.#generatorIds.COOLDOWN]: this.#updatePointChanceForCDGenerator,
            [this.#generatorIds.PULSE]: this.#updatePointChanceForPulseGenerator,
        }
    }

    /** 
     * @param {string} generatorName 
     * @param {SaveGeneratorPoints[]} saveGeneratorPoints
     * @param {PointSet} pointSetGenerated
     * @param {DataGeneratorGeneratesPoint[]} dataGeneratorPoints
     * */
    useStrategyFor(generatorName, saveGeneratorPoints, pointSetGenerated, dataGeneratorPoints) {
        Asserts.string(generatorName);
        Asserts.nonEmptyArray(saveGeneratorPoints);
        Asserts.object(pointSetGenerated);
        Asserts.nonEmptyArray(dataGeneratorPoints);

        this.#generatorRegistry[generatorName](saveGeneratorPoints, pointSetGenerated, dataGeneratorPoints);
    }

    /** 
     * @param {SaveGeneratorPoints[]} saveGeneratorPoints
     * @param {PointSet} pointSetGenerated
     * @param {DataGeneratorGeneratesPoint[]} dataGeneratorPoints
     * */
    #updatePointChanceForClickGenerator(saveGeneratorPoints, pointSetGenerated, dataGeneratorPoints) {
        Asserts.nonEmptyArray(saveGeneratorPoints);
        Asserts.object(pointSetGenerated);
        Asserts.nonEmptyArray(dataGeneratorPoints);

        function hasGeneratedPoint(pointType) {
            return pointSetGenerated[pointType] > 0;
        }

        saveGeneratorPoints.forEach(point => {
            /** @type {DataGeneratorGeneratesPoint} */
            const dataPoint = dataGeneratorPoints.find(dataPoint => dataPoint.type === point.type);

            point.currentChance += hasGeneratedPoint(point.type) ? dataPoint.updateChanceOnSuccess : dataPoint.updateChanceOnFail;

            point.currentChance = Math.max(20, point.currentChance);
            point.currentChance = parseFloat((point.currentChance).toFixed(2));
            console.log(point.currentChance);
        });
    }

    #updatePointChanceForCDGenerator(...args) {
        console.log('strategy for cd gen')
    }

    /** 
     * @param {SaveGeneratorPoints[]} saveGeneratorPoints
     * @param {PointSet} pointSetGenerated
     * @param {DataGeneratorGeneratesPoint[]} dataGeneratorPoints
     * */
    #updatePointChanceForPulseGenerator(saveGeneratorPoints, pointSetGenerated, dataGeneratorPoints) {
        Asserts.nonEmptyArray(saveGeneratorPoints);
        Asserts.object(pointSetGenerated);
        Asserts.nonEmptyArray(dataGeneratorPoints);

        function hasGeneratedPoint(pointType) {
            return pointSetGenerated[pointType] > 0;
        }

        saveGeneratorPoints.forEach(point => {
            /** @type {DataGeneratorGeneratesPoint} */
            const dataPoint = dataGeneratorPoints.find(dataPoint => dataPoint.type === point.type);

            point.currentChance = hasGeneratedPoint(point.type) ? dataPoint.baseChance : dataPoint.baseChance + dataPoint.updateChanceOnFail;

            point.currentChance = parseFloat((point.currentChance).toFixed(2));
            console.log(point.currentChance);
        });
    }
}
export const pointChanceStrategy = new PointChanceStrategy();