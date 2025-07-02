import {POINT_TYPES} from './points.data.js';

/** @type {DataGeneratorId} */
export const GENERATOR_IDS = {
    CLICK: 'clickGenerator',
    COOLDOWN: 'cooldownGenerator',
    CHARGE: 'chargeGenerator'
}

/** @type {DataGeneratorClasses} */
export const GENERATOR_CLASSES = {
    default: ["cell"],
    hint: ['hint'],
    canBuild: ['blank'],
    onCd: ['on-cd']
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
                updateChanceOnSuccess: 0.2,
                updateChanceOnFail: -1,
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
    }
}

/**
 * @type {DataGenerator}
 */
export const CHARGE_GENERATOR = {
    name: GENERATOR_IDS.CHARGE,
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
    }
}

/**
 * @type {DataGenerator[]}
 */
export const GENERATORS = [
    CLICK_GENERATOR,
    COOLDOWN_GENERATOR,
    CHARGE_GENERATOR
]

/**
 * @type { BuildGeneratorData }
 */
export const BUILD_GENERATOR = {
    defaultStepProgress: 1
}