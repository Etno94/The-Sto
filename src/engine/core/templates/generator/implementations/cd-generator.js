import BaseGenerator from "../generator.template.js";
import {EventBus, Events} from "../../../event-bus.js";
import { generatorM, DataManager } from "../../../../systems/managers-index.js"

export default class CDGenerator extends BaseGenerator {

  /** @param {string} generatorName */
  constructor(generatorName) {
    super(generatorName);

    this.cdChargesData = DataManager.getCDCargesData();
    this.cdCharges = [...generatorM.getBuiltCDCharges()];
  }

  // Emit Status

  emitStatus() {
    const chargeToUse = this.checkClosestChargeToFinish();
    if (!this.isChargeReadyToUse(chargeToUse)) return;

    EventBus.emit(Events.generator.onUse, this.generatorName);
    EventBus.emit(Events.generator.onCD, this.generatorName, chargeToUse.currentBaseCD);

    EventBus.emit(Events.generator.elements.cdCharges.onCd, chargeToUse.name, chargeToUse.currentBaseCD);
    EventBus.emit(Events.generator.elements.onUse, chargeToUse.name);
  }

  /** @returns {SaveGeneratorElement} */
  checkClosestChargeToFinish() {
    /** @type {SaveGeneratorElement} */
    let closestToFinish = null;

    this.cdCharges.forEach(
      /** @param {SaveGeneratorElement} charge */
      charge => {
      if (!closestToFinish) {
        closestToFinish = charge;
        return;
      }
      closestToFinish = charge.remainingCD < closestToFinish.remainingCD ? charge : closestToFinish;
    });

    return closestToFinish;
  }

  /**
   * @param {SaveGeneratorElement} charge 
   * @returns {boolean}
   */
  isChargeReadyToUse(charge) {
    return charge.remainingCD === 0;
  }

  // After Generate

  afterGenerate() {
  }
}