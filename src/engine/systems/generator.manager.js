import { GENERATORS } from "../data/generators.data.js";
import DataManager from "./data.manager.js";
import Global from "../core/global.js";
import Utils from "../utils/utils.js";
import Validators from '../utils/validators.js';
import Errors from '../utils/errors.js';

export default class GeneratorManager {

    /**
     * @type {string[]}
     */
    #orderedGenerators = [];

    /**
     * @type {string[]}
     */
    #lockedGenerators = [];
    /**
     * @type {string[]}
     */
    #hintedGenerators = [];
    /**
     * @type {string[]}
     */
    #canBuildGenerators = [];
    /**
     * @type {string[]}
     */
    #builtGenerators = [];


    constructor () {
        this.#setOrderedGenerators();
    }

    // #region Setup

    #setOrderedGenerators() {
        this.#orderedGenerators = this.getAllGeneratorsData().map(generator => generator.name);
    }

    setNewGeneratorManager() {
        this.#resetGenerators();
        this.#setGenerators(this.#sanitizeGenerators(Global.proxy.generators));
    }

    #resetGenerators() {
        this.#lockedGenerators = [];
        this.#hintedGenerators = [];
        this.#canBuildGenerators = [];
        this.#builtGenerators = [];
    }

    /**
     * @param {Object[]} generators
     * @returns {Object}
     */
    #sanitizeGenerators(generators) {
        let sanitizedGenerators = [];
        // Passed generators must exist in the code base
        sanitizedGenerators = generators.filter(generator => generator.name && GENERATORS.find(gen => gen.name === generator.name));
        // We set the correct life cycle state for generators flags
        sanitizedGenerators.forEach(generator => {
            if (generator.built && !generator.canBuild) generator.built = false;
            if (generator.canBuild && !generator.hinted) generator.canBuild = false;
        });
        return sanitizedGenerators;
    }

    #setGenerators(generators) {
        generators.forEach(generator => {
            if (!generator.hinted && !generator.canBuild && !generator.built) {
                this.#lockedGenerators.push(generator.name);
                return;
            }
            if (generator.hinted && !generator.canBuild && !generator.built) {
                this.#hintedGenerators.push(generator.name);
                return;
            }
            if (generator.hinted && generator.canBuild && !generator.built) {
                this.#canBuildGenerators.push(generator.name);
                return;
            }
            if (generator.hinted && generator.canBuild && generator.built) {
                this.#builtGenerators.push(generator.name);
                return;
            }
        });
    }

    // #endregion Setup

    // #region Get Data

    /**
     * @return {Array}
     */
    getAllGeneratorsData() {
        return DataManager.getAllGeneratorsData();
    }
    
    /**
     * @param { string } generatorName 
     * @return {Object|null}
     */
    getGeneratorData(generatorName) {
        return DataManager.getGeneratorData(generatorName);
    }

    /**
     * @param {string} generatorName 
     * @returns {Object | null}
     */
    getProxySaveGenerator(generatorName) {
        const generator = Global.proxy.generators.find(generator=> generator.name === generatorName);
        return Utils.deepCopy(generator);
    }

    /**
     * @param {string} generatorName 
     * @returns {boolean}
     */
    isValidGenerator(generatorName) {
        return Validators.isNotNullNorUndefined(this.getGeneratorData(generatorName));
    }

    /**
     * @param { string } generatorName
     * @return {Object|null}
     */
    whatConsumes(generatorName) {
        return this.getGeneratorData(generatorName)?.consumes || null;
    }

    /**
     * @param { string } generatorName 
     * @return {Object|null}
     */
    whatGenerates(generatorName) {
        return this.getGeneratorData(generatorName)?.generates || null;
    }

    /**
     * @param { string } generatorName 
     * @return {Object|null}
     */
    whatUnlockRequires(generatorName) {
        return this.getGeneratorData(generatorName)?.unlockRequires || null;
    }

    /**
     * @param { string } generatorName 
     * @return {Object|null}
     */
    whatUnlockHintRequires(generatorName) {
        return this.whatUnlockRequires(generatorName)?.hint || null;
    }

    /**
     * @param { string } generatorName 
     * @return {Object|null}
     */
    whatUnlockBuildRequires(generatorName) {
        return this.whatUnlockRequires(generatorName)?.build || null;
    }

    // #endregion Get Data

    // #region Manage

    /**
     * @param { string } generatorName 
     */
    canBeHinted(generatorName) {
        let generatorIndexToRemove = this.#lockedGenerators.indexOf(generatorName);
        let [generatorToBeHinted] = this.#lockedGenerators.splice(generatorIndexToRemove, 1);
        this.#hintedGenerators.push(generatorToBeHinted);
    }

    /**
     * @param { string } generatorName 
     */
    canBeBuilt(generatorName) {
        let generatorIndexToRemove = this.#hintedGenerators.indexOf(generatorName);
        let [generatorToBeBuildable] = this.#hintedGenerators.splice(generatorIndexToRemove, 1);
        this.#canBuildGenerators.push(generatorToBeBuildable);
    }

    /**
     * @param { string } generatorName 
     */
    isBuilt (generatorName) {
        let generatorIndexToRemove = this.#canBuildGenerators.indexOf(generatorName);
        let [generatorBuilt] = this.#canBuildGenerators.splice(generatorIndexToRemove, 1);
        this.#builtGenerators.push(generatorBuilt);
    }
    
    // #endregion Manage

    // #region Access


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
     * @returns {string[]}
     */
    get orderedGens() {
        return Utils.arrCopy(this.#orderedGenerators);
    }

    /**
     * @returns {string[]}
     */
    get lockedGens() {
        return Utils.arrCopy(this.#lockedGenerators);
    }

    /**
     * @returns {string[]}
     */
    get hintedGens() {
        return Utils.arrCopy(this.#hintedGenerators);
    }

    /**
     * @returns {string[]}
     */
    get canBuildGens() {
        return Utils.arrCopy(this.#canBuildGenerators);
    }

    /**
     * @returns {string[]}
     */
    get builtGens() {
        return Utils.arrCopy(this.#builtGenerators);
    }

    // #endregion Access
}