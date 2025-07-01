import BaseGenerator from "../generator.template.js";
import { EventBus, Events } from "../../../event-bus.js";
import PointCollection from "../../../../systems/point.collection.js";

export default class ClickGenerator extends BaseGenerator {

  /** @param {PointCollection} generated */
  afterGenerate(generated) {
    console.log(`[Click] Generated ${generated.total} points`);

    EventBus.emit(
      Events.generator.elements.statusItems.pointChance.updated,
      this.generatorName,
      generated.collection
    );
  }
  
}