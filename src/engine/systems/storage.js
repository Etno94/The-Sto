export class Storage {

    initialMaxStorage = 3;
    maxStorageUpgradeStep = 1;
    maxStorageUpgradeMaxLevel = 7;
    maxStorageUpgradeCurrentLevel = 0;

    constructor(maxStorageUpgradeCurrentLevel) {
        this.maxStorageUpgradeCurrentLevel = maxStorageUpgradeCurrentLevel;
    }

    maxStorageUpgradeCostFormula () {
        return 2 ^ this.maxStorageUpgradeCurrentLevel;
    }

    currentMaxStorage () {
        return this.initialMaxStorage + (this.maxStorageUpgradeCurrentLevel * this.maxStorageUpgradeStep);
    }
}