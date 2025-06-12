/**
 * @typedef { Object } SaveType
 * @property { TimeSaveType } time
 * @property { SettingsSaveType } settings
 * @property { Collection } points
 * @property { string[] } points_order
 * @property { SaveStorage } storage
 * @property { SaveGenerator[] } generators
 */

/**
 * @typedef {Object} TimeSaveType
 * @property {Date} saveTimestamp
 * @property {number} accumulator
 */

/**
 * @typedef {Object} SettingsSaveType
 * @property {string} version
 */