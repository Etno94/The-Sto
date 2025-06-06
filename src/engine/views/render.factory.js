import Animate from './helpers/animate.js';
import Utils from '../utils/utils.js';
import UIHelper from './helpers/ui-helper.js';

import { ANIMATIONS } from '../data/animations.data.js';
import { POINT_TYPES } from '../data/points.data.js';
import { DATA_SET_ATTRs, DATA_SET_TYPES } from '../data/data-set-attr.data.js';

import PointDirector from './directors/point.director.js';
import GeneratorDirector from './directors/generator.director.js';

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

            if (!UIHelper.areParentAndChildValid(parent, child)) continue;
            if (child.dataset.pointType !== pointType) continue;

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
        return GeneratorDirector.createCostPreview();
    }

    // TODO: move it to UI Manager future class

    /**
     * @param {HTMLDivElement} parentElement
     * @returns {boolean}
     */
    hasCostPreview(parentElement) {
        if (!UIHelper.hasChildrens(parentElement)) return false;
        for (let child of parentElement.children) {
            if (UIHelper.isDataSetValue(child, DATA_SET_ATTRs.type, DATA_SET_TYPES.costPreview)) return true;
        }
        return false;
    }

    // TODO: move it to UI Manager future class
    /**
     * @param {HTMLDivElement} parentElement
     */
    removeCostPreview(element) {
        UIHelper.applyToChildren(element, (child) => {
            if (UIHelper.containsClass(child, 'cost-preview') ||
                UIHelper.hasDataSet(child, DATA_SET_ATTRs.type, DATA_SET_TYPES.costPreview)) {
                UIHelper.removeChild(element, child);
            }
        });
    }

    // #endregion Generators

}