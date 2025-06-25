import ElBuilder from "../element.builder.js";
import DataManager from "../../../systems/managers/data.manager.js";

export default class WrapperDirector {

    /**
     * @param {HTMLElement} child
     * @param {string[]} [classes=[]]
     * @returns {HTMLDivElement}
     */
    static wrapChild(child, classes = []) {
        return new ElBuilder('div')
            .addClass(DataManager.getWrapClasses())
            .addClass(classes)
            .appendChild(child)
            .finish();
    }

    /**
     * @param {HTMLElement[]} children
     * @param {string[]} [classes=[]]
     * @returns {HTMLDivElement}
     */
    static wrapChildren(children, classes = []) {
        const wrapper = new ElBuilder('div')
            .addClass(DataManager.getWrapClasses())
            .addClass(classes)

        for (const child of children) {
            wrapper.appendChild(child);
        }
        
        return wrapper.finish();
    }

}