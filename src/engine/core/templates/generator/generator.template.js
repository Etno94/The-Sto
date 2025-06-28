import { pointM, generatorM, storageM } from "../../../systems/managers-index.js";

import PointCollection from "../../../systems/point.collection.js";

import Asserts from "../../../utils/asserts.js";

export default class BaseGenerator {

    /** @type {string} */
    generatorName;
    /** @type {SaveGeneratorPoints[]} */
    pointsToGenerate;
    /** @type {PointCollection} */
    consumeCollection;
    /** @type {number} */
    baseCooldown;

  /**
   * @param {string} generatorName
   */
  constructor(generatorName) {
    Asserts.string(generatorName);

    this.generatorName = generatorName;
    this.pointsToGenerate = generatorM.getGeneratorPoints(generatorName);
    this.consumeCollection = new PointCollection(generatorM.whatConsumes(generatorName));
    this.baseCooldown = generatorM.whatBaseCoolDown(generatorName);
  }

  run() {
    if (!this.canConsume() || !this.canGenerate()) return;

    this.consume();
    const generatedPoints = this.rollGeneration();

    this.applyGenerated(generatedPoints);
    this.emitStatus(generatedPoints);
    this.afterGenerate(generatedPoints);
  }

  canConsume() {
    return (
      !this.consumeCollection.total ||
      pointM.hasEnoughPoints(this.consumeCollection.collection)
    );
  }

  canGenerate() {
    if (!this.pointsToGenerate.length) return true;

    const generateTotal = this.getExpectedGenerateTotal();
    const overcaps = storageM.doesOvercap(
      pointM.getCurrentTotalPoints(),
      generateTotal,
      this.consumeCollection.total
    );

    if (overcaps) {
      EventBus.emit(Events.points.overcap);
      if (!storageM.isStorageUpgradeUnlocked())
        storageM.setStorageUpgradeUnlocked();
      return false;
    }

    return true;
  }

  consume() {
    if (this.consumeCollection.total)
      EventBus.emit(Events.points.substract, this.consumeCollection.collection);
  }

  rollGeneration() {
    const generated = new PointCollection();

    this.pointsToGenerate.forEach((point) => {
      const result = Utils.overloadChance(point.currentChance);
      if (result) generated.addToCollection(result, point.type);
    });

    return generated;
  }

  getExpectedGenerateTotal() {
    return this.pointsToGenerate.reduce((acc, p) => acc + p.amount, 0); // or more accurate model
  }

  applyGenerated(generated) {
    if (generated.total) EventBus.emit(Events.points.add, generated.collection);
  }

  emitStatus(generated) {
    EventBus.emit(Events.generator.onUse, this.generatorName);
    if (this.baseCooldown) {
      EventBus.emit(Events.generator.onCD, this.generatorName, this.baseCooldown);
    }

    EventBus.emit(
      Events.generator.elements.statusItems.pointChance.updated,
      this.generatorName,
      this.pointsToGenerate,
      generated.collection
    );
  }

  afterGenerate(generated) {
    // Hook for subclasses like CooldownGenerator, PulseGenerator
  }
}
