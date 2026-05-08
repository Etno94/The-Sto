import Global from "./global.js";
import GameSave from "./save.js";
import { EventBus, Events } from "./event-bus.js";
import GameLoop from "./game-loop.js";

import {generatorF, genElementF} from "./templates/templates.index.js";

import PointCollection from "../systems/point.collection.js";
import InputControl from "../systems/input.controller.js";

import {DataManager, pointM, generatorM, storageM} from "../systems/managers-index.js";

import { UIControl } from "../views/ui-controller.js";

import {Asserts, Utils, Validators} from "../utils/utils.index.js";

// #region Unlocks

function checkUnlocks() {
  checkGeneratorUnlocks();
  checkStorageUpgraderUnlock();
  checkGeneratorElementsUnlocks();
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

    setBuildProgress(
      generatorName, 
      generatorM.whatProgress.bind(generatorM),
      generatorM.whatBuildTotalStepsRequires.bind(generatorM),
      Events.generator.build
    );

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

// Generator Elements Unlock
function checkGeneratorElementsUnlocks () {
  // Locked Elements
  checkGeneratorElements(
    generatorM.getLockedGeneratorElementNames(), 
    generatorM.whatElementUnlockRequiresHint.bind(generatorM), 
    generatorM.setElementHinted.bind(generatorM),
    UIControl.showElementHint.bind(UIControl)
  );
  // Hinted Elements
  checkGeneratorElements(
    generatorM.getHintedGeneratorElementNames(), 
    generatorM.whatElementUnlockRequiresBuild.bind(generatorM), 
    generatorM.setElementCanBuild.bind(generatorM),
    UIControl.showElementCanBuild.bind(UIControl),
    UIControl.showElementHint.bind(UIControl)
  );
  // Can Build Elements
  checkGeneratorElementsCanBuild(generatorM.getCanBuildGeneratorElementNames());
  // Built Elements
  checkGeneratorElementsBuilt(generatorM.getBuiltGeneratorElementNames());
}

/**
 * @param {string[]} elementNames 
 * @param {Function} callbackRequires 
 * @param {Function} callbackSet 
 * @param {Function} callbackRender 
 * @param {Function} [fallbackRender] 
 */
function checkGeneratorElements(elementNames, callbackRequires, callbackSet, callbackRender, fallbackRender) {
  Asserts.stringArray(elementNames);
  Asserts.function(callbackRequires);
  Asserts.function(callbackSet);
  Asserts.function(callbackRender);
  if (Validators.isNotNullNorUndefined(fallbackRender)) Asserts.function(fallbackRender);

  elementNames.forEach(elementName => {
    const pointSet = callbackRequires(elementName);
    if (!pointSet) return;
    if (pointM.hasEnoughPoints(pointSet)) {
      callbackSet(elementName);
      callbackRender(elementName);
    } else if (fallbackRender) fallbackRender(elementName);
  });
}

/**
 * @param {string[]} elementNames 
 */
function checkGeneratorElementsCanBuild(elementNames) {
  Asserts.stringArray(elementNames);

  elementNames.forEach(elementName => {
    setBuildProgress(
      elementName, 
      generatorM.whatElementProgress.bind(generatorM),
      generatorM.whatElementBuildRequiresTotalSteps.bind(generatorM),
      Events.generator.elements.cdCharges.build
    );

    const domElement = UIControl.showElementCanBuild(elementName);
    const buildStep = generatorM.whatElementBuildRequiresStep(elementName);
    UIControl.renderCostPreview(domElement, buildStep);
    
    InputControl.addEventListener(domElement, "click", generatorElementOnClick, elementName);
  });
}

/**
 * @param {string[]} elementNames 
 */
function checkGeneratorElementsBuilt(elementNames) {
  Asserts.stringArray(elementNames);

  elementNames.forEach(elementName => {
    const domElement = UIControl.showElementBuilt(elementName);
    InputControl.addEventListener(domElement, "click", generatorElementOnClick, elementName);
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
  
  setBuildProgress(
    generatorName, 
    generatorM.buildProgress.bind(generatorM),
    generatorM.whatBuildTotalStepsRequires.bind(generatorM),
    Events.generator.build
  );

  if (generatorM.isBuildProgressComplete(generatorName)) {
    generatorM.setBuilt(generatorName);
    let generatorElement = UIControl.getGeneratorElement(generatorName);
    UIControl.showWrappedGeneratorElement(generatorElement, generatorM.getOrderedGeneratorIndex(generatorName));
    UIControl.hideBuild(generatorElement);
    UIControl.removeCostPreview(generatorElement);
    UIControl.showGeneratorElementsOnBuild(generatorName);
    setGeneratorElements(generatorName);
  }
}

/** @param { string } elementName */
function buildGeneratorElement(elementName) {
  Asserts.string(elementName);
  if (generatorM.isElementBuilt(elementName) || !generatorM.isElementCanBuild(elementName)) return;

  const buildStep = generatorM.whatElementBuildRequiresStep(elementName);
  if (!buildStep || !pointM.hasEnoughPoints(buildStep)) return;

  EventBus.emit(Events.points.substract, buildStep);

  setBuildProgress(
    elementName, 
    generatorM.buildElementProgress.bind(generatorM),
    generatorM.whatElementBuildRequiresTotalSteps.bind(generatorM),
    Events.generator.elements.cdCharges.build
  );

  if (generatorM.isBuildElementProgressComplete(elementName)) {
    generatorM.setElementBuilt(elementName);
    const domElement = UIControl.getGeneratorElementDOMElement(elementName);
    UIControl.removeCostPreview(domElement);
    const loadCostPreviewType = generatorM.doesNeedLoadCostPreview(elementName);
    if (loadCostPreviewType) showLoadCostPreview(loadCostPreviewType, domElement );
  }
}

// #endregion Build

// #region Generator Actions

/** @param { string } generatorName */
function generatorOnClick(generatorName) {
  Asserts.string(generatorName);
  if (!generatorM.isValidGenerator(generatorName)) return;

  if (generatorM.isBuilt(generatorName)) {
    generatorF.run(generatorName);
    return;
  }
  if (generatorM.isBuildable(generatorName)) {
    buildGenerator(generatorName);
    return;
  }
  if (generatorM.isHinted(generatorName))
    console.log("You see a new thing...");
}

/** @param {string} */
function generatorElementOnClick(elementName) {
  Asserts.string(elementName);

  if (generatorM.isElementBuilt(elementName)) {
    genElementF.run(elementName);
    return;
  }
  if (generatorM.isElementCanBuild(elementName)) {
    buildGeneratorElement(elementName);
    return;
  }
  if (generatorM.isElementHinted(elementName)) {
    return;
  }
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
  updateElementsCooldown(interval);
  updateStorageUpgradeCostPreview();
  checkPulseGeneratorCells(interval);
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

  const generatorsOnCD = generatorM.getGeneratorsOnCooldownNames();
  if (!Validators.isNonEmptyArray(generatorsOnCD)) {
    return;
  }

  generatorsOnCD.forEach(generatorName => {
    const updatedRemainingCD = generatorM.getGeneratorRemainingCD(generatorName) - interval;
    const baseCooldown = generatorM.whatBaseCoolDown(generatorName);
    const degs = Utils.getReversedDeg(Utils.getDegPercent(baseCooldown, updatedRemainingCD));
    if (initialSet) EventBus.emit(Events.generator.onCD, generatorName, updatedRemainingCD);
    EventBus.emit(Events.generator.updateCD, generatorName, updatedRemainingCD, degs);
  });
}

/** 
 * @param {number} [interval]
 * @param {boolean} [initialSet]
 */
function updateElementsCooldown(interval = 0, initialSet = false) {
  Asserts.number(interval);

  const elementsOnCD = generatorM.getElementsRemainingCd();
  if (!Validators.isNonEmptyArray(elementsOnCD)) {
    return;
  }

  elementsOnCD.forEach(element => {
    const updatedRemainingCD = element.remainingCD - interval;
    const baseCooldown = generatorM.whatChargeBaseCD(element.name);
    const degs = Utils.getReversedDeg(Utils.getDegPercent(baseCooldown, updatedRemainingCD));
    if (initialSet) EventBus.emit(Events.generator.elements.cdCharges.onCd, element.name, updatedRemainingCD);
    EventBus.emit(Events.generator.elements.cdCharges.updateCd, element.name, updatedRemainingCD, degs);
  });
}

/** 
 * @param {number} [interval]
 * @param {boolean} [initialSet]
 */
function checkPulseGeneratorCells(interval = 0, initialSet = false) {
  if (!generatorM.isBuilt(DataManager.getGeneratorIds().PULSE)) return;

  const isDischarging = generatorM.isDischarging(DataManager.getGeneratorIds().PULSE);

  const loadedCells = generatorM.getPulseCellsByStatus('loaded');
  const hasLoadedCells = Validators.isNonEmptyArray(loadedCells);

  const dischargingCells = generatorM.getPulseCellsByStatus('discharging');
  const hasdischargingCells = Validators.isNonEmptyArray(dischargingCells);

  const dischargedCells = generatorM.getPulseCellsByStatus('discharged');
  const amountbuiltPulseCells = generatorM.getBuiltPulseCells().length;

  const allBuiltCellsAreDischarged = dischargedCells.length === amountbuiltPulseCells;
  if (allBuiltCellsAreDischarged) EventBus.emit(Events.generator.discharged);

  const disableGeneratorIf = !hasLoadedCells || hasdischargingCells || isDischarging;
  UIControl.disableGenerator(DataManager.getGeneratorIds().PULSE, disableGeneratorIf);

  if (interval == 0) return;
  dischargingCells.forEach(cell => {
    generatorM.substractElementCellLoad(cell.name, interval);
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
    setGeneratorElements(generatorName);
  });
}

/** @param {string} generatorName */
function setGeneratorElements(generatorName) {
  Asserts.string(generatorName);
  const generatesPoints = generatorM.getGeneratorPoints(generatorName);
  UIControl.updateGeneratorStatusElements(generatorName, generatesPoints);
}

function renderGeneratorElements() {
  const elementNames = generatorM.getBuiltGeneratorElementNames();
  Asserts.stringArray(elementNames);
  elementNames.forEach(name => {
    genElementF.render(name);
    const loadCostPreviewType = generatorM.doesNeedLoadCostPreview(name);
    if (loadCostPreviewType) {
      const domElement = UIControl.getGeneratorElementDOMElement(name);
      showLoadCostPreview(loadCostPreviewType, domElement);
    }
  });
}

/**
 * @param {String} name 
 * @param {Function} buildProgressCallback 
 * @param {Function} totalProgressCallback 
 * @param {String} eventToEmit 
 */
function setBuildProgress(name, buildProgressCallback, totalProgressCallback, eventToEmit) {
  Asserts.string(name);
  Asserts.function(buildProgressCallback);
  Asserts.function(totalProgressCallback);
  Asserts.string(eventToEmit);

  const currentProgress = buildProgressCallback(name, DataManager.getDefaultStepProgress());
  const totalProgress = totalProgressCallback(name);
  const percentProgress = Utils.getPercent(totalProgress, currentProgress);
  EventBus.emit(eventToEmit, name, percentProgress);
}

/**
 * @param {String} type 
 * @param {HTMLElement} domElement
 */
function showLoadCostPreview(type, domElement) {
  Asserts.string(type);
  Asserts.htmlElement(domElement);

  /** @type {PointSet} */
  const loadCost = {[type]: 1};

  UIControl.renderCostPreview(domElement, loadCost);
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
  storageM.setCurrentStorage(Global?.proxy?.storage?.maxStorageUpgradeCurrentLevel);

  // Initial render for already unlocked generators
  initialRender();

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
  EventBus.on(Events.storageUpgrade.onClick, () => upgradeMaxStorage())
}

function initialRender() {
  checkUnlocks();
  updateGeneratorsCooldown(0, true);
  updateElementsCooldown(0, true);
  checkPulseGeneratorCells(0, true);  
  setBuiltGeneratorStatus();
  renderGeneratorElements();
}

startGame();

// #endregion SetUp

