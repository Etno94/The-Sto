import Global from "./global.js";
import GameSave from "./save.js";
import { EventBus, Events } from "./event-bus.js";
import GameLoop from "./game-loop.js";

import PointCollection from "../systems/point.collection.js";
import InputControl from "../systems/input.controller.js";

import DataManager from "../systems/managers/data.manager.js";
import {pointM} from '../systems/managers/point.manager.js';
import {generatorM} from "../systems/managers/generator.manager.js";
import {storageM} from "../systems/managers/storage.manager.js";

import { UIControl } from "../views/ui-controller.js";
import Asserts from "../utils/asserts.js";
import Validators from "../utils/validators.js";


// #region Unlocks

function checkUnlocks() {
  checkGeneratorUnlocks();
  checkStorageUpgraderUnlock();
}

// Burner Unlock

// Storage Upgrader Unlock
function checkStorageUpgraderUnlock() {
  if (storageM.wasStorageUpgradeRecentlyUnlocked()) EventBus.emit(Events.storageUpgrade.unlocked);
}

// Generator Unlocks
function checkGeneratorUnlocks() {
  checkLockedGenerators([...generatorM.getLockedGeneratorNames()]);
  checkHintedGenerators([...generatorM.getHintedGeneratorNames()]);
  checkCanBeBuiltGenerators([...generatorM.getBuildableGeneratorNames()]);
  checkBuiltGenerators([...generatorM.getBuitGeneratorNames()]);
}

/** @param {string[]} generatorNames */
function checkLockedGenerators(generatorNames) {
  generatorNames.forEach(generatorName => {
    if (!generatorM.isValidGenerator(generatorName)) return;

    if (pointM.hasEnoughPoints(generatorM.whatUnlockHintRequires(generatorName))) {
      if (!generatorM.isHinted(generatorName)) generatorM.setHinted(generatorName);
    } else {
      if (generatorM.isHinted(generatorName)) generatorM.setHinted(generatorName, false);
    }
  });
}

/** @param {string[]} generatorNames */
function checkHintedGenerators(generatorNames) {
  generatorNames.forEach(generatorName => {
    if (!generatorM.isValidGenerator(generatorName)) return;

    if (pointM.hasEnoughPoints(generatorM.whatUnlockBuildRequires(generatorName))) {
      if (!generatorM.isBuildable(generatorName)) generatorM.setBuildable(generatorName);
    } 
    else {
      if (generatorM.isBuildable(generatorName)) generatorM.setBuildable(generatorName, false);
      const generatorElement = UIControl.getGeneratorElement(generatorName);
      UIControl.showHint(generatorElement);
      UIControl.showGeneratorElement(generatorElement, generatorM.getOrderedGeneratorIndex(generatorElement.id));
      InputControl.addEventListener(generatorElement, "click", generatorOnClick, generatorName);
    }
  });
}

/** @param {string[]} generatorNames */
function checkCanBeBuiltGenerators(generatorNames) {
  generatorNames.forEach(generatorName => {
    if (!generatorM.isValidGenerator(generatorName)) return;

    const generatorElement = UIControl.getGeneratorElement(generatorName);
    UIControl.showBuild(generatorElement);
    UIControl.showGeneratorElement(generatorElement, generatorM.getOrderedGeneratorIndex(generatorElement.id));
    UIControl.renderCostPreview(generatorElement, generatorM.whatBuildStepRequires(generatorName));
    InputControl.addEventListener(generatorElement, "click", generatorOnClick, generatorName);
  });
}

/** @param {string[]} generatorNames */
function checkBuiltGenerators(generatorNames) {
  generatorNames.forEach(generatorName => {
    if (!generatorM.isValidGenerator(generatorName)) return;

    const generatorElement = UIControl.getGeneratorElement(generatorName);
    UIControl.showGeneratorElement(generatorElement, generatorM.getOrderedGeneratorIndex(generatorElement.id));
    InputControl.addEventListener(generatorElement, "click", generatorOnClick, generatorName);
  });
}

// #endregion Unlocks

// #region Build

/** @param { string } generatorName */
function buildGenerator(generatorName) {
  Asserts.string(generatorName);
  if (!generatorM.isValidGenerator(generatorName) || generatorM.isBuilt(generatorName) || !generatorM.isBuildable(generatorName)) return;

  const buildStep = generatorM.whatBuildStepRequires(generatorName);
  if (!pointM.hasEnoughPoints(buildStep)) return;
  EventBus.emit(Events.points.substract, buildStep);

  generatorM.buildProgress(generatorName, DataManager.getDefaultStepProgress());

  if (generatorM.isBuildProgressComplete(generatorName)) {
    generatorM.setBuilt(generatorName);
    const generatorElement = UIControl.getGeneratorElement(generatorName);
    UIControl.showGeneratorElement(generatorElement, generatorM.getOrderedGeneratorIndex(generatorElement.id));
    UIControl.hideBuild(generatorElement);
    UIControl.removeCostPreview(generatorElement);
  }
}

