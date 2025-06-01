import Utils from '../utils/utils.js';
import UIHelper from './ui-helper.js';

export default class Animate {
    constructor(){
    }

    /**
     * @param {HTMLElement} element 
     * @param {AnimationItem} animation 
     */
    async timedOut(element, animation) {
        UIHelper.toggleClass(element, animation.classes);
        await Utils.delay(animation.timer);
        UIHelper.toggleClass(element, animation.classes);
    }

    /**
     * @param {HTMLElement} element 
     */
    widthIn(element) {
        if (!UIHelper.containsClass(element, 'no-width')) return;
        element.offsetWidth; // We force a layout calculation to ensure the class is applied before the next frame
        requestAnimationFrame(() => {
            UIHelper.removeClass(element, 'no-width');
        });
    }

    /**
     * @param {HTMLElement} element 
     */
    widthOut(element) {
        if (UIHelper.containsClass(element, 'no-width')) return;
        UIHelper.addClass(element, 'no-width');
    }
}