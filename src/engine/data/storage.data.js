export const STORAGE_UPGRADES = {
    baseMaxStorage: 3,
    maxStorageUpgrade: {
        interval: 1,
        maxLevel: 7,
        costFormula: (currentMaxStorageLevel) => 2 ** currentMaxStorageLevel
    },
    getCurrentMaxStorage: (currentMaxStorageLevel) => {
        return STORAGE_UPGRADES.baseMaxStorage + ( currentMaxStorageLevel * STORAGE_UPGRADES.maxStorageUpgrade.interval);
    }
};