// #endregion Build

// #region Generator Actions

/** @param { string } generatorName */
function generatorOnClick(generatorName) {
  Asserts.string(generatorName);
  if (!generatorM.isValidGenerator(generatorName)) return;

  EventBus.emit(Events.generator.onClick, generatorName);

  if (generatorM.isBuilt(generatorName)) {
    builtGeneratorOnClick(generatorName);
    return;
  }
  if (generatorM.isBuildable(generatorName)) {
    buildGenerator(generatorName);
    return;
  }
  if (generatorM.isHinted(generatorName))
    console.log("You see a new thing...");
}

/** @param { string } generatorName */
function builtGeneratorOnClick (generatorName) {
  Asserts.string(generatorName);

  const consumePCollection = new PointCollection(generatorM.whatConsumes(generatorName));
  const generatePCollection = new PointCollection(generatorM.whatGenerates(generatorName));

  let canConsume = true;
  let canGenerate = true;

  if (consumePCollection.total && !pointM.hasEnoughPoints(consumePCollection.collection)) canConsume = false;
  if (generatePCollection.total && storageM.doesOvercap(pointM.getCurrentTotalPoints(), generatePCollection.total, consumePCollection.total)) {
    canGenerate = false;
    EventBus.emit(Events.points.overcap);
    if (!storageM.isStorageUpgradeUnlocked()) storageM.setStorageUpgradeUnlocked();
  }

  if (canConsume && canGenerate) {
    if (consumePCollection.total) EventBus.emit(Events.points.substract, consumePCollection.collection);
    if (generatePCollection.total) EventBus.emit(Events.points.add, generatePCollection.collection);
    const baseCooldown = generatorM.whatBaseCoolDown(generatorName); // TODO: add usedAmounts
    if (baseCooldown) EventBus.emit(Events.generator.onCD, generatorName, baseCooldown);
    EventBus.emit(Events.generator.onUse, generatorName);
  }
}

// #endregion Generator Actions

// #region Render

/** @param {number} interval */
function renderGeneralUpdatedStatus(interval) {
  setStoragePoints();
  updateGeneratorsCooldown(interval);
}

function setStoragePoints() {
  /** @type {PointSet} */
  const currentDomPoints = UIControl.getCurrentPointsFromDOM();
  const diffResult = pointM.calculateDOMPointDiff(currentDomPoints);
  UIControl.balancePoints(diffResult);
}

/** 
 * @param {number} [interval]
 * @param {boolean} [initialSet]
 */
function updateGeneratorsCooldown(interval = 0, initialSet = false) {
  Asserts.number(interval);
  if (!generatorM.needToCheckCooldowns) return;

  const generatorsOnCD = generatorM.getGeneratorsOnCooldownNames();
  if (!Validators.isNonEmptyArray(generatorsOnCD)) {
    generatorM.needToCheckCooldowns = false;
    return;
  }

  generatorsOnCD.forEach(generatorName => {
    const updatedRemainingCD = generatorM.getGeneratorRemainingCD(generatorName) - interval;
    const baseCooldown = generatorM.whatBaseCoolDown(generatorName);
    if (initialSet) EventBus.emit(Events.generator.onCD, generatorName, updatedRemainingCD);
    EventBus.emit(Events.generator.updateCD, generatorName, updatedRemainingCD, baseCooldown);
  });
}

// #endregion Render

// #region SetUp

// SetUp

function startGame() {
  const save = GameSave.load();
  if(save && typeof save === 'object') {
    Object.assign(Global.proxy, save);
  }
  registerBusEvents();
  generatorM.setNewGeneratorManager();
  storageM.setCurrentStorage(Global.proxy.storage.maxStorageUpgradeCurrentLevel);

  // Initial render for already unlocked generators
  checkUnlocks();
  updateGeneratorsCooldown(0, true);

  Global.saveProxy.subscribe((updatedSave) => {
    GameSave.save(updatedSave);
    checkUnlocks();
    renderGeneralUpdatedStatus();
  });

  new GameLoop()
    .setGameUpdates([
      () => checkUnlocks(),
      (interval) => renderGeneralUpdatedStatus(interval)
    ])
    .start();
}

function registerBusEvents() {
  EventBus.on(Events.points.add, (message) => console.log(`[think] ${Events.points.add}`, message));
  EventBus.on(Events.points.substract, (message) => console.log(`[think] ${Events.points.substract}`, message));
}

startGame();

// #endregion SetUp
