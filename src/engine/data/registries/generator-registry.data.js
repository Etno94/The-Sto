import {GENERATOR_IDS} from "../generators.data.js";

/** @type {DataGeneratorRegistry} */
export const DATA_GENERATOR_REGISTRY = {
    generatorName: {
        [GENERATOR_IDS.CLICK]: GENERATOR_IDS.CLICK,
        [GENERATOR_IDS.COOLDOWN]: GENERATOR_IDS.COOLDOWN,
        [GENERATOR_IDS.PULSE]: GENERATOR_IDS.PULSE
    },
    category: {
        statusItems: 'statusItems',
        cdCharges: 'cdCharges',
        pulseCells: 'pulseCharges'
    },
    itemPrefixes: {
        pointChance: 'pointChance',
        cdCharge: 'cdCharge',
        pulseCell: 'pulseCell'
    }
}