
import { EventBus, Events } from "../core/event-bus.js";

import Render from "./render.factory.js";
import Animate from "./helpers/animate.js";

import DataManager from "../systems/managers/data.manager.js";

export default class UIController {

    /**
     * @type { Animations }
     */
    #animations

    /**
     * @type { HTMLElement }
     */
    #central
    /**
     * @type { HTMLElement }
     */
    #pointsContainer
    
    constructor() {
        this.#animations = DataManager.getAnimations();
        this.#setElements();
        this.#setEventBus();
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

    // #region Public

    shakePointsContainer() {
        this.#shakeElement(this.#pointsContainer);
    }

    // #endregion
}

export const UIControl = new UIController();