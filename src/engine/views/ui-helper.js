import Utils from '../utils/utils.js';

export default class UIHelper {

    /**
     * @param {HTMLElement} parent 
     * @param {HTMLElement} child
     * @return {boolean}
     */
    static areParentAndChildValid(parent, child) {
        if (!Utils.isValidHTMLElement(parent) || !Utils.isValidHTMLElement(child)) return false;
        if (parent === child) return false;
        return true;
    }

    /**
     * @param {HTMLElement} parent 
     * @param {HTMLElement} child
     * @return {boolean}
     */
    static isParentNode(parent, child) {
        return child.parentNode === parent;
    }

    /**
     * @param {HTMLElement} parent 
     * @param {HTMLElement} child 
     */
    static removeChild(parent, child) {
        if (!UIHelper.areParentAndChildValid(parent, child)) return;
        if (!UIHelper.isParentNode(parent, child)) return;
        parent.removeChild(child);
    }
}