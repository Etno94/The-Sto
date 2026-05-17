import {POINT_TYPES} from './points.data.js';
import Validators from '../utils/validators.js';

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
            maxLevel: 7,
            costFormula: (currentLevel) => (currentLevel * 2) - 7,
            step: POINT_TYPES.solid_point
        },
        {
            name: 'energy-interval',
            minLevel: 8,
            levelRequired: 8,
            maxLevel: 9,
            costFormula: (currentLevel) => Math.max(0, Math.floor(10 * currentLevel - 79)),
            step: POINT_TYPES.energy_point
        }
    ],
    /** @returns {MaxStorageUpgradeInterval | null} */
    getCurrentIntervalUpgradeCost: (currentLevel) => {
        const interval = STORAGE_UPGRADES.maxStorageUpgradeIntervals.find(
            interval => interval.minLevel <= currentLevel && interval.maxLevel >= currentLevel);
            
        return Validators.isObjectWithNotNullNorUndefinedValues(interval) ? interval : null;
    },
    getCurrentMaxStorage: (currentLevel) => {
        return Math.min(
            STORAGE_UPGRADES.baseMaxStorage + currentLevel - 1, 
            STORAGE_UPGRADES.topMaxStorage);
    }
};