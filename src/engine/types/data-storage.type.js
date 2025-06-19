/**
 * @typedef {Object} DataStorage
 * @property {number} baseMaxStorage
 * @property {UnlockRequires} unlockRequires
 * @property {BuildRequires} buildRequires
 * @property {MaxStorageUpgrade} maxStorageUpgrade
 * @property {Function} getCurrentMaxStorage
 */

/**
 * @typedef {Object} MaxStorageUpgrade
 * @property {number} interval
 * @property {number} maxLevel
 * @property {Function} costFormula
 */