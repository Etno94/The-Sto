import BaseGenerator from "../generator.template.js";
import {EventBus, Events} from "../../../event-bus.js";
import { generatorM, DataManager } from "../../../../systems/managers-index.js"

export default class CDGenerator extends BaseGenerator {

  /** @param {string} generatorName */
  constructor(generatorName) {
    super(generatorName);
    this.baseCooldown = generatorM.whatBaseCoolDown(generatorName);

    this.cdChargesData = DataManager.getCDCargesData();
    this.cdCharges = [...generatorM.getBuiltCDCharges()];
  }

  emitStatus() {
    super.emitStatus();
    if (!this.baseCooldown) return;

    EventBus.emit(Events.generator.onCD, this.generatorName, this.baseCooldown);

    const chargeToUse = this.checkChargeToUse();
    EventBus.emit(Events.generator.elements.cdCharges.onCd, chargeToUse.name, chargeToUse.currentBaseCD);
    EventBus.emit(Events.generator.elements.onUse, chargeToUse.name);
  }

  /** @returns {SaveGeneratorElement} */
  checkChargeToUse() {
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
}