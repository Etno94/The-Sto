import {DataManager} from "../../systems/managers-index.js";
import {Asserts} from "../../utils/utils.index.js";
import UIHelper from "../helpers/ui-helper.js";
import {GenUIReg} from "./generators.ui-registry.js";

class UIRegistryService {

    /** @type {DataGeneratorId} */
    #generatorIds;
    /** @type {DataGeneratorRegistry} */
    #dataGeneratorRegistry;
    /** @type {Generator_CdCharges_Wrap} */
    #dataCdChargesClasses;
    /** @type {Generator_PulseCells_Wrap} */
    #dataPulseCellsClasses;

    constructor() {
        this.#setData();
    }

    #setData() {
        this.#generatorIds = DataManager.getGeneratorIds();
        this.#dataGeneratorRegistry = DataManager.getDataGeneratorRegistry();
        this.#dataCdChargesClasses = DataManager.getCdChargesWrapClasses();
        this.#dataPulseCellsClasses = DataManager.getPulseCellsWrapClasses();
    }

    // #region Generator UI Registry

    /**
     * @param {HTMLElement} generatorWrapElement 
     */
    registerGeneratorWrap(generatorWrapElement) {
        Asserts.htmlElement(generatorWrapElement);
        const buttomElement = generatorWrapElement.querySelector(`button`);
        if (!buttomElement) return;

        const map = {
            [this.#generatorIds.CLICK]: (el) => this.registerClickGeneratorElements(el),
            [this.#generatorIds.COOLDOWN]: (el) => this.registerGeneratorElements(el, 
                this.#dataCdChargesClasses, this.#dataGeneratorRegistry.itemPrefixes.cdCharge, this.#dataGeneratorRegistry.category.cdCharges),
            [this.#generatorIds.PULSE]: (el) => this.registerGeneratorElements(el, 
                this.#dataPulseCellsClasses, this.#dataGeneratorRegistry.itemPrefixes.pulseCell, this.#dataGeneratorRegistry.category.pulseCells)
        };

        const generatorFunc = map[buttomElement.id] || (() => {});
        generatorFunc(generatorWrapElement);
    }

    /**
     * @param {HTMLElement} generatorWrapElement 
     */
    registerClickGeneratorElements(generatorWrapElement) {
        Asserts.htmlElement(generatorWrapElement);
        const buttomElement = generatorWrapElement.querySelector(`button`);
        if (!buttomElement) return;
        console.log(`${buttomElement.id} registered`);
    }

    /**
     * @param {HTMLElement} generatorWrapElement
     * @param {{layer_0: string, layer_1: string}} wrapClasses
     * @param {string} itemPrefix
     * @param {string} category
     */
    registerGeneratorElements(generatorWrapElement, wrapClasses, itemPrefix, category) {
        Asserts.htmlElement(generatorWrapElement);

        const buttonElement = generatorWrapElement.querySelector('button');
        if (!buttonElement) return;

        const generatorName = buttonElement.id;
        const querySelector = 'div.' + wrapClasses.layer_0.join('.');
        const wrapElement = generatorWrapElement.querySelector(querySelector);

        if (!wrapElement || !UIHelper.hasChildren(wrapElement)) return;

        let elementNumber = 1;
        Array.from(wrapElement.children).forEach(child => {
            if (!UIHelper.containsClasses(child, wrapClasses.layer_1)) return;

            const formatedKey = this.getFormatedKey(itemPrefix, elementNumber);
            GenUIReg.register(generatorName, category, formatedKey, child);
            elementNumber++;
        });
    }

    /**
     * @param {string} generatorName 
     * @param {HTMLElement[]} pointChanceElements 
     */
    registerGeneratorPointChanceElements(generatorName, pointChanceElements) {
        Asserts.string(generatorName);
        Asserts.htmlArray(pointChanceElements);

        let newIndex = 0;
        const lastRegistryKey = GenUIReg.checkLastRegister(generatorName, this.#dataGeneratorRegistry.category.statusItems);
        if (lastRegistryKey) newIndex = Number(lastRegistryKey.split('#')[1]) + 1;

        pointChanceElements.forEach((pointChanceElement) => {
            GenUIReg.register(generatorName, this.#dataGeneratorRegistry.category.statusItems, 
                `${this.#dataGeneratorRegistry.itemPrefixes.pointChance}#${newIndex}`, pointChanceElement);
            newIndex++;
        });
    }

    /**
     * @param {string} generator 
     * @returns {Node[]}
     */
    getPointChancesFromGenerator(generatorName) {
        Asserts.string(generatorName);
        return GenUIReg.getPointChancesFromGenerator(generatorName);
    }

    /**
     * @param {string} generator 
     * @returns {Node[]}
     */
    getElementsFromGenerator(generatorName, category) {
        Asserts.string(generatorName);
        Asserts.string(category);
        return GenUIReg.getAllFrom(generatorName, category);
    }

    // #endregion Generator UI Registry

    /**
     * @param {string} prefix 
     * @param {number} index
     * @returns {string}
     */
    getFormatedKey(prefix, index) {
        return `${prefix}#${index}`;
    }

}
export const UIRegService = new UIRegistryService();