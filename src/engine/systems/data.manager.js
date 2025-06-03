import { GENERATORS } from '../data/generators.data.js';
import { STORAGE_UPGRADES } from '../data/storage.data.js';

export default class DataManager {

    // #region Generators

    /**
     * @param { string } generatorName 
     * @return {Object|null}
     */
    static getGeneratorData(generatorName) {
        return GENERATORS.find(generator => generator.name === generatorName) || null;
    }

    /**
     * @return {Array}
     */
    static getAllGeneratorsData() {
        return GENERATORS || [];
    }

    // #endregion Generators
    
    // #region Storage

    static getMaxStorageData() {
        return STORAGE_UPGRADES;
    }

    static getBaseMaxStorage() {
        return STORAGE_UPGRADES.baseMaxStorage;
    }

    static getMaxStorageUpgrade() {
        return STORAGE_UPGRADES.maxStorageUpgrade;
    }

    static getCurrentMaxStorageCalc(currentMaxStorageLevel) {
        return STORAGE_UPGRADES.getCurrentMaxStorage(currentMaxStorageLevel);
    }

    // #endregion Storage

}