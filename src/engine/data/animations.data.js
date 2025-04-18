import Utils from '../classes/utils.js';

let utils = new Utils();
let cssVars = getComputedStyle(document.body);

export const ANIMATIONS = {
    width: {
        name: 'width',
        classes: ['no-width'],
        timer: utils.getNumberFromMSValue(cssVars.getPropertyValue('--width'))
    },
    tilt: {
        name: 'tilt',
        classes: ['tilt'],
        timer: utils.getNumberFromMSValue(cssVars.getPropertyValue('--tilt'))
    }
}