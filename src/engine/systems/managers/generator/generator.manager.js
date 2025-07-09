import Global from "../../../core/global.js";
import { EventBus, Events } from "../../../core/event-bus.js";

import DataManager from "../data.manager.js";

import {pointChanceStrategy} from "./point-chance.strategy.js";

import Utils from "../../../utils/utils.js";
import Validators from '../../../utils/validators.js';
import Errors from '../../../utils/errors.js';
import Asserts from "../../../utils/asserts.js";

class GeneratorManager {

    /** @type {string[]} */
    #orderedGenerators = [];

    /** @type {boolean} */
    // #needToCheckCooldowns = false;
    /** @type {DataGeneratorId} */
    #generatorIds;
    /** @type {GeneratorElementNamesData} */
    #generatorElementNames;
    /** @type {GeneratorElementsData} */
    #generatorElementsData;

    /** @type {string[]} */
    #saveGeneratorElementNames = [];


    constructor () {
        this.#setOrderedGenerators();
        this.#setData();
        this.#setBusEvents();
    }

    // #region Setup

    #setOrderedGenerators() {
        this.#orderedGenerators = this.#getAllGeneratorsData().map(generator => generator.name);
    }

    #setData() {
        this.#generatorIds = DataManager.getGeneratorIds();
        this.#generatorElementNames = DataManager.getGeneratorElementNames();
        this.#generatorElementsData = DataManager.getGeneratorElementsData();
    }

    #setBusEvents() {
        EventBus.on(Events.generator.onCD, (generatorName, baseCooldown) => this.setGeneratorRemainingCD(generatorName, baseCooldown));
        EventBus.on(Events.generator.updateCD, (generatorName, remainingCD) => this.setGeneratorRemainingCD(generatorName, remainingCD));
        EventBus.on(Events.generator.onUse, (generatorName) => this.setGeneratorUses(generatorName));

        

        EventBus.on(Events.generator.elements.statusItems.pointChance.onUpdate, 
            (generatorName, pointSetGenerated) => this.updateGeneratorPointChance(generatorName, pointSetGenerated));
        EventBus.on(Events.generator.elements.cdCharges.onCd, (elementName, baseCooldown) => this.setElementRemainingCd(elementName, baseCooldown));
        EventBus.on(Events.generator.elements.cdCharges.updateCd, (elementName, remainingCD) => this.setElementRemainingCd(elementName, remainingCD));
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
                    // this.#needToCheckCooldowns = true;
                }
                if (Array.isArray(generator.elements)) {
                    for (const element of generator.elements) {
                        if (element.built && !element.canBuild) element.built = false;
                        if (element.canBuild && !element.hinted) element.canBuild = false;
                        if (element.remainingCD) {
                            if (generator.remainingCD < 0) {
                                generator.remainingCD = 0;
                                return;
                            }
                            // this.#needToCheckCooldowns = true;
                        }
                    }
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
     * @return {DataGenerator[]}
     */
    #getAllGeneratorsData() {
        return DataManager.getAllGeneratorsData();
    }
    
    /**
     * @param { string } generatorName 
     * @return { DataGenerator | null }
     */
    #getGeneratorData(generatorName) {
        Asserts.string(generatorName);
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

    // Elements Unlock Data

    /**
     * @param {string} elementName
     * @returns {GeneratorElementsUnlockData | null}
     */
    #whatElementsUnlock(elementName) {
        Asserts.string(elementName);
        const generator = this.#getAllGeneratorsData()?.find(generator =>
            generator?.elementsUnlock?.some(element => element.name === elementName)
        );
        if (!generator) return null;
        return generator.elementsUnlock.find(element => element.name === elementName) || null;
    }

    /**
     * @param {string} elementName
     * @returns {UnlockRequires | null}
     */
    #whatElementUnlockRequires(elementName) {
        return this.#whatElementsUnlock(elementName)?.unlockRequires || null;
    }

    /**
     * @param {string} elementName
     * @returns {PointSet | null}
     */
    whatElementUnlockRequiresHint(elementName) {
        return this.#whatElementUnlockRequires(elementName)?.hint || null;
    }

    /**
     * @param {string} elementName
     * @returns {PointSet | null}
     */
    whatElementUnlockRequiresBuild(elementName) {
        return this.#whatElementUnlockRequires(elementName)?.build || null;
    }

    /**
     * @param {string} elementName
     * @returns {BuildRequires | null}
     */
    #whatElementBuildRequires(elementName) {
        return this.#whatElementsUnlock(elementName)?.buildRequires || null;
    }

    /**
     * @param {string} elementName
     * @returns {PointSet | null}
     */
    whatElementBuildRequiresStep(elementName) {
        return this.#whatElementBuildRequires(elementName)?.step || null;
    }

    /**
     * @param {string} elementName
     * @returns {Number | null}
     */
    whatElementBuildRequiresTotalSteps(elementName) {
        return this.#whatElementBuildRequires(elementName)?.totalSteps || null;
    }

    // Elements Use Data

    /** @returns {GeneratorElementsCDChargesData[]} */
    getCdChargesData() {
        return this.#generatorElementsData.cdCharges;
    }

    /** @returns {GeneratorElementsPulseCellsData[]} */
    getPulseCellsData() {
        return this.#generatorElementsData.pulseCells;
    }

    /**
     * @param {string} name
     *  @returns {GeneratorElementsCDChargesData} */
    getCdChargeData(name) {
        return this.getCdChargesData().find(charge => charge.name === name);
    }

    /** 
     * @param {string} name
     * @returns {GeneratorElementsPulseCellsData} */
    getPulseCellData(name) {
        return this.getPulseCellsData().find(cell => cell.name === name);
    }

    /**
     * @param {string} name 
     * @returns {Number}
     */
    whatChargeBaseCD(name) {
        return this.getCdChargeData(name).baseCd || null;
    }

    /**
     * @param {string} name 
     * @returns {{type: string, total: number}}
     */
    whatCellLoad(name) {
        return this.getPulseCellData(name).loadCell || null;
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

    // Get Generators in each stage
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

    // Generator Elements

    /**
     * @param {function(SaveGeneratorElement): boolean} callback 
     * @returns {SaveGeneratorElement[]}
     */
    #getProxySaveGeneratorElementsByCriteria(callback) {
        Asserts.function(callback);

        const generators = this.#getProxySaveGeneratorByCriteria(
            (generator) =>
                generator.hinted &&
                generator.canBuild &&
                generator.built &&
                Array.isArray(generator.elements) &&
                generator.elements.length
        ) || [];

        return generators.flatMap(gen => gen.elements.filter(callback));
    }

    /**
     * @param {function(SaveGeneratorElement): boolean} callback 
     * @returns {SaveGeneratorElement | null}
     */
    #findProxySaveGeneratorElementByCriteria(callback) {
        Asserts.function(callback);

        const generators = this.#getProxySaveGeneratorByCriteria(
            (generator) =>
                generator.hinted &&
                generator.canBuild &&
                generator.built &&
                Array.isArray(generator.elements) &&
                generator.elements.length
        ) || [];

        const generator = generators.find(gen => gen.elements.find(callback));
        if (!generator) return null;

        return generator.elements.find(callback) || null;
    }

    /** @returns {string[]} */
    getLockedGeneratorElementNames() {
        return this.#getProxySaveGeneratorElementsByCriteria(element => !element.hinted && !element.canBuild && !element.built)
            .map(element => element.name);
    }

    /** @returns {string[]} */
    getHintedGeneratorElementNames() {
        return this.#getProxySaveGeneratorElementsByCriteria(element => element.hinted && !element.canBuild && !element.built)
            .map(element => element.name);
    }

    /** @returns {string[]} */
    getCanBuildGeneratorElementNames() {
        return this.#getProxySaveGeneratorElementsByCriteria(element => element.hinted && element.canBuild && !element.built)
            .map(element => element.name);
    }

    /** @returns {string[]} */
    getBuiltGeneratorElementNames() {
        return this.#getProxySaveGeneratorElementsByCriteria(element => element.hinted && element.canBuild && element.built)
            .map(element => element.name);
    }

    /**
     * @param {string} generatorName
     * @returns {SaveGeneratorElement[]}
     */
    getGeneratorElements(generatorName) {
        const elements = this.#getProxySaveGeneratorByName(generatorName)?.elements;
        return Array.isArray(elements) ? elements : [];
    }

    /**
     * 
     * @param {string} elementName 
     * @returns {SaveGeneratorElement}
     */
    #getGeneratorElement(elementName) {
        Asserts.string(elementName);
        return this.#findProxySaveGeneratorElementByCriteria(
            (element) => element.name === elementName
        );
    }

    // Generator Status

    /**
     * @returns { string[] }
     */
    getGeneratorsOnCooldownNames() {
        return this.#getProxySaveGeneratorByCriteria(
            (generator) => generator.remainingCD)
            .map(gen => gen.name) || null;
    }

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

    /** @returns {SaveGeneratorElement[]} */
    getElementsRemainingCd() {
        return this.#getProxySaveGeneratorElementsByCriteria(
            /** @param {SaveGeneratorElement} */
            element => element.remainingCD
        )
    }

    // Unlock Flow

    /**
     * @param {string} generatorName
     * @param {string} prop
     * @returns {boolean}
     */
    #isProp(generatorName, prop) {
        if (!Validators.isString(generatorName)) return false;
        if (!Validators.isString(prop)) return false;
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

    /**
     * @param {string} generatorName 
     * @returns {boolean}
     */
    whatProgress(generatorName) {
        Asserts.string(generatorName);
        return this.#isProp(generatorName, 'progress');
    }

    /**
     * @param {string} elementName 
     * @param {string} prop 
     */
    #isElementProp(elementName, prop) {
        Asserts.string(elementName);
        Asserts.string(prop);
        return this.#getGeneratorElement(elementName)[prop] ?? false;
    }

    /**
     * @param {string} elementName 
     * @returns {boolean}
     */
    isElementHinted(elementName) {
        Asserts.string(elementName);
        return this.#isElementProp(elementName, 'hinted');
    }

    /**
     * @param {string} elementName 
     * @returns {boolean}
     */
    isElementCanBuild(elementName) {
        Asserts.string(elementName);
        return this.#isElementProp(elementName, 'canBuild');
    }

    /**
     * @param {string} elementName 
     * @returns {boolean}
     */
    isElementBuilt(elementName) {
        Asserts.string(elementName);
        return this.#isElementProp(elementName, 'built');
    }

    /**
     * @param {string} elementName 
     * @returns {boolean}
     */
    whatElementProgress(elementName) {
        Asserts.string(elementName);
        return this.#isElementProp(elementName, 'progress');
    }

    // #endregion Get Proxy Save

    // #region Manage Proxy Save

    /**
     * @param { string } generatorName
     * @param { string } prop
     * @param {any} value
     * @returns {any}
     */
    #setProp(generatorName, prop, value) {
        Asserts.string(generatorName);
        Asserts.string(prop);
        Asserts.notNullOrUndefined(value);
        this.#getProxySaveGeneratorByName(generatorName)[prop] = value;
        return this.#getProxySaveGeneratorByName(generatorName)[prop];
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
     * @returns {Number}
     */
    buildProgress(generatorName, progress) {
        if (!Validators.isString(generatorName) || !Validators.isNumber(progress)) return;
        if (progress === 0) return;

        this.#getProxySaveGeneratorByName(generatorName).progress += progress;
        return this.#getProxySaveGeneratorByName(generatorName).progress;
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
    setGeneratorRemainingCD(generatorName, remainingCD) {
        Asserts.string(generatorName);
        Asserts.number(remainingCD);

        if (!remainingCD || remainingCD < 0) remainingCD = 0;
        this.#setProp(generatorName, 'remainingCD', remainingCD);
        // this.#needToCheckCooldowns = remainingCD > 0 || this.#needToCheckCooldowns;
        if (!remainingCD) EventBus.emit(Events.generator.ready, generatorName);
    }
    
    get needToCheckCooldowns() {
        // return this.#needToCheckCooldowns;
    }

    /** @param {boolean} value */
    set needToCheckCooldowns(value) {
        Asserts.boolean(value);
        // this.#needToCheckCooldowns = value;
    }

    /** @param {string} generatorName */
    setGeneratorUses(generatorName) {
        Asserts.string(generatorName);
        const generatorTimesUsed = this.getGeneratorTimesUsed(generatorName);
        Asserts.number(generatorTimesUsed);
        const newTimesUsed = generatorTimesUsed + 1;
        this.#setProp(generatorName, 'timesUsed', newTimesUsed);
    }

    /** 
     * @param {string} generatorName 
     * @param {PointSet} pointSetGenerated
     * */
    updateGeneratorPointChance(generatorName, pointSetGenerated) {
        Asserts.string(generatorName);
        Asserts.object(pointSetGenerated);

        const currentGeneratesPoints = this.getGeneratorPoints(generatorName);
        Asserts.nonEmptyArray(currentGeneratesPoints);
        const dataGeneratorPoints = this.whatGeneratesPoints(generatorName);
        Asserts.nonEmptyArray(dataGeneratorPoints);

        // Mutated reference from strategy, event bus emiting updated value
        pointChanceStrategy.useStrategyFor(generatorName, currentGeneratesPoints, pointSetGenerated, dataGeneratorPoints);
        EventBus.emit(Events.generator.elements.statusItems.pointChance.updated, generatorName, currentGeneratesPoints);
    }

    /**
     * @param {string} elementName 
     * @param {string} prop 
     * @param {any} value
     * @returns {any}
     */
    setElement(elementName, prop, value) {
        Asserts.string(elementName);
        Asserts.string(prop);
        Asserts.notNullOrUndefined(value);

        this.#getGeneratorElement(elementName)[prop] = value;
        return this.#getGeneratorElement(elementName)[prop];
    }

    /** @param {string} elementName */
    setElementHinted(elementName) {
        Asserts.string(elementName);
        this.setElement(elementName, 'hinted', true);
    }

    /** @param {string} elementName */
    setElementCanBuild(elementName) {
        Asserts.string(elementName);
        this.setElement(elementName, 'canBuild', true);
    }

    /** @param {string} elementName */
    setElementBuilt(elementName) {
        Asserts.string(elementName);
        this.setElement(elementName, 'built', true);
    }

    /**
     * @param {string} elementName
     * @param {number} progress 
     */
    buildElementProgress(elementName, progress) {
        Asserts.string(elementName);
        Asserts.number(progress);
        if (progress === 0) return;

        this.#getGeneratorElement(elementName).progress += progress;
        return this.#getGeneratorElement(elementName).progress;
    }

    /**
     * @param {string} elementName 
     * @returns {boolean}
     */
    isBuildElementProgressComplete(elementName) {
        Asserts.string(elementName);
        return this.#getGeneratorElement(elementName).progress >= this.whatElementBuildRequiresTotalSteps(elementName);
    }

    setElementRemainingCd(elementName, remainingCD) {
        Asserts.string(elementName);
        Asserts.number(remainingCD);

        if (!remainingCD || remainingCD < 0) remainingCD = 0;
        this.setElement(elementName, 'remainingCD', remainingCD);
        // this.#needToCheckCooldowns = remainingCD > 0 || this.#needToCheckCooldowns;
        if (!remainingCD) EventBus.emit(Events.generator.elements.cdCharges.ready, elementName);
    }

    /** @returns {string[]} */
    get saveGeneratorElementNames() {
        return this.#saveGeneratorElementNames;
    }

    // #endregion Manage Proxy Save
}
export const generatorM = new GeneratorManager();