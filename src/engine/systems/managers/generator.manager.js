import Global from "../../core/global.js";
import { EventBus, Events } from "../../core/event-bus.js";

import DataManager from "./data.manager.js";

import Utils from "../../utils/utils.js";
import Validators from '../../utils/validators.js';
import Errors from '../../utils/errors.js';
import Asserts from "../../utils/asserts.js";

class GeneratorManager {

    /** @type {string[]} */
    #orderedGenerators = [];

    /** @type {boolean} */
    #needToCheckCooldowns = false;

    // TODO: check if we will track here the status items or in UI controller
    #currentGeneratorStatus = [];


    constructor () {
        this.#setOrderedGenerators();
        this.#setBusEvents();
    }

    // #region Setup

    #setOrderedGenerators() {
        this.#orderedGenerators = this.#getAllGeneratorsData().map(generator => generator.name);
    }

    #setBusEvents() {
        EventBus.on(Events.generator.onCD, (generatorName, baseCooldown) => this.setRemainingCD(generatorName, baseCooldown));
        EventBus.on(Events.generator.updateCD, (generatorName, remainingCD) => this.setRemainingCD(generatorName, remainingCD));
        EventBus.on(Events.generator.onUse, (generatorName) => this.setGeneratorUses(generatorName));
    }

    setNewGeneratorManager() {
        this.#sanitizeGenerators(Global.proxy.generators, this.#orderedGenerators);
    }

    /**
     * @param {Object[]} generators
     */
    #sanitizeGenerators(generators, generatorsData) {
        // Passed generators must exist in the code base
        let sanitizedGenerators = generators.filter(generator => generator.name && generatorsData.find(generatorDataName => generatorDataName === generator.name));
        // We set the correct life cycle state for generators flags
        sanitizedGenerators.forEach(
            /** @param {SaveGenerator} generator */
            generator => {
                if (generator.built && !generator.canBuild) generator.built = false;
                if (generator.canBuild && !generator.hinted) generator.canBuild = false;
                if (generator.remainingCD) {
                    if (generator.remainingCD < 0) {
                        generator.remainingCD = 0;
                        return;
                    }
                    this.#needToCheckCooldowns = true;
                }
            }
        );
    }

    // #endregion Setup

    // #region Get Generator Data

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
     * @return { DataGeneratorGenerates | null}
     */
    whatGenerates(generatorName) {
        return Utils.deepCopy(this.#getGeneratorData(generatorName))?.generates || null;
    }

    /**
     * @param {string} generatorName 
     * @returns {number | null}
     */
    whatGeneratesMultiplier(generatorName) {
        return this.whatGenerates(generatorName)?.baseMultiplier || null;
    }

    /**
     * @param {string} generatorName 
     * @returns {DataGeneratorGeneratesPoint[] | null}
     */
    whatGeneratesPoints(generatorName) {
        return this.whatGenerates(generatorName)?.points || null;
    }

    /**
     * 
     * @param {string} generatorName 
     * @returns {GeneratorCooldownData | null}
     */
    #whatCoolDown(generatorName) {
        return this.#getGeneratorData(generatorName)?.cooldown || null;
    }

    /**
     * @param {string} generatorName 
     * @returns {number | null}
     */
    whatBaseCoolDown(generatorName) {
        return this.#whatCoolDown(generatorName)?.baseCooldown || null;
    }

    /**
     * @param {string} generatorName 
     * @param {number} timesUsed 
     * @returns {number | null}
     */
    whatCoolDownIncrement(generatorName, timesUsed) {
        return this.#whatCoolDown(generatorName)?.cooldownIncrement(timesUsed) || null;
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

    // #endregion Get Generator Data

    // #region Get Proxy Save

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
     * @returns { string[] }
     */
    getLockedGeneratorNames() {
        return this.#getProxySaveGeneratorByCriteria(
            (generator) => !generator.hinted && !generator.canBuild && !generator.built)
            .map(gen => gen.name) || null;
    }

    /**
     * @returns { string[] }
     */
    getHintedGeneratorNames() {
        return this.#getProxySaveGeneratorByCriteria(
            (generator) => generator.hinted && !generator.canBuild && !generator.built)
            .map(gen => gen.name) || null;
    }

    /**
     * @returns { string[] }
     */
    getBuildableGeneratorNames() {
        return this.#getProxySaveGeneratorByCriteria(
            (generator) => generator.hinted && generator.canBuild && !generator.built)
            .map(gen => gen.name) || null;
    }

    /**
     * @returns { string[] }
     */
    getBuiltGeneratorNames() {
        return this.#getProxySaveGeneratorByCriteria(
            (generator) => generator.hinted && generator.canBuild && generator.built)
            .map(gen => gen.name) || null;
    }

    /**
     * @returns { string[] }
     */
    getGeneratorsOnCooldownNames() {
        return this.#getProxySaveGeneratorByCriteria(
            (generator) => generator.remainingCD)
            .map(gen => gen.name) || null;
    }

    // Generator Status

    /**
     * @param {string} generatorName
     * @returns {number}
     */
    getGeneratorRemainingCD(generatorName) {
        return this.#getProxySaveGeneratorByName(generatorName).remainingCD;
    }

    /**
     * @param {string} generatorName
     * @returns {number}
     */
    getGeneratorTimesUsed(generatorName) {
        return this.#getProxySaveGeneratorByName(generatorName).timesUsed;
    }

    /**
     * @param {string} generatorName
     * @returns {number}
     */
    getGeneratorMultiplier(generatorName) {
        return this.#getProxySaveGeneratorByName(generatorName)?.currentMultiplier || null;
    }

    /**
     * @param {string} generatorName
     * @returns {SaveGeneratorPoints[] | []}
     */
    getGeneratorPoints(generatorName) {
        return this.#getProxySaveGeneratorByName(generatorName)?.generatesPoints || [];
    }

    // Unlock Flow

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

    // #endregion Get Proxy Save

    // #region Manage Proxy Save

    /**
     * @param { string } generatorName
     * @param { string } prop
     * @param {number | boolean} value
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

    /** 
     * @param {string} generatorName 
     * @param {number} remainingCD
     */
    setRemainingCD(generatorName, remainingCD) {
        Asserts.string(generatorName);
        Asserts.number(remainingCD);

        if (!remainingCD || remainingCD < 0) remainingCD = 0;
        this.#setProp(generatorName, 'remainingCD', remainingCD);
        this.#needToCheckCooldowns = remainingCD > 0 || this.#needToCheckCooldowns;
        if (!remainingCD) EventBus.emit(Events.generator.ready, generatorName);
    }
    
    get needToCheckCooldowns() {
        return this.#needToCheckCooldowns;
    }

    /** @param {boolean} value */
    set needToCheckCooldowns(value) {
        Asserts.boolean(value);
        this.#needToCheckCooldowns = value;
    }

    /** @param {string} generatorName */
    setGeneratorUses(generatorName) {
        Asserts.string(generatorName);
        const generatorTimesUsed = this.getGeneratorTimesUsed(generatorName);
        Asserts.number(generatorTimesUsed);
        const newTimesUsed = generatorTimesUsed + 1;
        this.#setProp(generatorName, 'timesUsed', newTimesUsed);
    }
    
    // #endregion Manage Proxy Save
}
export const generatorM = new GeneratorManager();