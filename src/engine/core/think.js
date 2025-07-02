import Global from "./global.js";
import GameSave from "./save.js";
import { EventBus, Events } from "./event-bus.js";
import GameLoop from "./game-loop.js";

import {generatorF} from "./templates/templates.index.js";

import PointCollection from "../systems/point.collection.js";
import InputControl from "../systems/input.controller.js";

import {DataManager, pointM, generatorM, storageM} from "../systems/managers-index.js";

import { UIControl } from "../views/ui-controller.js";

import {Asserts, Validators} from "../utils/utils.index.js";

// #region Unlocks

function checkUnlocks() {
  checkGeneratorUnlocks();
  checkStorageUpgraderUnlock();
}

// Burner Unlock

// Storage Upgrader Unlock
function checkStorageUpgraderUnlock() {
  if (storageM.isStorageUpgradeUnlocked() && 
      storageM.isStorageUpgradeDisabled) 
      EventBus.emit(Events.storageUpgrade.unlocked);
}

// Generator Unlocks
function checkGeneratorUnlocks() {
  checkLockedGenerators([...generatorM.getLockedGeneratorNames()]);
  checkHintedGenerators([...generatorM.getHintedGeneratorNames()]);
  checkCanBeBuiltGenerators([...generatorM.getBuildableGeneratorNames()]);
  checkBuiltGenerators([...generatorM.getBuiltGeneratorNames()]);
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

      let generatorElement = UIControl.getGeneratorElement(generatorName);
      UIControl.showHint(generatorElement);
      UIControl.showWrappedGeneratorElement(generatorElement, generatorM.getOrderedGeneratorIndex(generatorName));
      
      InputControl.addEventListener(generatorElement, "click", generatorOnClick, generatorName);
    }
  });
}

/** @param {string[]} generatorNames */
function checkCanBeBuiltGenerators(generatorNames) {
  generatorNames.forEach(generatorName => {
    if (!generatorM.isValidGenerator(generatorName)) return;

    let generatorElement = UIControl.getGeneratorElement(generatorName);
    UIControl.showBuild(generatorElement);
    UIControl.showWrappedGeneratorElement(generatorElement, generatorM.getOrderedGeneratorIndex(generatorName));

    UIControl.renderCostPreview(generatorElement, generatorM.whatBuildStepRequires(generatorName));
    InputControl.addEventListener(generatorElement, "click", generatorOnClick, generatorName);
  });
}

/** @param {string[]} generatorNames */
function checkBuiltGenerators(generatorNames) {
  generatorNames.forEach(generatorName => {
    if (!generatorM.isValidGenerator(generatorName)) return;

    let generatorElement = UIControl.getGeneratorElement(generatorName);
    UIControl.showWrappedGeneratorElement(generatorElement, generatorM.getOrderedGeneratorIndex(generatorName));
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
    let generatorElement = UIControl.getGeneratorElement(generatorName);
    UIControl.showWrappedGeneratorElement(generatorElement, generatorM.getOrderedGeneratorIndex(generatorName));
    UIControl.hideBuild(generatorElement);
    UIControl.removeCostPreview(generatorElement);
    setGeneratorStatus(generatorName);
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
  generatorF.run(generatorName);
}

// #endregion Generator Actions

// #region Storage Upgrade

function upgradeMaxStorage() {
  const currentCost = new PointCollection(storageM.getCurrentUpgradeCost()).collection;
  console.log(currentCost);

  if (pointM.hasEnoughPoints(currentCost)) {
    UIControl.removeCostPreview(storageM.upgradeStorageWrapperElement);
    EventBus.emit(Events.points.substract, currentCost);
    EventBus.emit(Events.storageUpgrade.upgrade);
  }
}

// #endregion Storage Upgrade

// #region Render

/** @param {number} interval */
function renderGeneralUpdatedStatus(interval) {
  setStoragePoints();
  updateGeneratorsCooldown(interval);
  updateStorageUpgradeCostPreview();
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

function updateStorageUpgradeCostPreview() {
  const currentCost = new PointCollection(storageM.getCurrentUpgradeCost()).collection;
  UIControl.renderCostPreview(storageM.upgradeStorageWrapperElement, currentCost);
}

function setBuiltGeneratorStatus() {
  const builtGeneratorNames = generatorM.getBuiltGeneratorNames();
  if (!Validators.isNonEmptyArray(builtGeneratorNames)) return;

  builtGeneratorNames.forEach(generatorName => {
    setGeneratorStatus(generatorName);
  });
}

/** @param {string} generatorName */
function setGeneratorStatus(generatorName) {
  Asserts.string(generatorName);
  const generatesPoints = generatorM.getGeneratorPoints(generatorName);
  UIControl.updateGeneratorStatusElements(generatorName, generatesPoints);
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
  setBuiltGeneratorStatus();

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
  EventBus.on(Events.storageUpgrade.onClick, () => upgradeMaxStorage())
}

startGame();

// #endregion SetUp
