import {POINT_TYPES} from './points.data.js';

/** @type {DataGeneratorId} */
export const GENERATOR_IDS = {
    CLICK: 'clickGenerator',
    COOLDOWN: 'cooldownGenerator',
    PULSE: 'pulseGenerator'
}

/** @type {DataGeneratorClasses} */
export const GENERATOR_CLASSES = {
    default: ["cell"],
    hint: ['hint'],
    canBuild: ['blank'],
    onCd: ['on-cd']
}

/** @type {GeneratorElementNamesData} */
export const GENERATOR_ELEMENT_NAMES = {
    cdCharge1: 'cdCharge#1',
    cdCharge2: 'cdCharge#2',
    cdCharge3: 'cdCharge#3',
    pulseCell1: 'pulseCell#1',
    pulseCell2: 'pulseCell#2',
    pulseCell3: 'pulseCell#3',
}

/**
 * @type {DataGenerator}
 */
export const CLICK_GENERATOR = {
    name: GENERATOR_IDS.CLICK,
    generates: {
        baseMultiplier: 1,
        points: [
            {
                type: POINT_TYPES.point,
                baseChance: 180,
                updateChanceOnSuccess: -0.2,
                updateChanceOnFail: 1,
                startingGuaranteedChanceTries: 3
            }
        ]
    }
}

/**
 * @type {DataGenerator}
 */
export const COOLDOWN_GENERATOR = {
    name: GENERATOR_IDS.COOLDOWN,
    generates: {
        baseMultiplier: 1,
        points: [
            {
                type: POINT_TYPES.solid_point,
                baseChance: 100,
            }
        ]
    },
    consumes: {
        [POINT_TYPES.point]: 2
    },
    cooldown: {
        baseCooldown: 2000,
        cooldownIncrement: (cooldown) => cooldown * 1.05
    },
    unlockRequires: {
        hint: {
            [POINT_TYPES.point]: 2
        },
        build: {
            [POINT_TYPES.point]: 3
        }
    },
    buildRequires: {
        step: {
            [POINT_TYPES.point]: 1
        },
        totalSteps: 6
    },
    elementsUnlock: [
        {name: GENERATOR_ELEMENT_NAMES.cdCharge1},
        {
            name: GENERATOR_ELEMENT_NAMES.cdCharge2,
            unlockRequires: {
                hint: {
                    [POINT_TYPES.solid_point]: 4
                },
                build: {
                    [POINT_TYPES.solid_point]: 6
                }
            },
            buildRequires: {
                step: {
                    [POINT_TYPES.solid_point]: 3
                },
                totalSteps: 5
            }
        },
        {
            name: GENERATOR_ELEMENT_NAMES.cdCharge3,
            unlockRequires: {
                hint: {
                    [POINT_TYPES.energy_point]: 1
                },
                build: {
                    [POINT_TYPES.energy_point]: 4
                }
            },
            buildRequires: {
                step: {
                    [POINT_TYPES.energy_point]: 1
                },
                totalSteps: 8
            }
        },
    ]
}

/**
 * @type {DataGenerator}
 */
export const PULSE_GENERATOR = {
    name: GENERATOR_IDS.PULSE,
    generates: {
        baseMultiplier: 1,
        points: [
            {
                type: POINT_TYPES.energy_point,
                baseChance: 100
            }
        ]
    },
    consumes: {
        [POINT_TYPES.point]: 2,
        [POINT_TYPES.solid_point]: 2
    },
    cooldown: {
        baseCooldown: 2000,
        cooldownIncrement: (cooldown) => cooldown * 1.05
    },
    unlockRequires: {
        hint: {
            [POINT_TYPES.solid_point]: 1
        },
        build: {
            [POINT_TYPES.solid_point]: 2
        }
    },
    buildRequires: {
        step: {
            [POINT_TYPES.solid_point]: 2
        },
        totalSteps: 3
    },
    elementsUnlock: [
        {name: GENERATOR_ELEMENT_NAMES.pulseCell1},
        {
            name: GENERATOR_ELEMENT_NAMES.pulseCell2,
            unlockRequires: {
                hint: {
                    [POINT_TYPES.energy_point]: 3
                },
                build: {
                    [POINT_TYPES.energy_point]: 6
                }
            },
            buildRequires: {
                step: {
                    [POINT_TYPES.energy_point]: 2
                },
                totalSteps: 10
            }
        },
        {
            name: GENERATOR_ELEMENT_NAMES.pulseCell3,
            unlockRequires: {
                hint: {
                    [POINT_TYPES.energy_point]: 10
                },
                build: {
                    [POINT_TYPES.energy_point]: 12
                }
            },
            buildRequires: {
                step: {
                    [POINT_TYPES.energy_point]: 4
                },
                totalSteps: 16
            }
        },
    ]
}

/**
 * @type {DataGenerator[]}
 */
export const GENERATORS = [
    CLICK_GENERATOR,
    COOLDOWN_GENERATOR,
    PULSE_GENERATOR
]

/**
 * @type { BuildGeneratorData }
 */
export const BUILD_GENERATOR = {
    defaultStepProgress: 1
}

/**
 * @type { GeneratorElementsData }
 */
export const GENERATOR_ELEMENTS_DATA = {
    cdCharges: [
        {
            name: GENERATOR_ELEMENT_NAMES.cdCharge1,
            baseCd: (currentCd) => currentCd
        },
        {
            name: GENERATOR_ELEMENT_NAMES.cdCharge2,
            baseCd: (currentCd) => currentCd * 2
        },
        {
            name: GENERATOR_ELEMENT_NAMES.cdCharge3,
            baseCd: (currentCd) => currentCd * 4
        }
    ],
    pulseCells: [
        {
            name: GENERATOR_ELEMENT_NAMES.pulseCell1,
            loadCell: {
                type: POINT_TYPES.point,
                total: 50
            }
        },
        {
            name: GENERATOR_ELEMENT_NAMES.pulseCell2,
            loadCell: {
                type: POINT_TYPES.solid_point,
                total: 30
            }
        },
        {
            name: GENERATOR_ELEMENT_NAMES.pulseCell3,
            loadCell: {
                type: POINT_TYPES.energy_point,
                total: 10
            }
        }
    ]
}