/**
 * @typedef { Object } BusEvents 
 * @property { GeneratorBusEvents } generator
 * @property { PointsBusEvents } points
 * @property {StorageUpgradeBusEvents} storageUpgrade
 * @property { UIBusEvents } ui
 */

// Generator
/**
 * @typedef { Object } GeneratorBusEvents
 * @property { string } build
 * @property { string } built
 * @property { string } onClick
 * @property { string } onCD
 * @property { string } updateCD
 * @property { string } onDischarge
 * @property { string } discharged
 * @property { string } ready
 * @property { string } onUse
 * @property { string } onTrigger
 * @property { GeneratorElementsBusEvents } elements
 */

// Generator Elements
/**
 * @typedef { Object } GeneratorElementsBusEvents
 * @property { GeneratorStatusItemsBusEvents } statusItems
 * @property { GeneratorCDChargesBusEvents } cdCharges
 * @property { GeneratorPulseCellsBusEvents } pulseCells
 * @property { string } onUse
 */

/**
 * @typedef { Object } GeneratorStatusItemsBusEvents
 * @property { GeneratorPointChanceBusEvents } pointChance
 */

/**
 * @typedef { Object } GeneratorPointChanceBusEvents
 * @property { string } created
 * @property { string } onUpdate
 * @property { string } updated
 */

/**
 * @typedef { Object } GeneratorCDChargesBusEvents
 * @property { string } build
 * @property { string } built
 * @property { string } onCd
 * @property { string } updateCd
 * @property { string } ready
 */

/**
 * @typedef { Object } GeneratorPulseCellsBusEvents
 * @property { string } build
 * @property { string } built
 * @property { string } load
 * @property { string } pulse
 */

// Points
/**
 * @typedef { Object } PointsBusEvents
 * @property { string } add
 * @property { string } substract
 * @property { string } substractByType
 * @property { string } substractedByType
 * @property { string } balance
 * @property { string } burnAll
 * @property { string } overcap
 */

// Storage
/**
 * @typedef {Object} StorageUpgradeBusEvents
 * @property {string} unlocked
 * @property {string} onClick
 * @property {string} upgrade
 * @property {string} onUpgrade
 */

// UI
/**
 * @typedef { Object } UIBusEvents
 * @property { string } render
 * @property { UIPointsContainerBusEvents } pointsContainer
 */

/**
 * @typedef {Object} UIPointsContainerBusEvents
 * @property {string} hover
 */
