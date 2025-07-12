import BaseGenerator from "../generator.template.js";
import {EventBus, Events} from "../../../event-bus.js";
import { generatorM, DataManager } from "../../../../systems/managers-index.js"

export default class CDGenerator extends BaseGenerator {

  /** @param {string} generatorName */
  constructor(generatorName) {
    super(generatorName);

    this.cdChargesData = DataManager.getCDCargesData();
    this.cdCharges = [...generatorM.getBuiltCDCharges()];
    this.chargesReady = this.getChargesReady();
  }

  // Run

  run() {
    if (!this.chargesReady.length) return;
    super.run();
  }

  // Emit Status

  emitStatus() {
    const chargeToUse = this.getLowestBaseCDCharge(this.chargesReady);

    EventBus.emit(Events.generator.elements.cdCharges.onCd, chargeToUse.name, chargeToUse.currentBaseCD);
    EventBus.emit(Events.generator.elements.onUse, chargeToUse.name);
  }

  // After Generate

  afterGenerate() {
    if (this.getChargesReady().length) return;

    const lowestRemainingCDCharge = this.checkClosestChargeToFinish();
    EventBus.emit(Events.generator.onUse, this.generatorName);
    EventBus.emit(Events.generator.onCD, this.generatorName, lowestRemainingCDCharge.remainingCD);
  }

  // CD Generator methods

  /** @returns {SaveGeneratorElement[]} */
  getChargesReady() {
    return this.cdCharges.filter(charge => charge.remainingCD === 0);
  }

  /** 
   * @param {SaveGeneratorElement[]} charges
   * @returns {SaveGeneratorElement | null} 
   * */
  getLowestBaseCDCharge(charges) {
    if (!charges.length) return null;

    const lowestBaseCDCharge = charges.reduce((prev, current) => {
      return current.currentBaseCD < prev.currentBaseCD ? current : prev;
    },charges[0]);

    return lowestBaseCDCharge || null;
  }

  /** @returns {SaveGeneratorElement} */
  checkClosestChargeToFinish() {
    const lowestRemainingCDCharge = this.cdCharges.reduce((prev, current) => {
      return current.remainingCD < prev.remainingCD ? current : prev;
    },this.cdCharges[0]);

    return lowestRemainingCDCharge || null;
  }
}