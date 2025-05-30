import Utils from '../utils/utils.js';

let cssVars = getComputedStyle(document.body);

export const ANIMATIONS = {
    width: {
        name: 'width',
        classes: ['no-width'],
        timer: Utils.getNumberFromMSValue(cssVars.getPropertyValue('--width'))
    },
    tilt: {
        name: 'tilt',
        classes: ['tilt'],
        timer: Utils.getNumberFromMSValue(cssVars.getPropertyValue('--tilt'))
    }
}
