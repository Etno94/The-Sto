// import Utils from '../utils/utils.js';
import Validators from '../utils/validators.js';

export default class UIHelper {

    // #region Validations

    /**
     * @param {HTMLElement} element
     * @param {string} className
     * @returns {boolean}
     */
    static containsClass(element, className) {
        if (!Validators.isString(className)) return false;
        return element.classList.contains(className);
    }

    /**
     * @param {HTMLElement} element
     * @param {string} attribute
     * @returns {boolean}
     */
    static hasAttribute(element, attribute) {
        if (!Validators.isString(attribute)) return false;
        return element.hasAttribute(attribute);
    }

    /**
     * @param {HTMLElement} element
     * @param {string} datasetName 
     * @returns {boolean}
     */
    static hasDataSet(element, datasetName) {
        if (!Validators.isString(datasetName)) return false;
        return element.hasAttribute(`data-${datasetName}`);
    }

    /**
     * @param {HTMLElement} element
     * @param {string} datasetName 
     * @param {string} value 
     * @returns {boolean}
     */
    static isDataSetValue(element, datasetName, value) {
        if (!Validators.isString(datasetName) || !Validators.isString(value)) return false;
        return element.dataset[datasetName] === value;
    }

    /**
     * @param {HTMLElement} parent 
     * @return {boolean}
     */
    static hasChildrens(parent) {
        if (!Validators.isHTMLElement(parent)) return false;
        return parent.children && parent.children.length > 0;
    }

    /**
     * @param {HTMLElement} parent 
     * @param {HTMLElement} child
     * @return {boolean}
     */
    static areParentAndChildValid(parent, child) {
        if (!Validators.isHTMLElement(parent) || !Validators.isHTMLElement(child)) return false;
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
        return Validators.isString(tag) ? document.createElement(tag) : null;
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
                if (Validators.isString(classNames)) 
                    element.classList[action](classNames);
                break;
            case 'object':
                if (Validators.isStringArray(classNames)) 
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
        if (Validators.isString(name) && Validators.isString(value)) {
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
        if (Validators.isString(name)) {
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
        if (Validators.isString(name) && Validators.isString(value)) {
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
        if (Validators.isString(name)) {
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
        if (Validators.isHTMLElement(child) &&
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

    // #region Iterators

    static applyToChildren(parent, callback)  {

        if (!Validators.isHTMLElement(parent) || !Validators.isFunction(callback)) return;

        if (!UIHelper.hasChildrens(parent)) return;

        for (let child of parent.children) {
            if (Validators.isHTMLElement(child)) {
                callback(child);
            }
        }
    }

    // #endregion Iterators
}