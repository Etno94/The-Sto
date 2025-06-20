import Utils from '../utils/utils.js';

let cssVars = getComputedStyle(document.body);

/**
 * @type {Animations}
 */
export const ANIMATIONS = {
    width: {
        name: 'width',
        classes: [ 'no-width'],
        timer: Utils.getNumberFromMSValue(cssVars.getPropertyValue('--width'))
    },
    height: {
        name: 'height',
        classes: [ 'no-height'],
        timer: Utils.getNumberFromMSValue(cssVars.getPropertyValue('--width'))
    },
    shrink: {
        name: 'shrink',
        classes: [ 'shrinkX'],
        timer: Utils.getNumberFromMSValue(cssVars.getPropertyValue('--shrink'))
    },
    opacity: {
        name: 'opacity',
        classes: ['no-opacity'],
        timer: Utils.getNumberFromMSValue(cssVars.getPropertyValue('--opacity'))
    },
    tilt: {
        name: 'tilt',
        classes: ['tilt'],
        timer: Utils.getNumberFromMSValue(cssVars.getPropertyValue('--tilt'))
    },
    ripple: {
        name: 'ripple',
        classes: ['ripple'],
        timer: Utils.getNumberFromMSValue(cssVars.getPropertyValue('--ripple'))
    }
}
