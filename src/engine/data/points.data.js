/**
 * @type { PointClasses }
 */
export const POINT_CLASSES = {
    wrap: {
        layer_0: ['wrapper']
    },
    point: {
        layer_0: ['point', 'basic']
    },
    solid_point: {
        layer_0: ['point', 'solid'],
        layer_1: ['inner-point']
    },
    energy_point: {
        layer_0: ['point', 'energy']
    } 
}

/** @type { PointTypes } */
export const POINT_TYPES = {
    point: 'point',
    solid_point: 'solid_point',
    energy_point: 'energy_point'
}

/**
 * @returns {string[]}
 */
export const POINT_PROPS = [
    ...Object.values(POINT_TYPES)
]

/**
 * @returns {PointSet}
 */
export const FRESH_POINTS = POINT_PROPS.reduce((acc, key) => {
    acc[key] = 0;
    return acc;
}, {});