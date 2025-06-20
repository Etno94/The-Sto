/**
 * @typedef { Object } BusEvents 
 * @property { GeneratorBusEvents } generator
 * @property { PointsBusEvents } points
 * @property {StorageUpgradeBusEvents} storageUpgrade
 * @property { UIBusEvents } ui
 */

/**
 * @typedef { Object } GeneratorBusEvents
 * @property { string } onClick
 * @property { string } onCD
 * @property { string } updateCD
 * @property { string } ready
 * @property { string } onUse
 */

/**
 * @typedef { Object } PointsBusEvents
 * @property { string } add
 * @property { string } substract
 * @property { string } balance
 * @property { string } burnAll
 * @property { string } overcap
 */

/**
 * @typedef {Object} StorageUpgradeBusEvents
 * @property {string} unlocked
 * @property {string} onClick
 */

/**
 * @typedef { Object } UIBusEvents
 * @property { string } render
 * @property { UIPointsContainerBusEvents } pointsContainer
 */

/**
 * @typedef {Object} UIPointsContainerBusEvents
 * @property {string} hover
 */
