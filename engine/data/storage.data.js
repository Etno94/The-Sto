export const STORAGE_UPGRADES = {
    maxStorageUpgradeCurrentLevel: 0,
    initialMaxStorage: 3,
    maxStorageUpgrade: 1,
    maxStorageUpgradeMaxLevel: 7,
    maxStorageUpgradeCostFormula: (maxStorageUpgradeCurrentLevel) => 2 ^ maxStorageUpgradeCurrentLevel,
    currentMaxStorage: (initialMaxStorage, maxStorageUpgradeCurrentLevel, maxStorageUpgrade) => initialMaxStorage + (maxStorageUpgradeCurrentLevel * maxStorageUpgrade),
}

