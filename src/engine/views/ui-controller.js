
import { EventBus, Events } from "../core/event-bus.js";

import Render from "./render.factory.js";
import Animate from "./helpers/animate.js";
import UIHelper from "./helpers/ui-helper.js";

import DataManager from "../systems/managers/data.manager.js";
import Asserts from "../utils/asserts.js";
import Utils from "../utils/utils.js";
import Errors from "../utils/errors.js";
import PointCollection from "../systems/point.collection.js";

class UIController {

    // Data
    /** @type { Animations } */
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
        EventBus.on(Events.ui.render, (locked) => this.manageLockGenerators(locked)); // TODO: remove once finished with with RemovePoints revamp
        EventBus.on(Events.generator.onClick, (generatorName) => {});
    }

    // #endregion Setup

    // #region Animations

    /** @param { HTMLElement } element */
    #shakeElement(element) {
        Asserts.htmlElement(element);
        Animate.timedOut(element, this.#animations.tilt);
    }

    /** @param { HTMLElement } element */
    #rippleElement(element) {
        Asserts.htmlElement(element);
        Animate.ripple(element, Render.renderAnimationElement(this.#animations.ripple.name));
    }

    shakePointsContainer() {
        this.#shakeElement(this.#pointsContainer);
    }

    /** @param { string } generatorName */
    rippleGenerator(generatorName) {
        Asserts.string(generatorName);
        this.#rippleElement(this.getGeneratorElement(generatorName));
    }

    // #endregion Animations
    
    // #region Elements Flow

    // Points
    /**
     * @param {string} type
     * @returns {HTMLElement}
     */
    renderPoint(type, ...classes) {
        Asserts.string(type);

        return Render.renderPoint(type, classes);
    }

    /** @param {string} type */
    generatePoint(type) {
        const point = this.renderPoint(type, "no-width");
        this.#pointsContainer.appendChild(point);
        Animate.widthIn(point);
    }

    /**
     * @param {string} pointType 
     */
    async removePoint(pointType) {
        Asserts.string(pointType);

        for (let child of Array.from(this.#pointsContainer.children)) {

            if (!UIHelper.areParentAndChildValid(this.#pointsContainer, child)) continue;
            if (child.dataset.pointType !== pointType) continue;

            Animate.widthOut(child);
            await Utils.delay(this.#animations.width.timer);
            UIHelper.removeChild(this.#pointsContainer, child);

            return;
        }
    }

    /** @type {PointSet} */
    balancePoints(pointSetDiff) {
        pointSetDiff = new PointCollection(pointSetDiff).collection; // Validate point set

        for (const [type, points] of Object.entries(pointSetDiff)) {
            if (!this.#pointTypes.hasOwnProperty(type)) continue;
            if (!points) continue;
            if (points > 0) {
                let toGenerate = points;
                while (toGenerate) {
                    this.generatePoint(type);
                    toGenerate--;
                }
            } else {
                this.setDOMPointsToBeRemoved(type, points);
            }
        }
    }

    setDOMPointsToBeRemoved(type, quantity) {
        console.log(`${quantity} ${type} marked to be removed`);

        for (let child of this.#pointsContainer.children) {
            const childType = child.dataset.pointType;
            if (childType !== type) continue;
            UIHelper.addDataSet(child, DataManager.getDataSetAttrs().status, DataManager.getDataSetStatus().remove);
        }
    }

    // Generators
    /**
     * @param {string} generatorName 
     * @param {string[]} classes
     * @returns {HTMLElement}
     */
    renderGenerator(generatorName, classes) {
        Asserts.string(generatorName);
        Asserts.stringArray(classes);

        return Render.renderGenerator(generatorName, classes);
    }

    /** 
     * @param {HTMLElement} generatorElement 
     * @param {number} generatorPosition
    */
    showGeneratorElement(generatorElement, generatorPosition) {
        Asserts.htmlElement(generatorElement);
        if (UIHelper.isParentNode(this.#generatorsContainer, generatorElement)) return;
    
        this.#generatorsContainer.insertBefore(
            generatorElement, 
            this.#generatorsContainer.children[generatorPosition]);
        Animate.widthIn(generatorElement);
    }

    /**
     * @param {string} generatorName 
     * @returns {HTMLElement}
     */
    getGeneratorElement(generatorName) {
        Asserts.string(generatorName);
        return document.getElementById(generatorName) ?? this.renderGenerator(generatorName, DataManager.getAnimations().width.classes);
    }

    /** @param {HTMLElement} generatorElement */
    showHint(generatorElement) {
        Asserts.htmlElement(generatorElement);

        const hintClasses = DataManager.getGeneratorClasses().hint;
        if (!UIHelper.containsClasses(generatorElement, hintClasses))
            UIHelper.addClass(generatorElement, hintClasses);
    }

    /** @param {HTMLElement} generatorElement */
    showBuild(generatorElement) {
        Asserts.htmlElement(generatorElement);
        
        const hintClasses = DataManager.getGeneratorClasses().hint;
        if (UIHelper.containsClasses(generatorElement, hintClasses))
            UIHelper.removeClass(generatorElement, hintClasses);
        const canBuildClasses = DataManager.getGeneratorClasses().canBuild;
        if (!UIHelper.containsClasses(generatorElement, canBuildClasses))
            UIHelper.addClass(generatorElement, canBuildClasses);
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
     * @param {HTMLElement} generatorElement 
     * @param {PointSet} buildCosts 
     * @returns 
     */
    renderCostPreview(generatorElement, buildCosts) {
        Asserts.htmlElement(generatorElement);
        Asserts.object(buildCosts);
        if (this.hasCostPreview(generatorElement)) return;

        const costPreviewElement = Render.renderCostPreview();
        for (let pointType in buildCosts) {
            costPreviewElement.appendChild(UIControl.renderPoint(pointType));
        }
        generatorElement.appendChild(costPreviewElement);
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
        if (!UIHelper.hasChildrens(this.#generatorsContainer)) return;

        const generatorElements = Array.from(this.#generatorsContainer.children);
        generatorElements.forEach(gen => gen.disabled = isDisabled);
    }

    // Storage
    getCurrentPointsFromDOM() {
      /** @type {PointSet} */
      const currentDomPointSet = new PointCollection().collection;

      for (let child of this.#pointsContainer.children) {
        const type = child.dataset.pointType;
        if (currentDomPointSet.hasOwnProperty(type)) {
          currentDomPointSet[type]++;
        }
      }
      return currentDomPointSet;
    }

    // #endregion Elements Flow
}

export const UIControl = new UIController();