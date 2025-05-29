import Animate from './animate.js';
import Utils from '../utils/utils.js';

import { ANIMATIONS } from '../data/animations.data.js';
import { POINT_CLASSES, POINT_TYPES } from '../data/points.data.js';

export default class Render {

    constructor() {
        this.animate = new Animate();
        this.utils = new Utils();
    }

    /**
     * 
     * @param {string} pointType
     * @param {args} args
     * @returns {HTMLDivElement}
     */
    renderPoint(pointType, ...args) {

        // If functions use 'this' context, we need to bind them.
        // In this case, we don't rely on 'this' context
        return ({
            [POINT_TYPES.point]: this.renderBasicPoint,
            [POINT_TYPES.solid_point]: this.renderSolidPoint,
            [POINT_TYPES.energy_point]: this.renderEnergyPoint
        })[pointType](...args);
    }

    /**
     * 
     * @param {args} args
     * @returns {HTMLDivElement}
     */
    renderBasicPoint(...args) {
        const point = document.createElement("div");
        point.classList.add("point", ...args);
        point.dataset.type = POINT_TYPES.point;

        return point;
    }

    /**
     * 
     * @param {args} args
     * @returns {HTMLDivElement}
     */
    renderSolidPoint(...args) {
        const point = document.createElement("div");
        point.classList.add("point", "solid", ...args);
        point.dataset.type = POINT_TYPES.solid_point;

        const innerPoint = document.createElement("div");
        innerPoint.classList.add("inner-point");
        point.appendChild(innerPoint);

        return point;
    }

    /**
     * 
     * @param {args} args
     * @returns {HTMLDivElement}
     */
    renderEnergyPoint(...args) {
        const point = document.createElement("div");
        point.classList.add("point", "energy", ...args);
        point.dataset.type = POINT_TYPES.energy_point;

        return point;
    }

    async removePoint(parent, pointType) {
        for (let child of Array.from(parent.children)) {

            if (child.parentNode !== parent) continue;
            if (child.dataset.type !== pointType) continue;

            this.animate.widthOut(child);
            await this.utils.delay(ANIMATIONS.width.timer);
            parent.removeChild(child);

            return;
        }
    }

    /**
     * @param {string} generatorName
     * @returns {HTMLDivElement}
     */
    renderGenerator(generatorName) {
        const generator = document.createElement("div");
        generator.setAttribute('id', generatorName);
        generator.classList.add("cell", "m-24", "no-width");

        return generator;
    }

    /**
     * @returns {HTMLDivElement}
     */
    renderCostPreview() {

        const costPreviewElement = document.createElement("div");
        costPreviewElement.classList.add("cost-preview");

        return costPreviewElement;
    }

    /**
     * @param {HTMLDivElement} parentElement
     * @returns {boolean}
     */
    hasCostPreview(parentElement) {
        if (parentElement.children) {
            for (let child of parentElement.children) {
                if (child.classList.contains('cost-preview'))
                    return true;
            }
        }
        return false;
    }

    /**
     * @param {HTMLDivElement} parentElement
     */
    removeCostPreview(element) {
        if (element.children) {
            for (let child of element.children) {
                if (child.classList.contains('cost-preview'))
                    element.removeChild(child);
            }
        }
    }
}