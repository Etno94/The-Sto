import Global from "../../core/global.js";
import { EventBus, Events } from "../../core/event-bus.js";

import DataManager from "./data.manager.js";

import Utils from "../../utils/utils.js";
import Validators from '../../utils/validators.js';
import Errors from '../../utils/errors.js';

export default class GeneratorManager {

    /**
     * @type {string[]}
     */
    #orderedGenerators = [];


    constructor () {
        this.#setOrderedGenerators();
        this.#setBusEvents();
    }

    // #region Setup

    #setOrderedGenerators() {
        this.#orderedGenerators = this.#getAllGeneratorsData().map(generator => generator.name);
    }

    #setBusEvents() {

    }

    setNewGeneratorManager() {
        this.#sanitizeGenerators(Global.proxy.generators, this.#orderedGenerators);
    }

    /**
     * @param {Object[]} generators
     */
    #sanitizeGenerators(generators, generatorsData) {
        // Passed generators must exist in the code base
        let sanitizedGenerators = generators.filter(generator => generator.name && generatorsData.find(gen => gen.name === generator.name));
        // We set the correct life cycle state for generators flags
        sanitizedGenerators.forEach(generator => {
            if (generator.built && !generator.canBuild) generator.built = false;
            if (generator.canBuild && !generator.hinted) generator.canBuild = false;
        });
    }

    // #endregion Setup

    // #region Get Data

    /**
     * @param {string} generatorName 
     * @returns {number}
     */
    getOrderedGeneratorIndex(generatorName) {
        if (!Validators.isString(generatorName)) {
            Errors.logError(new Error(`GeneratorName ${generatorName} is not a valid string.`));
            return 0;
        }
        const index = this.#orderedGenerators.indexOf(generatorName);
        if (index === -1) {
            Errors.logError(new Error(`Generator ${generatorName} not found in ordered generators.`));
            return 0;
        }
        return index;
    }


    /**
     * @return {Array}
     */
    #getAllGeneratorsData() {
        return DataManager.getAllGeneratorsData();
    }
    
    /**
     * @param { string } generatorName 
     * @return { DataGenerator | null }
     */
    #getGeneratorData(generatorName) {
        return DataManager.getGeneratorData(generatorName);
    }

    /**
     * @param {Function} callback 
     * @returns { SaveGenerator[] | null}
     */
    #getProxySaveGeneratorByCriteria(callback) {
        if (!Validators.isFunction(callback)) return null;
        return Utils.arrCopy(Global.proxy.generators.filter(callback)) || null;
    }

    /**
     * @param {string} generatorName 
     * @returns { SaveGenerator | null}
     */
    #getProxySaveGeneratorByName(generatorName) {
        if (!Validators.isString(generatorName)) return null;
        return this.#getProxySaveGeneratorByCriteria((generator) => generator.name === generatorName)[0] || null;
    }

    /**
     * @returns { SaveGenerator[] }
     */
    getLockedGenerators() {
        return this.#getProxySaveGeneratorByCriteria((generator) => !generator.hinted && !generator.canBuild && !generator.built) || null;
    }

    /**
     * @returns { SaveGenerator[] }
     */
    getHintedGenerators() {
        return this.#getProxySaveGeneratorByCriteria((generator) => generator.hinted && !generator.canBuild && !generator.built) || null;
    }

    /**
     * @returns { SaveGenerator[] }
     */
    getBuildableGenerators() {
        return this.#getProxySaveGeneratorByCriteria((generator) => generator.hinted && generator.canBuild && !generator.built) || null;
    }

    /**
     * @returns { SaveGenerator[] }
     */
    getBuitGenerators() {
        return this.#getProxySaveGeneratorByCriteria((generator) => generator.hinted && generator.canBuild && generator.built) || null;
    }


    /**
     * @param {string} generatorName 
     * @returns {boolean}
     */
    isValidGenerator(generatorName) {
        return Validators.isNotNullNorUndefined(this.#getGeneratorData(generatorName));
    }


    /**
     * @param { string } generatorName
     * @return { PointSet | null}
     */
    whatConsumes(generatorName) {
        return Utils.deepCopy(this.#getGeneratorData(generatorName))?.consumes || null;
    }

    /**
     * @param { string } generatorName 
     * @return { PointSet | null}
     */
    whatGenerates(generatorName) {
        return Utils.deepCopy(this.#getGeneratorData(generatorName))?.generates || null;
    }

    /**
     * @param { string } generatorName 
     * @return { UnlockRequires | null}
     */
    #whatUnlockRequires(generatorName) {
        return this.#getGeneratorData(generatorName)?.unlockRequires || null;
    }

    /**
     * @param { string } generatorName 
     * @return { PointSet | null}
     */
    whatUnlockHintRequires(generatorName) {
        return Utils.deepCopy(this.#whatUnlockRequires(generatorName))?.hint || null;
    }

    /**
     * @param { string } generatorName 
     * @return { PointSet | null}
     */
    whatUnlockBuildRequires(generatorName) {
        return Utils.deepCopy(this.#whatUnlockRequires(generatorName))?.build || null;
    }

    /**
     * @param { string } generatorName 
     * @return { BuildRequires | null}
     */
    #whatBuildRequires(generatorName) {
        return this.#getGeneratorData(generatorName)?.buildRequires || null;
    }

    /**
     * @param { string } generatorName 
     * @return { PointSet | null}
     */
    whatBuildStepRequires(generatorName) {
        return Utils.deepCopy(this.#whatBuildRequires(generatorName))?.step || null;
    }

    /**
     * @param { string } generatorName 
     * @return { PointSet | null}
     */
    whatBuildTotalStepsRequires(generatorName) {
        return Utils.deepCopy(this.#whatBuildRequires(generatorName))?.totalSteps || null;
    }


    /**
     * @param {string} generatorName
     * @param {string} prop
     * @returns {boolean}
     */
    #isProp(generatorName, prop) {
        if (!Validators.isString(generatorName)) return false;
        return this.#getProxySaveGeneratorByName(generatorName)[prop] ?? false;
    }

    /**
     * @param {string} generatorName 
     * @returns {boolean}
     */
    isHinted(generatorName) {
        return this.#isProp(generatorName, 'hinted');
    }

    /**
     * @param {string} generatorName 
     * @returns {boolean}
     */
    isBuildable(generatorName) {
        return this.#isProp(generatorName, 'canBuild');
    }

    /**
     * @param {string} generatorName 
     * @returns {boolean}
     */
    isBuilt(generatorName) {
        return this.#isProp(generatorName, 'built');
    }

    // #endregion Get Data

    // #region Manage

    /**
     * @param { string } generatorName
     * @param { string } prop
     * @param {boolean} value
     * @return {boolean}
     */
    #setProp(generatorName, prop, value) {
        if (!Validators.isString(generatorName)) return false;
        this.#getProxySaveGeneratorByName(generatorName)[prop] = value;
    }

    /**
     * @param { string } generatorName
     * @param { boolean } value
     */
    setHinted(generatorName, value = true) {
        this.#setProp(generatorName, 'hinted', value);
    }

    /**
     * @param { string } generatorName
     * @param { boolean } value
     */
    setBuildable(generatorName, value = true) {
        this.#setProp(generatorName, 'canBuild', value);
    }

    /**
     * @param { string } generatorName
     * @param { boolean } value
     */
    setBuilt(generatorName, value = true) {
        this.#setProp(generatorName, 'built', value);
    }

    /**
     * @param {string} generatorName
     * @param {number} progress 
     */
    buildProgress(generatorName, progress) {
        if (!Validators.isString(generatorName) || !Validators.isNumber(progress)) return;
        if (progress === 0) return;

        this.#getProxySaveGeneratorByName(generatorName).progress += progress;
    }

    /**
     * @param {string} generatorName 
     * @returns {boolean}
     */
    isBuildProgressComplete(generatorName) {
        if (!Validators.isString(generatorName)) return;
        return this.#getProxySaveGeneratorByName(generatorName).progress >= this.whatBuildTotalStepsRequires(generatorName);
    }
    
    // #endregion Manage
}