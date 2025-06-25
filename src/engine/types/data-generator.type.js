/**
 * @typedef {Object} DataGeneratorId
 * @property {string} CLICK
 * @property {string} COOLDOWN
 * @property {string} CHARGE
 */

/**
 * @typedef {Object} DataGenerator
 * @property {string} name
 * @property {PointSet} [generates]
 * @property {PointSet} [consumes]
 * @property {GeneratorCooldownData} [cooldown]
 * @property {UnlockRequires} [unlockRequires]
 * @property {BuildRequires} [buildRequires]
 */

/**
 * @typedef {Object} UnlockRequires
 * @property {PointSet} hint
 * @property {PointSet} build
 */

/**
 * @typedef {Object} BuildRequires
 * @property {PointSet} step
 * @property {number} totalSteps
 */

/**
 * @typedef {Object} GeneratorCooldownData
 * @property {number} baseCooldown
 * @property {Function} cooldownIncrement
 */

/**
 * @typedef {Object} BuildGeneratorData
 * @property {number} defaultStepProgress
 */


/**
 * @typedef {Object} DataGeneratorClasses
 * @property {string[]} default
 * @property {string[]} hint
 * @property {string[]} canBuild
 * @property {string[]} onCd
 */