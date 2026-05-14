import BaseGenerator from "../generator.template.js";
import {EventBus, Events} from "../../../event-bus.js";
import { generatorM, DataManager } from "../../../../systems/managers-index.js"

export default class PulseGenerator extends BaseGenerator {

  /** @param {string} generatorName */
  constructor(generatorName) {
    super(generatorName);
    this.baseCooldown = generatorM.whatBaseCoolDown(generatorName);
    this.isDischarging = generatorM.isDischarging(generatorName);
  }

  run() {
    const remainingCd = generatorM.getGeneratorRemainingCD(DataManager.getGeneratorIds().PULSE);
    const loadedCells = generatorM.getPulseCellsByStatus('loaded');

    if (this.isDischarging || 
        !loadedCells || !loadedCells.length || 
        remainingCd) return;

    this.emitStatus();
  }

  emitStatus() {
    super.emitStatus();
    if (!this.baseCooldown) return;

    EventBus.emit(Events.generator.onCD, this.generatorName, this.baseCooldown);
    EventBus.emit(Events.generator.onDischarge, this.generatorName, this.baseCooldown);
  }

  trigger() {
    this.generatePointsOnPulse();
  }

  generatePointsOnPulse() {
    const generatedPoints = super.rollGeneration();
    super.applyGenerated(generatedPoints);
  }

}