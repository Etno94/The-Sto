import Utils from '../utils/utils.js';
import {CSS_VARS} from './css-vars.data.js';

let cssVars = getComputedStyle(document.body);

/**
 * @type {Animations}
 */
export const ANIMATIONS = {
    width: {
        name: 'width',
        classes: [ 'no-width'],
        timer: Utils.getNumberFromMSValue(cssVars.getPropertyValue(CSS_VARS.width))
    },
    height: {
        name: 'height',
        classes: [ 'no-height'],
        timer: Utils.getNumberFromMSValue(cssVars.getPropertyValue(CSS_VARS.height))
    },
    shrink: {
        name: 'shrink',
        classes: [ 'shrinkX'],
        timer: Utils.getNumberFromMSValue(cssVars.getPropertyValue(CSS_VARS.shrink))
    },
    opacity: {
        name: 'opacity',
        classes: ['no-opacity'],
        timer: Utils.getNumberFromMSValue(cssVars.getPropertyValue(CSS_VARS.opacity))
    },
    tilt: {
        name: 'tilt',
        classes: ['tilt'],
        timer: Utils.getNumberFromMSValue(cssVars.getPropertyValue(CSS_VARS.tilt))
    },
    ripple: {
        name: 'ripple',
        classes: ['ripple'],
        timer: Utils.getNumberFromMSValue(cssVars.getPropertyValue(CSS_VARS.ripple))
    }
}
