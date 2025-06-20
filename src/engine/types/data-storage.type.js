/**
 * @typedef {Object} DataStorage
 * @property {number} baseMaxStorageUpgradeLevel
 * @property {number} baseMaxStorage
 * @property {number} topMaxStorage
 * @property {UnlockRequires} [unlockRequires]
 * @property {BuildRequires} [buildRequires]
 * @property {MaxStorageUpgradeInterval[]} maxStorageUpgradeIntervals
 * @property {(currentLevel: number) => MaxStorageUpgradeInterval} getCurrentIntervalUpgradeCost
 * @property {(currentLevel: number) => number} getCurrentMaxStorage
 */

/**
 * @typedef {Object} MaxStorageUpgradeInterval
 * @property {string} name
 * @property {number} minLevel
 * @property {number} levelRequired
 * @property {number} maxLevel
 * @property {(currentLevel: number) => number} costFormula
 * @property {string} step
 */