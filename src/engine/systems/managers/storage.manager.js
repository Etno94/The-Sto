import Global from '../../core/global.js';

import DataManager from './data.manager.js';
class StorageManager {

    /** @type {boolean} */
    #recentlyUnlocked = false;

    /** @type { number } */
    #currentMaxStorage = 0;
    /** @type { number } */
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
        this.updateMaxStorage(currentUpgradeLevel);
        if (Global.proxy.storage.unlocked) this.#recentlyUnlocked = true;
    }

    /** @returns {boolean} */
    isStorageUpgradeUnlocked() {
        return Global.proxy.storage.unlocked;
    }

    /** @returns {boolean} */
    wasStorageUpgradeRecentlyUnlocked() {
        if (this.#recentlyUnlocked) {
            this.#recentlyUnlocked = false;
            return Global.proxy.storage.unlocked;
        }
        return false;
    }

    setStorageUpgradeUnlocked() {
        Global.proxy.storage.unlocked = true;
        this.#recentlyUnlocked = true;
    }

    /**
     * @param { Number } totalToGenerate
     * @param { Number } totalToConsume
     * @returns {Boolean}
     */
    doesOvercap(currentTotal, totalToGenerate, totalToConsume) {
        return this.#currentMaxStorage < currentTotal + totalToGenerate - totalToConsume;
    }

    /** @returns {PointSet} */
    getCurrentUpgradeCost() {
        const currentInterval = DataManager.getCurrentIntervalUpgradeCost(this.#currentUpgradeLevel);
        return {[currentInterval.step]: currentInterval.costFormula(this.#currentUpgradeLevel)};
    }

    /**
     * @param { number } [currentUpgradeLevel] 
     */
    updateMaxStorage(currentUpgradeLevel) {
        this.#currentUpgradeLevel = currentUpgradeLevel;
        this.#currentMaxStorage = DataManager.getCurrentMaxStorageCalc(this.#currentUpgradeLevel);
    }
}
export const storageM = new StorageManager();