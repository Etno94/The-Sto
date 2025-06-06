import { BUS_EVENTS } from '../../data/bus-events.data.js';
import { POINT_PROPS } from '../../data/points.data.js';
import { GENERATORS, BUILD_GENERATOR } from '../../data/generators.data.js';
import { STORAGE_UPGRADES } from '../../data/storage.data.js';
import Utils from '../../utils/utils.js';


export default class DataManager {

    // #region Event Bus

    /**
     * @returns { BusEvents }
     */
    static getBusEventsData() {
        return Utils.deepCopy(BUS_EVENTS) || null;
    }

    // #endregion Event Bus

    // #region Points

    /**
     * @returns { string[] }
     */
    static getPointTypeData() {
        return Utils.arrCopy(POINT_PROPS) || [];
    }

    // #endregion Points

    // #region Generators

    /**
     * @param { string } generatorName 
     * @return { DataGenerator | null }
     */
    static getGeneratorData(generatorName) {
        return Utils.deepCopy(GENERATORS.find(generator => generator.name === generatorName)) || null;
    }

    /**
     * @return { DataGenerator[] | [] }
     */
    static getAllGeneratorsData() {
        return Utils.arrCopy(GENERATORS) || [];
    }

    /**
     * @returns { BuildGeneratorData | null }
     */
    static getBuildGeneratorData() {
        return Utils.deepCopy(BUILD_GENERATOR) || null;
    }

    /**
     * @returns { number | null }
     */
    static getDefaultStepProgress() {
        return DataManager.getBuildGeneratorData()?.defaultStepProgress || null;
    }

    // #endregion Generators
    
    // #region Storage

    static getMaxStorageData() {
        return Utils.deepCopy(STORAGE_UPGRADES);
    }

    static getBaseMaxStorage() {
        return Utils.deepCopy(STORAGE_UPGRADES.baseMaxStorage);
    }

    static getMaxStorageUpgrade() {
        return Utils.deepCopy(STORAGE_UPGRADES.maxStorageUpgrade);
    }

    static getCurrentMaxStorageCalc(currentMaxStorageLevel) {
        return STORAGE_UPGRADES.getCurrentMaxStorage(currentMaxStorageLevel);
    }

    // #endregion Storage

}