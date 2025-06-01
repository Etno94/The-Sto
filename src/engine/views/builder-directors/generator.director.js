import ElBuilder from "../element.builder.js";

export default class GeneratorDirector {

    /**
     * 
     * @param {string} generatorName 
     * @param {string[]} classes 
     * @returns 
     */
    static createGenerator(generatorName, classes = []) {
        return new ElBuilder('div')
            .addAttribute('id', generatorName)
            .addClass(["cell", "m-24"])
            .addClass(classes)
            .finish();
    }

    createCostPreview() {
        return new ElBuilder('div')
            .addClass("cost-preview")
            .finish();
    }

}