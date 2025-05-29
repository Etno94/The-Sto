import PointCollection from "./point.collection.js";
import { GENERATORS } from "../data/generators.data.js";

export default class Generator {

    #hashGenerators = {};

    lockedGenerators = [];
    hintedGenerators = [];
    canBuildGenerators = [];
    builtGenerators = [];

    /**
     * @param {Object[]} generators 
     */
    constructor (generators) {
        if (generators) this.newGenerator(generators);
    }

    /**
     * @param {Object[]} generators 
     */
    newGenerator(generators) {
        this.#hashGenerators = this.sanitizeGenerators(generators);
        this.setGenerators();
    }

    /**
     * @param {Object[]} generators
     * @returns {Object}
     */
    sanitizeGenerators(generators) {
        let sanitizedGenerators = [];
        // Passed generators must exist in the code base
        sanitizedGenerators = generators.filter(generator => generator.name && GENERATORS.find(gen => gen.name === generator.name));
        // We set the correct life cycle state for generators flags
        sanitizedGenerators.forEach(generator => {
            if (generator.built && !generator.canBuild) generator.built = false;
            if (generator.canBuild && !generator.hinted) generator.canBuild = false;
        });
        return sanitizedGenerators.reduce((acc, generator) => {
            acc[generator.name] = generator;
            return acc;
        }, {});
    }

    setGenerators() {
        Object.values(this.#hashGenerators).forEach(generator => {
            if (!generator.hinted && !generator.canBuild && !generator.built) {
                this.lockedGenerators.push(generator.name);
                return;
            }
            if (generator.hinted && !generator.canBuild && !generator.built) {
                this.hintedGenerators.push(generator.name);
                return;
            }
            if (generator.hinted && generator.canBuild && !generator.built) {
                this.canBuildGenerators.push(generator.name);
                return;
            }
            if (generator.hinted && generator.canBuild && generator.built) {
                this.builtGenerators.push(generator.name);
                return;
            }
        });
    }

    /**
     * @param { string } generatorName 
     */
    canBeHinted(generatorName) {
        let generatorIndexToRemove = this.lockedGenerators.indexOf(generatorName);
        let [generatorToBeHinted] = this.lockedGenerators.splice(generatorIndexToRemove, 1);
        this.hintedGenerators.push(generatorToBeHinted);
    }

    /**
     * @param { string } generatorName 
     */
    canBeBuilt(generatorName) {
        let generatorIndexToRemove = this.hintedGenerators.indexOf(generatorName);
        let [generatorToBeBuildable] = this.hintedGenerators.splice(generatorIndexToRemove, 1);
        this.canBuildGenerators.push(generatorToBeBuildable);
    }

    /**
     * @param { string } generatorName 
     */
    isBuilt (generatorName) {
        let generatorIndexToRemove = this.canBuildGenerators.indexOf(generatorName);
        let [generatorBuilt] = this.canBuildGenerators.splice(generatorIndexToRemove, 1);
        this.builtGenerators.push(generatorBuilt);
    }

    /**
     * @param { string } generatorName 
     * @return {Object|null}
     */
    getGeneratorData(generatorName) {
        return GENERATORS.find(generator => generator.name === generatorName) || null;
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

    /**
     * @returns {string[]}
     */
    get lockedGens() {
        return this.lockedGenerators;
    }

    /**
     * @returns {string[]}
     */
    get hintedGens() {
        return this.hintedGenerators;
    }

    /**
     * @returns {string[]}
     */
    get canBuildGens() {
        return this.canBuildGenerators;
    }

    /**
     * @returns {string[]}
     */
    get builtGens() {
        return this.builtGenerators;
    }
}