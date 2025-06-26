// General UI identifiers
/**
 * @typedef {Object} DataGeneratorId
 * @property {string} CLICK
 * @property {string} COOLDOWN
 * @property {string} CHARGE
 */

/**
 * @typedef {Object} DataGeneratorClasses
 * @property {string[]} default
 * @property {string[]} hint
 * @property {string[]} canBuild
 * @property {string[]} onCd
 */

// Generator Structure
/**
 * @typedef {Object} DataGenerator
 * @property {string} name
 * @property {PointSet | DataGeneratorGenerates} [generates]
 * @property {PointSet} [consumes]
 * @property {GeneratorCooldownData} [cooldown]
 * @property {UnlockRequires} [unlockRequires]
 * @property {BuildRequires} [buildRequires]
 */

// What generates and stats
/**
 * @typedef {Object} DataGeneratorGenerates
 * @property {number} baseMultiplier
 * @property {DataGeneratorGeneratesPoint[]} points
 */

/**
 * @typedef {Object} DataGeneratorGeneratesPoint
 * @property {string} type
 * @property {number} baseChance
 * @property {number} startingGuaranteedChanceTries
 */

// What needs to be unlocked
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

// Generator Mechanics
/**
 * @typedef {Object} GeneratorCooldownData
 * @property {number} baseCooldown
 * @property {Function} cooldownIncrement
 */


