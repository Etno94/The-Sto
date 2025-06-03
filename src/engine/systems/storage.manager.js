import DataManager from './data.manager.js';

export default class StorageManager {

    /**
     * @type { number }
     */
    #currentMaxStorage = 0;
    /**
     * @type { number }
     */
    #currentUpgradeLevel = 0;

    /**
     * @param { number } currentUpgradeLevel 
     */
    constructor(currentUpgradeLevel) {
        if (currentUpgradeLevel) this.setCurrentStorage(currentUpgradeLevel);
    }

    /**
     * @param { number } [currentUpgradeLevel] 
     */
    setCurrentStorage(currentUpgradeLevel) {
        this.#currentUpgradeLevel = currentUpgradeLevel;
        this.#currentMaxStorage = DataManager.getCurrentMaxStorageCalc(this.#currentUpgradeLevel);
    }

    /**
     * @param { Number } totalToGenerate
     * @param { Number } totalToConsume
     * @returns {Boolean}
     */
    doesOvercap(currentTotal, totalToGenerate, totalToConsume) {
        return this.#currentMaxStorage < currentTotal + totalToGenerate - totalToConsume;
    }
}