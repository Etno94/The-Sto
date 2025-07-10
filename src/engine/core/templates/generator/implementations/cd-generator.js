import BaseGenerator from "../generator.template.js";
import {EventBus, Events} from "../../../event-bus.js";
import { generatorM, DataManager } from "../../../../systems/managers-index.js"

export default class CDGenerator extends BaseGenerator {

  /** @param {string} generatorName */
  constructor(generatorName) {
    super(generatorName);
    this.baseCooldown = generatorM.whatBaseCoolDown(generatorName);

    const {cdCharge1, cdCharge2, cdCharge3} = DataManager.getGeneratorElementNames();
    this.cdChargesIds = [cdCharge1, cdCharge2, cdCharge3];
  }

  /** @param {PointCollection} generated */
  emitStatus(generated) {
    super.emitStatus(generated);
    if (!this.baseCooldown) return;

    EventBus.emit(Events.generator.onCD, this.generatorName, this.baseCooldown);
    EventBus.emit(Events.generator.elements.cdCharges.onCd, this.cdChargesIds[0], this.baseCooldown);
    EventBus.emit(Events.generator.elements.onUse, this.cdChargesIds[0]);
  }

  afterGenerate(generated) {
    console.log(`[CD] Generated ${generated.total} points`);
  }
}