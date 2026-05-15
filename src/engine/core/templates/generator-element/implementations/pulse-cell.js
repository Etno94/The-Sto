import BaseGeneratorElement from "../generator-element.template.js";

import { EventBus, Events } from "../../../event-bus.js";
import { pointM, generatorM, DataManager } from "../../../../systems/managers-index.js";
import {Asserts, Errors, Utils} from "../../../../utils/utils.index.js";

export default class PulseCell extends BaseGeneratorElement {

    /** @type {GeneratorElementsPulseCellsData} */
    #pulseCellData;

    /** @type {SaveGeneratorElement} */
    #pulseCellSave;
    /** @type {SaveGeneratorPoints[]} */
    pointsToGenerate;

    /** @type {Generator_PulseCells_Status_Strings} */
    #pulseCellStatusStrings;

    constructor(elementName) {
        super(elementName);
        this.#pulseCellStatusStrings = DataManager.getPulseCellStatusStringsData();
        this.#pulseCellData = generatorM.getPulseCellData(elementName);
        this.#pulseCellSave = generatorM.getBuiltPulseCell(elementName);
    }

    run() {
        if (!this.#pulseCellData || !this.#pulseCellSave) {
            Errors.logError(`pulse cell data not found`);
            return;
        }
        if (this.isPulseCellLoaded()) return;
        if (this.isLoading()) this.loadCell();
        this.render();
    }

    /** @returns {boolean} */
    isPulseCellLoaded() {
        const cellStatus = this.#pulseCellSave.cellStatus;
        const currentLoad = generatorM.whatElementCellLoad(this.elementName);
        return cellStatus === this.#pulseCellStatusStrings.LOADED && currentLoad >= this.#pulseCellData.loadCell.total;
    }

    /** @returns {boolean} */
    isLoading() {
        const status = this.#pulseCellSave.cellStatus;
        return status === this.#pulseCellStatusStrings.LOADING;
    }

    /** @returns {boolean} */
    isDischargingOrDischarged() {
        const status = this.#pulseCellSave.cellStatus;
        return status === this.#pulseCellStatusStrings.DISCHARGING || status === this.#pulseCellStatusStrings.DISCHARGED;
    }

    loadCell() {
        const currentLoad = generatorM.whatElementCellLoad(this.elementName);
        const remainingLoad = Math.max(0, this.#pulseCellData.loadCell.total - currentLoad);
        const loadToAdd = pointM.substractAllPointsByType(this.#pulseCellData.loadCell.type, remainingLoad);
        Asserts.number(loadToAdd);
        if (!loadToAdd || loadToAdd <= 0) return;

        generatorM.addElementCellLoad(this.elementName, loadToAdd);
    }

    render() {
        const percentLoad = this.getPulseCellRenderPercent();
        EventBus.emit(Events.generator.elements.pulseCells.load, this.elementName, percentLoad);
    }

    /** @returns {number} */
    getPulseCellRenderPercent() {
        const status = this.#pulseCellSave.cellStatus;
        if (status === this.#pulseCellStatusStrings.DISCHARGING) {
            const remainingLoad = generatorM.whatElementCellRemainingLoad(this.elementName);
            Asserts.number(remainingLoad);
            const totalDischarge = generatorM.whatCellDischargeInterval(this.elementName);
            Asserts.number(totalDischarge);
            return Utils.getPercent(totalDischarge, remainingLoad);
        }

        const currentLoad = generatorM.whatElementCellLoad(this.elementName);
        Asserts.number(currentLoad);
        return Utils.getPercent(this.#pulseCellData.loadCell.total, currentLoad);
    }

    trigger() {
        this.emitPulse();
    }

    emitPulse() {
        console.log('Emitting pulse from', this.elementName);
        EventBus.emit(Events.generator.onTrigger, DataManager.getGeneratorIds().PULSE);
    }

}