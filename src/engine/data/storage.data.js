import {POINT_TYPES} from './points.data.js';

/** @type {DataStorage} */
export const STORAGE_UPGRADES = {
    baseMaxStorage: 3,
    unlockRequires: {
        hint: {
            [POINT_TYPES.point]: 1
        },
        build: {
            [POINT_TYPES.solid_point]: 2
        }
    },
    buildRequires: {
        step: {
            [POINT_TYPES.point]: 2
        },
        totalSteps: 3
    },
    maxStorageUpgrade: {
        interval: 1,
        maxLevel: 9,
        costFormula: (currentMaxStorageLevel) => 2 ** currentMaxStorageLevel
    },
    getCurrentMaxStorage: (currentMaxStorageLevel) => {
        return STORAGE_UPGRADES.baseMaxStorage + ( currentMaxStorageLevel * STORAGE_UPGRADES.maxStorageUpgrade.interval);
    }
};