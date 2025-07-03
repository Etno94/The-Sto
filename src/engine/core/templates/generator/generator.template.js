import {EventBus, Events} from "../../event-bus.js";

import { pointM, generatorM, storageM } from "../../../systems/managers-index.js";
import PointCollection from "../../../systems/point.collection.js";

import {Asserts, Utils, SaveGeneratesToPointSet} from "../../../utils//utils.index.js";
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

  /** @returns {Boolean} */
  canConsume() {
    return (
      !this.consumeCollection.total ||
      pointM.hasEnoughPoints(this.consumeCollection.collection)
    );
  }

  /** @returns {Boolean} */
  canGenerate() {
    const result = this.canGeneratePure();
    if (!result) {
      EventBus.emit(Events.points.overcap);
      if (!storageM.isStorageUpgradeUnlocked())
        storageM.setStorageUpgradeUnlocked();
    }
    return result;
  }

  /** @returns {Boolean} */
  canGeneratePure() {
    if (!this.pointsToGenerate.length) return true;
    const generateTotal = new PointCollection(SaveGeneratesToPointSet(this.pointsToGenerate)).total;
    const spaceLeft = storageM.storageSpaceLeft(pointM.getCurrentTotalPoints(), this.consumeCollection.total);
    return !(spaceLeft <= 0 && generateTotal > 0);
  }

  consume() {
    if (this.consumeCollection.total)
      EventBus.emit(Events.points.substract, this.consumeCollection.collection);
  }

  /** @returns {PointCollection} */
  rollGeneration() {
    let spaceLeft = storageM.storageSpaceLeft(pointM.getCurrentTotalPoints(), this.consumeCollection.total);
    const generated = new PointCollection();

    this.pointsToGenerate.forEach((point) => {
      if (spaceLeft <= 0) return;
      const result = Utils.overloadChance(point.currentChance);
      if (result) {
        const toAdd = result > spaceLeft ? spaceLeft : result;
        generated.addToCollection(toAdd, point.type);
        spaceLeft -= toAdd;
      }
    });

    return generated;
  }

  /** @param {PointCollection} generated */
  applyGenerated(generated) {
    Asserts.object(generated);
    if (generated.total) EventBus.emit(Events.points.add, generated.collection);
  }

  /** @param {PointCollection} generated */
  emitStatus(generated) {
    Asserts.object(generated);
    
    EventBus.emit(Events.generator.onUse, this.generatorName);
    if (this.baseCooldown) {
      EventBus.emit(Events.generator.onCD, this.generatorName, this.baseCooldown);
    }
  }

  /** @param {PointCollection} generated */
  afterGenerate(generated) {
    Asserts.object(generated);
    // Hook for subclasses like CooldownGenerator, PulseGenerator
  }
}
