/**
 * @typedef { Object } DataSet
 * @property { DataSetTypes } types
 * @property { DataSetAttr } attr
 */

/**
 * @typedef { Object } DataSetAttr
 * @property { string } type => DataSetTypes
 * @property { string } pointType => PointTypes
 * @property { string } status => DataSetStatus
 * @property { string } generatorStatus => DataSetGeneratorStatus
 */

/**
 * @typedef { Object } DataSetTypes
 * @property { string } point
 * @property { string } generator
 * @property { string } costPreview
 * @property { string } wrap
 * @property { string } generatorStatus => DataSetGeneratorStatus
 * @property { string } cdCharges
 * @property { string } pulseCells
 * @property { string } animationElement
 */

/**
 * @typedef DataSetStatus
 * @property {string} remove
 * @property {string} cooldown
 */

/**
 * @typedef DataSetGeneratorStatus
 * @property {string} pointChance
 * @property {string} shadowPoint
 */