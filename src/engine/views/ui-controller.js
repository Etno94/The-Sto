
import { EventBus, Events } from "../core/event-bus.js";

import Render from "./render.factory.js";
import Animate from "./helpers/animate.js";
import UIHelper from "./helpers/ui-helper.js";

import DataManager from "../systems/managers/data.manager.js";
import Asserts from "../utils/asserts.js";
import Utils from "../utils/utils.js";
import Errors from "../utils/errors.js";

class UIController {

    // Data
    /** @type { DataSet } */
    #animations;
    /** @type { DataSet } */
    #dataset = {
        types: {},
        attr: {}
    };

    /** @type { PointTypes } */
    #pointTypes;

    // Elements
    /** @type {HTMLElement} */
    #generatorsContainer;
    /** @type {HTMLElement} */
    #pointsContainer;
    
    constructor() {
        this.#setData();
        this.#setElements();
        this.#setEventBus();
    }

    // #region Setup

    #setData() {
        this.#animations = DataManager.getAnimations();
        this.#dataset.types = DataManager.getDataSetTypes();
        this.#dataset.attr = DataManager.getDataSetAttrs();
        this.#pointTypes = DataManager.getPointTypesData();
    }

    #setElements() {
        this.#generatorsContainer = document.getElementById("central");
        this.#pointsContainer = document.getElementById("points");
    }

    #setEventBus() {
        EventBus.on(Events.points.overcap, () => this.shakePointsContainer());
        EventBus.on(Events.ui.render, (locked) => this.manageLockGenerators(locked));
    }

    // #endregion Setup

    // #region Animations

    /** @param { HTMLElement } element */
    #shakeElement(element) {
        Asserts.htmlElement(element);

        Animate.timedOut(element, this.#animations.tilt);
    }

    shakePointsContainer() {
        this.#shakeElement(this.#pointsContainer);
    }

    // #endregion Animations
    
    // #region Elements Flow

    // Points
    /**
     * @param {string} type 
     * @param {...string} classes
     * @returns {HTMLElement}
     */
    renderPoint(type, ...classes) {
        Asserts.string(type);
        Asserts.stringArray(classes);

        return Render.renderPoint(type, classes);
    }

    /**
     * @param {HTMLElement} parent 
     * @param {string} pointType 
     */
    async removePoint(parent, pointType) {
        Asserts.htmlElement(parent);
        Asserts.string(pointType);

        for (let child of Array.from(parent.children)) {

            if (!UIHelper.areParentAndChildValid(parent, child)) continue;
            if (child.dataset.pointType !== pointType) continue;

            Animate.widthOut(child);
            await Utils.delay(this.#animations.width.timer);
            UIHelper.removeChild(parent, child);

            return;
        }
    }

    // Generators
    /**
     * @param {string} generatorName 
     * @param {...string} classes
     * @returns {HTMLElement}
     */
    renderGenerator(generatorName, ...classes) {
        Asserts.string(generatorName);
        Asserts.stringArray(classes);

        return Render.renderGenerator(generatorName, classes);
    }

    // Cost Preview
    /**
     * @param {HTMLDivElement} parentElement
     * @returns {boolean}
     */
    hasCostPreview(parentElement) {
        Asserts.htmlElement(parentElement);

        if (!UIHelper.hasChildrens(parentElement)) return false;
        for (let child of parentElement.children) {
            if (UIHelper.isDataSetValue(child, this.#dataset.attr.type, this.#dataset.types.costPreview)) {
                return true;
            }
        }
        return false;
    }

    /**
     * @returns {HTMLDivElement}
     */
    renderCostPreview() {
        return Render.renderCostPreview();
    }

    /** @param {HTMLDivElement} parentElement */
    removeCostPreview(parentElement) {
        Asserts.htmlElement(parentElement);

        UIHelper.applyToChildren(parentElement, (child) => {
            if (UIHelper.containsClass(child, 'cost-preview') ||
                UIHelper.hasDataSet(child, this.#dataset.attr.type, this.#dataset.types.costPreview)) {
                UIHelper.removeChild(parentElement, child);
            }
        });
    }

    /** @param { boolean } isDisabled */
    manageLockGenerators(isDisabled = false) {
        Asserts.boolean(isDisabled);
                if (!UIHelper.hasChildrens(this.#generatorsContainer)) {
            Errors.logError(`(manageLockGenerators) There's no generators`);
            return;
        }

        console.log(`(manageLockGenerators) setting generators to ${isDisabled ? 'disabled': 'enabled'}`)
        const generatorElements = Array.from(this.#generatorsContainer.children);
        generatorElements.forEach(gen => gen.disabled = isDisabled);
    }

    // Storage
    getCurrentPointsFromDOM() {
      const counts = {
        [this.#pointTypes.point]: 0,
        [this.#pointTypes.solid_point]: 0,
        [this.#pointTypes.energy_point]: 0
      };
    
      for (let child of this.#pointsContainer.children) {
        const type = child.dataset.pointType;
        if (counts.hasOwnProperty(type)) {
          counts[type]++;
        }
      }
    
      return counts;
    }

    // #endregion Elements Flow
}

export const UIControl = new UIController();