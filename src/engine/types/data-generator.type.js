/**
 * @typedef {Object} DataGenerator
 * @property {string} name
 * @property {number} generates
 * @property {PointSet} [consumes]
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
 * @typedef {Object} BuildGeneratorData
 * @property {number} defaultStepProgress
 */


/**
 * @typedef {Object} DataGeneratorClasses
 * @property {string[]} default
 * @property {string[]} hint
 */