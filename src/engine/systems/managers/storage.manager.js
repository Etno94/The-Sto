import Asserts from '../../utils/asserts.js';
import { EventBus, Events } from '../../core/event-bus.js';
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
        this.#setBusEvents();
    }

    /** @param { number } currentUpgradeLevel */
    setCurrentStorage(currentUpgradeLevel) {
        Asserts.number(currentUpgradeLevel);

        this.updateMaxStorage(currentUpgradeLevel);
        if (Global.proxy.storage.unlocked) this.#recentlyUnlocked = true;
    }

    #setBusEvents() {
        EventBus.on(Events.storageUpgrade.upgrade, () => this.#upgradeMaxStorage());
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
     * @param { Number } currentTotal
     * @param { Number } totalToGenerate
     * @param { Number } totalToConsume
     * @returns {Boolean}
     */
    doesOvercap(currentTotal, totalToGenerate, totalToConsume) {
        Asserts.number(currentTotal);
        Asserts.number(totalToGenerate);
        Asserts.number(totalToConsume);

        return this.#currentMaxStorage < currentTotal + totalToGenerate - totalToConsume;
    }

    /** @returns {PointSet} */
    getCurrentUpgradeCost() {
        const currentInterval = DataManager.getCurrentIntervalUpgradeCost(this.#currentUpgradeLevel);
        return {[currentInterval.step]: currentInterval.costFormula(this.#currentUpgradeLevel)};
    }

    /** @param { number } currentUpgradeLevel */
    updateMaxStorage(currentUpgradeLevel) {
        Asserts.number(currentUpgradeLevel);

        this.#currentUpgradeLevel = currentUpgradeLevel;
        this.#currentMaxStorage = DataManager.getCurrentMaxStorageCalc(this.#currentUpgradeLevel);
        EventBus.emit(Events.storageUpgrade.onUpgrade, this.#currentMaxStorage);
    }

    #upgradeMaxStorage() {
        Global.proxy.storage.maxStorageUpgradeCurrentLevel += 1;
        this.updateMaxStorage(Global.proxy.storage.maxStorageUpgradeCurrentLevel);
    }
}
export const storageM = new StorageManager();