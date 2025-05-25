import PointCollection from "./point.collection.js";
import { GENERATORS } from "../data/generators.data.js";

export default class Generator {

    saveGenerators = [];

    lockedGenerators = [];
    hintedGenerators = [];
    canBuildGenerators = [];
    builtGenerators = [];

    constructor (generators) {
        if (generators) this.newGenerator(generators);
    }

    newGenerator(generators) {
        this.saveGenerators = this.sanitizeGenerators(generators);
        this.setGenerators();
    }

    sanitizeGenerators(generators) {
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

    setGenerators() {
        this.saveGenerators.forEach(generator => {
            if (!generator.hinted && !generator.canBuild && !generator.built) {
                this.lockedGenerators.push(generator.name);
                return;
            }
            if (generator.hinted && !generator.canBuild && !generator.built) {
                this.hintedGenerators.push(generator.name);
                return;
            }
            if (!generator.hinted && generator.canBuild && !generator.built) {
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
     * @param { PointCollection.collection } points 
     */
    canBeHinted(points) {
        // let hinted = true;
        // for (const [key, value] of Object.entries(points)) {
        //     if (this.generator.unlockRequires.hint[key] > value)
        //         hinted = false;
        // }
        // return hinted;

        // for (const [key, value] of Object.entries(this.generator.unlockRequires.hint)) {
        //     if (points[key] && points[key] < value) {

        //     }

        // }
        // return this.isHinted;
    }

    canBuild(points) {
        // let canBuild = true;
        // for (const [key, value] of Object.entries(points)) {
        //     if (this.generator.unlockRequires.build[key] > value)
        //         canBuild = false;
        // }
        // return canBuild;
    }

    build () {
        
    }

    findGenerator(generatorName) {
        return GENERATORS.find(generator => generator.name === generatorName) || null;
    }

    whatConsumes(generatorName) {
        return this.findGenerator(generatorName)?.consumes || null;
    }

    whatGenerates(generatorName) {
        return this.findGenerator(generatorName)?.generates || null;
    }

    get lockedGenerators() {
        return this.lockedGenerators;
    }

    get hintedGenerators() {
        return this.hintedGenerators;
    }

    get canBuildGenerators() {
        return this.canBuildGenerators;
    }

    get builtGenerators() {
        return this.builtGenerators;
    }
}