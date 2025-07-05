/**
 * @typedef {Object} SaveGenerator
 * @property {string} name
 * @property {boolean} hinted
 * @property {boolean} canBuild
 * @property {number} [progress=0]
 * @property {boolean} built
 * @property {number} timesUsed
 * @property {number} [remainingCD=0]
 * @property {number} currentMultiplier
 * @property {SaveGeneratorPoints[]} generatesPoints
 * @property {SaveGeneratorElement[]} [elements]
 */

/**
 * @typedef {Object} SaveGeneratorPoints
 * @property {string} type
 * @property {number} currentChance
 * @property {number} [guaranteedChanceTries=0]
 */

/**
 * @typedef {Object} SaveGeneratorElement
 * @property {string} name
 * @property {boolean} hinted
 * @property {boolean} built
 * @property {number} [remainingCD]
 * @property {number} [cellLoad]
 */