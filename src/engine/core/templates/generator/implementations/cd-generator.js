import BaseGenerator from "../generator.template.js";
import {EventBus, Events} from "../../../event-bus.js";
import { generatorM, DataManager } from "../../../../systems/managers-index.js"
import { UIControl } from "../../../../views/ui-controller.js";

export default class CDGenerator extends BaseGenerator {

  /** @param {string} generatorName */
  constructor(generatorName) {
    super(generatorName);

    this.cdChargesData = DataManager.getCDCargesData();
    this.cdCharges = [...generatorM.getBuiltCDCharges()];
  }

  // Can Generate

  /** @returns {Boolean} */
  canGenerate() {
    const parentResult = super.canGenerate();
    this.chargesReady = this.getChargesReady();
    const isGeneratorDisabled = UIControl.isDisabled(UIControl.getGeneratorElement(this.generatorName));

    return parentResult && this.chargesReady.length && !isGeneratorDisabled;
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
    const chargesReady = this.cdCharges.filter(
      /** @param {SaveGeneratorElement} charge */
      charge => charge.remainingCD === 0);

    return chargesReady;
  }

  /** 
   * @param {SaveGeneratorElement[]} charges
   * @returns {SaveGeneratorElement | null} 
   * */
  getLowestBaseCDCharge(charges) {
    const lowertBaseCDCharge = charges.reduce((prev, current) => {
      return current.currentBaseCD < prev.currentBaseCD ? current : prev;
    },charges[0]);

    return lowertBaseCDCharge || null;
  }

  /** @returns {SaveGeneratorElement} */
  checkClosestChargeToFinish() {
    const lowestRemainingCDCharge = this.cdCharges.reduce((prev, current) => {
      return current.remainingCD < prev.remainingCD ? current : prev;
    },this.cdCharges[0]);

    return lowestRemainingCDCharge || null;
  }
}