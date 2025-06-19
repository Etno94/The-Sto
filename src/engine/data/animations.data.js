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
