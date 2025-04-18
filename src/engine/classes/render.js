import Animate from './animate.js';
import Utils from './utils.js';

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

        switch (pointType) {
            case POINT_TYPES.point:
                return this.renderBasicPoint(...args);
            case POINT_TYPES.solid_point:
                return this.renderSolidPoint(...args);
            case POINT_TYPES.energy_point:
                return this.renderEnergyPoint(...args);
        }
    }

    /**
     * 
     * @param {args} args
     * @returns {HTMLDivElement}
     */
    renderBasicPoint(...args) {
        const point = document.createElement("div");
        point.classList.add("point", ...args);

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

        return point;
    }

    async removePoint(parent, className) {
        for (let child of Array.from(parent.children)) {
            if ((!className &&
                !child.classList.contains(POINT_CLASSES['solid_points']) &&
                !child.classList.contains(POINT_CLASSES['energy_points'])) ||
                child.classList.contains(className)) {

                // Debugging: Log before animation
                console.log('Before animation:', child);

                // Ensure the child is still a part of the parent
                if (child.parentNode !== parent) {
                    console.error('Child is no longer a part of the parent before animation:', child);
                    return;
                }

                // Apply animation
                this.animate.widthOut(child);

                // Wait for animation to complete
                await this.utils.delay(ANIMATIONS.width.timer);

                // Debugging: Log before removal
                console.log('Before removal:', child);

                // Double-check the parent-child relationship before removal
                if (child.parentNode === parent) {
                    parent.removeChild(child);
                    // Debugging: Log successful removal
                    console.log('Child removed successfully:', child);
                } else {
                    console.error('Child is no longer a part of the parent before removal:', child);
                }

                return;
            }
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