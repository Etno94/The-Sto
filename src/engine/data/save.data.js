import { GENERATOR_IDS } from './generators.data.js';
import { FRESH_POINTS } from './points.data.js';


/**
 * @type { SaveType }
 */
export const FRESH_SAVE = {
    points: FRESH_POINTS,
    points_order: [],
    storage: {
        maxStorageUpgradeCurrentLevel: 0,
        maxStorage: 3,
    },
    generators: [
        {
            name: GENERATOR_IDS.CLICK,
            hinted: true,
            canBuild: true,
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

/**
 * @type { SaveType[] }
 */
export const TEST_SAVES = [
    {
        points: FRESH_POINTS,
        points_order: [],
        storage: {
            maxStorageUpgradeCurrentLevel: 0,
            maxStorage: 3,
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
    