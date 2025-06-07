// import Utils from '../utils/utils.js';
import Validators from '../../utils/validators.js';
import Asserts from '../../utils/asserts.js';

export default class UIHelper {

    // #region Validations

    /**
     * @param {HTMLElement} element
     * @param {string} className
     * @returns {boolean}
     */
    static containsClass(element, className) {
        Asserts.htmlElement(element);
        Asserts.string(className);
        return element.classList.contains(className);
    }

    /**
     * @param {HTMLElement} element
     * @param {string} attribute
     * @returns {boolean}
     */
    static hasAttribute(element, attribute) {
        Asserts.htmlElement(element);
        Asserts.string(attribute);
        return element.hasAttribute(attribute);
    }

    /**
     * @param {HTMLElement} element
     * @param {string} datasetName 
     * @returns {boolean}
     */
    static hasDataSet(element, datasetName) {
        Asserts.htmlElement(element);
        Asserts.string(datasetName);
        return element.hasAttribute(`data-${datasetName}`);
    }

    /**
     * @param {HTMLElement} element
     * @param {string} datasetName 
     * @param {string} value 
     * @returns {boolean}
     */
    static isDataSetValue(element, datasetName, value) {
        Asserts.htmlElement(element);
        Asserts.string(datasetName);
        Asserts.string(value);
        return element.dataset[datasetName] === value;
    }

    /**
     * @param {HTMLElement} parent 
     * @return {boolean}
     */
    static hasChildrens(parent) {
        Asserts.htmlElement(parent);
        return parent.children && parent.children.length > 0;
    }

    /**
     * @param {HTMLElement} parent 
     * @param {HTMLElement} child
     * @return {boolean}
     */
    static areParentAndChildValid(parent, child) {
        Asserts.htmlElement(parent);
        Asserts.htmlElement(child);
        return (parent !== child && UIHelper.isParentNode(parent, child));
    }

    /**
     * @param {HTMLElement} parent 
     * @param {HTMLElement} child
     * @return {boolean}
     */
    static isParentNode(parent, child) {
        Asserts.htmlElement(parent);
        Asserts.htmlElement(child);
        return child.parentNode === parent;
    }

    // #endregion Validations

    // #region Actions

    /**
     * @param {string} tag
     * @returns {HTMLElement}
     */
    static create(tag) {
        Asserts.string(tag);
        return document.createElement(tag);
    }

    // #region Class

    /**
     * @param {HTMLElement} element
     * @param {string | string[]} classNames
     * @param {string} action
     * @returns {HTMLElement}
     */
    static actionOnClass(element, action, classNames ) {
        Asserts.htmlElement(element);
        Asserts.notNullOrUndefined(classNames, 'classNames');
        Asserts.string(action, 'action');
        switch(typeof classNames) {
            case 'string':
                Asserts.string(classNames) 
                element.classList[action](classNames);
                break;
            case 'object':
                Asserts.stringArray(classNames) 
                element.classList[action](...classNames);
                break;
        }
        return element;
    }

    /**
     * @param {HTMLElement} element
     * @param {string | string[]} classNames
     * @returns {HTMLElement}
     */
    static addClass(element, classNames) {
        Asserts.htmlElement(element);
        return UIHelper.actionOnClass(element,'add', classNames);
    }

    /**
     * @param {HTMLElement} element
     * @param {string | string[]} classNames
     * @returns {HTMLElement}
     */
    static removeClass(element, classNames) {
        Asserts.htmlElement(element);
        return UIHelper.actionOnClass(element, 'remove', classNames);
    }

    /**
     * @param {HTMLElement} element
     * @param {string | string[]} classNames
     * @returns {HTMLElement}
     */
    static toggleClass(element, classNames) {
        Asserts.htmlElement(element);
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
        Asserts.htmlElement(element);
        Asserts.string(name);
        Asserts.string(value);

        element.setAttribute(name, value);
        return element;
    }

    /**
     * @param {HTMLElement} element
     * @param {string} name 
     * @returns {HTMLElement}
     */
    static removeAttribute(name) {
        Asserts.htmlElement(element);
        Asserts.string(name);

        element.removeAttribute(name);
        return element;
    }

    /**
     * @param {HTMLElement} element
     * @param {string} name 
     * @param {string} value 
     * @returns {HTMLElement}
     */
    static addDataSet(element, name, value) {
        Asserts.htmlElement(element);
        Asserts.string(name);
        Asserts.string(value);

        element.setAttribute(`data-${name}`, value);
        return element;
    }

    /**
     * @param {HTMLElement} element
     * @param {string} name 
     * @returns {HTMLElement}
     */
    static removeDataSet(element, name) {
        Asserts.htmlElement(element);
        Asserts.string(name);

        element.removeAttribute(`data-${name}`);
        return element;
    }

    /**
     * @param {HTMLElement} parent
     * @param {HTMLElement} child 
     * @returns {HTMLElement}
     */
    static appendChild(parent, child) {
        Asserts.htmlElement(parent);
        Asserts.htmlElement(child);

        if (!parent.contains(child)) parent.appendChild(child);
        return parent;
    }

    /**
     * @param {HTMLElement} parent 
     * @param {HTMLElement} child
     * @returns {HTMLElement}
     */
    static removeChild(parent, child) {
        Asserts.htmlElement(parent);
        Asserts.htmlElement(child);

        if (UIHelper.areParentAndChildValid(parent, child) && 
            UIHelper.isParentNode(parent, child)) 
            parent.removeChild(child);
        
        return parent;
    }

    // #endregion Actions

    // #region Iterators

    /**
     * @param { HTMLElement } parent 
     * @param { Function } callback 
     * @returns {HTMLElement}
     */
    static applyToChildren(parent, callback)  {
        Asserts.htmlElement(parent);
        Asserts.function(callback);
        if (!UIHelper.hasChildrens(parent)) return parent;

        for (let child of parent.children) {
            Asserts.htmlElement(child)
            callback(child);
        }
        return parent;
    }

    // #endregion Iterators
}