import { GENERATORS } from '../data/generators.data.js';
import { STORAGE_UPGRADES } from '../data/storage.data.js';
import Utils from '../utils/utils.js';

/// <reference path="../types/data-generator.type.js" />

export default class DataManager {

    // #region Generators

    /**
     * @param { string } generatorName 
     * @return { DataGenerator | null }
     */
    static getGeneratorData(generatorName) {
        return Utils.deepCopy(GENERATORS.find(generator => generator.name === generatorName)) || null;
    }

    /**
     * @return { DataGenerator[] }
     */
    static getAllGeneratorsData() {
        return Utils.arrCopy(GENERATORS) || [];
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