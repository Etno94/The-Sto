import { BUS_EVENTS } from '../../data/bus-events.data.js';
import { POINT_PROPS, POINT_TYPES, POINT_CLASSES } from '../../data/points.data.js';
import { GENERATOR_IDS, GENERATORS, GENERATOR_CLASSES, BUILD_GENERATOR, GENERATOR_ELEMENT_NAMES, GENERATOR_ELEMENTS_DATA } from '../../data/generators.data.js';
import { STORAGE_UPGRADES } from '../../data/storage.data.js';
import { CSS_VARS } from "../../data/css-vars.data.js";
import { ANIMATIONS } from "../../data/animations.data.js";
import { DATA_SET_ATTRs, DATA_SET_TYPES, DATA_SET_STATUS, DATA_SET_GENERATOR_STATUS } from '../../data/data-set-attr.data.js';
import { LIFE_CYCLE_CLASSES, STATUS_CLASSES, WRAPPER_CLASSES, GENERATOR_STATUS_WRAP_CLASSES, POINT_CHANCE_WRAP_CLASSES, COST_PREVIEW_CLASSES, 
        GENERATOR_CD_CHARGES_WRAP_CLASSES, GENERATOR_PULSE_CELLS_WRAP_CLASSES, ELEMENT_PULSE_CELL_STATUSES } from '../../data/elements.data.js';
import {DATA_GENERATOR_REGISTRY} from "../../data/registries/generator-registry.data.js";

import Utils from '../../utils/utils.js';

export default class DataManager {

    // #region Event Bus

    /**
     * @returns { BusEvents }
     */
    static getBusEventsData() {
        return Utils.deepCopy(BUS_EVENTS) || null;
    }

    // #endregion Event Bus

    // #region Points

    /**
     * @returns { string[] }
     */
    static getPointPropsData() {
        return Utils.arrCopy(POINT_PROPS) || [];
    }

    /**
     * @returns { PointTypes }
     */
    static getPointTypesData() {
        return Utils.deepCopy(POINT_TYPES) || null;
    }

    /**
     * @returns { PointClasses }
     */
    static getPointClassesData() {
        return Utils.deepCopy(POINT_CLASSES) || null;
    }

    // #endregion Points

    // #region Generators

    /**
     * @return { DataGeneratorId | null }
     */
    static getGeneratorIds() {
        return Utils.deepCopy(GENERATOR_IDS) || null;
    }

    /**
     * @param { string } generatorName 
     * @return { DataGenerator | null }
     */
    static getGeneratorData(generatorName) {
        return Utils.deepCopy(GENERATORS.find(generator => generator.name === generatorName)) || null;
    }

    /**
     * @return { DataGenerator[] | [] }
     */
    static getAllGeneratorsData() {
        return Utils.arrCopy(GENERATORS) || [];
    }

    /**
     * @return { DataGeneratorClasses | null }
     */
    static getGeneratorClasses() {
        return Utils.deepCopy(GENERATOR_CLASSES) || null;
    }

    /**
     * @returns { BuildGeneratorData | null }
     */
    static getBuildGeneratorData() {
        return Utils.deepCopy(BUILD_GENERATOR) || null;
    }

    /**
     * @returns { number | null }
     */
    static getDefaultStepProgress() {
        return DataManager.getBuildGeneratorData()?.defaultStepProgress || null;
    }

    // #endregion Generators
    
    // #region Storage

    /** @returns {DataStorage} */
    static getMaxStorageData() {
        return Utils.deepCopy(STORAGE_UPGRADES);
    }

    /** @returns {number} */
    static getBaseMaxStorage() {
        return Utils.deepCopy(STORAGE_UPGRADES.baseMaxStorage);
    }

    /** @returns {number} */
    static getBaseMaxStorageUpgradeLevel() {
        return Utils.deepCopy(STORAGE_UPGRADES.baseMaxStorageUpgradeLevel);
    }

    /**
     * @param {number} currentMaxStorageLevel 
     * @returns {MaxStorageUpgradeInterval}
     */
    static getCurrentIntervalUpgradeCost(currentMaxStorageLevel) {
        return Utils.deepCopy(STORAGE_UPGRADES.getCurrentIntervalUpgradeCost(currentMaxStorageLevel));
    }

