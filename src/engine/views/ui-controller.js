
import { EventBus, Events } from "../core/event-bus.js";

import Render from "./render.factory.js";
import Animate from "./helpers/animate.js";
import UIHelper from "./helpers/ui-helper.js";

import DataManager from "../systems/managers/data.manager.js";

class UIController {

    /**
     * @type { Animations }
     */
    #animations

    /**
     * @type { DataSet }
     */
    #dataset = {
        types: {},
        attr: {}
    }

    /**
     * @type { HTMLElement }
     */
    #central
    /**
     * @type { HTMLElement }
     */
    #pointsContainer
    
    constructor() {
        this.#setData();
        this.#setElements();
        this.#setEventBus();
    }

    #setData() {
        this.#animations = DataManager.getAnimations();
        this.#dataset.types = DataManager.getDataSetTypes();
        this.#dataset.attr = DataManager.getDataSetAttrs();
    }

    #setElements() {
        this.#central = document.getElementById("central");
        this.#pointsContainer = document.getElementById("points");
    }

    #setEventBus() {
        EventBus.on(Events.points.overcap, () => this.shakePointsContainer());
    }

    /**
     * @param { HTMLElement } element 
     */
    #shakeElement(element) {
        Animate.timedOut(element, this.#animations.tilt);
    }

    // #region Animations

    shakePointsContainer() {
        this.#shakeElement(this.#pointsContainer);
    }

    // #endregion Animations
    
    // #region Elements Flow

    /**
     * @param {HTMLDivElement} parentElement
     * @returns {boolean}
     */
    hasCostPreview(parentElement) {
        if (!UIHelper.hasChildrens(parentElement)) return false;
        for (let child of parentElement.children) {
            if (UIHelper.isDataSetValue(child, this.#dataset.attr.type, this.#dataset.types.costPreview)) return true;
        }
        return false;
    }

    /**
     * @param {HTMLDivElement} parentElement
     */
    removeCostPreview(element) {
        UIHelper.applyToChildren(element, (child) => {
            if (UIHelper.containsClass(child, 'cost-preview') ||
                UIHelper.hasDataSet(child, this.#dataset.attr.type, this.#dataset.types.costPreview)) {
                UIHelper.removeChild(element, child);
            }
        });
    }

    // #endregion Elements Flow
}

export const UIControl = new UIController();