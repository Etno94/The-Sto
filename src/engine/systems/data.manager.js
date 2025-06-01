import { GENERATORS } from '../data/generators.data.js';

export default class DataManager {

    /**
     * @param { string } generatorName 
     * @return {Object|null}
     */
    static getGeneratorData(generatorName) {
        return GENERATORS.find(generator => generator.name === generatorName) || null;
    }

}