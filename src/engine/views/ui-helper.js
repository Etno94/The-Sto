import Utils from '../utils/utils.js';

export default class UIHelper {

    // #region Validations

    /**
     * @param {HTMLElement} element
     * @param {string} className
     * @returns {boolean}
     */
    static containsClass(element, className) {
        if (!Utils.isValidString(className)) return false;
        return element.classList.contains(className);
    }

    /**
     * @param {HTMLElement} element
     * @param {string} attribute
     * @returns {boolean}
     */
    static hasAttribute(element, attribute) {
        if (!Utils.isValidString(attribute)) return false;
        return element.hasAttribute(attribute);
    }

    /**
     * @param {HTMLElement} element
     * @param {string} datasetName 
     * @returns {boolean}
     */
    static hasDataSet(element, datasetName) {
        if (!Utils.isValidString(datasetName)) return false;
        return element.hasAttribute(`data-${datasetName}`);
    }

    /**
     * @param {HTMLElement} element
     * @param {string} datasetName 
     * @param {string} value 
     * @returns {boolean}
     */
    static isDataSetValue(element, datasetName, value) {
        if (!Utils.isValidString(datasetName) || !Utils.isValidString(value)) return false;
        return element.dataset[`data-${datasetName}`] === value;
    }

    /**
     * @param {HTMLElement} parent 
     * @param {HTMLElement} child
     * @return {boolean}
     */
    static areParentAndChildValid(parent, child) {
        if (!Utils.isValidHTMLElement(parent) || !Utils.isValidHTMLElement(child)) return false;
        return (parent !== child && UIHelper.isParentNode(parent, child));
    }

    /**
     * @param {HTMLElement} parent 
     * @param {HTMLElement} child
     * @return {boolean}
     */
    static isParentNode(parent, child) {
        return child.parentNode === parent;
    }

    // #endregion Validations

    // #region Actions

    /**
     * Creates a new HTML element with the specified tag.
     * @param {string} tag
     * @returns {HTMLElement}
     */
    static create(tag) {
        return Utils.isValidString(tag) ? document.createElement(tag) : null;
    }

    // #region Class

    /**
     * @param {HTMLElement} element
     * @param {string[]} classNames
     * @param {string} action
     * @returns {HTMLElement}
     */
    static actionOnClass(element, action, classNames ) {
        switch(typeof classNames) {
            case 'string':
                if (Utils.isValidString(classNames)) 
                    element.classList[action](classNames);
                break;
            case 'object':
                if (Utils.isStringArray(classNames)) 
                    element.classList[action](...classNames);
                break;
        }
        return element;
    }

    /**
     * @param {HTMLElement} element
     * @param {string[]} classNames
     * @returns {HTMLElement}
     */
    static addClass(element, classNames) {
        return UIHelper.actionOnClass(element,'add', classNames);
    }

    /**
     * @param {HTMLElement} element
     * @param {string[]} classNames
     * @returns {HTMLElement}
     */
    static removeClass(element, classNames) {
        return UIHelper.actionOnClass(element, 'remove', classNames);
    }

    /**
     * @param {HTMLElement} element
     * @param {string[]} classNames
     * @returns {HTMLElement}
     */
    static toggleClass(element, classNames) {
        UIHelper.actionOnClass(element, 'toggle', classNames);
    }

    // #endregion Class

    /**
     * @param {HTMLElement} element
     * @param {string} name 
     * @param {string} value 
     * @returns {HTMLElement}
     */
    static addAttribute(element, name, value) {
        if (Utils.isValidString(name) && Utils.isValidString(value)) {
            element.setAttribute(name, value);
        }
        return element;
    }

    /**
     * @param {HTMLElement} element
     * @param {string} name 
     * @returns {HTMLElement}
     */
    static removeAttribute(name) {
        if (Utils.isValidString(name)) {
            element.removeAttribute(name);
        }
        return element;
    }

    /**
     * @param {HTMLElement} element
     * @param {string} name 
     * @param {string} value 
     * @returns {HTMLElement}
     */
    static addDataSet(element, name, value) {
        if (Utils.isValidString(name) && Utils.isValidString(value)) {
            element.setAttribute(`data-${name}`, value);
        }
        return element;
    }

    /**
     * @param {HTMLElement} element
     * @param {string} name 
     * @returns {HTMLElement}
     */
    static removeDataSet(element, name) {
        if (Utils.isValidString(name)) {
            element.removeAttribute(`data-${name}`);
        }
        return element;
    }

    /**
     * @param {HTMLElement} parent
     * @param {HTMLElement} child 
     * @returns {HTMLElement}
     */
    static appendChild(parent, child) {
        if (Utils.isValidHTMLElement(child) &&
            !parent.contains(child)) {
            parent.appendChild(child);
        }
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

    // #endregion Actions
}