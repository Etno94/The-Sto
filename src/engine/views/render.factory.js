import Animate from './animate.js';
import Utils from '../utils/utils.js';
import UIHelper from './ui-helper.js';

import { ANIMATIONS } from '../data/animations.data.js';
import { POINT_TYPES } from '../data/points.data.js';

import PointDirector from './builder-directors/point.director.js';
import GeneratorDirector from './builder-directors/generator.director.js';

export default class Render {

    constructor() {
        this.animate = new Animate();
    }

    // #region Points

    /**
     * 
     * @param {string} pointType
     * @param {args} classes
     * @returns {HTMLDivElement}
     */
    renderPoint(pointType, ...classes) {

        // If functions use 'this' context, we need to bind them.
        // In this case, we don't rely on 'this' context
        return ({
            [POINT_TYPES.point]: PointDirector.createBasicPoint,
            [POINT_TYPES.solid_point]: PointDirector.createSolidPoint,
            [POINT_TYPES.energy_point]: PointDirector.createEnergyPoint
        })[pointType](classes);
    }

    // TODO: move it to UI Manager future class
    async removePoint(parent, pointType) {
        for (let child of Array.from(parent.children)) {

            if (!UIHelper.isParentNode(parent, child)) continue;
            if (child.dataset.type !== pointType) continue;

            this.animate.widthOut(child);
            await Utils.delay(ANIMATIONS.width.timer);

            UIHelper.removeChild(parent, child);

            return;
        }
    }

    // #endregion Points

    // #region Generators


    /**
     * @param {string} generatorName
     * @returns {HTMLDivElement}
     */
    renderGenerator(generatorName, ...classes) {
        return GeneratorDirector.createGenerator(generatorName, classes);
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

    // #endregion Points

}