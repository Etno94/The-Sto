import DataManager from '../systems/managers/data.manager.js';

import Asserts from '../utils/asserts.js';

import PointDirector from './builders/directors/point.director.js';
import GeneratorDirector from './builders/directors/generator.director.js';
import WrapperDirector from './builders/directors/wrapper.director.js';
import AnimationElementsDirector from './builders/directors/animation-elements.director.js';

export default class Render {

    constructor() {
    }

    // #region Points

    /**
     * @param {string} pointType
     * @param {string[]} [classes]
     * @returns {HTMLDivElement}
     */
    static renderPoint(pointType, classes = []) {
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
     * @param {HTMLDivElement} generatorElement
     * @param {string[]} [classes]
     * @returns {HTMLDivElement}
     */
    static renderWrappedGenerator(generatorElement, classes = []) {
        Asserts.htmlElement(generatorElement);
        Asserts.stringArray(classes);

        const childrenToWrap = [
            generatorElement,
            GeneratorDirector.createGeneratorStatusWrap()
        ];

        const generatorElements = ({
                [DataManager.getGeneratorIds().CLICK]: () => null,
                [DataManager.getGeneratorIds().COOLDOWN]: GeneratorDirector.createCdChargesWrapper,
                [DataManager.getGeneratorIds().PULSE]: GeneratorDirector.createPulseCellsWrapper
            })[generatorElement.id]();

        if (generatorElements) childrenToWrap.push(generatorElements);
        const wrappedGenerator = WrapperDirector.wrapChildren(childrenToWrap, classes);
        return wrappedGenerator;
    }

    // #endregion Generators

    // #region UI Elements

    /**
     * @param {HTMLElement[]} [generatorStatusElements] 
     * @returns {HTMLElement[]}
     */
    static renderGeneratorStatusWrap(generatorStatusElements = []) {
        Asserts.htmlArray(generatorStatusElements);
        return GeneratorDirector.createGeneratorStatusWrap(generatorStatusElements);
    }

    /**
     * @param {{element: HTMLElement, chance: number}[]} pointElementsWithChances
     * @returns {HTMLElement[]}
     */
    static renderPointChanceWrapper(pointElementsWithChances) {
        Asserts.array(pointElementsWithChances);
        return GeneratorDirector.createPointChanceWrap(pointElementsWithChances);
    }

    /**
     * @returns {HTMLDivElement}
     */
    static renderCostPreview() {
        return GeneratorDirector.createCostPreview();
    }

    // #endregion UI Elements

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