import Utils from '../../utils/utils.js';
import Asserts from '../../utils/asserts.js';

import UIHelper from './ui-helper.js';

export default class Animate {

    constructor(){}

    /**
     * @param {HTMLElement} element 
     * @param {AnimationItem} animation 
     */
    static async timedOut(element, animation) {
        Asserts.htmlElement(element);
        Asserts.object(animation, 'animation');

        UIHelper.toggleClass(element, animation.classes);
        await Utils.delay(animation.timer);
        UIHelper.toggleClass(element, animation.classes);
    }

    /**
     * @param {HTMLElement} element 
     */
    static widthIn(element) {
        Asserts.htmlElement(element);

        if (!UIHelper.containsClass(element, 'no-width')) return;
        element.offsetWidth; // We force a layout calculation to ensure the class is applied before the next frame
        requestAnimationFrame(() => {
            UIHelper.removeClass(element, 'no-width');
        });
    }

    /**
     * @param {HTMLElement} element 
     */
    static widthOut(element) {
        Asserts.htmlElement(element);

        if (!UIHelper.containsClass(element, 'no-width'))
            UIHelper.addClass(element, 'no-width');
    }
}