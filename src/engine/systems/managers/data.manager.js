import { BUS_EVENTS } from '../../data/bus-events.data.js';
import { POINT_PROPS, POINT_TYPES, POINT_CLASSES } from '../../data/points.data.js';
import { GENERATORS, BUILD_GENERATOR } from '../../data/generators.data.js';
import { STORAGE_UPGRADES } from '../../data/storage.data.js';
import { ANIMATIONS } from "../../data/animations.data.js";
import { DATA_SET_ATTRs, DATA_SET_TYPES } from '../../data/data-set-attr.data.js';


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

    static getMaxStorageData() {
        return Utils.deepCopy(STORAGE_UPGRADES);
    }

    static getBaseMaxStorage() {
        return Utils.deepCopy(STORAGE_UPGRADES.baseMaxStorage);
    }

    static getMaxStorageUpgrade() {
        return Utils.deepCopy(STORAGE_UPGRADES.maxStorageUpgrade);
    }

    static getCurrentMaxStorageCalc(currentMaxStorageLevel) {
        return STORAGE_UPGRADES.getCurrentMaxStorage(currentMaxStorageLevel);
    }

    // #endregion Storage

    // #region Views

    /**
     * @returns { Animations }
     */
    static getAnimations() {
        return Utils.deepCopy(ANIMATIONS);
    }

    // #endregion Views

    // #region DataSets

    /**
     * @returns { DataSetTypes }
     */
    static getDataSetTypes() {
        return Utils.deepCopy(DATA_SET_TYPES);
    }

    /**
     * @returns { DataSetAttr }
     */
    static getDataSetAttrs() {
        return Utils.deepCopy(DATA_SET_ATTRs);
    }

    // #endregion DataSets

}