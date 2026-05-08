/** @type {string[]} */
export const WRAPPER_CLASSES = ['wrapper'];

/** @type {LifeCycle_Props} */
export const LIFE_CYCLE_CLASSES = {
    hidden: ['hidden'],
    hint: ['hint'],
    blank: ['blank']
};

/** @type {Status_Classes} */
export const STATUS_CLASSES = {
    onCd: ['on-cd'],
    loaded: ['loaded']
}

/** @type {GeneratorStatus_Wrap} */
export const GENERATOR_STATUS_WRAP_CLASSES = {
    layer_0: ['generator-status']
}

/** @type {PointChance_Wrap} */
export const POINT_CHANCE_WRAP_CLASSES = {
    layer_0: ['point-chance'],
    layer_1: {
        shadowPoint: ['half-opacity', 'pos-abs'],
        hiddenPoint: ['d-none']
    }
}

/** @type {Generator_CdCharges_Wrap} */
export const GENERATOR_CD_CHARGES_WRAP_CLASSES = {
    layer_0: ['cd-charges-wrap'],
    layer_1: ['cd-charge']
}

/** @type {Generator_PulseCells_Wrap} */
export const GENERATOR_PULSE_CELLS_WRAP_CLASSES = {
    layer_0: ['pulse-cells-wrap'],
    layer_1: ['pulse-cell']
}

/** @type {string[]} */
export const COST_PREVIEW_CLASSES = ['cost-preview'];

/** @type {Generator_PulseCells_Status_Strings} */
export const ELEMENT_PULSE_CELL_STATUSES = {
    LOADING: 'loading',
    LOADED: 'loaded',
    DISCHARGING: 'discharging',
    DISCHARGED: 'discharged'
};