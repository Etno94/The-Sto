import { GENERATOR_IDS, CLICK_GENERATOR, COOLDOWN_GENERATOR, CHARGE_GENERATOR } from './generators.data.js';
import { POINT_TYPES, FRESH_POINTS } from './points.data.js';
import { STORAGE_UPGRADES} from './storage.data.js';

import {ToSavePoints} from '../utils/adapters/generatorGenerates-to-saveGenerates.adapter.js';

/**
 * @type { SaveType }
 */
export const FRESH_SAVE = {
    time: {
        saveTimestamp: Date.now(),
        accumulator: 0
    },
    settings: {
        version: '0.1.0'
    },
    points: FRESH_POINTS,
    points_order: [],
    storage: {
        unlocked: false,
        maxStorageUpgradeCurrentLevel: STORAGE_UPGRADES.baseMaxStorageUpgradeLevel,
    },
    generators: [
        {
            name: GENERATOR_IDS.CLICK,
            hinted: true,
            canBuild: true,
            built: true,
            timesUsed: 0,
            currentMultiplier: CLICK_GENERATOR.generates.baseMultiplier,
            generatesPoints: ToSavePoints(CLICK_GENERATOR.generates.points)
        },
        {
            name: GENERATOR_IDS.COOLDOWN,
            hinted: false,
            canBuild: false,
            progress: 0,
            built: false,
            timesUsed: 0,
            remainingCD: 0,
            currentMultiplier: COOLDOWN_GENERATOR.generates.baseMultiplier,
            generatesPoints: ToSavePoints(COOLDOWN_GENERATOR.generates.points)
        },
        {
            name: GENERATOR_IDS.CHARGE,
            hinted: false,
            canBuild: false,
            progress: 0,
            built: false,
            timesUsed: 0,
            currentMultiplier: CHARGE_GENERATOR.generates.baseMultiplier,
            generatesPoints: ToSavePoints(CHARGE_GENERATOR.generates.points)
        },
    ]
}

/**
 * @type { SaveType[] }
 */
export const TEST_SAVES = [
    {
        time: {
            saveTimestamp: Date.now(),
            accumulator: 0
        },
        settings: {
            version: '1.0.0'
        },
        points: FRESH_POINTS,
        points_order: [],
        storage: {
            maxStorageUpgradeCurrentLevel: STORAGE_UPGRADES.baseMaxStorageUpgradeLevel,
        },
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
]
    