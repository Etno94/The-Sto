/**
 * @returns {{[key: string]: string[]}}
 */
export const POINT_CLASSES = {
    point: ['point'],
    solid_point: ['point', 'solid'],
    energy_point: ['point', 'energy']
}

/**
 * @returns {{[key: string]: string}}
 */
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