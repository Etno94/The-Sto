import {POINT_TYPES} from './points.data.js';

export const GENERATOR_IDS = {
    CLICK: 'clickGenerator',
    COOLDOWN: 'cooldownGenerator'
}

/** @type {DataGeneratorClasses} */
export const GENERATOR_CLASSES = {
    default: ["cell", "m-24"],
    hint: ['hint'],
    canBuild: ['blank'],
    onCd: ['on-cd']
}

/**
 * @type {DataGenerator}
 */
const CLICK_GENERATOR = {
    name: GENERATOR_IDS.CLICK,
    generates: {
        [POINT_TYPES.point]: 1
    }
}

/**
 * @type {DataGenerator}
 */
const COOLDOWN_GENERATOR = {
    name: GENERATOR_IDS.COOLDOWN,
    generates: {
        [POINT_TYPES.solid_point]: 1
    },
    consumes: {
        [POINT_TYPES.point]: 2
    },
    cooldown: 5000,
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
 * @type {DataGenerator[]}
 */
export const GENERATORS = [
    CLICK_GENERATOR,
    COOLDOWN_GENERATOR
]

/**
 * @type { BuildGeneratorData }
 */
export const BUILD_GENERATOR = {
    defaultStepProgress: 1
}