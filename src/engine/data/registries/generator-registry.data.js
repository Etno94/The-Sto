import {GENERATOR_IDS} from "../generators.data.js";

/** @type {DataGeneratorRegistry} */
export const DATA_GENERATOR_REGISTRY = {
    generatorName: {
        [GENERATOR_IDS.CLICK]: GENERATOR_IDS.CLICK,
        [GENERATOR_IDS.COOLDOWN]: GENERATOR_IDS.COOLDOWN,
        [GENERATOR_IDS.CHARGE]: GENERATOR_IDS.CHARGE
    },
    category: {
        statusItems: 'statusItems',
        cdCharges: 'cdCharges',
        pulseCharges: 'pulseCharges'
    },
    itemPrefixes: {
        pointChance: 'pointChance',
        cdCharge: 'cdCharge',
        pulseCell: 'pulseCell'
    }
}