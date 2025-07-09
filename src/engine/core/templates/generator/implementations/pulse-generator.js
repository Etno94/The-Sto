import BaseGenerator from "../generator.template.js";
import {EventBus, Events} from "../../../event-bus.js";
import { generatorM } from "../../../../systems/managers-index.js"

export default class PulseGenerator extends BaseGenerator {

  /** @param {string} generatorName */
  constructor(generatorName) {
    super(generatorName);
    this.baseCooldown = generatorM.whatBaseCoolDown(generatorName);
  }

  /** @param {PointCollection} generated */
  emitStatus(generated) {
    super.emitStatus(generated);
    if (this.baseCooldown) {
      EventBus.emit(Events.generator.onCD, this.generatorName, this.baseCooldown);
    }
  }

  afterGenerate(generated) {
    console.log(`[Pulse] Generated ${generated.total} points`);
  }
}