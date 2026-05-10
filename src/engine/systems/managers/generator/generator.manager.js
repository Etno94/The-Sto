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

    /** @type {DataGeneratorId} */
    #generatorIds;
    /** @type {GeneratorElementNamesData} */
    #generatorElementNames;
    /** @type {GeneratorElementsData} */
    #generatorElementsData;
    /** @type {Generator_PulseCells_Status_Strings} */
    #pulseCellStatusStrings;

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
        this.#pulseCellStatusStrings = DataManager.getPulseCellStatusStringsData();
    }

    #setBusEvents() {
        // Generators
        EventBus.on(Events.generator.onCD, (generatorName, baseCooldown) => this.setGeneratorRemainingCD(generatorName, baseCooldown));
        EventBus.on(Events.generator.updateCD, (generatorName, remainingCD) => this.setGeneratorRemainingCD(generatorName, remainingCD));
        EventBus.on(Events.generator.onUse, (generatorName) => this.setGeneratorUses(generatorName));
        EventBus.on(Events.generator.onDischarge, (generatorName) => this.setGeneratorOnDischarge(generatorName));
        EventBus.on(Events.generator.discharged, (generatorName) => this.setGeneratorOnDischarge(generatorName, false));

        // Generators Elements

        // Point Chances
        EventBus.on(Events.generator.elements.statusItems.pointChance.onUpdate, 
            (generatorName, pointSetGenerated) => this.updateGeneratorPointChance(generatorName, pointSetGenerated));

        // CD Charges
        EventBus.on(Events.generator.elements.cdCharges.onCd, (elementName, baseCooldown) => this.setElementRemainingCd(elementName, baseCooldown));
        EventBus.on(Events.generator.elements.cdCharges.updateCd, (elementName, remainingCD) => this.setElementRemainingCd(elementName, remainingCD));

        // Pulse Cells
        EventBus.on(Events.generator.elements.pulseCells.pulse, (elementName) => this.pulseCellsOnPulse(elementName));
        

        EventBus.on(Events.generator.elements.onUse, (elementName) => this.setElementUses(elementName));
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
     * @param {string} elementName 
     * @returns {{type: string, total: number}}
     */
    whatCellLoad(elementName) {
        Asserts.string(elementName);
        return this.getPulseCellData(elementName).loadCell || null;
    }

    /**
     * @param {string} elementName 
     * @returns {Number}
     */
    whatCellDischargeInterval(elementName) {
        Asserts.string(elementName);
        return this.getPulseCellData(elementName).dischargeInterval || null;
    }

    /**
     * @param {string} elementName 
     * @returns {Number}
     */
    whatCellPulseInterval(elementName) {
        Asserts.string(elementName);
        return this.getPulseCellData(elementName).pulseInterval || null;
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

        const element = generators.flatMap(gen => gen.elements).find(callback);

        return element || null;
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

    /** @returns {SaveGeneratorElement[]} */
    getElementsRemainingLoad() {
        return this.#getProxySaveGeneratorElementsByCriteria(
            /** @param {SaveGeneratorElement} */
            element => element.remainingLoad
        )
    }

    /** @returns {SaveGeneratorElement[]} */
    getCDCharges() {
        const {cdCharge1, cdCharge2, cdCharge3} = this.#generatorElementNames;
        const cdChargesIds = [cdCharge1, cdCharge2, cdCharge3];

        return this.#getProxySaveGeneratorElementsByCriteria(
            /** @param {SaveGeneratorElement} */
            element => cdChargesIds.some(name => name === element.name) 
        )
    }

    /** @returns {SaveGeneratorElement[]} */
    getPulseCells() {
        const {pulseCell1, pulseCell2, pulseCell3} = this.#generatorElementNames;
        const pulseCellIds = [pulseCell1, pulseCell2, pulseCell3];

        return this.#getProxySaveGeneratorElementsByCriteria(
            /** @param {SaveGeneratorElement} */
            element => pulseCellIds.some(name => name === element.name) 
        )
    }

    /** @returns {SaveGeneratorElement[]} */
    getBuiltCDCharges() {
        return this.getCDCharges().filter(charge => charge.hinted && charge.canBuild && charge.built);
    }

    /** @returns {SaveGeneratorElement[]} */
    getBuiltPulseCells() {
        return this.getPulseCells().filter(charge => charge.hinted && charge.canBuild && charge.built);
    }

    /**
     * @param {string} cellName 
     * @returns {SaveGeneratorElement}
     */
    getBuiltPulseCell(cellName) {
        Asserts.string(cellName);
        return this.getBuiltPulseCells().find(cell => cell.name === cellName) || null;
    }

    /** 
     * @param {CellStatus} status 
     * @returns {SaveGeneratorElement[]} */
    getPulseCellsByStatus(status) {
        Asserts.string(status);
        return this.getPulseCells().filter(charge => charge.hinted && charge.canBuild && charge.built && charge.cellStatus === status);
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
     * @param {string} generatorName 
     * @returns {boolean}
     */
    isDischarging(generatorName) {
        Asserts.string(generatorName);
        return this.#isProp(generatorName, 'isDischarging');
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
     * @returns {Number}
     */
    whatElementProgress(elementName) {
        Asserts.string(elementName);
        return this.#isElementProp(elementName, 'progress');
    }

    /**
     * @param {string} elementName 
     * @returns {Number}
     */
    whatElementUses(elementName) {
        Asserts.string(elementName);
        return this.#isElementProp(elementName, 'timesUsed');
    }

    /**
     * @param {string} elementName 
     * @returns {Number}
     */
    whatElementCellLoad(elementName) {
        Asserts.string(elementName);
        return this.#isElementProp(elementName, 'cellLoad');
    }

    /**
     * @param {string} elementName 
     * @returns {Number}
     */
    whatElementCellRemainingLoad(elementName) {
        Asserts.string(elementName);
        return this.#isElementProp(elementName, 'remainingLoad');
    }

    /**
     * @param {string} elementName 
     * @returns {Number}
     */
    whatElementCellNextPulse(elementName) {
        Asserts.string(elementName);
        return this.#isElementProp(elementName, 'untilNextPulse');
    }

    /**
     * @param {string} elementName 
     * @returns {Boolean}
     */
    isElementLoaded(elementName) {
        Asserts.string(elementName);
        const cellLoad = this.#isElementProp(elementName, 'cellLoad');
        const loadTotal = this.getPulseCellData(elementName)?.loadCell?.total;
        return cellLoad >= loadTotal;
    }

    /**
     * @param {String} elementName 
     * @returns {String | null}
     */
    doesNeedLoadCostPreview(elementName) {
        const {pulseCell1, pulseCell2, pulseCell3} = this.#generatorElementNames;
        const pulseCellIds = [pulseCell1, pulseCell2, pulseCell3];
        const needsCostPreview = pulseCellIds.some(id => id === elementName);
        return needsCostPreview ? this.getPulseCellData(elementName)?.loadCell?.type : null;
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
        if (!remainingCD) EventBus.emit(Events.generator.ready, generatorName);
    }

    /** @param {string} generatorName */
    setGeneratorOnDischarge(generatorName, isDischarging = true) {
        Asserts.string(generatorName);
        
        this.#setProp(generatorName, 'isDischarging', isDischarging);
        this.setGeneratorLoadedCellsOnDischarge(isDischarging);
    }

    /** @param {boolean} isDischarging */
    setGeneratorLoadedCellsOnDischarge(isDischarging) {

        if (isDischarging) {
            this.getPulseCellsByStatus(this.#pulseCellStatusStrings.LOADED).forEach(
                /**@type {SaveGeneratorElement} */
                pulseCell => {
                    this.setCellElementStatus(pulseCell.name, this.#pulseCellStatusStrings.DISCHARGING);
                    this.setElement(pulseCell.name, 'cellLoad', 0);
                    const newRemainingLoad = this.whatCellDischargeInterval(pulseCell.name);
                    this.setElement(pulseCell.name, 'remainingLoad', newRemainingLoad);
                    const newPulseInterval = this.whatCellPulseInterval(pulseCell.name);
                    this.setElement(pulseCell.name, 'untilNextPulse', newPulseInterval);
                }
            );
        } else {
            this.getPulseCellsByStatus(this.#pulseCellStatusStrings.DISCHARGED).forEach(
                /**@type {SaveGeneratorElement} */
                pulseCell => {
                    this.setCellElementStatus(pulseCell.name, this.#pulseCellStatusStrings.LOADING);
                }
            );
        }
        
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

    /** @param {string} elementName */
    setElementUses(elementName) {
        Asserts.string(elementName);
        const elementUses = this.whatElementUses(elementName);
        Asserts.number(elementUses);
        const newUses = elementUses + 1;
        this.setElement(elementName, 'timesUsed', newUses);
    }

    /**
     * @param {String} elementName 
     * @param {Number} remainingCD 
     */
    setElementRemainingCd(elementName, remainingCD) {
        Asserts.string(elementName);
        Asserts.number(remainingCD);

        if (!remainingCD || remainingCD < 0) remainingCD = 0;
        this.setElement(elementName, 'remainingCD', remainingCD);
        if (!remainingCD) EventBus.emit(Events.generator.elements.cdCharges.ready, elementName);
    }

    /**
     * @param {String} elementName 
     * @param {Number} load 
     */
    addElementCellLoad(elementName, load) {
        Asserts.string(elementName);
        Asserts.number(load);

        const elementLoad = this.whatElementCellLoad(elementName);
        Asserts.number(elementLoad);
        const newCurrentLoad = elementLoad + load;

        const cellTotalLoad = this.whatCellLoad(elementName).total;
        Asserts.number(cellTotalLoad);

        this.setElement(elementName, 'cellLoad', Math.min(newCurrentLoad, cellTotalLoad));

        if (this.isElementLoaded(elementName)) this.setCellElementStatus(elementName, this.#pulseCellStatusStrings.LOADED);
    }

    /**
     * @param {String} elementName 
     * @param {Number} load 
     */
    subtractElementCellLoad(elementName, load) {
        Asserts.string(elementName);
        Asserts.number(load);

        const minInterval = 0;

        // Remaining Load
        const elementRemainingLoad = this.whatElementCellRemainingLoad(elementName);
        Asserts.number(elementRemainingLoad);
        const newRemainingLoad = Math.max(elementRemainingLoad - load, minInterval);

        this.setElement(elementName, 'remainingLoad', newRemainingLoad);
        console.log('new current load:' + newRemainingLoad);

        // Next Pulse
        const elementNextPulse = this.whatElementCellNextPulse(elementName);
        Asserts.number(elementNextPulse);
        const newNextPulse = Math.max(elementNextPulse - load, minInterval);

        this.setElement(elementName, 'untilNextPulse', newNextPulse);
        console.log('new next pulse:' + newNextPulse);

        const totalLoad = this.whatCellDischargeInterval(elementName);
        const percentLoad = Utils.getPercent(totalLoad, newRemainingLoad);
        EventBus.emit(Events.generator.elements.pulseCells.load, elementName, percentLoad);

        if (newRemainingLoad == 0) this.setCellElementStatus(elementName, this.#pulseCellStatusStrings.DISCHARGED);
        if (newNextPulse == 0) EventBus.emit(BusEvents.generator.elements.pulseCells.pulse, elementName);
    }

    /** 
     * @param {String} elementName */
    pulseCellsOnPulse(elementName) {
        Asserts.string(elementName);

    }

    /**
     * @param {CellStatus} status 
     * @param {String} elementName */
    setCellElementStatus(elementName, status) {
        Asserts.string(elementName);
        Asserts.string(status);
        this.setElement(elementName, 'cellStatus', status);
    }

    /** @returns {string[]} */
    get saveGeneratorElementNames() {
        return this.#saveGeneratorElementNames;
    }

    // #endregion Manage Proxy Save
}
export const generatorM = new GeneratorManager();