import DataManager from "../../systems/managers/data.manager.js";

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

        void element.offsetWidth;
        UIHelper.toggleClasses(element, animation.classes);
        await Utils.delay(animation.timer);
        UIHelper.toggleClasses(element, animation.classes);
    }

    /**
     * @param {HTMLElement} element 
     */
    static widthIn(element) {
        Asserts.htmlElement(element);

        const widthClasses = DataManager.getAnimations().width.classes;
        if (!UIHelper.containsClasses(element, widthClasses)) return;
        void element.offsetWidth; // We force a layout calculation to ensure the class is applied before the next frame
        requestAnimationFrame(() => {
            UIHelper.removeClass(element, widthClasses);
        });
    }

    /**
     * @param {HTMLElement} element 
     */
    static widthOut(element) {
        Asserts.htmlElement(element);

        const widthClasses = DataManager.getAnimations().width.classes;
        if (!UIHelper.containsClasses(element, widthClasses))
            UIHelper.addClass(element, widthClasses);
    }

    /**
     * @param {HTMLElement} element
     * @param {HTMLElement} rippleElement
     */
    static ripple(element, rippleElement) {
        Asserts.htmlElement(element);
        Asserts.htmlElement(rippleElement);

        UIHelper.appendChild(element, rippleElement);
    }
}