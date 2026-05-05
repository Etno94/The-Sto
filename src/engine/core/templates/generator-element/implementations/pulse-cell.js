import BaseGeneratorElement from "../generator-element.template.js";

import { EventBus, Events } from "../../../event-bus.js";
import { pointM, generatorM, storageM, DataManager } from "../../../../systems/managers-index.js";
import {Asserts, Errors, Utils} from "../../../../utils/utils.index.js";

export default class PulseCell extends BaseGeneratorElement {

    /** @type {GeneratorElementsPulseCellsData} */
    #pulseCellData;

    /** @type {SaveGeneratorElement} */
    #pulseCellSave;

    /** @type {number} */
    #remainingLoad = 0;

    constructor(elementName) {
        super(elementName);
        this.#pulseCellData = generatorM.getPulseCellData(elementName);
        this.#pulseCellSave = generatorM.getBuiltPulseCell(elementName);
        this.#remainingLoad = Math.max(0, this.#pulseCellData.loadCell.total - this.#pulseCellSave.cellLoad);
    }

    run() {
        if (!this.#pulseCellData || !this.#pulseCellSave) {
            Errors.logError(`pulse cell data not found`);
            return;
        }

        if (this.isPulseCellLoaded()) return;

        this.loadCell();
        this.render();
    }

    

    /** @returns {boolean} */
    isPulseCellLoaded() {
        return this.#pulseCellSave.cellStatus === 'loaded' && this.#remainingLoad <= 0;
    }

    loadCell() {
        const loadToAdd = pointM.substractAllPointsByType(this.#pulseCellData.loadCell.type, this.#remainingLoad);
        Asserts.number(loadToAdd);
        if (!loadToAdd || loadToAdd <= 0) return;

        generatorM.addElementCellLoad(this.elementName, loadToAdd);
    }

    render() {
        const currentLoad = generatorM.whatElementCellLoad(this.elementName);
        Asserts.number(currentLoad);

        const totalLoad = this.#pulseCellData.loadCell.total;
        const percentLoad = Utils.getPercent(totalLoad, currentLoad);

        EventBus.emit(Events.generator.elements.pulseCells.load, this.elementName, percentLoad)
    }

}