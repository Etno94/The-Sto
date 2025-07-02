import Asserts from '../../utils/asserts.js';
import { EventBus, Events } from '../../core/event-bus.js';
import Global from '../../core/global.js';

import DataManager from './data.manager.js';
class StorageManager {

    /** @type {HTMLElement} */
    #upgradeStorageWrapperElement = document.getElementById('storage-upgrade-wrap');
    /** @type {HTMLElement} */
    #upgradeStorageElement = document.getElementById('storage-upgrade');

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
        this.#updateMaxStorage(currentUpgradeLevel);
    }

    #setBusEvents() {
        EventBus.on(Events.storageUpgrade.upgrade, () => this.#upgradeMaxStorage());
    }

    /** @returns {boolean} */
    isStorageUpgradeUnlocked() {
        return Global.proxy.storage.unlocked;
    }

    /** @returns {boolean} */
    isStorageUpgradeDisabled() {
        return this.#upgradeStorageElement.disabled;
    }

    setStorageUpgradeUnlocked() {
        Global.proxy.storage.unlocked = true;
    }

    /**
     * @param { Number } currentTotal
     * @returns {Number}
     */
    storageSpaceLeft(currentTotal) {
        Asserts.number(currentTotal);
        return this.#currentMaxStorage - currentTotal;
    }

    /** @returns {PointSet} */
    getCurrentUpgradeCost() {
        const currentInterval = DataManager.getCurrentIntervalUpgradeCost(this.#currentUpgradeLevel);
        return {[currentInterval.step]: currentInterval.costFormula(this.#currentUpgradeLevel)};
    }

    /** @param { number } currentUpgradeLevel */
    #updateMaxStorage(currentUpgradeLevel) {
        Asserts.number(currentUpgradeLevel);

        this.#currentUpgradeLevel = currentUpgradeLevel;
        this.#currentMaxStorage = DataManager.getCurrentMaxStorageCalc(this.#currentUpgradeLevel);
        EventBus.emit(Events.storageUpgrade.onUpgrade, this.#currentMaxStorage);
    }

    #upgradeMaxStorage() {
        Global.proxy.storage.maxStorageUpgradeCurrentLevel += 1;
        this.#updateMaxStorage(Global.proxy.storage.maxStorageUpgradeCurrentLevel);
    }

    get upgradeStorageWrapperElement() {
        return this.#upgradeStorageWrapperElement;
    }

    get upgradeStorageElement() {
        return this.#upgradeStorageElement;
    }
}
export const storageM = new StorageManager();