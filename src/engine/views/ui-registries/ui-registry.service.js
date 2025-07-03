import {DataManager} from "../../systems/managers-index.js";

class UIRegistryService {

    #dataGeneratorRegistry;

    constructor() {
        this.#setData();
    }

    #setData() {
        this.#dataGeneratorRegistry = DataManager.getDataGeneratorRegistry();
    }
    /**
     * @param {string} generatorName 
     * @param {HTMLElement[]} pointChanceElements 
     */
    registerGeneratorPointChanceElements(generatorName, pointChanceElements) {
        let newIndex = 0;
        const lastRegistryKey = GenUIReg.checkLastRegister(generatorName, this.#dataGeneratorRegistry.category.statusItems);
        if (lastRegistryKey) newIndex = Number(lastRegistryKey.split('#')[1]) + 1;

        pointChanceElements.forEach((pointChanceElement) => {
            GenUIReg.register(generatorName, this.#dataGeneratorRegistry.category.statusItems, 
                `${this.#dataGeneratorRegistry.itemPrefixes.pointChance}#${newIndex}`, pointChanceElement);
            newIndex++;
        });
    }

}
export const UIRegService = new UIRegistryService();