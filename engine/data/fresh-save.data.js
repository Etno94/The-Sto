import { GENERATOR_IDS } from './generators.data.js';
import {POINT_PROPS} from '../data/points.data.js';

const points = POINT_PROPS.reduce((acc, key) => {
    acc[key] = 0;
    return acc;
}, {});


export const FRESH_SAVE = {
    points,
    points_order: [],
    maxStorageUpgradeCurrentLevel: 0,
    maxStorage: 3,
    generators: [
        {
            name: GENERATOR_IDS.CLICK,
            built: true
        },
        {
            name: GENERATOR_IDS.COOLDOWN,
            hinted: false,
            canBuild: false,
            progress: 0,
            built: false
        }
    ]
}

export const TEST_SAVE = {
    points,
    points_order: [],
    maxStorageUpgradeCurrentLevel: 0,
    maxStorage: 3,
    generators: [
        {
            name: GENERATOR_IDS.CLICK,
            built: true
        },
        {
            name: GENERATOR_IDS.COOLDOWN,
            hinted: false,
            canBuild: false,
            progress: 0,
            built: true
        }
    ]
}