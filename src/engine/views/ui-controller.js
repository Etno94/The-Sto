
import { EventBus, Events } from "../core/event-bus.js";

import Render from "./render.factory.js";
import Animate from "./helpers/animate.js";
import UIHelper from "./helpers/ui-helper.js";
import { RenderQ } from "./helpers/render-queue.js";
import {GenUIReg} from "./ui-registries/generators.ui-registry.js";
import {UIRegService} from "./ui-registries/ui-registry.service.js";

import DataManager from "../systems/managers/data.manager.js";
import {Asserts, Utils, Errors, Validators} from "../utils/utils.index.js";
// import Asserts from "../utils/asserts.js";
// import Utils from "../utils/utils.js";
import PointCollection from "../systems/point.collection.js";

class UIController {

    // Data
    /** @type { Animations } */
    #animations;
    /** @type { CssVarsData } */
    #cssVars;
    /** @type { DataSet } */
    #dataset = {
        types: {},
        attr: {}
    };
    /** @type { PointTypes } */
    #pointTypes;
    /** @type { DataGeneratorRegistry } */
    #dataGeneratorRegistry;
    /** @type { DataGeneratorId } */
    #generatorIds;

    // Bindings
    /** @type {Function} */
    #disableGeneratorFn;

    // Elements
    /** @type {HTMLElement} */
    #generatorsContainer;
    /** @type {HTMLElement} */
    #pointsContainer;
    /** @type {HTMLElement} */
    #storageUpgradeWrapper;
    /** @type {HTMLElement} */
    #storageUpgrade;

    // Animation tracking
    #pointState = new WeakMap();
    
    constructor() {
        this.#setData();
        this.#setElements();
        this.#setBindings();
        this.#setEventBus();
    }

    // #region Setup

    #setData() {
        this.#animations = DataManager.getAnimations();
        this.#cssVars = DataManager.getCssVars();
        this.#animations = DataManager.getAnimations();
        this.#dataset.types = DataManager.getDataSetTypes();
        this.#dataset.attr = DataManager.getDataSetAttrs();
        this.#pointTypes = DataManager.getPointTypesData();
        this.#dataGeneratorRegistry = DataManager.getDataGeneratorRegistry();
        this.#generatorIds = DataManager.getGeneratorIds();
    }

    #setElements() {
        this.#generatorsContainer = document.getElementById("generators-container");
        this.#pointsContainer = document.getElementById("points");
        this.#storageUpgradeWrapper = document.getElementById("storage-upgrade-wrap");
        this.#storageUpgrade = document.getElementById("storage-upgrade");
    }

    #setBindings() {
        this.#disableGeneratorFn = this.disableGenerator.bind(this);
    }

    #setEventBus() {
        // Points
        EventBus.on(Events.points.overcap, () => this.shakePointsContainer());

        // Generators
        EventBus.on(Events.generator.build, (generatorName, percentProgress) => this.updateGeneratorBuildProgress(generatorName, percentProgress));
        EventBus.on(Events.generator.onCD, (generatorName) => this.setOnCD(generatorName, this.#disableGeneratorFn));
        EventBus.on(Events.generator.updateCD, (generatorName, _, degs) => this.updateRemainingCD(generatorName, degs));
        EventBus.on(Events.generator.ready, (generatorName) => this.setOffCD(generatorName, this.#disableGeneratorFn, false));
        EventBus.on(Events.generator.elements.statusItems.pointChance.updated,
            (generatorName, pointChances) => this.updateGeneratorStatusElements(generatorName, pointChances)
        );
        EventBus.on(Events.generator.elements.cdCharges.build, (elementName, progress) => this.updateElementBuildProgress(elementName, progress));

        // UI Elements
        EventBus.on(Events.ui.render, (isRendering) => {});
        EventBus.on(Events.ui.pointsContainer.hover, (target, isMouseEnter = false) => this.#animateEnergyPoint(target, isMouseEnter));

        // Storage
        EventBus.on(Events.storageUpgrade.unlocked, () => this.showStorageUpgrader());
        EventBus.on(Events.storageUpgrade.onUpgrade, (currentMaxStorage) => this.updateStorageLayout(currentMaxStorage));
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

    // Generator Wrappers

    /** 
     * @param {HTMLElement} generatorElement 
     * @param {number} generatorPosition
    */
    showWrappedGeneratorElement(generatorElement, generatorPosition) {
        Asserts.htmlElement(generatorElement);

        const wrappedGeneratorElement = 
            generatorElement.parentNode && UIControl.#isGeneratorWrapped(generatorElement) ?
                generatorElement.parentNode : generatorElement;

        if (UIHelper.isParentNode(this.#generatorsContainer, wrappedGeneratorElement)) return;
    
        this.#generatorsContainer.insertBefore(
            wrappedGeneratorElement, 
            this.#generatorsContainer.children[generatorPosition]);
        Animate.widthIn(generatorElement);
    }

    /**
     * @param {string} generatorName 
     * @returns {HTMLElement}
     */
    getGeneratorElement(generatorName) {
        Asserts.string(generatorName);

        let generatorElement = document.getElementById(generatorName);
        if (!generatorElement) 
            generatorElement = this.#createWrappedGeneratorElement(
                                this.#renderGenerator(
                                    generatorName, DataManager.getAnimations().width.classes))
                                .querySelector(`button#${generatorName}`);
        return generatorElement;
    }

    /**
     * @param {string} generatorName 
     * @param {string[]} classes
     * @returns {HTMLElement}
     */
    #renderGenerator(generatorName, classes) {
        Asserts.string(generatorName);
        Asserts.stringArray(classes);

        return Render.renderGenerator(generatorName, classes);
    }

    /**
     * @param {HTMLElement} generatorElement 
     * @returns {HTMLElement}
     */
    #createWrappedGeneratorElement(generatorElement) {
        Asserts.htmlElement(generatorElement);

        const generatorWrap = Render.renderWrappedGenerator(generatorElement);
        UIRegService.registerGeneratorWrap(generatorWrap);
        return generatorWrap;
    }

    /** 
     * @param {HTMLElement} generatorElement 
     * @returns {boolean}
     */
    #isGeneratorWrapped(generatorElement) {
        Asserts.htmlElement(generatorElement);
        if (!generatorElement.parentNode) return false;
        return UIHelper.containsClasses(generatorElement.parentNode, DataManager.getWrapClasses());
    }

    // Generator Flow

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

    /**
     * @param {String} generatorName 
     * @param {Number} progress 
     */
    updateGeneratorBuildProgress(generatorName, progress) {
        Asserts.string(generatorName);
        Asserts.number(progress);
        const domElement = this.getGeneratorElement(generatorName);
        UIHelper.setProperty(domElement, this.#cssVars.buildProgressPercent, `${progress}%`);
    }

    /** @param { boolean } isDisabled */
    manageLockGenerators(isDisabled = false) {
        Asserts.boolean(isDisabled);
        if (!UIHelper.hasChildren(this.#generatorsContainer)) return;

        const generatorElements = Array.from(this.#generatorsContainer.children);
        generatorElements.forEach(gen => gen.disabled = isDisabled);
    }
    
    /**
     * @param {string} generatorName 
     * @param {boolean} isDisabled 
     */
    disableGenerator(generatorName, isDisabled = true) {
        Asserts.string(generatorName);
        Asserts.boolean(isDisabled);

        const generatorElement = this.getGeneratorElement(generatorName);
        generatorElement.disabled = isDisabled;
    }

    // #endregion Generators

    // #region Generator Elements

    /**
     * @param {string} generatorName 
     */
    showGeneratorElementsOnBuild(generatorName) {
        Asserts.string(generatorName);

        const category = ({
            [this.#generatorIds.CLICK]: null,
            [this.#generatorIds.COOLDOWN]: this.#dataGeneratorRegistry.category.cdCharges,
            [this.#generatorIds.PULSE]: this.#dataGeneratorRegistry.category.pulseCells,
        })[generatorName];

        const categoryMap = category ? UIRegService.getElementsFromGenerator(generatorName, category) : null;
        console.log(categoryMap);
    }

    /** 
     * @param {string} elementName 
     * @returns {HTMLElement}
    */
    getGeneratorElementDOMElement(elementName) {
        Asserts.string(elementName);

        const elementDOMElement = document.getElementById(elementName);
        Asserts.notNullOrUndefined(elementDOMElement);

        return elementDOMElement;
    }

    /** 
     * @param {string} elementName 
     * @returns {HTMLElement}
     * */
    showElementHint(elementName) {
        Asserts.string(elementName);

        const elementDOMEl = this.getGeneratorElementDOMElement(elementName);

        const hiddenClasses = DataManager.getLifeCycleClasses().hidden;
        UIHelper.removeClass(elementDOMEl, hiddenClasses);
        const hintClasses = DataManager.getLifeCycleClasses().hint;
        UIHelper.addClass(elementDOMEl, hintClasses);

        return elementDOMEl;
    }

    /** 
     * @param {string} elementName 
     * @returns {HTMLElement}
     * */
    showElementCanBuild(elementName) {
        Asserts.string(elementName);

        const elementDOMEl = this.getGeneratorElementDOMElement(elementName);

        const hiddenClasses = DataManager.getLifeCycleClasses().hidden;
        UIHelper.removeClass(elementDOMEl, hiddenClasses);
        const hintClasses = DataManager.getLifeCycleClasses().hint;
        UIHelper.removeClass(elementDOMEl, hintClasses);
        const canBuildClasses = DataManager.getLifeCycleClasses().blank;
        UIHelper.addClass(elementDOMEl, canBuildClasses);

        return elementDOMEl;
    }

    /** 
     * @param {string} elementName 
     * @returns {HTMLElement}
     * */
    showElementBuilt(elementName) {
        Asserts.string(elementName);

        const elementDOMEl = this.getGeneratorElementDOMElement(elementName);

        const hiddenClasses = DataManager.getLifeCycleClasses().hidden;
        UIHelper.removeClass(elementDOMEl, hiddenClasses);
        const hintClasses = DataManager.getLifeCycleClasses().hint;
        UIHelper.removeClass(elementDOMEl, hintClasses);
        const canBuildClasses = DataManager.getLifeCycleClasses().blank;
        UIHelper.removeClass(elementDOMEl, canBuildClasses);

        return elementDOMEl;
    }

    /**
     * @param {String} elementName 
     * @param {Number} progress 
     */
    updateElementBuildProgress(elementName, progress) {
        Asserts.string(elementName);
        Asserts.number(progress);
        const domElement = this.getGeneratorElementDOMElement(elementName);
        UIHelper.setProperty(domElement, this.#cssVars.buildProgressPercent, `${progress}%`);
    }

    // #endregion Generator Elements

    // #region Generator Status

    /** 
     * @param {string} entityName
     * @param {function} callback
     */
    setOnCD(entityName, callback, ...args) {
        Asserts.string(entityName);
        if (Validators.isNotNullNorUndefined(callback)) Asserts.function(callback);

        const entityElement = document.getElementById(entityName);
        Asserts.notNullOrUndefined(entityElement);
        const onCDClasses = DataManager.getStatusClasses().onCd;
        const dataSetStatus = DataManager.getDataSetAttrs().status;
        const statusCooldown = DataManager.getDataSetStatus().cooldown;

        if (entityElement.disabled && 
            UIHelper.containsClasses(onCDClasses) &&
            UIHelper.isDataSetValue(entityElement, dataSetStatus, statusCooldown)) return;

        UIHelper.addClass(entityElement, onCDClasses);
        UIHelper.addDataSet(entityElement, dataSetStatus, statusCooldown);

        if (callback) callback(entityName, ...args);
    }

    /** 
     * @param {string} entityName 
     * @param {function} callback
     * */
    setOffCD(entityName, callback, ...args) {
        Asserts.string(entityName);
        if (Validators.isNotNullNorUndefined(callback)) Asserts.function(callback);

        const entityElement = this.getGeneratorElement(entityName);
        Utils.deferFrame(() => UIHelper.removeClass(entityElement, DataManager.getStatusClasses().onCd));

        const dataSetStatus = DataManager.getDataSetAttrs().status;
        const statusCooldown = DataManager.getDataSetStatus().cooldown;
        if (UIHelper.isDataSetValue(entityElement, dataSetStatus, statusCooldown))
            Utils.deferFrame(() => UIHelper.removeDataSet(entityElement, dataSetStatus));
        if (callback) callback(entityName, ...args);
    }

    /** 
     * @param {string} entityName
     * @param {number} degs
     */
    updateRemainingCD(entityName, degs) {
        Asserts.string(entityName);
        Asserts.number(degs);

        const entityElement = this.getGeneratorElement(entityName);
        Utils.deferFrame(() => UIHelper.setProperty(entityElement, this.#cssVars.onCdDg, `${degs}deg`));
    }

    /**
     * @param {string} generatorName 
     * @param {SaveGeneratorPoints[]} pointChances
     */
    updateGeneratorStatusElements(generatorName, pointChances) {
        Asserts.string(generatorName);
        Asserts.nonEmptyArray(pointChances);

        const generatorElement = this.getGeneratorElement(generatorName);
        const generatorStatusElement = generatorElement.nextSibling;
        if (!generatorStatusElement || !UIHelper.containsClasses(generatorStatusElement, DataManager.getGeneratorStatusWrapClasses().layer_0)) {
            Errors.logError(`generatorStatusElement doesnt exist`).
            return;
        }
        const pointChanceElements = UIRegService.getPointChancesFromGenerator(generatorName);

        pointChances.forEach((chance) => {

            const [fullChanceElements, remainingChance] = Utils.getDivisionRemainder(chance.currentChance, 100);

            /** @type {Node[]} */
            const currentPointTypeChances = Array.from(pointChanceElements).filter(element => {
                return UIHelper.hasChildren(element) && 
                        Array.from(element.children).some(child => 
                            UIHelper.isDataSetValue(child, DataManager.getDataSetAttrs().pointType, chance.type));
            });

            let fullChanceCounter = fullChanceElements;
            let remainingChanceChecked = false;

            currentPointTypeChances.forEach(point => {
                if (fullChanceCounter) {
                    UIHelper.setProperty(point, this.#cssVars.pointChancePercent, '100%');
                    UIHelper.removeClass(point, DataManager.getPointChanceWrapClasses().layer_1.hiddenPoint);
                    fullChanceCounter--;
                } else if(remainingChance && !remainingChanceChecked) {
                    UIHelper.setProperty(point, this.#cssVars.pointChancePercent, `${remainingChance}%`);
                    UIHelper.removeClass(point, DataManager.getPointChanceWrapClasses().layer_1.hiddenPoint);
                    remainingChanceChecked = true;
                } else {
                    UIHelper.setProperty(point, this.#cssVars.pointChancePercent, '0%');
                    UIHelper.addClass(point, DataManager.getPointChanceWrapClasses().layer_1.hiddenPoint);
                }
                console.log(point);
            });

            /** @type {SaveGeneratorPoints[]} */
            const chancePointsToAdd = [];
            while (fullChanceCounter) {
                chancePointsToAdd.push({type: chance.type, currentChance: 100});
                fullChanceCounter--;
            }
            if (remainingChance && !remainingChanceChecked) {
                chancePointsToAdd.push({type: chance.type, currentChance: remainingChance});
                remainingChanceChecked = true;
            }

            if (chancePointsToAdd.length) {
                const newPointChances = this.createPointChanceElements(generatorName, chancePointsToAdd);
                this.appendGeneratorStatusElements(generatorName, newPointChances);
                UIRegService.registerGeneratorPointChanceElements(generatorName, newPointChances);
            }
        })
    }

    /**
     * @param {string} generatorName 
     * @param {SaveGeneratorPoints[]} pointChances
     * @returns {HTMLElement[]}
     */
    createPointChanceElements(generatorName, pointChances = []) {
        Asserts.string(generatorName);
        Asserts.array(pointChances);

        /** @type {{element: HTMLElement, chance: number}[]} */
        const pointElementsWithChances = [];
        pointChances.forEach(pointChance => {
            pointElementsWithChances.push({element: Render.renderPoint(pointChance.type), chance: pointChance.currentChance});
        })

        return Render.renderPointChanceWrapper(pointElementsWithChances);
    }

    /**
     * @param {string} generatorName 
     * @param {HTMLElement[]} [pointChanceElements]
     */
    appendGeneratorStatusElements(generatorName, pointChanceElements = []) {
        Asserts.string(generatorName);
        Asserts.htmlArray(pointChanceElements);

        const generatorElement = this.getGeneratorElement(generatorName);
        const generatorStatusElement = generatorElement.nextSibling;
        if (!UIHelper.containsClasses(generatorStatusElement, DataManager.getGeneratorStatusWrapClasses().layer_0)) return;
        UIHelper.appendChildren(generatorStatusElement, pointChanceElements);
    }

    // #endregion Generator Status

    // #region Cost Preview

    /**
     * @param {HTMLDivElement} parentElement
     * @returns {boolean}
     */
    hasCostPreview(parentElement) {
        Asserts.htmlElement(parentElement);

        if (!UIHelper.hasChildren(parentElement)) return false;
        for (let child of parentElement.children) {
            if (UIHelper.isDataSetValue(child, this.#dataset.attr.type, this.#dataset.types.costPreview)) {
                return true;
            }
        }
        return false;
    }

    /**
     * @param {HTMLElement} generatorElement 
     * @param {PointSet} cost 
     */
    renderCostPreview(generatorElement, cost) {
        Asserts.htmlElement(generatorElement);
        Asserts.object(cost);
        if (this.hasCostPreview(generatorElement)) return;

        const costPreviewElement = Render.renderCostPreview();
        for (const [key, value] of Object.entries(cost)) {
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

    showStorageUpgrader() {
        const children = this.#storageUpgradeWrapper.children;
        for (let child of Array.from(children)) {
            Animate.widthIn(child);
            Animate.opacityIn(child);
        }   
        this.#storageUpgrade.disabled = false;
    }

    /** @param {number} */
    updateStorageLayout(currentMaxStorage) {
        Asserts.number(currentMaxStorage);

        if (currentMaxStorage > 9) {
            this.#pointsContainer.style.setProperty(this.#cssVars.storagePointsPerRow, 4);
            return;
        }
        if (currentMaxStorage > 5) {
            this.#pointsContainer.style.setProperty(this.#cssVars.storagePointsPerRow, 3)
        }
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