import BaseGeneratorElement from "../generator-element.template.js";

import { EventBus, Events } from "../../../event-bus.js";
import { pointM, generatorM, storageM, DataManager } from "../../../../systems/managers-index.js";
import {Asserts, Errors, Utils} from "../../../../utils/utils.index.js";

export default class PulseCell extends BaseGeneratorElement {

    /** @type {GeneratorElementsPulseCellsData} */
    #pulseCellData;

    /** @type {SaveGeneratorElement} */
    #pulseCellSave;

    constructor(elementName) {
        super(elementName);
        this.#pulseCellData = generatorM.getPulseCellData(elementName);
        this.#pulseCellSave = generatorM.getBuiltPulseCell(elementName);
    }

    run() {
        if (!this.#pulseCellData || !this.#pulseCellSave) {
            Errors.logError(`pulse cell data not found`);
            return;
        }

        const remainingLoad = this.getRemainingPointsToBeLoad();
        if (remainingLoad <= 0) return;

        this.loadCell(remainingLoad);
        this.render();
    }

    /** @returns {Number} */
    getRemainingPointsToBeLoad() {
        return this.#pulseCellData.loadCell.total - this.#pulseCellSave.cellLoad
    }

    /** @param {Number} amount */
    loadCell(amount) {
        Asserts.number(amount);

        const load = pointM.substractAllPointsByType(this.#pulseCellData.loadCell.type, amount);
        if (!load || load <= 0) return;

        generatorM.setElementLoad(this.elementName, load);
    }

    render() {
        const currentLoad = generatorM.whatElementCellLoad(this.elementName);
        Asserts.number(currentLoad);

        const totalLoad = this.#pulseCellData.loadCell.total;
        const percentLoad = Utils.getPercent(totalLoad, currentLoad);

        EventBus.emit(Events.generator.elements.pulseCells.load, this.elementName, percentLoad)
    }

}