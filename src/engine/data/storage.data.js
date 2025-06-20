import {POINT_TYPES} from './points.data.js';
import Asserts from '../utils/asserts.js';

/** @type {DataStorage} */
export const STORAGE_UPGRADES = {
    baseMaxStorageUpgradeLevel: 1,
    baseMaxStorage: 3,
    topMaxStorage: 12,
    maxStorageUpgradeIntervals: [
        {
            name: 'basic-interval',
            minLevel: 1,
            levelRequired: 1,
            maxLevel: 3,
            costFormula: (currentLevel) => (currentLevel * 2) - 1,
            step: POINT_TYPES.point
        },
        {
            name: 'solid-interval',
            minLevel: 4,
            levelRequired: 4,
            maxLevel: 10,
            costFormula: (currentLevel) => (currentLevel * 2) - 7,
            step: POINT_TYPES.solid_point
        }
    ],
    getCurrentIntervalUpgradeCost: (currentLevel) => {
        const interval = STORAGE_UPGRADES.maxStorageUpgradeIntervals.find(
            interval => interval.minLevel <= currentLevel && interval.maxLevel >= currentLevel);
        Asserts.noNullValuesObject(interval);

        return interval;
    },
    getCurrentMaxStorage: (currentLevel) => {
        return Math.min(
            STORAGE_UPGRADES.baseMaxStorage + currentLevel - 1, 
            STORAGE_UPGRADES.topMaxStorage);
    }
};