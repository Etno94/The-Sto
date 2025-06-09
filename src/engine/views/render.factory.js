import DataManager from '../systems/managers/data.manager.js';

import Asserts from '../utils/asserts.js';

import PointDirector from './builders/directors/point.director.js';
import GeneratorDirector from './builders/directors/generator.director.js';
import AnimationElementsDirector from './builders/directors/animation-elements.director.js';

export default class Render {

    constructor() {
    }

    // #region Points

    /**
     * @param {string} pointType
     * @param {string[]} classes
     * @returns {HTMLDivElement}
     */
    static renderPoint(pointType, classes) {
        Asserts.string(pointType);
        Asserts.stringArray(classes);

        return ({
            [DataManager.getPointTypesData().point]: PointDirector.createBasicPoint,
            [DataManager.getPointTypesData().solid_point]: PointDirector.createSolidPoint,
            [DataManager.getPointTypesData().energy_point]: PointDirector.createEnergyPoint
        })[pointType](classes);
    }

    // #endregion Points

    // #region Generators

    /**
     * @param {string} generatorName
     * @param {string[]} classes
     * @returns {HTMLDivElement}
     */
    static renderGenerator(generatorName, classes) {
        Asserts.string(generatorName);
        Asserts.stringArray(classes);

        return GeneratorDirector.createGenerator(generatorName, classes);
    }

    /**
     * @returns {HTMLDivElement}
     */
    static renderCostPreview() {
        return GeneratorDirector.createCostPreview();
    }

    // #endregion Generators

    // #region Animation Elements

    /**
     * @param {string} animationName
     * @param {string[]} [classes=[]]
     * @returns {HTMLDivElement}
     */
    static renderAnimationElement(animationName, classes) {
        Asserts.string(animationName);
        if (classes) Asserts.stringArray(classes);

        return ({
            [DataManager.getAnimations().ripple.name]: AnimationElementsDirector.createRippleChild
        })[animationName](classes);
    }

    // #endregion Animation Elements

}