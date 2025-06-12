/**
 * @typedef { Object } BusEvents 
 * @property { GeneratorBusEvents } generator
 * @property { PointsBusEvents } points
 * @property { UIBusEvents } ui
 */

/**
 * @typedef { Object } GeneratorBusEvents
 * @property { string } onClick
 * @property { string } onCD
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
 * @typedef { Object } UIBusEvents
 * @property { string } render
 */
