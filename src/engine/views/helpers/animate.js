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
     */
    static opacityIn(element) {
        Asserts.htmlElement(element);

        const opacityClasses = DataManager.getAnimations().opacity.classes;
        if (!UIHelper.containsClasses(element, opacityClasses)) return;
        void element.offsetWidth; // We force a layout calculation to ensure the class is applied before the next frame
        requestAnimationFrame(() => {
            UIHelper.removeClass(element, opacityClasses);
        });
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

    /**
     * 
     * @param {number} durationMs 
     * @param {HTMLElement} element 
     * @param {string} property 
     * @param {Function} [onUpdate] 
     */
    static animateCooldown(durationMs, element, property, onUpdate) {
        Asserts.number(durationMs);
        Asserts.htmlElement(element);
        Asserts.string(property);
        if (onUpdate) Asserts.function(onUpdate);

        let start = performance.now();
        let elapsedAccumulator = 0;
        let lastFrameTime = start;

        function frame(now) {
            const deltaTime = now - lastFrameTime;
            lastFrameTime = now;

            elapsedAccumulator += deltaTime;

            const elapsed = now - start;
            const progress = Math.min(elapsed / durationMs, 1);
            const angle = 360 * progress;
            UIHelper.setProperty(element, property, `${angle}deg`);

            if (onUpdate) onUpdate(elapsedAccumulator, progress);

            if (progress < 1) {
                requestAnimationFrame(frame);
            } else {
                if (onUpdate) onUpdate(elapsedAccumulator, 1, true);
            }
        }

        requestAnimationFrame(frame);

        element.reduceCooldown = (msToReduce) => {
            const now = performance.now();
            start -= msToReduce;
        };
    }

    /**
     * @param {HTMLElement} element 
     * @param {Object} options 
     * @returns {NodeJS.Timeout}
     */
    static startZigZagOrbit(element, options = {orbitRadius: 15,updateInterval: 350}) {
        Asserts.htmlElement(element);
        Asserts.object(options);

        const intervalId = setInterval(() => {
            const angle = Math.random() * 2 * Math.PI;
            const x = Math.cos(angle) * options.orbitRadius;
            const y = Math.sin(angle) * options.orbitRadius;
            element.style.transform = `translate(${x}px, ${y}px)`;
        }, options.updateInterval);

        return intervalId;
    }

    /** @param {HTMLElement} element */
    static stopZigZagOrbit(element) {
        element.style.transform = 'translate(0, 0)';
    }
}