import {POINT_TYPES} from './points.data.js';

export const GENERATOR_IDS = {
    CLICK: 'clickGenerator',
    COOLDOWN: 'cooldownGenerator'
}

const CLICK_GENERATOR = {
    name: GENERATOR_IDS.CLICK,
    generates: {
        [POINT_TYPES.point]: 1
    }
}

const COOLDOWN_GENERATOR = {
    name: GENERATOR_IDS.COOLDOWN,
    generates: {
        [POINT_TYPES.solid_point]: 1
    },
    consumes: {
        [POINT_TYPES.point]: 2
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

export const GENERATORS = [
    CLICK_GENERATOR,
    COOLDOWN_GENERATOR
]