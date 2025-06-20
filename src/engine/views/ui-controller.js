
import { EventBus, Events } from "../core/event-bus.js";

import Render from "./render.factory.js";
import Animate from "./helpers/animate.js";
import UIHelper from "./helpers/ui-helper.js";
import { RenderQ } from "./helpers/render-queue.js";

import DataManager from "../systems/managers/data.manager.js";
import Asserts from "../utils/asserts.js";
import Utils from "../utils/utils.js";
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
    /** @type {HTMLElement} */
    #storageUpgrade;

    // Animation tracking
    #pointState = new WeakMap();
    
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
        this.#storageUpgrade = document.getElementById("storage-upgrade");
    }

    #setEventBus() {
        EventBus.on(Events.points.overcap, () => this.shakePointsContainer());

        EventBus.on(Events.generator.onClick, (generatorName) => {});
        EventBus.on(Events.generator.onCD, (generatorName) => this.setGeneratorOnCD(generatorName));
        EventBus.on(Events.generator.updateCD, (generatorName, remainingCD, baseCooldown) => {
            this.updateGeneratorRemainingCD(generatorName, remainingCD, baseCooldown);
        });
        EventBus.on(Events.generator.ready, (generatorName) => this.setGeneratorOffCD(generatorName));

        EventBus.on(Events.ui.render, (isRendering) => {});
        EventBus.on(Events.ui.pointsContainer.hover, (target, isMouseEnter = false) => this.#animateEnergyPoint(target, isMouseEnter));
        EventBus.on(Events.storageUpgrade.unlocked, () => this.#showStorageUpgrader());
    }

    // #endregion Setup

    // #region Animations

    /**
     * @param {EventTarget} target 
     * @param {boolean} isMouseEnter 
     */
    #animateEnergyPoint(target, isMouseEnter) {
        Asserts.htmlElement(target);
        Asserts.boolean(isMouseEnter);
        
        const orbitRadius = 15;
        const updateInterval = 350;

        if (isMouseEnter) {
            if (this.#pointState.has(target)) return;

            const intervalId = Animate.startZigZagOrbit(target, {orbitRadius, updateInterval});
            this.#pointState.set(target, intervalId);
        } else {
            if (!this.#pointState.has(target)) return;

            clearInterval(this.#pointState.get(target));
            this.#pointState.delete(target);
            Animate.stopZigZagOrbit(target);
        }
    }

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

    // #region Points
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
        const point = this.renderPoint(type, ...DataManager.getAnimations().width.classes);
        this.#pointsContainer.appendChild(point);
        Animate.widthIn(point);
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
                this.setDOMPointsToBeRemoved(type, Math.abs(points), Animate.shrinkOut);
                RenderQ.queue(async () => {
                    await Utils.delay(this.#animations.width.timer);
                    this.removeMarkedElementsFromParent(this.#pointsContainer);
                });
            }
        }
    }

    /**
     * @param {string} type 
     * @param {number} quantity 
     * @param {Function} [animation] 
     */
    setDOMPointsToBeRemoved(type, quantity, animation = null) {
        Asserts.string(type);
        Asserts.number(quantity);
        if (animation) Asserts.function(animation);

        const dataSetStatus = DataManager.getDataSetAttrs().status;
        const statusRemove = DataManager.getDataSetStatus().remove;
        let toRemove = quantity;

        for (let child of this.#pointsContainer.children) {
            if (!toRemove) return;
            const childType = child.dataset.pointType;
            if (childType !== type) continue;
            if (UIHelper.isDataSetValue(child, dataSetStatus, statusRemove)) continue;

            UIHelper.addDataSet(child, dataSetStatus, statusRemove);
            if (animation) animation(child);
            toRemove--;
        }
    }

    /**
     * @param {htmlElement} parent 
     */
    removeMarkedElementsFromParent(parent) {
        Asserts.htmlElement(parent);

        const dataSetStatus = DataManager.getDataSetAttrs().status;
        const statusRemove = DataManager.getDataSetStatus().remove;
        for (let child of Array.from(parent.children)) {
            if (!UIHelper.areParentAndChildValid(parent, child)) continue;
            if (!UIHelper.hasDataSet(child, dataSetStatus)) continue;
            if (!UIHelper.isDataSetValue(child, dataSetStatus, statusRemove)) continue;

            UIHelper.removeChild(parent, child);
        }
    }

    // #endregion Points

    // #region Generators

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

    /** @param {HTMLElement} generatorElement */
    hideBuild(generatorElement) {
        Asserts.htmlElement(generatorElement);

        const canBuildClasses = DataManager.getGeneratorClasses().canBuild;
        if (UIHelper.containsClasses(generatorElement, canBuildClasses))
            UIHelper.removeClass(generatorElement, canBuildClasses);
    }

    /** @param { boolean } isDisabled */
    manageLockGenerators(isDisabled = false) {
        Asserts.boolean(isDisabled);
        if (!UIHelper.hasChildrens(this.#generatorsContainer)) return;

        const generatorElements = Array.from(this.#generatorsContainer.children);
        generatorElements.forEach(gen => gen.disabled = isDisabled);
    }

    /** 
     * @param {string} generatorName
     */
    setGeneratorOnCD(generatorName) {
        Asserts.string(generatorName);

        const generatorElement = this.getGeneratorElement(generatorName);
        const onCDClasses = DataManager.getGeneratorClasses().onCd;
        const dataSetStatus = DataManager.getDataSetAttrs().status;
        const statusCooldown = DataManager.getDataSetStatus().cooldown;

        if (generatorElement.disabled && 
            UIHelper.containsClasses(onCDClasses) &&
            UIHelper.isDataSetValue(generatorElement, dataSetStatus, statusCooldown)) return;

        UIHelper.addClass(generatorElement, onCDClasses);
        UIHelper.addDataSet(generatorElement, dataSetStatus, statusCooldown);
        generatorElement.disabled = true;
    }

    /** @param {string} generatorName */
    setGeneratorOffCD(generatorName) {
        Asserts.string(generatorName);

        const generatorElement = this.getGeneratorElement(generatorName);
        Utils.deferFrame(() => UIHelper.removeClass(generatorElement, DataManager.getGeneratorClasses().onCd));

        const dataSetStatus = DataManager.getDataSetAttrs().status;
        const statusCooldown = DataManager.getDataSetStatus().cooldown;
        if (UIHelper.isDataSetValue(generatorElement, dataSetStatus, statusCooldown))
            Utils.deferFrame(() => UIHelper.removeDataSet(generatorElement, dataSetStatus));
        generatorElement.disabled = false;
    }

    /** 
     * @param {string} generatorName
     * @param {number} remainingCD
     * @param {number} baseCooldown
     */
    updateGeneratorRemainingCD(generatorName, remainingCD, baseCooldown) {
        Asserts.string(generatorName);
        Asserts.number(remainingCD);
        Asserts.number(baseCooldown);

        const generatorElement = this.getGeneratorElement(generatorName);
        const degs = Utils.getReversedDeg(Utils.getDegPercent(baseCooldown, remainingCD));
        Utils.deferFrame(() => UIHelper.setProperty(generatorElement, '--cooldownGenerator-oncd-dg', `${degs}deg`));
    }

    // #endregion Generators

    // #region Cost Preview

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
        for (const [key, value] of Object.entries(buildCosts)) {
            let amount = value;
            while (amount) {
                costPreviewElement.appendChild(UIControl.renderPoint(key));
                amount--;
            }
        }
        if (UIHelper.isElementTransformed(generatorElement)) {
            UIHelper.transformStrategy('counter', costPreviewElement, generatorElement);
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

    // #endregion Cost Preview

    // #region Storage

    #showStorageUpgrader() {
        Animate.widthIn(this.#storageUpgrade);
        Animate.opacityIn(this.#storageUpgrade);
        this.#storageUpgrade.disabled = false;
    }

    getCurrentPointsFromDOM() {
      /** @type {PointSet} */
      const currentDomPointSet = new PointCollection().collection;

      for (let child of this.#pointsContainer.children) {
        if (UIHelper.hasDataSet(child, DataManager.getDataSetAttrs().status) &&
            UIHelper.isDataSetValue(child, DataManager.getDataSetAttrs().status, DataManager.getDataSetStatus().remove))
            continue;

        const type = child.dataset.pointType;
        if (currentDomPointSet.hasOwnProperty(type)) {
          currentDomPointSet[type]++;
        }
      }
      return currentDomPointSet;
    }

    // #endregion Storage
}

export const UIControl = new UIController();