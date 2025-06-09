import ElBuilder from "../element.builder.js";
import DataManager from "../../../systems/managers/data.manager.js";

export default class AnimationElementsDirector {

    /**
     * @param {string[]} [classes=[]]
     * @returns {HTMLDivElement}
     */
    static createRippleChild(classes = []) {
        return new ElBuilder('div')
            .addClass(DataManager.getAnimations().ripple.classes)
            .addClass(classes)
            .addDataSet(DataManager.getDataSetAttrs().type, DataManager.getDataSetTypes().animationElement)
            .finish();
    }

}