    /**
     * @param {number} currentMaxStorageLevel 
     * @returns {number}
     */
    static getCurrentMaxStorageCalc(currentMaxStorageLevel) {
        return STORAGE_UPGRADES.getCurrentMaxStorage(currentMaxStorageLevel);
    }

    // #endregion Storage

    // #region Views

    /**
     * @returns { CssVarsData }
     */
    static getCssVars() {
        return Utils.deepCopy(CSS_VARS);
    }

    /**
     * @returns { Animations }
     */
    static getAnimations() {
        return Utils.deepCopy(ANIMATIONS);
    }

    // #endregion Views

    // #region DataSets

    /** @returns { DataSetTypes } */
    static getDataSetTypes() {
        return Utils.deepCopy(DATA_SET_TYPES);
    }

    /** @returns { DataSetAttr } */
    static getDataSetAttrs() {
        return Utils.deepCopy(DATA_SET_ATTRs);
    }

    /** @returns { DataSetStatus } */
    static getDataSetStatus() {
        return Utils.deepCopy(DATA_SET_STATUS);
    }

    /** @returns { DataSetGeneratorStatus } */
    static getDataSetGeneratorStatus() {
        return Utils.deepCopy(DATA_SET_GENERATOR_STATUS);
    }

    // #endregion DataSets

    // #region Elements

    /** @returns { LifeCycle_Props } */
    static getLifeCycleClasses() {
        return Utils.deepCopy(LIFE_CYCLE_CLASSES);
    }

    /** @returns { Status_Classes } */
    static getStatusClasses() {
        return Utils.deepCopy(STATUS_CLASSES);
    }

    /** @returns { string[] } */
    static getWrapClasses() {
        return Utils.arrCopy(WRAPPER_CLASSES);
    }

    /** @returns { GeneratorStatus_Wrap } */
    static getGeneratorStatusWrapClasses() {
        return Utils.deepCopy(GENERATOR_STATUS_WRAP_CLASSES);
    }

    /** @returns { PointChance_Wrap } */
    static getPointChanceWrapClasses() {
        return Utils.deepCopy(POINT_CHANCE_WRAP_CLASSES);
    }

    /** @returns { string[] } */
    static getCostPreviewClasses() {
        return Utils.arrCopy(COST_PREVIEW_CLASSES);
    }

    /** @returns { Generator_CdCharges_Wrap } */
    static getCdChargesWrapClasses() {
        return Utils.deepCopy(GENERATOR_CD_CHARGES_WRAP_CLASSES);
    }

    /** @returns { Generator_PulseCells_Wrap } */
    static getPulseCellsWrapClasses() {
        return Utils.deepCopy(GENERATOR_PULSE_CELLS_WRAP_CLASSES);
    }

    /** @returns { GeneratorElementNamesData } */
    static getGeneratorElementNames() {
        return Utils.deepCopy(GENERATOR_ELEMENT_NAMES);
    }

    /** @returns { GeneratorElementsData } */
    static getGeneratorElementsData() {
        return Utils.deepCopy(GENERATOR_ELEMENTS_DATA);
    }

    /** @returns { GeneratorElementsCDChargesData[] } */
    static getCDCargesData() {
        return Utils.arrCopy(GENERATOR_ELEMENTS_DATA.cdCharges);
    }

    /** @returns { GeneratorElementsPulseCellsData[] } */
    static getPulseCellsData() {
        return Utils.arrCopy(GENERATOR_ELEMENTS_DATA.pulseCells);
    }

    /** @returns { Generator_PulseCells_Status_Strings } */
    static getPulseCellStatusStringsData() {
        let copy = Utils.deepCopy(ELEMENT_PULSE_CELL_STATUSES);
        return copy;
    }

    // #endregion Elements

    // #region UI Registries

    /** @returns { DataGeneratorRegistry } */
    static getDataGeneratorRegistry() {
        return Utils.deepCopy(DATA_GENERATOR_REGISTRY);
    }
    
    // #endregion UI Registries

}